import { CaborItem, JURNAL_MONEV_DATES } from './monev-data';
import { KONI_LOGO_DATA_URL } from './logo-data';

interface SaveOfficialReportPdfParams {
  officerName: string;
  cabors: CaborItem[];
  fileName?: string;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = (text || '-').split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : ['-'];
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Packs an array of A4 JPEG page data URLs into a valid multi-page PDF 1.4 binary Blob.
 */
function buildPdfFromJpegPages(
  pages: { dataUrl: string; widthPx: number; heightPx: number }[]
): Blob {
  // Standard A4 in PDF points (72 dpi): 595.28 x 841.89
  const pageWidthPt = 595.28;
  const pageHeightPt = 841.89;

  const chunks: BlobPart[] = [];
  const offsets: number[] = [0]; // 1-indexed object offsets
  let byteLength = 0;

  const encoder = new TextEncoder();
  const pushStr = (s: string) => {
    const arr = encoder.encode(s);
    chunks.push(arr as unknown as BlobPart);
    byteLength += arr.byteLength;
  };
  const pushBytes = (arr: Uint8Array) => {
    chunks.push(arr as unknown as BlobPart);
    byteLength += arr.byteLength;
  };

  pushStr('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n');

  // Object 1: Catalog
  // Object 2: Pages
  // For each page i (0..N-1):
  //   pageObj = 3 + i * 3
  //   contentObj = 4 + i * 3
  //   imageObj = 5 + i * 3
  const numPages = pages.length;
  const kidsRefs = pages.map((_, i) => `${3 + i * 3} 0 R`).join(' ');

  // 1: Catalog
  offsets[1] = byteLength;
  pushStr('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // 2: Pages
  offsets[2] = byteLength;
  pushStr(
    `2 0 obj\n<< /Type /Pages /Count ${numPages} /Kids [ ${kidsRefs} ] >>\nendobj\n`
  );

  for (let i = 0; i < numPages; i++) {
    const page = pages[i];
    const pageObjId = 3 + i * 3;
    const contentObjId = 4 + i * 3;
    const imageObjId = 5 + i * 3;
    const imgName = `/Im${i + 1}`;

    const base64Data = page.dataUrl.split(',')[1] || '';
    const jpegBytes = base64ToUint8Array(base64Data);

    const contentStream = `q\n${pageWidthPt.toFixed(2)} 0 0 ${pageHeightPt.toFixed(
      2
    )} 0 0 cm\n${imgName} Do\nQ\n`;

    // Page Object
    offsets[pageObjId] = byteLength;
    pushStr(
      `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [ 0 0 ${pageWidthPt.toFixed(
        2
      )} ${pageHeightPt.toFixed(
        2
      )} ] /Resources << /XObject << ${imgName} ${imageObjId} 0 R >> >> /Contents ${contentObjId} 0 R >>\nendobj\n`
    );

    // Content Object
    offsets[contentObjId] = byteLength;
    pushStr(
      `${contentObjId} 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`
    );

    // Image XObject
    offsets[imageObjId] = byteLength;
    pushStr(
      `${imageObjId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${page.widthPx} /Height ${page.heightPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.byteLength} >>\nstream\n`
    );
    pushBytes(jpegBytes);
    pushStr('\nendstream\nendobj\n');
  }

  const totalObjects = 2 + numPages * 3;
  const xrefOffset = byteLength;

  pushStr(`xref\n0 ${totalObjects + 1}\n`);
  pushStr('0000000000 65535 f \n');
  for (let objId = 1; objId <= totalObjects; objId++) {
    const off = String(offsets[objId] || 0).padStart(10, '0');
    pushStr(`${off} 00000 n \n`);
  }

  pushStr(
    `trailer\n<< /Size ${
      totalObjects + 1
    } /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  );

  return new Blob(chunks, { type: 'application/pdf' });
}

export async function saveOfficialReportAsPdf({
  officerName,
  cabors,
  fileName,
}: SaveOfficialReportPdfParams): Promise<void> {
  // High-resolution A4 canvas (1240 x 1754 px = ~150 DPI A4)
  const W = 1240;
  const H = 1754;
  const marginX = 110;
  const indentLeft = marginX + 110;
  const contentRight = W - marginX;
  const bottomLimit = H - 120;

  const koniLogo = await loadImage(KONI_LOGO_DATA_URL);

  const canvases: HTMLCanvasElement[] = [];
  let currentCanvas = document.createElement('canvas');
  currentCanvas.width = W;
  currentCanvas.height = H;
  let ctx = currentCanvas.getContext('2d')!;

  const startNewPage = (drawKop: boolean) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);
    canvases.push(currentCanvas);

    if (!drawKop) {
      return 110;
    }

    // Draw Kop Surat on Page 1
    if (koniLogo) {
      ctx.drawImage(koniLogo, marginX + 6, 70, 132, 142);
    }
    ctx.fillStyle = '#C8102E';
    ctx.textAlign = 'center';
    ctx.font = 'bold 13px Arial, Helvetica, sans-serif';
    ctx.fillText('KOTA SURABAYA', marginX + 72, 232);

    // Center institutional header
    const centerX = marginX + 165 + (contentRight - (marginX + 165)) / 2;
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 28px "Times New Roman", Times, serif';
    ctx.fillText('KOMITE OLAHRAGA NASIONAL INDONESIA', centerX, 108);
    ctx.fillText('(KONI)', centerX, 144);
    ctx.fillText('KOTA SURABAYA', centerX, 180);

    ctx.font = '20px "Times New Roman", Times, serif';
    ctx.fillText(
      'Sekretariat : Komplek Gelanggang Remaja – Jl. Bogen No. 1, Surabaya – 60133',
      centerX,
      212
    );
    ctx.fillText('Email : officialkonisurabaya@gmail.com', centerX, 238);

    // Double Line Divider
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(marginX, 258);
    ctx.lineTo(contentRight, 258);
    ctx.stroke();

    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(marginX, 265);
    ctx.lineTo(contentRight, 265);
    ctx.stroke();

    ctx.textAlign = 'left';
    return 305;
  };

  let y = startNewPage(true);

  const ensureSpace = (neededHeight: number) => {
    if (y + neededHeight > bottomLimit) {
      currentCanvas = document.createElement('canvas');
      currentCanvas.width = W;
      currentCanvas.height = H;
      ctx = currentCanvas.getContext('2d')!;
      y = startNewPage(false);
    }
  };

  // Date & Recipient Block (without Nomor Surat)
  const rightColX = W - marginX - 380;
  ctx.fillStyle = '#000000';
  ctx.font = '22px "Times New Roman", Times, serif';
  ctx.fillText('Surabaya, 3 November 2026', rightColX, y);

  // Left: Lampiran & Perihal
  ctx.fillText('Lampiran', marginX, y + 40);
  ctx.fillText(': 1 (Satu) Berkas', marginX + 130, y + 40);
  ctx.fillText('Perihal', marginX, y + 72);
  ctx.fillText(':', marginX + 130, y + 72);
  ctx.font = 'bold italic 22px "Times New Roman", Times, serif';
  ctx.fillText('L A P O R A N   M O N E V', marginX + 148, y + 72);

  // Right: Kepada Yth
  ctx.font = '22px "Times New Roman", Times, serif';
  ctx.fillText('Kepada Yth :', rightColX, y + 40);
  ctx.font = 'bold 22px "Times New Roman", Times, serif';
  ctx.fillText('Ketua Umum KONI Kota Surabaya', rightColX, y + 72);
  ctx.font = '22px "Times New Roman", Times, serif';
  ctx.fillText('Di-', rightColX, y + 104);
  ctx.fillText('T E M P A T', rightColX + 10, y + 136);

  y += 185;

  // Salam Olahraga
  ctx.font = '22px "Times New Roman", Times, serif';
  ctx.fillText('Salam Olahraga! Jaya!', indentLeft, y);
  y += 30;
  ctx.fillText('Surabaya! Selalu Juara!', indentLeft, y);
  y += 30;
  ctx.fillText('Porprov! 250 Emas!', indentLeft, y);
  y += 45;

  // Intro paragraph
  const introText =
    'Tim Monitoring dan Evaluasi (Monev) Komite Olahraga Nasional Indonesia (KONI) Kota Surabaya pada penyelenggaraan POPDA XIV – PEPAPERDA II Jawa Timur 2026, dengan ini menyampaikan laporan hasil monitoring dan evaluasi cabang olahraga dengan rincian poin-poin sebagai berikut :';
  const introLines = wrapLines(ctx, introText, contentRight - indentLeft);
  for (const line of introLines) {
    ensureSpace(32);
    ctx.fillText(line, indentLeft, y);
    y += 30;
  }
  y += 16;

  // Helper to draw key-value colon row
  const labelWidth = 250;
  const drawFieldRow = (
    label: string,
    value: string,
    boldValue = false,
    boldLabel = false
  ) => {
    ctx.font = `${boldValue ? 'bold ' : ''}21px "Times New Roman", Times, serif`;
    const valLines = wrapLines(
      ctx,
      value,
      contentRight - (indentLeft + labelWidth + 24)
    );
    ensureSpace(valLines.length * 29 + 6);

    ctx.font = `${boldLabel ? 'bold ' : ''}21px "Times New Roman", Times, serif`;
    ctx.fillStyle = '#000000';
    ctx.fillText(label, indentLeft, y);
    ctx.fillText(':', indentLeft + labelWidth, y);

    ctx.font = `${boldValue ? 'bold ' : ''}21px "Times New Roman", Times, serif`;
    valLines.forEach((ln, i) => {
      ctx.fillText(ln, indentLeft + labelWidth + 20, y + i * 28);
    });
    y += valLines.length * 28 + 6;
  };

  for (let cIdx = 0; cIdx < cabors.length; cIdx++) {
    const cabor = cabors[cIdx];
    ensureSpace(160);

    if (cabors.length > 1) {
      ctx.font = 'bold 22px "Times New Roman", Times, serif';
      ctx.fillText(
        `${cIdx + 1}. CABANG OLAHRAGA : ${cabor.name.toUpperCase()}`,
        indentLeft,
        y
      );
      y += 34;
    }

    drawFieldRow(
      'Cabang Olahraga',
      `${cabor.name} (PIC Cabor: ${cabor.pic})`,
      true
    );
    drawFieldRow('Petugas Monev', officerName);
    drawFieldRow(
      'Tempat / Venue',
      `${cabor.venueName} (${cabor.venueRegion}) — ${cabor.venueAddress}`
    );
    drawFieldRow(
      'Posko Tim Monev',
      'Hotel Riski Samudra, Jl. Basuki Rahmat, Winong, Margomulyo, Ngawi'
    );
    drawFieldRow(
      'Perolehan Medali',
      `${cabor.gold} Emas, ${cabor.silver} Perak, ${cabor.bronze} Perunggu (Total: ${
        cabor.gold + cabor.silver + cabor.bronze
      } Medali)`,
      true
    );

    if (cabor.athletes.length === 0) {
      drawFieldRow('Atlet Peraih Medali', '-');
    } else {
      const athSummary = cabor.athletes
        .map(
          (a, i) =>
            `${i + 1}) ${a.name} — ${a.eventNumber} (Medali ${a.medal}, ${
              a.schoolOrClub
            })`
        )
        .join('; ');
      drawFieldRow('Atlet Peraih Medali', athSummary);
    }

    // Daily Reports (1 Nov - 11 Nov 2026)
    const reportsList = JURNAL_MONEV_DATES.map(
      (d) => cabor.dailyReports[d.key]
    ).filter(Boolean);

    ensureSpace(45);
    ctx.font = 'bold 21px "Times New Roman", Times, serif';
    ctx.fillText(
      'Jurnal Laporan Tertulis (1 Nov - 11 Nov 2026) :',
      indentLeft,
      y
    );
    y += 30;

    if (reportsList.length === 0) {
      ctx.font = 'italic 20px "Times New Roman", Times, serif';
      ctx.fillText('- Belum ada rincian laporan harian yang diinput.', indentLeft + 15, y);
      y += 30;
    } else {
      for (let rIdx = 0; rIdx < reportsList.length; rIdx++) {
        const rep = reportsList[rIdx];
        drawFieldRow(
          `   ${String.fromCharCode(97 + rIdx)}. Hari/Tanggal`,
          rep.dateLabel,
          true,
          true
        );
        drawFieldRow('      - Kondisi Pertandingan', rep.matchCondition);
        drawFieldRow('      - Kondisi Venue', rep.venueCondition);
        drawFieldRow('      - Kondisi Atlet', rep.athleteCondition);
        drawFieldRow('      - Laporan Tambahan', rep.additionalReport);
      }
    }

    // Photos if any
    const allPhotos = reportsList.flatMap((r) =>
      r.photos.map((p) => ({ ...p, dateLabel: r.dateLabel }))
    );
    if (allPhotos.length > 0) {
      ensureSpace(240);
      ctx.font = 'bold 21px "Times New Roman", Times, serif';
      ctx.fillText('Dokumentasi Foto :', indentLeft, y);
      y += 20;

      for (const ph of allPhotos.slice(0, 4)) {
        const img = await loadImage(ph.dataUrl);
        if (img) {
          ensureSpace(230);
          ctx.drawImage(img, indentLeft + 20, y, 320, 185);
          ctx.font = '18px "Times New Roman", Times, serif';
          ctx.fillText(
            `${ph.caption} (${ph.dateLabel})`,
            indentLeft + 20,
            y + 208
          );
          y += 225;
        }
      }
    }

    y += 18;
  }

  // Closing & Signature Block (Hormat Kami + bold italic officer name, no signature image)
  ensureSpace(190);
  ctx.font = '22px "Times New Roman", Times, serif';
  ctx.fillText(
    'Demikian atas perhatian dan arahannya disampaikan terima kasih',
    indentLeft,
    y
  );
  y += 60;

  const signCenterX = contentRight - 170;
  ctx.textAlign = 'center';
  ctx.font = '22px "Times New Roman", Times, serif';
  ctx.fillText('Hormat Kami,', signCenterX, y);
  y += 65;
  ctx.font = 'bold italic 23px "Times New Roman", Times, serif';
  ctx.fillText(officerName, signCenterX, y);
  const nameW = ctx.measureText(officerName).width;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(signCenterX - nameW / 2, y + 5);
  ctx.lineTo(signCenterX + nameW / 2, y + 5);
  ctx.stroke();
  ctx.textAlign = 'left';

  // Convert each canvas to JPEG and assemble PDF
  const jpegPages = canvases.map((c) => ({
    dataUrl: c.toDataURL('image/jpeg', 0.92),
    widthPx: c.width,
    heightPx: c.height,
  }));

  const pdfBlob = buildPdfFromJpegPages(jpegPages);
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  const safeName = (
    fileName ||
    `Laporan_Monev_KONI_Surabaya_${officerName.replace(/\s+/g, '_')}.pdf`
  ).replace(/[^a-zA-Z0-9._-]/g, '_');

  link.href = url;
  link.download = safeName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}

'use client';

import React, { useState } from 'react';
import { Printer, X, FileCheck2, Download } from 'lucide-react';
import { CaborItem, JURNAL_MONEV_DATES } from '@/lib/monev-data';
import { saveOfficialReportAsPdf } from '@/lib/pdf-export';
import { KONI_LOGO_DATA_URL } from '@/lib/logo-data';

interface OfficialLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  officerName: string;
  cabors: CaborItem[];
  selectedCaborId?: string;
}

export default function OfficialLetterModal({
  isOpen,
  onClose,
  officerName,
  cabors,
  selectedCaborId,
}: OfficialLetterModalProps) {
  const [scopeMode, setScopeMode] = useState<'single' | 'all'>(
    selectedCaborId ? 'single' : 'all'
  );
  const [activeCaborId, setActiveCaborId] = useState<string>(
    selectedCaborId || (cabors[0]?.id ?? '')
  );

  const [isSavingPdf, setIsSavingPdf] = useState<boolean>(false);

  if (!isOpen) return null;

  const targetCabors =
    scopeMode === 'single'
      ? cabors.filter((c) => c.id === activeCaborId)
      : cabors;

  const totalGold = targetCabors.reduce((acc, c) => acc + c.gold, 0);
  const totalSilver = targetCabors.reduce((acc, c) => acc + c.silver, 0);
  const totalBronze = targetCabors.reduce((acc, c) => acc + c.bronze, 0);
  const totalMedals = totalGold + totalSilver + totalBronze;

  const handlePrintPdf = () => {
    window.print();
  };

  const handleSaveAsPdf = async () => {
    if (isSavingPdf) return;
    setIsSavingPdf(true);
    try {
      const caborLabel =
        scopeMode === 'single' && targetCabors[0]
          ? targetCabors[0].name
          : 'Seluruh_Cabor';
      await saveOfficialReportAsPdf({
        officerName,
        cabors: targetCabors,
        fileName: `Laporan_Monev_KONI_Surabaya_${caborLabel}_${officerName}.pdf`,
      });
    } finally {
      setIsSavingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 overflow-y-auto print:static print:bg-white print:p-0">
      <div className="relative w-full max-w-4xl bg-white rounded-xl border border-slate-200 shadow-2xl my-8 overflow-hidden print:shadow-none print:border-none print:my-0 print:max-w-none print:rounded-none">
        {/* Top Action Bar (Hidden when printing) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-white via-yellow-50 to-amber-300 text-[#0A2540] px-6 py-4 border-b-2 border-amber-400">
          <div className="flex items-center gap-3">
            <FileCheck2 className="w-5 h-5 text-[#0A2540] shrink-0" />
            <div>
              <h3 className="text-sm font-extrabold tracking-tight">
                Generate Laporan PDF — KONI Kota Surabaya
              </h3>
              <p className="text-xs text-slate-700">
                Format Kop Surat Resmi KONI Kota Surabaya (Tanpa Nomor Surat · Poin-Poin Atribut Isian)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Scope Toggle */}
            <div className="flex items-center bg-white/90 border border-amber-300 p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setScopeMode('single')}
                className={`px-3 py-1.5 rounded-md font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  scopeMode === 'single'
                    ? 'bg-[#0A2540] text-amber-300'
                    : 'text-slate-700 hover:text-[#0A2540]'
                }`}
              >
                Per Cabor
              </button>
              <button
                type="button"
                onClick={() => setScopeMode('all')}
                className={`px-3 py-1.5 rounded-md font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  scopeMode === 'all'
                    ? 'bg-[#0A2540] text-amber-300'
                    : 'text-slate-700 hover:text-[#0A2540]'
                }`}
              >
                Seluruh Cabor Tugas ({cabors.length})
              </button>
            </div>

            {scopeMode === 'single' && (
              <select
                value={activeCaborId}
                onChange={(e) => setActiveCaborId(e.target.value)}
                aria-label="Pilih Cabang Olahraga untuk Surat Resmi"
                className="bg-white text-[#0A2540] font-semibold text-xs border border-amber-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#0A2540]"
              >
                {cabors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.no}. {c.name} (PIC: {c.pic})
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={handleSaveAsPdf}
              disabled={isSavingPdf}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              {isSavingPdf ? 'Menyimpan PDF...' : 'Save as PDF'}
            </button>

            <button
              type="button"
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A2540] hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              Cetak / Print
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup pratinjau surat"
              className="p-2 text-slate-700 hover:text-[#0A2540] hover:bg-amber-200/50 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body — Classic Official KONI Kota Surabaya Letterhead Format */}
        <div
          className="max-h-[82vh] overflow-y-auto px-10 py-8 md:px-16 md:py-12 bg-white text-black print:max-h-none print:overflow-visible print:px-10 print:py-6"
          style={{ fontFamily: '"Times New Roman", Times, Georgia, serif' }}
        >
          {/* KOP SURAT PERSIS SESUAI CONTOH GAMBAR */}
          <div className="flex items-center gap-4 pb-2">
            {/* Left: Logo KONI Surabaya (koni surabaya.png) + KOTA SURABAYA text underneath */}
            <div className="flex flex-col items-center justify-center shrink-0 w-28">
              <img
                src={KONI_LOGO_DATA_URL}
                alt="Logo KONI Kota Surabaya"
                referrerPolicy="no-referrer"
                className="w-24 h-24 object-contain"
              />
              <div
                className="text-center leading-none mt-0.5"
                style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
              >
                <p className="text-[8.5px] font-bold tracking-tight text-[#C8102E]">
                  KOTA SURABAYA
                </p>
              </div>
            </div>

            {/* Center/Right: Institutional Text */}
            <div className="flex-1 text-center">
              <p className="text-[18px] md:text-[20px] font-bold tracking-tight text-black leading-snug uppercase">
                KOMITE OLAHRAGA NASIONAL INDONESIA
              </p>
              <p className="text-[18px] md:text-[20px] font-bold tracking-tight text-black leading-snug uppercase">
                (KONI)
              </p>
              <p className="text-[18px] md:text-[20px] font-bold tracking-tight text-black leading-snug uppercase">
                KOTA SURABAYA
              </p>
              <p className="text-[13px] text-black mt-1 leading-snug">
                Sekretariat : Komplek Gelanggang Remaja – Jl. Bogen No. 1, Surabaya – 60133
              </p>
              <p className="text-[13px] text-black leading-snug">
                Email :{' '}
                <span className="text-blue-700 underline">
                  officialkonisurabaya@gmail.com
                </span>
              </p>
            </div>
          </div>

          {/* Double Line Divider under Kop Surat */}
          <div className="border-t-[2.5px] border-b border-black h-[5px] w-full mb-5" />

          {/* Tanggal & Tujuan Surat (Tanpa Nomor Surat) */}
          <div className="grid grid-cols-12 text-[15px] leading-relaxed text-black">
            {/* Left Side: Lampiran & Perihal (Tanpa Nomor Surat) */}
            <div className="col-span-7 space-y-0.5 pt-7">
              <div className="flex">
                <span className="w-24">Lampiran</span>
                <span>: 1 (Satu) Berkas</span>
              </div>
              <div className="flex">
                <span className="w-24">Perihal</span>
                <span>
                  :{' '}
                  <strong className="italic tracking-[0.2em]">
                    LAPORAN MONEV
                  </strong>
                </span>
              </div>
            </div>

            {/* Right Side: Tanggal & Kepada Yth */}
            <div className="col-span-5 space-y-0.5">
              <p className="mb-2">Surabaya, 3 November 2026</p>
              <p>Kepada Yth :</p>
              <p className="font-bold">Ketua Umum KONI Kota Surabaya</p>
              <p>Di-</p>
              <p className="tracking-[0.25em] pl-1">T E M P A T</p>
            </div>
          </div>

          {/* Indented Body Content matching the reference letter margin */}
          <div className="mt-8 pl-0 sm:pl-20 text-[15px] leading-relaxed text-black space-y-5">
            {/* Salam Olahraga Block */}
            <div className="leading-snug space-y-0.5">
              <p>Salam Olahraga! Jaya!</p>
              <p>Surabaya! Selalu Juara!</p>
              <p>Porprov! 250 Emas!</p>
            </div>

            {/* Paragraf Pengantar */}
            <p className="text-justify">
              Tim Monitoring dan Evaluasi (Monev) Komite Olahraga Nasional Indonesia (KONI) Kota Surabaya pada penyelenggaraan POPDA XIV – PEPAPERDA II Jawa Timur 2026, dengan ini menyampaikan laporan hasil monitoring dan evaluasi cabang olahraga dengan rincian poin-poin sebagai berikut :
            </p>

            {/* POIN-POIN MENYESUAIKAN ATRIBUT ISIAN LAPORAN */}
            <div className="space-y-6">
              {targetCabors.map((cabor, caborIdx) => {
                const reportsList = JURNAL_MONEV_DATES.map(
                  (d) => cabor.dailyReports[d.key]
                ).filter(Boolean);
                const allPhotos = reportsList.flatMap((r) =>
                  r.photos.map((p) => ({ ...p, dateLabel: r.dateLabel }))
                );

                return (
                  <div
                    key={cabor.id}
                    className="space-y-3 border-b border-slate-300 pb-5 last:border-b-0 break-inside-avoid"
                  >
                    {targetCabors.length > 1 && (
                      <p className="font-bold underline text-[15px]">
                        {caborIdx + 1}. CABANG OLAHRAGA : {cabor.name.toUpperCase()}
                      </p>
                    )}

                    {/* Atribut Utama Cabor & Perolehan Medali */}
                    <div className="space-y-1">
                      <div className="flex items-start">
                        <span className="w-44 shrink-0">Cabang Olahraga</span>
                        <span className="mr-2">:</span>
                        <span className="font-bold">
                          {cabor.name} (PIC Cabor: {cabor.pic})
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="w-44 shrink-0">Petugas Monev</span>
                        <span className="mr-2">:</span>
                        <span>{officerName}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="w-44 shrink-0">Tempat / Venue</span>
                        <span className="mr-2">:</span>
                        <div>
                          <p>{cabor.venueName} ({cabor.venueRegion})</p>
                          <p className="text-[13.5px]">{cabor.venueAddress}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <span className="w-44 shrink-0">Posko Utama</span>
                        <span className="mr-2">:</span>
                        <span>
                          Hotel Riski Samudra, Jl. Basuki Rahmat, Winong, Margomulyo, Ngawi
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="w-44 shrink-0">Perolehan Medali</span>
                        <span className="mr-2">:</span>
                        <span className="font-bold">
                          {cabor.gold} Emas, {cabor.silver} Perak, {cabor.bronze} Perunggu (Total: {cabor.gold + cabor.silver + cabor.bronze} Medali)
                        </span>
                      </div>
                    </div>

                    {/* Poin Daftar Atlet Peraih Medali */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-start">
                        <span className="w-44 shrink-0">Atlet Peraih Medali</span>
                        <span className="mr-2">:</span>
                        <div className="flex-1">
                          {cabor.athletes.length === 0 ? (
                            <span>-</span>
                          ) : (
                            <ul className="list-disc pl-4 space-y-1">
                              {cabor.athletes.map((ath) => (
                                <li key={ath.id}>
                                  <strong>{ath.name}</strong> — {ath.eventNumber} (Medali{' '}
                                  <strong>{ath.medal}</strong>, {ath.schoolOrClub}).{' '}
                                  {ath.performanceNote}.
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Poin Laporan Tertulis Harian (Kondisi Pertandingan, Venue, Atlet, Tambahan) */}
                    <div className="space-y-2 pt-1">
                      <p className="font-bold">
                        Jurnal Laporan Tertulis (1 Nov - 11 Nov 2026) :
                      </p>
                      {reportsList.length === 0 ? (
                        <p className="italic text-[14px]">
                          - Belum ada rincian laporan harian yang diinput.
                        </p>
                      ) : (
                        <div className="space-y-3 pl-2">
                          {reportsList.map((rep, rIdx) => (
                            <div key={rep.dateKey} className="space-y-0.5">
                              <div className="flex items-start">
                                <span className="w-44 shrink-0 font-bold">
                                  {String.fromCharCode(97 + rIdx)}. Hari/Tanggal
                                </span>
                                <span className="mr-2">:</span>
                                <span className="font-bold">{rep.dateLabel}</span>
                              </div>
                              <div className="flex items-start">
                                <span className="w-44 shrink-0 pl-4">
                                  - Kondisi Pertandingan
                                </span>
                                <span className="mr-2">:</span>
                                <span className="flex-1 text-justify">
                                  {rep.matchCondition}
                                </span>
                              </div>
                              <div className="flex items-start">
                                <span className="w-44 shrink-0 pl-4">
                                  - Kondisi Venue
                                </span>
                                <span className="mr-2">:</span>
                                <span className="flex-1 text-justify">
                                  {rep.venueCondition}
                                </span>
                              </div>
                              <div className="flex items-start">
                                <span className="w-44 shrink-0 pl-4">
                                  - Kondisi Atlet
                                </span>
                                <span className="mr-2">:</span>
                                <span className="flex-1 text-justify">
                                  {rep.athleteCondition}
                                </span>
                              </div>
                              <div className="flex items-start">
                                <span className="w-44 shrink-0 pl-4">
                                  - Laporan Tambahan
                                </span>
                                <span className="mr-2">:</span>
                                <span className="flex-1 text-justify">
                                  {rep.additionalReport}
                                </span>
                              </div>
                              {rep.ketumNote && (
                                <div className="flex items-start">
                                  <span className="w-44 shrink-0 pl-4 font-bold">
                                    - Arahan Ketum KONI
                                  </span>
                                  <span className="mr-2">:</span>
                                  <span className="flex-1 font-semibold">
                                    {rep.ketumNote}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Dokumentasi Foto Laporan (bila ada) */}
                    {allPhotos.length > 0 && (
                      <div className="pt-2 space-y-2">
                        <div className="flex items-start">
                          <span className="w-44 shrink-0">Dokumentasi Foto</span>
                          <span className="mr-2">:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                            {allPhotos.map((ph) => (
                              <div
                                key={ph.id}
                                className="border border-slate-300 p-2 rounded bg-white"
                              >
                                <img
                                  src={ph.dataUrl}
                                  alt={ph.caption}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-32 object-cover"
                                />
                                <p className="text-[12px] mt-1 leading-tight">
                                  {ph.caption} ({ph.dateLabel})
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Ringkasan Total jika memilih Seluruh Cabor Tugas */}
              {targetCabors.length > 1 && (
                <div className="pt-2 space-y-1">
                  <div className="flex items-start">
                    <span className="w-44 shrink-0 font-bold">
                      Total Akumulasi Medali
                    </span>
                    <span className="mr-2">:</span>
                    <span className="font-bold">
                      {totalGold} Emas, {totalSilver} Perak, {totalBronze} Perunggu (Total: {totalMedals} Medali dari {targetCabors.length} Cabor)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Kalimat Penutup */}
            <p className="pt-2">
              Demikian atas perhatian dan arahannya disampaikan terima kasih
            </p>

            {/* BLOK HORMAT KAMI TANPA TANDA TANGAN & NAMA LENGKAP BOLD ITALIC */}
            <div className="pt-6 flex justify-end">
              <div className="w-72 text-center space-y-6">
                <p className="text-[15px] text-black">Hormat Kami,</p>
                <p className="text-[16px] font-bold italic underline text-black">
                  {officerName}
                </p>
              </div>
            </div>

            {/* Bottom Action Strip for Generated Report */}
            <div className="no-print pt-6 mt-6 border-t border-slate-200 flex flex-wrap items-center justify-end gap-3" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>
              <button
                type="button"
                onClick={handleSaveAsPdf}
                disabled={isSavingPdf}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0D9488] hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-60"
              >
                <Download className="w-4 h-4" />
                {isSavingPdf ? 'Menyimpan PDF...' : 'Save as PDF'}
              </button>
              <button
                type="button"
                onClick={handlePrintPdf}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2540] hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Cetak / Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

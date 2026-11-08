import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface LiveAthleteMedal {
  id: string;
  name: string;
  eventNumber: string;
  medal: 'Emas' | 'Perak' | 'Perunggu';
  schoolOrClub: string;
  performanceNote: string;
  isPorprov2027Potential: boolean;
}

export interface LiveCaborStanding {
  sportName: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
  athletes: LiveAthleteMedal[];
}

export interface LiveSurabayaKlasemenResponse {
  sourceUrl: string;
  contingent: string;
  podium: string;
  contributingCabors: number;
  syncedAt: string;
  isLive: boolean;
  overall: {
    gold: number;
    silver: number;
    bronze: number;
    total: number;
  };
  byCaborName: Record<string, LiveCaborStanding>;
}

const SOURCE_URL = 'https://popdapeparpedajatim.id/klasemen';

// Fallback snapshot taken directly from https://popdapeparpedajatim.id/klasemen for Kota Surabaya
const FALLBACK_SURABAYA_DATA: Omit<LiveSurabayaKlasemenResponse, 'syncedAt' | 'isLive'> = {
  sourceUrl: SOURCE_URL,
  contingent: 'Kota Surabaya',
  podium: 'Podium 2',
  contributingCabors: 9,
  overall: {
    gold: 23,
    silver: 26,
    bronze: 31,
    total: 80,
  },
  byCaborName: {
    ATLETIK: {
      sportName: 'Atletik',
      gold: 3,
      silver: 2,
      bronze: 2,
      total: 7,
      athletes: [
        {
          id: 'live-atl-1',
          name: 'ALASKA ARGA SUJUDI ALLAH',
          eventNumber: 'LONTAR MARTIL (ATLMPA)',
          medal: 'Emas',
          schoolOrClub: 'Kontingen Kota Surabaya',
          performanceNote: 'Data Resmi Klasemen POPDA-PEPARPEDA Jatim 2026',
          isPorprov2027Potential: false,
        },
      ],
    },
    AKUATIK: {
      sportName: 'Akuatik',
      gold: 1,
      silver: 3,
      bronze: 7,
      total: 11,
      athletes: [
        {
          id: 'live-aku-1',
          name: 'ELOK HAYUNINGTYAS MULYADI',
          eventNumber: '200 M GAYA KUPU-KUPU PUTRI (AK200GKKPI)',
          medal: 'Emas',
          schoolOrClub: 'Kontingen Kota Surabaya',
          performanceNote: 'Data Resmi Klasemen POPDA-PEPARPEDA Jatim 2026',
          isPorprov2027Potential: false,
        },
      ],
    },
    'BOLA VOLI PANTAI': {
      sportName: 'Bola Voli Pantai',
      gold: 0,
      silver: 1,
      bronze: 0,
      total: 1,
      athletes: [
        {
          id: 'live-bvp-1',
          name: 'Kota Surabaya',
          eventNumber: 'Bola Voli Pantai Putra (BP1PA)',
          medal: 'Perak',
          schoolOrClub: 'Beregu Kontingen Kota Surabaya',
          performanceNote: 'Data Resmi Klasemen POPDA-PEPARPEDA Jatim 2026',
          isPorprov2027Potential: false,
        },
      ],
    },
    JUDO: {
      sportName: 'Judo',
      gold: 6,
      silver: 4,
      bronze: 3,
      total: 13,
      athletes: [
        {
          id: 'live-jd-1',
          name: 'CYRILA AURORA KHANZA PARAMESTI',
          eventNumber: 'JUDO +63KG PUTRI (JD+63KGPI)',
          medal: 'Emas',
          schoolOrClub: 'Kontingen Kota Surabaya',
          performanceNote: 'Data Resmi Klasemen POPDA-PEPARPEDA Jatim 2026',
          isPorprov2027Potential: false,
        },
      ],
    },
    MENEMBAK: {
      sportName: 'Menembak',
      gold: 3,
      silver: 3,
      bronze: 5,
      total: 11,
      athletes: [
        {
          id: 'live-mn-1',
          name: 'Kota Surabaya',
          eventNumber: 'INDOOR RIFLE 10M TEAM PUTRA (MN-I10MRTEAMPA)',
          medal: 'Emas',
          schoolOrClub: 'Beregu Kontingen Kota Surabaya',
          performanceNote: 'Data Resmi Klasemen POPDA-PEPARPEDA Jatim 2026',
          isPorprov2027Potential: false,
        },
      ],
    },
    'PANJAT TEBING': {
      sportName: 'Panjat Tebing',
      gold: 1,
      silver: 0,
      bronze: 1,
      total: 2,
      athletes: [
        {
          id: 'live-pt-1',
          name: 'OKANDRA JODIE SYAILENDRA',
          eventNumber: 'LEAD PUTRA (PTLPA)',
          medal: 'Emas',
          schoolOrClub: 'Kontingen Kota Surabaya',
          performanceNote: 'Data Resmi Klasemen POPDA-PEPARPEDA Jatim 2026',
          isPorprov2027Potential: false,
        },
      ],
    },
    SENAM: {
      sportName: 'Senam',
      gold: 3,
      silver: 5,
      bronze: 4,
      total: 12,
      athletes: [
        {
          id: 'live-sn-1',
          name: 'FIDELYN MERCY ROMKENY',
          eventNumber: 'Perorangan Per Alat (Kompetisi III) Putri (SN-AKIIIPI)',
          medal: 'Emas',
          schoolOrClub: 'Kontingen Kota Surabaya',
          performanceNote: 'BB',
          isPorprov2027Potential: false,
        },
      ],
    },
    'SEPAK TAKRAW': {
      sportName: 'Sepak Takraw',
      gold: 0,
      silver: 1,
      bronze: 0,
      total: 1,
      athletes: [
        {
          id: 'live-st-1',
          name: 'Kota Surabaya',
          eventNumber: 'INTER REGU PUTRI (ST-IRPI)',
          medal: 'Perak',
          schoolOrClub: 'Beregu Kontingen Kota Surabaya',
          performanceNote: 'Data Resmi Klasemen POPDA-PEPARPEDA Jatim 2026',
          isPorprov2027Potential: false,
        },
      ],
    },
    'WUSHU TAOLU': {
      sportName: 'Wushu Taolu',
      gold: 6,
      silver: 7,
      bronze: 9,
      total: 22,
      athletes: [
        {
          id: 'live-ws-1',
          name: 'AARON HANJAYA TIOS',
          eventNumber: 'TAOLU NANQUAN & NANGUN PUTRA (WS-TNNPA)',
          medal: 'Emas',
          schoolOrClub: 'Kontingen Kota Surabaya',
          performanceNote: 'TOTAL NILAI (9.241)',
          isPorprov2027Potential: false,
        },
      ],
    },
  },
};

interface RawPortalAthleteItem {
  medal: 'GOLD' | 'SILVER' | 'BRONZE' | string;
  medal_label?: string;
  match_number?: string;
  athlete_name?: string;
  notes?: string | null;
  entry_type?: string;
  contingent_name?: string;
}

function mapRawAthlete(item: RawPortalAthleteItem, prefix: string, idx: number): LiveAthleteMedal {
  const medal: 'Emas' | 'Perak' | 'Perunggu' =
    item.medal === 'GOLD'
      ? 'Emas'
      : item.medal === 'SILVER'
      ? 'Perak'
      : 'Perunggu';

  return {
    id: `${prefix}-${idx + 1}`,
    name: item.athlete_name || 'Kontingen Kota Surabaya',
    eventNumber: item.match_number || '-',
    medal,
    schoolOrClub:
      item.entry_type === 'CONTINGENT'
        ? 'Beregu Kontingen Kota Surabaya'
        : 'Kontingen Kota Surabaya',
    performanceNote:
      item.notes && String(item.notes).trim().length > 0
        ? String(item.notes).trim()
        : 'Tercatat pada Klasemen Resmi POPDA-PEPARPEDA Jatim 2026',
    isPorprov2027Potential: false,
  };
}

export async function GET() {
  const nowFormatted = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone: 'Asia/Jakarta',
  }).format(new Date());

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8500);

    const res = await fetch(SOURCE_URL, {
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const html = await res.text();

    // Locate Kota Surabaya section
    const rincianMarker = 'Rincian Medali Per Cabang Olahraga — Kota Surabaya';
    const idx = html.indexOf(rincianMarker);
    if (idx === -1) {
      throw new Error('Bagian Kota Surabaya tidak ditemukan pada HTML klasemen.');
    }

    const headerStart = html.lastIndexOf('contingent-card-wrapper', idx);
    const nextWrapper = html.indexOf('contingent-card-wrapper', idx);
    const sbyHtml = html.slice(
      headerStart > -1 ? headerStart : Math.max(0, idx - 2500),
      nextWrapper > -1 ? nextWrapper : idx + 25000
    );

    const goldMatch = sbyHtml.match(
      /title="Emas"[\s\S]*?<div class="fs-5[^"]*">(\d+)<\/div>/
    );
    const silverMatch = sbyHtml.match(
      /title="Perak"[\s\S]*?<div class="fs-5[^"]*">(\d+)<\/div>/
    );
    const bronzeMatch = sbyHtml.match(
      /title="Perunggu"[\s\S]*?<div class="fs-5[^"]*">(\d+)<\/div>/
    );
    const totalMatch = sbyHtml.match(
      /title="Total Medali"[\s\S]*?<div class="fs-5[^"]*">(\d+)<\/div>/
    );
    const podiumMatch = sbyHtml.match(/Podium\s*\d+|Peringkat\s*\d+/i);
    const caborCountMatch = sbyHtml.match(/(\d+)\s+Cabor Penyumbang/i);

    const overallGold = goldMatch ? parseInt(goldMatch[1], 10) : 23;
    const overallSilver = silverMatch ? parseInt(silverMatch[1], 10) : 26;
    const overallBronze = bronzeMatch ? parseInt(bronzeMatch[1], 10) : 31;
    const overallTotal = totalMatch
      ? parseInt(totalMatch[1], 10)
      : overallGold + overallSilver + overallBronze;

    // Parse athletesMedalData object from script
    let athletesMap: Record<string, RawPortalAthleteItem[]> = {};
    const athIdx = html.indexOf('athletesMedalData');
    if (athIdx > -1) {
      const scriptStart = html.lastIndexOf('<script', athIdx);
      const scriptEnd = html.indexOf('</script>', athIdx);
      if (scriptStart > -1 && scriptEnd > -1) {
        const scriptBlock = html.slice(scriptStart, scriptEnd);
        const jsonMatch = scriptBlock.match(
          /const\s+athletesMedalData\s*=\s*(\{[\s\S]*?\});/
        );
        if (jsonMatch) {
          try {
            athletesMap = JSON.parse(jsonMatch[1]);
          } catch {
            athletesMap = {};
          }
        }
      }
    }

    // Parse per-sport rows inside Kota Surabaya
    const byCaborName: Record<string, LiveCaborStanding> = {};
    const sportRegex =
      /openSportMedalsModal\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*\)[\s\S]*?title="Emas [^"]+"[\s\S]*?>(\d+)<\/div>[\s\S]*?title="Perak [^"]+"[\s\S]*?>(\d+)<\/div>[\s\S]*?title="Perunggu [^"]+"[\s\S]*?>(\d+)<\/div>[\s\S]*?title="Total Medali [^"]+"[\s\S]*?>(\d+)<\/div>/g;

    let match: RegExpExecArray | null;
    while ((match = sportRegex.exec(sbyHtml)) !== null) {
      const contingentUuid = match[1];
      const sportUuid = match[2];
      const rawSportName = match[4].trim().toUpperCase();
      const sGold = parseInt(match[5], 10) || 0;
      const sSilver = parseInt(match[6], 10) || 0;
      const sBronze = parseInt(match[7], 10) || 0;
      const sTotal = parseInt(match[8], 10) || sGold + sSilver + sBronze;

      const key = `${contingentUuid}_${sportUuid}`;
      const rawAthletes = athletesMap[key] || [];

      if (rawSportName === 'WUSHU') {
        // Split Wushu into Wushu Taolu and Wushu Sanda based on match_number
        const sandaRaw = rawAthletes.filter((a) =>
          (a.match_number || '').toUpperCase().includes('SANDA')
        );
        const taoluRaw = rawAthletes.filter(
          (a) => !(a.match_number || '').toUpperCase().includes('SANDA')
        );

        if (rawAthletes.length > 0) {
          const taoluGold = taoluRaw.filter((a) => a.medal === 'GOLD').length;
          const taoluSilver = taoluRaw.filter((a) => a.medal === 'SILVER').length;
          const taoluBronze = taoluRaw.filter((a) => a.medal === 'BRONZE').length;

          const sandaGold = sandaRaw.filter((a) => a.medal === 'GOLD').length;
          const sandaSilver = sandaRaw.filter((a) => a.medal === 'SILVER').length;
          const sandaBronze = sandaRaw.filter((a) => a.medal === 'BRONZE').length;

          byCaborName['WUSHU TAOLU'] = {
            sportName: 'Wushu Taolu',
            gold: taoluGold,
            silver: taoluSilver,
            bronze: taoluBronze,
            total: taoluGold + taoluSilver + taoluBronze,
            athletes: taoluRaw.map((item, idx) =>
              mapRawAthlete(item, 'live-wushu-taolu', idx)
            ),
          };

          byCaborName['WUSHU SANDA'] = {
            sportName: 'Wushu Sanda',
            gold: sandaGold,
            silver: sandaSilver,
            bronze: sandaBronze,
            total: sandaGold + sandaSilver + sandaBronze,
            athletes: sandaRaw.map((item, idx) =>
              mapRawAthlete(item, 'live-wushu-sanda', idx)
            ),
          };
        } else {
          byCaborName['WUSHU TAOLU'] = {
            sportName: 'Wushu Taolu',
            gold: sGold,
            silver: sSilver,
            bronze: sBronze,
            total: sTotal,
            athletes: [],
          };
        }
      } else {
        byCaborName[rawSportName] = {
          sportName: rawSportName,
          gold: sGold,
          silver: sSilver,
          bronze: sBronze,
          total: sTotal,
          athletes: rawAthletes.map((item, idx) =>
            mapRawAthlete(
              item,
              `live-${rawSportName.toLowerCase().replace(/\s+/g, '-')}`,
              idx
            )
          ),
        };
      }
    }

    const payload: LiveSurabayaKlasemenResponse = {
      sourceUrl: SOURCE_URL,
      contingent: 'Kota Surabaya',
      podium: podiumMatch ? podiumMatch[0] : 'Podium 2',
      contributingCabors: caborCountMatch
        ? parseInt(caborCountMatch[1], 10)
        : Object.keys(byCaborName).length,
      syncedAt: `${nowFormatted} WIB`,
      isLive: true,
      overall: {
        gold: overallGold,
        silver: overallSilver,
        bronze: overallBronze,
        total: overallTotal,
      },
      byCaborName,
    };

    return NextResponse.json(payload);
  } catch {
    const fallbackPayload: LiveSurabayaKlasemenResponse = {
      ...FALLBACK_SURABAYA_DATA,
      syncedAt: `${nowFormatted} WIB`,
      isLive: false,
    };
    return NextResponse.json(fallbackPayload);
  }
}

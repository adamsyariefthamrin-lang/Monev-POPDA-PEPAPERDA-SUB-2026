export type UserRole = 'guest' | 'monev' | 'ketum';

export type ScheduleCode = '' | 'TM' | 'TM/P' | 'P' | 'UPM' | 'UPN';

export interface AthleteMedal {
  id: string;
  name: string;
  eventNumber: string; // Nomor Pertandingan / Kelas
  medal: 'Emas' | 'Perak' | 'Perunggu';
  schoolOrClub: string;
  performanceNote: string;
  isPorprov2027Potential: boolean;
}

export interface DailyReportEntry {
  dateKey: string; // e.g. '2026-10-29' to '2026-11-11'
  dateLabel: string; // e.g. '29 Okt 2026'
  matchCondition: string; // Kondisi Pertandingan
  venueCondition: string; // Kondisi Venue
  athleteCondition: string; // Kondisi Atlet & Proyeksi PORPROV 2027
  additionalReport: string; // Laporan Tambahan
  photos: {
    id: string;
    caption: string;
    dataUrl: string;
    uploadedAt: string;
  }[];
  validatedByKetum: boolean;
  ketumNote?: string;
  updatedAt: string;
}

export interface CaborItem {
  id: string;
  no: number;
  name: string;
  pic: string;
  monevOfficer: string;
  coordinatingOfficers?: string[]; // e.g. Ardhi Semeru has coordination access to Sepak Bola
  gold: number;
  silver: number;
  bronze: number;
  venueName: string;
  venueRegion: 'Kab. Ngawi' | 'Kota Surabaya' | 'Kab. Kediri';
  venueAddress: string;
  lat: number;
  lng: number;
  athletes: AthleteMedal[];
  schedule: Record<string, ScheduleCode>;
  dailyReports: Record<string, DailyReportEntry>;
}

export interface MonevOfficerProfile {
  name: string;
  roleTitle: string;
  phone: string;
  primaryCaborCount: number;
  coordinationNote?: string;
}

export const MONEV_DATES = [
  { key: '2026-10-29', short: '29 Okt', label: '29 Oktober 2026', month: 'Oktober' },
  { key: '2026-10-30', short: '30 Okt', label: '30 Oktober 2026', month: 'Oktober' },
  { key: '2026-10-31', short: '31 Okt', label: '31 Oktober 2026', month: 'Oktober' },
  { key: '2026-11-01', short: '01 Nov', label: '1 November 2026', month: 'November' },
  { key: '2026-11-02', short: '02 Nov', label: '2 November 2026', month: 'November' },
  { key: '2026-11-03', short: '03 Nov', label: '3 November 2026', month: 'November' },
  { key: '2026-11-04', short: '04 Nov', label: '4 November 2026', month: 'November' },
  { key: '2026-11-05', short: '05 Nov', label: '5 November 2026', month: 'November' },
  { key: '2026-11-06', short: '06 Nov', label: '6 November 2026', month: 'November' },
  { key: '2026-11-07', short: '07 Nov', label: '7 November 2026', month: 'November' },
  { key: '2026-11-08', short: '08 Nov', label: '8 November 2026', month: 'November' },
  { key: '2026-11-09', short: '09 Nov', label: '9 November 2026', month: 'November' },
  { key: '2026-11-10', short: '10 Nov', label: '10 November 2026', month: 'November' },
  { key: '2026-11-11', short: '11 Nov', label: '11 November 2026', month: 'November' },
];

export const JURNAL_MONEV_DATES = MONEV_DATES.filter(
  (d) => d.key >= '2026-11-01' && d.key <= '2026-11-11'
);

export const POSKO_MONEV = {
  name: 'Hotel Riski Samudra (Posko Utama Monev Kontingen Kota Surabaya)',
  address: 'Jl. Basuki Rahmat, Winong, Margomulyo, Kec. Ngawi, Kabupaten Ngawi, Jawa Timur 63217',
  lat: -7.4068,
  lng: 111.4464,
  operationalHours: '24 Jam Selama POPDA XIV & PEPAPERDA II Jatim (29 Okt – 11 Nov 2026)',
  commandCenterContact: '+62 811-3400-2026 (Sekretariat Posko KONI & Dispora Surabaya)',
};

export const MONEV_OFFICERS: MonevOfficerProfile[] = [
  {
    name: 'Ardhi Semeru',
    roleTitle: 'Koordinator Tim Monev I',
    phone: '0812-3011-4401',
    primaryCaborCount: 10,
    coordinationNote: '10 Cabor Utama + Akses Koordinasi Cabor Sepak Bola',
  },
  {
    name: 'Darryl Dharmawan',
    roleTitle: 'Petugas Monev II (Bela Diri & Terukur)',
    phone: '0812-3011-4402',
    primaryCaborCount: 4,
  },
  {
    name: 'Puji Kurniawati',
    roleTitle: 'Petugas Monev III (Permainan Beregu)',
    phone: '0812-3011-4403',
    primaryCaborCount: 3,
  },
  {
    name: 'Novita Indah',
    roleTitle: 'Petugas Monev IV (Raket & Perairan)',
    phone: '0812-3011-4404',
    primaryCaborCount: 3,
  },
  {
    name: 'Rudik Setiawan',
    roleTitle: 'Petugas Monev V (Bela Diri Kontak)',
    phone: '0812-3011-4405',
    primaryCaborCount: 3,
  },
  {
    name: 'Alan Brahamantyo',
    roleTitle: 'Petugas Monev VI (Bela Diri & Sepak Bola)',
    phone: '0812-3011-4406',
    primaryCaborCount: 4,
  },
  {
    name: 'Dwi Priatmawati',
    roleTitle: 'Petugas Monev VII (Akurasi & Konsentrasi)',
    phone: '0812-3011-4407',
    primaryCaborCount: 3,
  },
];

// Helper to generate SVG documentation data URL so every cabor has crisp built-in photo documentation
export function createDocumentationDataUrl(caborName: string, venueName: string, dateLabel: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0A2540"/>
        <stop offset="55%" stop-color="#0F3456"/>
        <stop offset="100%" stop-color="#0D9488"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(#bg)"/>
    <circle cx="680" cy="110" r="140" fill="#F59E0B" opacity="0.14"/>
    <circle cx="120" cy="420" r="180" fill="#0D9488" opacity="0.18"/>
    <rect x="40" y="40" width="720" height="420" rx="12" fill="none" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="2"/>
    <rect x="64" y="64" width="290" height="32" rx="4" fill="#F59E0B"/>
    <text x="78" y="85" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0A2540">DOKUMENTASI MONEV KONTINGEN SURABAYA</text>
    <text x="64" y="165" font-family="sans-serif" font-size="36" font-weight="bold" fill="#FFFFFF">CABOR ${caborName.toUpperCase()}</text>
    <text x="64" y="210" font-family="sans-serif" font-size="19" fill="#E2E8F0">Lokasi Venue: ${venueName}</text>
    <text x="64" y="245" font-family="sans-serif" font-size="16" fill="#94A3B8">Tanggal Evaluasi: ${dateLabel} · POPDA XIV / PEPAPERDA II Jatim 2026</text>
    <g transform="translate(64, 300)">
      <rect width="672" height="110" rx="8" fill="#0A2540" fill-opacity="0.65" stroke="#0D9488" stroke-width="1.5"/>
      <text x="24" y="38" font-family="sans-serif" font-size="15" font-weight="bold" fill="#5EEAD4">VERIFIKASI LAPANGAN TIM MONEV KONI KOTA SURABAYA</text>
      <text x="24" y="66" font-family="sans-serif" font-size="14" fill="#F8FAFC">Kondisi kesiapan teknis atlet, kelayakan arena pertandingan, serta pemantauan</text>
      <text x="24" y="88" font-family="sans-serif" font-size="14" fill="#F8FAFC">talenta potensial menuju Pemusatan Latihan Cabang (Puslatcab) PORPROV Jatim 2027.</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function buildSchedule(
  tmDay: string,
  tmpDay: string,
  pDays: string[],
  upmDays: string[]
): Record<string, ScheduleCode> {
  const map: Record<string, ScheduleCode> = {};
  MONEV_DATES.forEach((d) => {
    map[d.key] = '';
  });
  map['2026-11-03'] = 'UPN'; // Opening Ceremony POPDA XIV
  map['2026-11-10'] = 'UPN'; // Closing Ceremony
  if (tmDay) map[tmDay] = 'TM';
  if (tmpDay) map[tmpDay] = 'TM/P';
  pDays.forEach((d) => {
    map[d] = 'P';
  });
  upmDays.forEach((d) => {
    map[d] = 'UPM';
  });
  return map;
}

function buildInitialReports(
  caborName: string,
  pic: string,
  venueName: string,
  officer: string,
  topAthlete: string
): Record<string, DailyReportEntry> {
  const reports: Record<string, DailyReportEntry> = {};
  const sampleDates = ['2026-11-01', '2026-11-02', '2026-11-03'];
  sampleDates.forEach((dKey, idx) => {
    const dObj = MONEV_DATES.find((d) => d.key === dKey)!;
    reports[dKey] = {
      dateKey: dKey,
      dateLabel: dObj.label,
      matchCondition:
        idx === 0
          ? `Technical Meeting dan babak penyisihan awal Cabor ${caborName} berjalan tertib sesuai regulasi Technical Handbook POPDA XIV Jatim. Koordinasi bersama PIC ${pic} berjalan lancar.`
          : idx === 1
          ? `Pertandingan fase gugur dan semifinal Cabor ${caborName} berlangsung dengan tensi kompetitif tinggi melawan kontingen Malang dan Sidoarjo. Wasit memimpin secara objektif.`
          : `Babak final dan perebutan medali Cabor ${caborName} berlangsung kondusif. Kontingen Surabaya berhasil mengamankan podium utama sesuai target harian.`,
      venueCondition: `Arena ${venueName} dalam kondisi layak tanding, pencahayaan dan sirkulasi udara memadai, serta fasilitas medis lapangan siaga penuh.`,
      athleteCondition: `Seluruh atlet Cabor ${caborName} dalam kondisi fisik prima (100% fit) tanpa cedera serius. ${topAthlete} menunjukkan performa luar biasa dan sangat direkomendasikan masuk proyeksi Puslatcab PORPROV Jatim 2027.`,
      additionalReport: `Suplai nutrisi, vitamin, dan transportasi dari Posko Hotel Riski Samudra menuju ${venueName} terdistribusi tepat waktu 90 menit sebelum jadwal tanding.`,
      photos:
        idx === 2
          ? [
              {
                id: `photo-${caborName.toLowerCase().replace(/\s+/g, '-')}-1`,
                caption: `Dokumentasi Evaluasi & Podium Medali Cabor ${caborName} di ${venueName}`,
                dataUrl: createDocumentationDataUrl(caborName, venueName, dObj.label),
                uploadedAt: '2026-11-03 16:45 WIB',
              },
            ]
          : [],
      validatedByKetum: idx < 2,
      ketumNote:
        idx < 2
          ? 'Laporan diterima dan tervalidasi. Pertahankan konsistensi perolehan medali dan kawal atlet proyeksi PORPROV 2027.'
          : undefined,
      updatedAt: `${dObj.label}, 17:30 WIB oleh ${officer}`,
    };
  });
  return reports;
}

const BASE_CABOR_DATA: CaborItem[] = [
  // ================= 1. ARDHI SEMERU (10 Cabor + Koordinasi Sepak Bola) =================
  {
    id: 'cabor-1',
    no: 1,
    name: 'Atletik',
    pic: 'Rahayu',
    monevOfficer: 'Ardhi Semeru',
    gold: 7,
    silver: 4,
    bronze: 3,
    venueName: 'Stadion Ketonggo Ngawi',
    venueRegion: 'Kab. Ngawi',
    venueAddress: 'Jl. Jaksa Agung Suprapto No.12, Ketanggi, Kec. Ngawi, Kab. Ngawi',
    lat: -7.4039,
    lng: 111.4449,
    athletes: [
      {
        id: 'atl-1',
        name: 'Bagas Pratama Wijaya',
        eventNumber: 'Lari 100m Putra',
        medal: 'Emas',
        schoolOrClub: 'SMAN Olahraga / PASI Surabaya',
        performanceNote: 'Catatan waktu 10.68 detik (Rekor Baru POPDA Jatim)',
        isPorprov2027Potential: true,
      },
      {
        id: 'atl-2',
        name: 'Nadia Kusuma Wardhani',
        eventNumber: 'Lompat Jauh Putri',
        medal: 'Emas',
        schoolOrClub: 'SMAN 5 Surabaya',
        performanceNote: 'Lompatan terbaik 5.74 meter, teknik tolakan sangat matang',
        isPorprov2027Potential: true,
      },
      {
        id: 'atl-3',
        name: 'Kuartet Estafet Putra SBY',
        eventNumber: 'Estafet 4x100m Putra',
        medal: 'Emas',
        schoolOrClub: 'Tim PASI Kota Surabaya',
        performanceNote: 'Unggul 0.45 detik dari peringkat kedua',
        isPorprov2027Potential: true,
      },
      {
        id: 'atl-4',
        name: 'Rizky Aditya Saputra',
        eventNumber: 'Tolak Peluru Putra',
        medal: 'Perak',
        schoolOrClub: 'SMKN 2 Surabaya',
        performanceNote: 'Tolakan 14.82 meter',
        isPorprov2027Potential: false,
      },
    ],
    schedule: buildSchedule(
      '2026-11-02',
      '2026-11-03',
      ['2026-11-04', '2026-11-05', '2026-11-06'],
      ['2026-11-07', '2026-11-08']
    ),
    dailyReports: buildInitialReports('Atletik', 'Rahayu', 'Stadion Ketonggo Ngawi', 'Ardhi Semeru', 'Bagas Pratama Wijaya'),
  },
  {
    id: 'cabor-2',
    no: 2,
    name: 'Akuatik',
    pic: 'Budi Primanto',
    monevOfficer: 'Ardhi Semeru',
    gold: 9,
    silver: 6,
    bronze: 4,
    venueName: 'Kolam Renang Dispora Jatim Surabaya',
    venueRegion: 'Kota Surabaya',
    venueAddress: 'Jl. Kertajaya Indah Timur No.1, Manyar Sabrangan, Kec. Mulyorejo, Kota Surabaya',
    lat: -7.2798,
    lng: 112.7815,
    athletes: [
      {
        id: 'aku-1',
        name: 'Chelsea Alexandra Putri',
        eventNumber: '100m Gaya Bebas Putri',
        medal: 'Emas',
        schoolOrClub: 'SMAN 2 Surabaya / Hiu Aquatic',
        performanceNote: 'Waktu 57.92 detik, dominasi penuh sejak 50m pertama',
        isPorprov2027Potential: true,
      },
      {
        id: 'aku-2',
        name: 'Darren Nicholas Tan',
        eventNumber: '200m Gaya Ganti Perorangan Putra',
        medal: 'Emas',
        schoolOrClub: 'SMA Kristen Petra 1 Surabaya',
        performanceNote: 'Split gaya dada dan bebas sangat eksplosif',
        isPorprov2027Potential: true,
      },
      {
        id: 'aku-3',
        name: 'Aurelia Maharani',
        eventNumber: '50m Gaya Kupu-Kupu Putri',
        medal: 'Perak',
        schoolOrClub: 'SMAN 15 Surabaya',
        performanceNote: 'Selisih 0.12 detik dari medali emas',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-10-31',
      '2026-11-01',
      ['2026-11-02', '2026-11-03'],
      ['2026-11-04', '2026-11-05']
    ),
    dailyReports: buildInitialReports('Akuatik', 'Budi Primanto', 'Kolam Renang Dispora Jatim Surabaya', 'Ardhi Semeru', 'Chelsea Alexandra Putri'),
  },
  {
    id: 'cabor-3',
    no: 3,
    name: 'Bola Voli Pantai',
    pic: 'Eko',
    monevOfficer: 'Ardhi Semeru',
    gold: 2,
    silver: 1,
    bronze: 1,
    venueName: 'Lapangan Voli Pantai Alun-Alun Merdeka Ngawi',
    venueRegion: 'Kab. Ngawi',
    venueAddress: 'Jl. Merdeka, Kluncing, Ketanggi, Kec. Ngawi, Kab. Ngawi',
    lat: -7.4018,
    lng: 111.4426,
    athletes: [
      {
        id: 'bvp-1',
        name: 'Dimas Wahyu & Fajar Ramadhan',
        eventNumber: 'Beregu 2x2 Putra',
        medal: 'Emas',
        schoolOrClub: 'PBVSI Kota Surabaya',
        performanceNote: 'Menang straight set 2-0 (21-16, 21-14) di babak final',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-11-03',
      '2026-11-04',
      ['2026-11-05', '2026-11-06', '2026-11-07'],
      ['2026-11-08']
    ),
    dailyReports: buildInitialReports('Bola Voli Pantai', 'Eko', 'Lapangan Voli Pantai Alun-Alun Merdeka Ngawi', 'Ardhi Semeru', 'Dimas Wahyu & Fajar Ramadhan'),
  },
  {
    id: 'cabor-4',
    no: 4,
    name: 'Judo',
    pic: 'Venny Pantaow',
    monevOfficer: 'Ardhi Semeru',
    gold: 3,
    silver: 2,
    bronze: 3,
    venueName: 'Aula Gedung Eka Kapti Ngawi',
    venueRegion: 'Kab. Ngawi',
    venueAddress: 'Jl. Jaksa Agung Suprapto No.8, Ketanggi, Kec. Ngawi, Kab. Ngawi',
    lat: -7.4032,
    lng: 111.4438,
    athletes: [
      {
        id: 'jud-1',
        name: 'Kenshin Pratama',
        eventNumber: 'Kelas -66 kg Putra',
        medal: 'Emas',
        schoolOrClub: 'PJSI Kota Surabaya',
        performanceNote: 'Kemenangan Ippon di partai final dalam waktu 1 menit 42 detik',
        isPorprov2027Potential: true,
      },
      {
        id: 'jud-2',
        name: 'Larasati Dewi',
        eventNumber: 'Kelas -52 kg Putri',
        medal: 'Emas',
        schoolOrClub: 'SMAN 9 Surabaya',
        performanceNote: 'Teknik bantingan Uchi-mata sangat presisi',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-11-04',
      '2026-11-05',
      ['2026-11-06', '2026-11-07'],
      ['2026-11-08']
    ),
    dailyReports: buildInitialReports('Judo', 'Venny Pantaow', 'Aula Gedung Eka Kapti Ngawi', 'Ardhi Semeru', 'Kenshin Pratama'),
  },
  {
    id: 'cabor-5',
    no: 5,
    name: 'Menembak',
    pic: 'Erlin',
    monevOfficer: 'Ardhi Semeru',
    gold: 4,
    silver: 3,
    bronze: 2,
    venueName: 'Lapangan Tembak Yonarmed 12 Kostrad Ngawi',
    venueRegion: 'Kab. Ngawi',
    venueAddress: 'Jl. Siliwangi, Grudo, Kec. Ngawi, Kab. Ngawi',
    lat: -7.4175,
    lng: 111.4342,
    athletes: [
      {
        id: 'mnm-1',
        name: 'Naufal Azhar Gunawan',
        eventNumber: '10m Air Rifle Men Youth',
        medal: 'Emas',
        schoolOrClub: 'Perbakin Kota Surabaya',
        performanceNote: 'Skor kualifikasi dan final tertinggi (248.6 poin)',
        isPorprov2027Potential: true,
      },
      {
        id: 'mnm-2',
        name: 'Kayla Putri Maharani',
        eventNumber: '10m Air Pistol Women Youth',
        medal: 'Emas',
        schoolOrClub: 'SMAN 6 Surabaya',
        performanceNote: 'Ketenangan mental di seri eliminasi sangat stabil',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-11-02',
      '2026-11-03',
      ['2026-11-04', '2026-11-05'],
      ['2026-11-06', '2026-11-07']
    ),
    dailyReports: buildInitialReports('Menembak', 'Erlin', 'Lapangan Tembak Yonarmed 12 Kostrad Ngawi', 'Ardhi Semeru', 'Naufal Azhar Gunawan'),
  },
  {
    id: 'cabor-6',
    no: 6,
    name: 'Panjat Tebing',
    pic: 'Efendi',
    monevOfficer: 'Ardhi Semeru',
    gold: 4,
    silver: 2,
    bronze: 2,
    venueName: 'Arena Wall Climbing Alun-Alun Merdeka Ngawi',
    venueRegion: 'Kab. Ngawi',
    venueAddress: 'Sisi Timur Alun-Alun Merdeka, Kec. Ngawi, Kab. Ngawi',
    lat: -7.4012,
    lng: 111.4431,
    athletes: [
      {
        id: 'pjt-1',
        name: 'Galang Ramadhan Putra',
        eventNumber: 'Speed WR Putra',
        medal: 'Emas',
        schoolOrClub: 'FPTI Kota Surabaya',
        performanceNote: 'Catatan waktu 5.38 detik, sangat potensial untuk tim inti PORPROV',
        isPorprov2027Potential: true,
      },
      {
        id: 'pjt-2',
        name: 'Salsabila Nur Aini',
        eventNumber: 'Lead Perorangan Putri',
        medal: 'Emas',
        schoolOrClub: 'SMAN 11 Surabaya',
        performanceNote: 'Mencapai Top di babak final',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-11-03',
      '2026-11-04',
      ['2026-11-05', '2026-11-06', '2026-11-07'],
      ['2026-11-08', '2026-11-09']
    ),
    dailyReports: buildInitialReports('Panjat Tebing', 'Efendi', 'Arena Wall Climbing Alun-Alun Merdeka Ngawi', 'Ardhi Semeru', 'Galang Ramadhan Putra'),
  },
  {
    id: 'cabor-7',
    no: 7,
    name: 'Selam',
    pic: 'Sri Heksi',
    monevOfficer: 'Ardhi Semeru',
    gold: 6,
    silver: 5,
    bronze: 3,
    venueName: 'Kolam Renang Dispora Jatim Surabaya',
    venueRegion: 'Kota Surabaya',
    venueAddress: 'Jl. Kertajaya Indah Timur No.1, Mulyorejo, Kota Surabaya',
    lat: -7.2801,
    lng: 112.7819,
    athletes: [
      {
        id: 'slm-1',
        name: 'Revan Adi Nugroho',
        eventNumber: '100m Surface Putra',
        medal: 'Emas',
        schoolOrClub: 'POSSI Kota Surabaya',
        performanceNote: 'Dominasi nomor finswimming jarak pendek dan menengah',
        isPorprov2027Potential: true,
      },
      {
        id: 'slm-2',
        name: 'Tiara Kusuma Dewi',
        eventNumber: '50m Bifins Putri',
        medal: 'Emas',
        schoolOrClub: 'SMAN 4 Surabaya',
        performanceNote: 'Rekor personal best terbaik musim 2026',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-11-05',
      '2026-11-06',
      ['2026-11-07', '2026-11-08'],
      ['2026-11-09']
    ),
    dailyReports: buildInitialReports('Selam', 'Sri Heksi', 'Kolam Renang Dispora Jatim Surabaya', 'Ardhi Semeru', 'Revan Adi Nugroho'),
  },
  {
    id: 'cabor-8',
    no: 8,
    name: 'Senam',
    pic: 'Christine',
    monevOfficer: 'Ardhi Semeru',
    gold: 5,
    silver: 3,
    bronze: 3,
    venueName: 'Gedung Nusantara Landungsari Surabaya',
    venueRegion: 'Kota Surabaya',
    venueAddress: 'Jl. Kertajaya Indah, Kompleks KONI Jatim, Kota Surabaya',
    lat: -7.2785,
    lng: 112.7798,
    athletes: [
      {
        id: 'snm-1',
        name: 'Michelle Valencia',
        eventNumber: 'Artistik Serba Bisa (All-Around) Putri',
        medal: 'Emas',
        schoolOrClub: 'Persani Kota Surabaya',
        performanceNote: 'Eksekusi balok keseimbangan dan lantai sangat bersih',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-10-30',
      '2026-10-31',
      ['2026-11-01', '2026-11-02'],
      ['2026-11-03']
    ),
    dailyReports: buildInitialReports('Senam', 'Christine', 'Gedung Nusantara Landungsari Surabaya', 'Ardhi Semeru', 'Michelle Valencia'),
  },
  {
    id: 'cabor-9',
    no: 9,
    name: 'Sepak Takraw',
    pic: 'Ponco',
    monevOfficer: 'Ardhi Semeru',
    gold: 1,
    silver: 2,
    bronze: 2,
    venueName: 'GOR SMAN 2 Ngawi',
    venueRegion: 'Kab. Ngawi',
    venueAddress: 'Jl. Ahmad Yani, Klitik, Kec. Geneng, Kab. Ngawi',
    lat: -7.4321,
    lng: 111.4385,
    athletes: [
      {
        id: 'stk-1',
        name: 'Tim Quadrant Putra Surabaya',
        eventNumber: 'Quadrant Putra',
        medal: 'Emas',
        schoolOrClub: 'PSTI Kota Surabaya',
        performanceNote: 'Kekompakan blok dan servis tekong sangat tajam',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-11-03',
      '2026-11-04',
      ['2026-11-05', '2026-11-06', '2026-11-07'],
      ['2026-11-08']
    ),
    dailyReports: buildInitialReports('Sepak Takraw', 'Ponco', 'GOR SMAN 2 Ngawi', 'Ardhi Semeru', 'Tim Quadrant Putra Surabaya'),
  },
  {
    id: 'cabor-10',
    no: 10,
    name: 'Wushu Taolu',
    pic: 'Kriswanto',
    monevOfficer: 'Ardhi Semeru',
    gold: 5,
    silver: 4,
    bronze: 2,
    venueName: 'GOR Bung Hatta Ngawi',
    venueRegion: 'Kab. Ngawi',
    venueAddress: 'Jl. Ir. Soekarno, Beran, Kec. Ngawi, Kab. Ngawi',
    lat: -7.4198,
    lng: 111.4301,
    athletes: [
      {
        id: 'wta-1',
        name: 'Jason Alexander Wijaya',
        eventNumber: 'Changquan & Daoshu Putra',
        medal: 'Emas',
        schoolOrClub: 'Sasakawa Wushu Surabaya',
        performanceNote: 'Skor 9.68, lompatan 540 derajat mendarat sempurna',
        isPorprov2027Potential: true,
      },
      {
        id: 'wta-2',
        name: 'Evelyn Natalia Tan',
        eventNumber: 'Jianshu & Qiangshu Putri',
        medal: 'Emas',
        schoolOrClub: 'WI Kota Surabaya',
        performanceNote: 'Atlet binaan utama proyeksi emas PORPROV 2027',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-11-02',
      '2026-11-03',
      ['2026-11-04', '2026-11-05'],
      ['2026-11-06']
    ),
    dailyReports: buildInitialReports('Wushu Taolu', 'Kriswanto', 'GOR Bung Hatta Ngawi', 'Ardhi Semeru', 'Jason Alexander Wijaya'),
  },

  // ================= 2. DARRYL DHARMAWAN (4 Cabor) =================
  {
    id: 'cabor-11',
    no: 11,
    name: 'Angkat Besi',
    pic: 'Choirul Anwar',
    monevOfficer: 'Darryl Dharmawan',
    gold: 3,
    silver: 2,
    bronze: 2,
    venueName: 'Aula SMKN 1 Ngawi',
    venueRegion: 'Kab. Ngawi',
    venueAddress: 'Jl. Teuku Umar No.10, Ketanggi, Kec. Ngawi, Kab. Ngawi',
    lat: -7.4052,
    lng: 111.4482,
    athletes: [
      {
        id: 'ab-1',
        name: 'Bima Sakti Pamungkas',
        eventNumber: 'Kelas 61 kg Putra (Snatch & Clean Jerk)',
        medal: 'Emas',
        schoolOrClub: 'PABSI Kota Surabaya',
        performanceNote: 'Total angkatan 218 kg, melampaui limit kualifikasi PORPROV',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-11-03',
      '2026-11-04',
      ['2026-11-05', '2026-11-06'],
      ['2026-11-07']
    ),
    dailyReports: buildInitialReports('Angkat Besi', 'Choirul Anwar', 'Aula SMKN 1 Ngawi', 'Darryl Dharmawan', 'Bima Sakti Pamungkas'),
  },
  {
    id: 'cabor-12',
    no: 12,
    name: 'Balap Sepeda',
    pic: 'Besari',
    monevOfficer: 'Darryl Dharmawan',
    gold: 4,
    silver: 3,
    bronze: 3,
    venueName: 'Sirkuit Jalan Raya Ringroad Ngawi & Velodrome Surabaya',
    venueRegion: 'Kab. Ngawi',
    venueAddress: 'Jl. Ringroad Barat Ngawi, Kec. Ngawi, Kab. Ngawi',
    lat: -7.4141,
    lng: 111.4258,
    athletes: [
      {
        id: 'bsp-1',
        name: 'Aldi Pratama Kusuma',
        eventNumber: 'Criterium Putra & Individual Time Trial',
        medal: 'Emas',
        schoolOrClub: 'ISSI Kota Surabaya',
        performanceNote: 'VO2Max dan daya tahan tanjakan sangat istimewa',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-11-02',
      '2026-11-03',
      ['2026-11-04', '2026-11-05', '2026-11-06'],
      ['2026-11-07', '2026-11-08']
    ),
    dailyReports: buildInitialReports('Balap Sepeda', 'Besari', 'Sirkuit Jalan Raya Ringroad Ngawi', 'Darryl Dharmawan', 'Aldi Pratama Kusuma'),
  },
  {
    id: 'cabor-13',
    no: 13,
    name: 'Pencak Silat',
    pic: 'Dhany',
    monevOfficer: 'Darryl Dharmawan',
    gold: 4,
    silver: 3,
    bronze: 4,
    venueName: 'Padepokan PSHT Cabang Ngawi',
    venueRegion: 'Kab. Ngawi',
    venueAddress: 'Jl. Raya Solo - Ngawi, Beran, Kec. Ngawi, Kab. Ngawi',
    lat: -7.4162,
    lng: 111.4319,
    athletes: [
      {
        id: 'psl-1',
        name: 'Maulana Malik Ibrahim',
        eventNumber: 'Tanding Kelas D Putra',
        medal: 'Emas',
        schoolOrClub: 'IPSI Kota Surabaya',
        performanceNote: 'Menang mutlak 5-0 di partai puncak atas wakil Madiun',
        isPorprov2027Potential: true,
      },
      {
        id: 'psl-2',
        name: 'Siti Nurhaliza Putri',
        eventNumber: 'Seni Tunggal Baku Putri',
        medal: 'Emas',
        schoolOrClub: 'SMAN 7 Surabaya',
        performanceNote: 'Skor kemantapan jurus tertinggi 9.94',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-11-03',
      '2026-11-04',
      ['2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08'],
      ['2026-11-09']
    ),
    dailyReports: buildInitialReports('Pencak Silat', 'Dhany', 'Padepokan PSHT Cabang Ngawi', 'Darryl Dharmawan', 'Maulana Malik Ibrahim'),
  },
  {
    id: 'cabor-14',
    no: 14,
    name: 'Taekwondo',
    pic: 'Herry Zahro',
    monevOfficer: 'Darryl Dharmawan',
    gold: 5,
    silver: 3,
    bronze: 4,
    venueName: 'GOR Bung Hatta Ngawi (Hall B)',
    venueRegion: 'Kab. Ngawi',
    venueAddress: 'Jl. Ir. Soekarno, Beran, Kec. Ngawi, Kab. Ngawi',
    lat: -7.4202,
    lng: 111.4305,
    athletes: [
      {
        id: 'tkd-1',
        name: 'Rafi Akbar Hidayat',
        eventNumber: 'Kyorugi Under 59 kg Putra',
        medal: 'Emas',
        schoolOrClub: 'TI Kota Surabaya',
        performanceNote: 'Akurasi tendangan Dolke Chagi ke head protector sangat efektif',
        isPorprov2027Potential: true,
      },
      {
        id: 'tkd-2',
        name: 'Keisya Aurelia',
        eventNumber: 'Poomsae Individual Putri',
        medal: 'Emas',
        schoolOrClub: 'SMAN 16 Surabaya',
        performanceNote: 'Juara bertahan Kejurprov & POPDA',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-11-05',
      '2026-11-06',
      ['2026-11-07', '2026-11-08'],
      ['2026-11-09']
    ),
    dailyReports: buildInitialReports('Taekwondo', 'Herry Zahro', 'GOR Bung Hatta Ngawi (Hall B)', 'Darryl Dharmawan', 'Rafi Akbar Hidayat'),
  },

  // ================= 3. PUJI KURNIAWATI (3 Cabor) =================
  {
    id: 'cabor-15',
    no: 15,
    name: 'Bola Voli Indoor',
    pic: 'Firman',
    monevOfficer: 'Puji Kurniawati',
    gold: 1,
    silver: 1,
    bronze: 0,
    venueName: 'GOR Bung Hatta Ngawi (Arena Utama)',
    venueRegion: 'Kab. Ngawi',
    venueAddress: 'Jl. Ir. Soekarno, Beran, Kec. Ngawi, Kab. Ngawi',
    lat: -7.4195,
    lng: 111.4298,
    athletes: [
      {
        id: 'bvi-1',
        name: 'Tim Bola Voli Indoor Putri Surabaya',
        eventNumber: 'Beregu Putri',
        medal: 'Emas',
        schoolOrClub: 'PBVSI Kota Surabaya (Inti Bank Jatim Junior)',
        performanceNote: 'Tak terkalahkan sejak fase grup hingga final (3-0)',
        isPorprov2027Potential: true,
      },
      {
        id: 'bvi-2',
        name: 'Tim Bola Voli Indoor Putra Surabaya',
        eventNumber: 'Beregu Putra',
        medal: 'Perak',
        schoolOrClub: 'PBVSI Kota Surabaya',
        performanceNote: 'Tampil solid hingga 5 set di partai final',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-11-01',
      '2026-11-02',
      ['2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07'],
      ['2026-11-08']
    ),
    dailyReports: buildInitialReports('Bola Voli Indoor', 'Firman', 'GOR Bung Hatta Ngawi (Arena Utama)', 'Puji Kurniawati', 'Tim Bola Voli Indoor Putri Surabaya'),
  },
  {
    id: 'cabor-16',
    no: 16,
    name: 'Bola Basket',
    pic: 'Hasan Fuadi',
    monevOfficer: 'Puji Kurniawati',
    gold: 2,
    silver: 0,
    bronze: 0,
    venueName: 'GOR SMAN 1 Ngawi & Arena Basket Pare Kediri',
    venueRegion: 'Kab. Ngawi',
    venueAddress: 'Jl. Ahmad Yani No.45, Beran, Kec. Ngawi, Kab. Ngawi',
    lat: -7.4125,
    lng: 111.4412,
    athletes: [
      {
        id: 'bsk-1',
        name: 'Tim Basket 5x5 Putra Surabaya',
        eventNumber: 'Beregu 5x5 Putra',
        medal: 'Emas',
        schoolOrClub: 'Perbasi Kota Surabaya',
        performanceNote: 'Kawin gelar Emas Putra & Putri, materi pemain siap ke PORPROV 2027',
        isPorprov2027Potential: true,
      },
      {
        id: 'bsk-2',
        name: 'Tim Basket 5x5 Putri Surabaya',
        eventNumber: 'Beregu 5x5 Putri',
        medal: 'Emas',
        schoolOrClub: 'Perbasi Kota Surabaya',
        performanceNote: 'Unggul rata-rata 25 poin di setiap pertandingan',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-10-30',
      '2026-10-31',
      ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05'],
      ['2026-11-06']
    ),
    dailyReports: buildInitialReports('Bola Basket', 'Hasan Fuadi', 'GOR SMAN 1 Ngawi', 'Puji Kurniawati', 'Tim Basket 5x5 Putra & Putri Surabaya'),
  },
  {
    id: 'cabor-17',
    no: 17,
    name: 'Tenis',
    pic: 'Antok',
    monevOfficer: 'Puji Kurniawati',
    gold: 3,
    silver: 2,
    bronze: 1,
    venueName: 'Lapangan Tenis Pendopo Wedya Graha Ngawi',
    venueRegion: 'Kab. Ngawi',
    venueAddress: 'Jl. Teuku Umar No.1, Ketanggi, Kec. Ngawi, Kab. Ngawi',
    lat: -7.4008,
    lng: 111.4442,
    athletes: [
      {
        id: 'tns-1',
        name: 'Christopher Bryan Halim',
        eventNumber: 'Tunggal Putra & Beregu Putra',
        medal: 'Emas',
        schoolOrClub: 'Pelti Kota Surabaya',
        performanceNote: 'Servis pertama keras dan konsistensi baseline sangat tinggi',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-11-02',
      '2026-11-03',
      ['2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07'],
      ['2026-11-08']
    ),
    dailyReports: buildInitialReports('Tenis', 'Antok', 'Lapangan Tenis Pendopo Wedya Graha Ngawi', 'Puji Kurniawati', 'Christopher Bryan Halim'),
  },

  // ================= 4. NOVITA INDAH (3 Cabor) =================
  {
    id: 'cabor-18',
    no: 18,
    name: 'Bulu Tangkis',
    pic: 'Gina',
    monevOfficer: 'Novita Indah',
    gold: 4,
    silver: 3,
    bronze: 2,
    venueName: 'GOR Badminton Sudirman Ngawi',
    venueRegion: 'Kab. Ngawi',
    venueAddress: 'Jl. Panglima Sudirman No.28, Margomulyo, Kec. Ngawi, Kab. Ngawi',
    lat: -7.4046,
    lng: 111.4471,
    athletes: [
      {
        id: 'btk-1',
        name: 'Raka Surya & Kevin Sanjaya Putra',
        eventNumber: 'Ganda Putra Remaja',
        medal: 'Emas',
        schoolOrClub: 'PBSI Kota Surabaya / PB Suryanaga',
        performanceNote: 'Permainan cepat di depan net sangat dominan',
        isPorprov2027Potential: true,
      },
      {
        id: 'btk-2',
        name: 'Felicia Amanda',
        eventNumber: 'Tunggal Putri',
        medal: 'Emas',
        schoolOrClub: 'PB Hi-Qua Wima Surabaya',
        performanceNote: 'Stamina dan footwork sangat siap untuk level PORPROV',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-11-02',
      '2026-11-03',
      ['2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07'],
      ['2026-11-08', '2026-11-09']
    ),
    dailyReports: buildInitialReports('Bulu Tangkis', 'Gina', 'GOR Badminton Sudirman Ngawi', 'Novita Indah', 'Raka Surya & Felicia Amanda'),
  },
  {
    id: 'cabor-19',
    no: 19,
    name: 'Dayung',
    pic: 'Suwarto',
    monevOfficer: 'Novita Indah',
    gold: 3,
    silver: 2,
    bronze: 2,
    venueName: 'Waduk Pondok Ngawi & Bendung Gerak Waru Turi Kediri',
    venueRegion: 'Kab. Kediri',
    venueAddress: 'Kawasan Wisata Waduk Pondok / Sungai Brantas Waru Turi, Gampengrejo, Kab. Kediri',
    lat: -7.7689,
    lng: 112.0124,
    athletes: [
      {
        id: 'dyg-1',
        name: 'Hendrik Setiawan',
        eventNumber: 'Kayak 1 (K-1) 1000m Putra',
        medal: 'Emas',
        schoolOrClub: 'PODSI Kota Surabaya',
        performanceNote: 'Ritme kayuhan konstan di 250m terakhir',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-11-03',
      '2026-11-04',
      ['2026-11-05', '2026-11-06'],
      ['2026-11-07']
    ),
    dailyReports: buildInitialReports('Dayung', 'Suwarto', 'Bendung Gerak Waru Turi Kediri', 'Novita Indah', 'Hendrik Setiawan'),
  },
  {
    id: 'cabor-20',
    no: 20,
    name: 'Ski Air',
    pic: 'Taufan',
    monevOfficer: 'Novita Indah',
    gold: 2,
    silver: 2,
    bronze: 1,
    venueName: 'Danau Ski Air & Wakeboard Kompleks Kediri / Waduk Pondok',
    venueRegion: 'Kab. Kediri',
    venueAddress: 'Kawasan Danau Buatan / Perairan Terpadu Kab. Kediri',
    lat: -7.8012,
    lng: 112.0351,
    athletes: [
      {
        id: 'ska-1',
        name: 'Nabila Zahra Taufan',
        eventNumber: 'Wakeboard Putri & Slalom',
        medal: 'Emas',
        schoolOrClub: 'PSAWI Kota Surabaya',
        performanceNote: 'Manuver inverts dan grabs bernilai kesulitan tertinggi',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-11-04',
      '2026-11-05',
      ['2026-11-06', '2026-11-07'],
      ['2026-11-08']
    ),
    dailyReports: buildInitialReports('Ski Air', 'Taufan', 'Danau Ski Air & Wakeboard Kediri', 'Novita Indah', 'Nabila Zahra Taufan'),
  },

  // ================= 5. RUDIK SETIAWAN (3 Cabor) =================
  {
    id: 'cabor-21',
    no: 21,
    name: 'Gulat',
    pic: 'Sri Dwi',
    monevOfficer: 'Rudik Setiawan',
    gold: 3,
    silver: 3,
    bronze: 2,
    venueName: 'Aula Gedung Kesenian Ngawi',
    venueRegion: 'Kab. Ngawi',
    venueAddress: 'Jl. Yos Sudarso, Margomulyo, Kec. Ngawi, Kab. Ngawi',
    lat: -7.4059,
    lng: 111.4452,
    athletes: [
      {
        id: 'glt-1',
        name: 'Rangga Bima Sakti',
        eventNumber: 'Gaya Bebas 65 kg Putra',
        medal: 'Emas',
        schoolOrClub: 'PGSI Kota Surabaya',
        performanceNote: 'Menang Technical Superiority 10-0 di partai final',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-11-04',
      '2026-11-05',
      ['2026-11-06', '2026-11-07'],
      ['2026-11-08']
    ),
    dailyReports: buildInitialReports('Gulat', 'Sri Dwi', 'Aula Gedung Kesenian Ngawi', 'Rudik Setiawan', 'Rangga Bima Sakti'),
  },
  {
    id: 'cabor-22',
    no: 22,
    name: 'Karate',
    pic: 'Alex Sengko',
    monevOfficer: 'Rudik Setiawan',
    gold: 5,
    silver: 3,
    bronze: 4,
    venueName: 'GOR Bung Hatta Ngawi',
    venueRegion: 'Kab. Ngawi',
    venueAddress: 'Jl. Ir. Soekarno, Beran, Kec. Ngawi, Kab. Ngawi',
    lat: -7.4205,
    lng: 111.4309,
    athletes: [
      {
        id: 'krt-1',
        name: 'Devon Christian Sengko',
        eventNumber: 'Kumite -61 kg Putra',
        medal: 'Emas',
        schoolOrClub: 'FORKI Kota Surabaya',
        performanceNote: 'Kecepatan counter Gyaku-Zuki sangat mematikan',
        isPorprov2027Potential: true,
      },
      {
        id: 'krt-2',
        name: 'Putri Ayu Kartika',
        eventNumber: 'Kata Perorangan Putri',
        medal: 'Emas',
        schoolOrClub: 'SMAN 1 Surabaya',
        performanceNote: 'Bunkai dan kime sangat tegas, menang 5 bendera mutlak',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-11-06',
      '2026-11-07',
      ['2026-11-08', '2026-11-09'],
      ['2026-11-10']
    ),
    dailyReports: buildInitialReports('Karate', 'Alex Sengko', 'GOR Bung Hatta Ngawi', 'Rudik Setiawan', 'Devon Christian Sengko'),
  },
  {
    id: 'cabor-23',
    no: 23,
    name: 'Tinju',
    pic: 'Dian',
    monevOfficer: 'Rudik Setiawan',
    gold: 2,
    silver: 2,
    bronze: 3,
    venueName: 'Sasana Tinju Alun-Alun Merdeka Ngawi',
    venueRegion: 'Kab. Ngawi',
    venueAddress: 'Boulevard Alun-Alun Merdeka, Kec. Ngawi, Kab. Ngawi',
    lat: -7.4022,
    lng: 111.4435,
    athletes: [
      {
        id: 'tnj-1',
        name: 'Samuel Ferdinand',
        eventNumber: 'Youth Kelas 57 kg (Featherweight) Putra',
        medal: 'Emas',
        schoolOrClub: 'Pertina Kota Surabaya',
        performanceNote: 'Menang RSC ronde ke-2, footwork dan kombinasi jab-straight rapi',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-11-03',
      '2026-11-04',
      ['2026-11-05', '2026-11-06', '2026-11-07'],
      ['2026-11-08']
    ),
    dailyReports: buildInitialReports('Tinju', 'Dian', 'Sasangka Tinju Alun-Alun Merdeka Ngawi', 'Rudik Setiawan', 'Samuel Ferdinand'),
  },

  // ================= 6. ALAN BRAHAMANTYO (4 Cabor; Sepak Bola shared coordination with Ardhi Semeru) =================
  {
    id: 'cabor-24',
    no: 24,
    name: 'Kempo',
    pic: 'Agus Santoso',
    monevOfficer: 'Alan Brahamantyo',
    gold: 3,
    silver: 2,
    bronze: 3,
    venueName: 'Aula Gedung Korpri Ngawi',
    venueRegion: 'Kab. Ngawi',
    venueAddress: 'Jl. MH Thamrin No.19, Margomulyo, Kec. Ngawi, Kab. Ngawi',
    lat: -7.4074,
    lng: 111.4448,
    athletes: [
      {
        id: 'kmp-1',
        name: 'Pasangan Embu Berpasangan Putra SBY',
        eventNumber: 'Embu Berpasangan Kyu Kenshi Putra',
        medal: 'Emas',
        schoolOrClub: 'Perkemi Kota Surabaya',
        performanceNote: 'Sinkronisasi gerakan dan kiai memperoleh poin tertinggi',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-11-04',
      '2026-11-05',
      ['2026-11-06', '2026-11-07'],
      ['2026-11-08']
    ),
    dailyReports: buildInitialReports('Kempo', 'Agus Santoso', 'Aula Gedung Korpri Ngawi', 'Alan Brahamantyo', 'Pasangan Embu Putra SBY'),
  },
  {
    id: 'cabor-25',
    no: 25,
    name: 'MMA',
    pic: 'Bambang',
    monevOfficer: 'Alan Brahamantyo',
    gold: 2,
    silver: 2,
    bronze: 2,
    venueName: 'Octagon Hall GOR Bung Hatta Ngawi',
    venueRegion: 'Kab. Ngawi',
    venueAddress: 'Jl. Ir. Soekarno, Beran, Kec. Ngawi, Kab. Ngawi',
    lat: -7.4209,
    lng: 111.4295,
    athletes: [
      {
        id: 'mma-1',
        name: 'Daffa Arya Putra',
        eventNumber: 'Amateur Youth 61.2 kg (Bantamweight)',
        medal: 'Emas',
        schoolOrClub: 'IBCA MMA Kota Surabaya',
        performanceNote: 'Transisi striking ke grappling sangat matang',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-11-05',
      '2026-11-06',
      ['2026-11-07', '2026-11-08'],
      ['2026-11-09']
    ),
    dailyReports: buildInitialReports('MMA', 'Bambang', 'Octagon Hall GOR Bung Hatta Ngawi', 'Alan Brahamantyo', 'Daffa Arya Putra'),
  },
  {
    id: 'cabor-26',
    no: 26,
    name: 'Sepak Bola',
    pic: 'Usama',
    monevOfficer: 'Alan Brahamantyo',
    coordinatingOfficers: ['Ardhi Semeru'], // [+ akses koordinasi Sepak Bola]
    gold: 1,
    silver: 0,
    bronze: 0,
    venueName: 'Stadion Ketonggo Ngawi & Stadion Brawijaya Kediri',
    venueRegion: 'Kab. Ngawi',
    venueAddress: 'Jl. Jaksa Agung Suprapto, Ketanggi, Kec. Ngawi, Kab. Ngawi',
    lat: -7.4041,
    lng: 111.4455,
    athletes: [
      {
        id: 'sb-1',
        name: 'Skuad Sepak Bola POPDA Kota Surabaya',
        eventNumber: 'Beregu Putra U-17',
        medal: 'Emas',
        schoolOrClub: 'Askot PSSI Surabaya / Persebaya EPA Junior',
        performanceNote: 'Juara 1 setelah menang 2-0 di partai final; 9 pemain inti masuk kerangka PORPROV 2027',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-10-29',
      '2026-10-30',
      ['2026-10-31', '2026-11-01', '2026-11-02', '2026-11-04', '2026-11-06', '2026-11-08'],
      ['2026-11-09']
    ),
    dailyReports: buildInitialReports('Sepak Bola', 'Usama', 'Stadion Ketonggo Ngawi', 'Alan Brahamantyo & Ardhi Semeru', 'Skuad Sepak Bola POPDA Kota Surabaya'),
  },
  {
    id: 'cabor-27',
    no: 27,
    name: 'Wushu Sanda',
    pic: 'Kriswanto',
    monevOfficer: 'Alan Brahamantyo',
    gold: 2,
    silver: 2,
    bronze: 2,
    venueName: 'GOR Bung Hatta Ngawi',
    venueRegion: 'Kab. Ngawi',
    venueAddress: 'Jl. Ir. Soekarno, Beran, Kec. Ngawi, Kab. Ngawi',
    lat: -7.4196,
    lng: 111.4304,
    athletes: [
      {
        id: 'wsd-1',
        name: 'Fikri Haikal Pratama',
        eventNumber: 'Sanda Kelas 56 kg Putra',
        medal: 'Emas',
        schoolOrClub: 'WI Kota Surabaya',
        performanceNote: 'Teknik bantingan cepat dan pertahanan low-kick sangat rapat',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-11-03',
      '2026-11-04',
      ['2026-11-05', '2026-11-06'],
      ['2026-11-07']
    ),
    dailyReports: buildInitialReports('Wushu Sanda', 'Kriswanto', 'GOR Bung Hatta Ngawi', 'Alan Brahamantyo', 'Fikri Haikal Pratama'),
  },

  // ================= 7. DWI PRIATMAWATI (3 Cabor) =================
  {
    id: 'cabor-28',
    no: 28,
    name: 'Panahan',
    pic: 'Eky Pratama',
    monevOfficer: 'Dwi Priatmawati',
    gold: 5,
    silver: 3,
    bronze: 2,
    venueName: 'Lapangan Batalyon Armed 12 Ngawi & Lapangan KONI Surabaya',
    venueRegion: 'Kab. Ngawi',
    venueAddress: 'Jl. Siliwangi, Grudo, Kec. Ngawi, Kab. Ngawi',
    lat: -7.4182,
    lng: 111.4348,
    athletes: [
      {
        id: 'pnh-1',
        name: 'Aqila Zahra Ramadhani',
        eventNumber: 'Recurve 70m Putri & Beregu Putri',
        medal: 'Emas',
        schoolOrClub: 'Perpani Kota Surabaya / Fast Archery',
        performanceNote: 'Skor sesi kualifikasi 642 poin, akurasi X-ring sangat stabil',
        isPorprov2027Potential: true,
      },
      {
        id: 'pnh-2',
        name: 'Farhan Syahputra',
        eventNumber: 'Compound 50m Putra',
        medal: 'Emas',
        schoolOrClub: 'SMAN 5 Surabaya',
        performanceNote: 'Menang shoot-off di babak final dengan skor 10-X',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-11-02',
      '2026-11-03',
      ['2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07'],
      ['2026-11-08', '2026-11-09']
    ),
    dailyReports: buildInitialReports('Panahan', 'Eky Pratama', 'Lapangan Batalyon Armed 12 Ngawi', 'Dwi Priatmawati', 'Aqila Zahra Ramadhani'),
  },
  {
    id: 'cabor-29',
    no: 29,
    name: 'Petanque',
    pic: 'Rendi',
    monevOfficer: 'Dwi Priatmawati',
    gold: 2,
    silver: 2,
    bronze: 3,
    venueName: 'Arena Petanque Taman Candi Ngawi',
    venueRegion: 'Kab. Ngawi',
    venueAddress: 'Kawasan Taman Candi, Kartoharjo, Kec. Ngawi, Kab. Ngawi',
    lat: -7.3945,
    lng: 111.4562,
    athletes: [
      {
        id: 'ptq-1',
        name: 'Ilham Maulana',
        eventNumber: 'Shooting Men & Single Men',
        medal: 'Emas',
        schoolOrClub: 'FOPI Kota Surabaya',
        performanceNote: 'Akurasi tembakan jarak 8m dan 9m sangat konsisten',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-11-04',
      '2026-11-05',
      ['2026-11-06', '2026-11-07', '2026-11-08'],
      ['2026-11-09']
    ),
    dailyReports: buildInitialReports('Petanque', 'Rendi', 'Arena Petanque Taman Candi Ngawi', 'Dwi Priatmawati', 'Ilham Maulana'),
  },
  {
    id: 'cabor-30',
    no: 30,
    name: 'Woodball',
    pic: 'Estu',
    monevOfficer: 'Dwi Priatmawati',
    gold: 2,
    silver: 1,
    bronze: 2,
    venueName: 'Lapangan Woodball Benteng Van Den Bosch Ngawi',
    venueRegion: 'Kab. Ngawi',
    venueAddress: 'Kawasan Taman Wisata Benteng Pendem, Pelem, Kec. Ngawi, Kab. Ngawi',
    lat: -7.3911,
    lng: 111.4545,
    athletes: [
      {
        id: 'wdb-1',
        name: 'Annisa Fitriani',
        eventNumber: 'Stroke Competition Single Putri',
        medal: 'Emas',
        schoolOrClub: 'IWbA Kota Surabaya',
        performanceNote: 'Jumlah pukulan terendah selama 24 fairway',
        isPorprov2027Potential: true,
      },
    ],
    schedule: buildSchedule(
      '2026-11-04',
      '2026-11-05',
      ['2026-11-06', '2026-11-07'],
      ['2026-11-08']
    ),
    dailyReports: buildInitialReports('Woodball', 'Estu', 'Lapangan Woodball Benteng Van Den Bosch Ngawi', 'Dwi Priatmawati', 'Annisa Fitriani'),
  },
];

// Official Kota Surabaya medal snapshot from https://popdapeparpedajatim.id/klasemen
const OFFICIAL_SURABAYA_MEDAL_BASELINE: Record<
  string,
  { gold: number; silver: number; bronze: number }
> = {
  ATLETIK: { gold: 3, silver: 2, bronze: 2 },
  AKUATIK: { gold: 1, silver: 3, bronze: 7 },
  'BOLA VOLI PANTAI': { gold: 0, silver: 1, bronze: 0 },
  JUDO: { gold: 6, silver: 4, bronze: 3 },
  MENEMBAK: { gold: 3, silver: 3, bronze: 5 },
  'PANJAT TEBING': { gold: 1, silver: 0, bronze: 1 },
  SENAM: { gold: 3, silver: 5, bronze: 4 },
  'SEPAK TAKRAW': { gold: 0, silver: 1, bronze: 0 },
  'WUSHU TAOLU': { gold: 6, silver: 7, bronze: 9 },
};

export const INITIAL_CABOR_DATA: CaborItem[] = BASE_CABOR_DATA.map((cabor) => {
  const key = cabor.name.toUpperCase();
  const official = OFFICIAL_SURABAYA_MEDAL_BASELINE[key] || {
    gold: 0,
    silver: 0,
    bronze: 0,
  };
  return {
    ...cabor,
    gold: official.gold,
    silver: official.silver,
    bronze: official.bronze,
    athletes:
      official.gold + official.silver + official.bronze > 0
        ? cabor.athletes
        : [],
  };
});

export function syncCaborsWithLiveKlasemen(
  cabors: CaborItem[],
  byCaborName: Record<
    string,
    {
      sportName: string;
      gold: number;
      silver: number;
      bronze: number;
      total: number;
      athletes: AthleteMedal[];
    }
  >
): CaborItem[] {
  let hasAnyChange = false;

  const nextCabors = cabors.map((cabor) => {
    const key = cabor.name.toUpperCase();
    const liveEntry = byCaborName[key];
    const targetGold = liveEntry ? liveEntry.gold : 0;
    const targetSilver = liveEntry ? liveEntry.silver : 0;
    const targetBronze = liveEntry ? liveEntry.bronze : 0;

    // Preserve user-added/existing athletes; only seed from liveEntry if cabor currently has 0 athletes and liveEntry has athletes
    const shouldSeedAthletes =
      cabor.athletes.length === 0 &&
      Boolean(liveEntry?.athletes && liveEntry.athletes.length > 0);

    if (
      cabor.gold === targetGold &&
      cabor.silver === targetSilver &&
      cabor.bronze === targetBronze &&
      !shouldSeedAthletes
    ) {
      return cabor;
    }

    hasAnyChange = true;
    return {
      ...cabor,
      gold: targetGold,
      silver: targetSilver,
      bronze: targetBronze,
      athletes: shouldSeedAthletes ? liveEntry!.athletes : cabor.athletes,
    };
  });

  return hasAnyChange ? nextCabors : cabors;
}

export function canOfficerAccessCabor(officerName: string, cabor: CaborItem): boolean {
  if (!officerName) return false;
  if (cabor.monevOfficer === officerName) return true;
  if (cabor.coordinatingOfficers && cabor.coordinatingOfficers.includes(officerName)) {
    return true;
  }
  return false;
}

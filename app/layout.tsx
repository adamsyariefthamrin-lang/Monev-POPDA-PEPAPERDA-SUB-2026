import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PAPAN PRESTASI SURABAYA – LAPORAN MONEV POPDA-PEPAPERDA 2026',
  description:
    'Sistem Monitoring Evaluasi Harian, Perolehan Medali 30 Cabor, dan Identifikasi Atlet Potensial Kontingen Kota Surabaya menuju PORPROV Jawa Timur 2027.',
  openGraph: {
    title: 'PAPAN PRESTASI SURABAYA – LAPORAN MONEV POPDA-PEPAPERDA 2026',
    description:
      'Sistem Monitoring Evaluasi Harian, Perolehan Medali 30 Cabor, dan Identifikasi Atlet Potensial Kontingen Kota Surabaya menuju PORPROV Jawa Timur 2027.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PAPAN PRESTASI SURABAYA – LAPORAN MONEV POPDA-PEPAPERDA 2026',
    description:
      'Sistem Monitoring Evaluasi Harian, Perolehan Medali 30 Cabor, dan Identifikasi Atlet Potensial Kontingen Kota Surabaya menuju PORPROV Jawa Timur 2027.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id">
      <body
        suppressHydrationWarning
        className="bg-[#F8FAFC] text-[#0A2540] antialiased selection:bg-[#0D9488]/20 selection:text-[#0A2540]"
      >
        {children}
      </body>
    </html>
  );
}

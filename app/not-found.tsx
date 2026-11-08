import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A2540] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 max-w-md w-full space-y-4">
        <p className="text-xs font-extrabold uppercase tracking-widest text-[#0D9488]">
          KONI Kota Surabaya · Monev 2026
        </p>
        <h1 className="text-2xl font-extrabold text-[#0A2540]">
          Halaman Tidak Ditemukan (404)
        </h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          Halaman yang Anda tuju tidak tersedia. Silakan kembali ke Dashboard Laporan Petugas MONEV POPDA XV -PEPAPERDA III JAWA TIMUR 2026.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-[#0A2540] text-amber-300 text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Kembali ke Dashboard Utama
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Edit3,
  Printer,
  Filter,
  ArrowUpDown,
  Lock,
  RefreshCw,
} from 'lucide-react';
import {
  CaborItem,
  MONEV_OFFICERS,
  UserRole,
  canOfficerAccessCabor,
} from '@/lib/monev-data';

interface KlasemenCaborSectionProps {
  cabors: CaborItem[];
  role: UserRole;
  activeOfficer: string;
  liveSyncInfo: {
    sourceUrl: string;
    podium: string;
    contributingCabors: number;
    syncedAt: string;
    isSyncing: boolean;
    overall: {
      gold: number;
      silver: number;
      bronze: number;
      total: number;
    };
  };
  onRefreshLiveKlasemen: () => void;
  onJumpToUpdateCabor: (caborId: string) => void;
  onOpenLetterModal: (caborId?: string) => void;
}

export default function KlasemenCaborSection({
  cabors,
  role,
  activeOfficer,
  liveSyncInfo,
  onRefreshLiveKlasemen,
  onJumpToUpdateCabor,
  onOpenLetterModal,
}: KlasemenCaborSectionProps) {
  const [subView, setSubView] = useState<'cabor' | 'athletes' | 'officers'>('cabor');
  const [searchQuery, setSearchQuery] = useState('');
  const [officerFilter, setOfficerFilter] = useState<string>('ALL');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'rank' | 'no'>('rank');

  const filteredCabors = useMemo(() => {
    const list = cabors.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        c.name.toLowerCase().includes(q) ||
        c.pic.toLowerCase().includes(q) ||
        c.monevOfficer.toLowerCase().includes(q) ||
        c.venueName.toLowerCase().includes(q);
      const matchOfficer =
        officerFilter === 'ALL' || canOfficerAccessCabor(officerFilter, c);
      const matchRegion =
        regionFilter === 'ALL' || c.venueRegion === regionFilter;
      return matchSearch && matchOfficer && matchRegion;
    });

    if (sortBy === 'rank') {
      return [...list].sort((a, b) => {
        if (b.gold !== a.gold) return b.gold - a.gold;
        if (b.silver !== a.silver) return b.silver - a.silver;
        if (b.bronze !== a.bronze) return b.bronze - a.bronze;
        return a.no - b.no;
      });
    }
    return [...list].sort((a, b) => a.no - b.no);
  }, [cabors, searchQuery, officerFilter, regionFilter, sortBy]);

  const allAthletes = useMemo(() => {
    return cabors.flatMap((c) =>
      c.athletes.map((a) => ({
        ...a,
        caborId: c.id,
        caborName: c.name,
        caborPic: c.pic,
        monevOfficer: c.monevOfficer,
        venueName: c.venueName,
      }))
    );
  }, [cabors]);

  const filteredAthletes = useMemo(() => {
    return allAthletes.filter((a) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        a.name.toLowerCase().includes(q) ||
        a.caborName.toLowerCase().includes(q) ||
        a.eventNumber.toLowerCase().includes(q) ||
        a.schoolOrClub.toLowerCase().includes(q);
      const matchOfficer =
        officerFilter === 'ALL' || a.monevOfficer === officerFilter;
      return matchSearch && matchOfficer;
    });
  }, [allAthletes, searchQuery, officerFilter]);

  const totalGold = filteredCabors.reduce((acc, c) => acc + c.gold, 0);
  const totalSilver = filteredCabors.reduce((acc, c) => acc + c.silver, 0);
  const totalBronze = filteredCabors.reduce((acc, c) => acc + c.bronze, 0);

  return (
    <section className="space-y-6">
      {/* Header & View Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-semibold text-[#0D9488]">
            Rekapitulasi Real-Time Kontingen Kota Surabaya
          </p>
          <h2 className="text-2xl font-bold text-[#0A2540] tracking-tight mt-0.5">
            Klasemen Medali Kontingen Kota Surabaya & Pembagian Tugas 7 Petugas Monev
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Perolehan medali dikunci untuk seluruh role dan terintegrasi secara real-time dengan klasemen resmi POPDA-PEPARPEDA Jawa Timur 2026 khusus Kota Surabaya.
          </p>
        </div>

        {/* Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setSubView('cabor')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              subView === 'cabor'
                ? 'bg-[#0A2540] text-white shadow-xs'
                : 'text-slate-700 hover:text-[#0A2540]'
            }`}
          >
            Klasemen
          </button>
          <button
            type="button"
            onClick={() => setSubView('officers')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              subView === 'officers'
                ? 'bg-[#0A2540] text-white shadow-xs'
                : 'text-slate-700 hover:text-[#0A2540]'
            }`}
          >
            Pembagian 7 Petugas Monev
          </button>
          <button
            type="button"
            onClick={() => setSubView('athletes')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              subView === 'athletes'
                ? 'bg-[#0A2540] text-white shadow-xs'
                : 'text-slate-700 hover:text-[#0A2540]'
            }`}
          >
            Daftar Atlet Peraih Medali ({allAthletes.length})
          </button>
        </div>
      </div>

      {/* Real-Time Standings Sync Bar (Updated Date/Time & Refresh Only) */}
      <div className="bg-white rounded-xl border border-amber-300 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-slate-600 font-mono">
          Updated: <strong className="text-[#0A2540]">{liveSyncInfo.syncedAt}</strong>
        </span>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onRefreshLiveKlasemen}
            disabled={liveSyncInfo.isSyncing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0A2540] hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#F59E0B] ${
                liveSyncInfo.isSyncing ? 'animate-spin' : ''
              }`}
            />
            {liveSyncInfo.isSyncing ? 'Menyinkronkan...' : 'Refresh Real-Time'}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama cabor, PIC, atlet, nomor pertandingan, atau lokasi venue..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0D9488]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={officerFilter}
            onChange={(e) => setOfficerFilter(e.target.value)}
            aria-label="Filter berdasarkan Petugas Monev"
            className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-[#0D9488]"
          >
            <option value="ALL">Semua Petugas Monev (7 Petugas)</option>
            {MONEV_OFFICERS.map((off) => (
              <option key={off.name} value={off.name}>
                {off.name} ({off.primaryCaborCount} Cabor)
              </option>
            ))}
          </select>
        </div>

        {subView === 'cabor' ? (
          <div className="flex items-center gap-2">
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              aria-label="Filter Wilayah Venue"
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-[#0D9488]"
            >
              <option value="ALL">Semua Wilayah Venue</option>
              <option value="Kab. Ngawi">Kab. Ngawi</option>
              <option value="Kota Surabaya">Kota Surabaya</option>
              <option value="Kab. Kediri">Kab. Kediri</option>
            </select>
            <button
              type="button"
              onClick={() => setSortBy((s) => (s === 'rank' ? 'no' : 'rank'))}
              title="Ubah urutan berdasarkan Peringkat Medali atau Nomor Urut Cabor"
              className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#0D9488]" />
              {sortBy === 'rank' ? 'Peringkat' : 'No. Urut'}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end px-2 text-xs font-semibold text-slate-500">
            Sinkronisasi Real-Time Kota Surabaya
          </div>
        )}
      </div>

      {/* SUBVIEW 1: KLASEMEN TABLE */}
      {subView === 'cabor' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#0A2540] text-white text-left">
                  <th className="py-3.5 px-4 font-bold w-12 text-center">#</th>
                  <th className="py-3.5 px-4 font-bold">Cabang Olahraga & PIC</th>
                  <th className="py-3.5 px-4 font-bold">Petugas Monev</th>
                  <th className="py-3.5 px-4 font-bold">Lokasi Venue & Wilayah</th>
                  <th className="py-3.5 px-3 font-bold text-right text-[#F59E0B]">
                    <span className="inline-flex items-center justify-end gap-1">
                      <Lock className="w-3 h-3" /> Emas
                    </span>
                  </th>
                  <th className="py-3.5 px-3 font-bold text-right text-slate-200">
                    <span className="inline-flex items-center justify-end gap-1">
                      <Lock className="w-3 h-3" /> Perak
                    </span>
                  </th>
                  <th className="py-3.5 px-3 font-bold text-right text-amber-500">
                    <span className="inline-flex items-center justify-end gap-1">
                      <Lock className="w-3 h-3" /> Perunggu
                    </span>
                  </th>
                  <th className="py-3.5 px-4 font-bold text-right">
                    <span className="inline-flex items-center justify-end gap-1">
                      <Lock className="w-3 h-3" /> Total
                    </span>
                  </th>
                  {role !== 'guest' && (
                    <th className="py-3.5 px-4 font-bold text-right">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCabors.map((cabor, index) => {
                  const total = cabor.gold + cabor.silver + cabor.bronze;
                  const canEdit =
                    role === 'ketum' ||
                    (role === 'monev' && canOfficerAccessCabor(activeOfficer, cabor));

                  return (
                    <tr
                      key={cabor.id}
                      className="hover:bg-slate-50/90 transition-colors"
                    >
                      <td className="py-3 px-4 text-center font-mono tabular-nums font-bold text-slate-500">
                        {sortBy === 'rank' ? index + 1 : cabor.no}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-sm text-[#0A2540]">
                          {cabor.name}
                        </div>
                        <div className="text-slate-500 mt-0.5">
                          PIC Cabor: <strong className="text-slate-700">{cabor.pic}</strong> · Kode #{cabor.no}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#0A2540]">
                          {cabor.monevOfficer}
                        </div>
                        {cabor.coordinatingOfficers && (
                          <div className="text-[11px] text-[#0D9488] font-medium">
                            + Koordinasi: {cabor.coordinatingOfficers.join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">
                          {cabor.venueName}
                        </div>
                        <div className="text-slate-500">{cabor.venueRegion}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-sm font-extrabold text-amber-600">
                        {cabor.gold}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-sm font-bold text-slate-600">
                        {cabor.silver}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-sm font-bold text-orange-700">
                        {cabor.bronze}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-sm font-extrabold text-[#0A2540]">
                        {total}
                      </td>
                      {role !== 'guest' && (
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onJumpToUpdateCabor(cabor.id)}
                              className={`px-2.5 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 whitespace-nowrap ${
                                canEdit
                                  ? 'bg-[#0D9488] text-white hover:bg-teal-700'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              <Edit3 className="w-3 h-3" />
                              {canEdit ? 'Update Monev' : 'Detail Laporan'}
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenLetterModal(cabor.id)}
                              title="Cetak Surat Resmi PDF Cabor Ini"
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded transition-colors cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold text-[#0A2540] border-t-2 border-slate-300">
                  <td colSpan={4} className="py-3.5 px-4 text-right">
                    TOTAL PEROLEHAN MEDALI KOTA SURABAYA ({filteredCabors.length} CABOR TERFILTER):
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums text-base text-amber-600">
                    {totalGold}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums text-base text-slate-700">
                    {totalSilver}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums text-base text-orange-700">
                    {totalBronze}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-base text-[#0A2540]">
                    {totalGold + totalSilver + totalBronze}
                  </td>
                  {role !== 'guest' && <td />}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* SUBVIEW 2: PEMBAGIAN TUGAS 7 PETUGAS MONEV SESUAI NOTULEN RAPAT */}
      {subView === 'officers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {MONEV_OFFICERS.map((off, idx) => {
            const primaryCabors = cabors.filter((c) => c.monevOfficer === off.name);
            const coordCabors = cabors.filter(
              (c) =>
                c.coordinatingOfficers && c.coordinatingOfficers.includes(off.name)
            );
            const goldSum = primaryCabors.reduce((s, c) => s + c.gold, 0);
            const silverSum = primaryCabors.reduce((s, c) => s + c.silver, 0);
            const bronzeSum = primaryCabors.reduce((s, c) => s + c.bronze, 0);

            return (
              <div
                key={off.name}
                className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
                    <div>
                      <p className="text-xs font-semibold text-[#0D9488]">
                        0{idx + 1}. {off.roleTitle}
                      </p>
                      <h3 className="text-lg font-bold text-[#0A2540]">{off.name}</h3>
                      {off.coordinationNote && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {off.coordinationNote}
                        </p>
                      )}
                    </div>
                    <div className="text-right font-mono tabular-nums">
                      <span className="text-xs text-slate-500 block">
                        Akumulasi Medali (Terkunci)
                      </span>
                      <span className="text-sm font-extrabold text-[#0A2540]">
                        {goldSum}E · {silverSum}P · {bronzeSum}Pr
                      </span>
                    </div>
                  </div>

                  {/* List of Assigned Cabors & PICs */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-700">
                      Daftar Cabor & PIC Tanggung Jawab ({primaryCabors.length} Cabor Utama):
                    </p>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                      {primaryCabors.map((c) => (
                        <div
                          key={c.id}
                          className="p-2.5 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-[#0A2540]">{c.name}</span>
                            <span className="text-slate-500"> · PIC {c.pic}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono tabular-nums font-semibold text-slate-700">
                              {c.gold}E / {c.silver}P / {c.bronze}Pr
                            </span>
                            {role !== 'guest' && (
                              <button
                                type="button"
                                onClick={() => onJumpToUpdateCabor(c.id)}
                                className="text-[#0D9488] font-bold hover:underline cursor-pointer"
                              >
                                Buka
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {coordCabors.map((c) => (
                        <div
                          key={`coord-${c.id}`}
                          className="p-2.5 bg-teal-50/50 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-[#0D9488]">
                              [Akses Koordinasi] {c.name}
                            </span>
                            <span className="text-slate-600"> · PIC {c.pic}</span>
                          </div>
                          {role !== 'guest' && (
                            <button
                              type="button"
                              onClick={() => onJumpToUpdateCabor(c.id)}
                              className="text-[#0D9488] font-bold hover:underline cursor-pointer"
                            >
                              Buka Koordinasi
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUBVIEW 3: DAFTAR ATLET PERAIH MEDALI */}
      {subView === 'athletes' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#0A2540] text-white text-left">
                  <th className="py-3.5 px-4 font-bold">Nama Atlet / Beregu</th>
                  <th className="py-3.5 px-4 font-bold">Cabang Olahraga & PIC</th>
                  <th className="py-3.5 px-4 font-bold">Nomor / Kelas Pertandingan</th>
                  <th className="py-3.5 px-4 font-bold">Medali</th>
                  <th className="py-3.5 px-4 font-bold">Kontingen / Asal</th>
                  <th className="py-3.5 px-4 font-bold">
                    Catatan / Skor Pertandingan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAthletes.map((ath) => (
                  <tr key={ath.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-sm text-[#0A2540]">
                      {ath.name}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {ath.caborName}
                      </div>
                      <div className="text-slate-500">
                        PIC {ath.caborPic} · Monev {ath.monevOfficer}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {ath.eventNumber}
                    </td>
                    <td className="py-3 px-4 font-extrabold">
                      <span
                        className={
                          ath.medal === 'Emas'
                            ? 'text-amber-600'
                            : ath.medal === 'Perak'
                            ? 'text-slate-600'
                            : 'text-orange-700'
                        }
                      >
                        Medali {ath.medal}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{ath.schoolOrClub}</td>
                    <td className="py-3 px-4">
                      <p className="text-slate-700">{ath.performanceNote}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

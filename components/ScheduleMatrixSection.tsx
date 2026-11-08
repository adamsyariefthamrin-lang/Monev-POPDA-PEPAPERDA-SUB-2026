'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, Search, Filter } from 'lucide-react';
import {
  CaborItem,
  MONEV_DATES,
  MONEV_OFFICERS,
  ScheduleCode,
  UserRole,
  canOfficerAccessCabor,
} from '@/lib/monev-data';

interface ScheduleMatrixSectionProps {
  cabors: CaborItem[];
  role: UserRole;
  activeOfficer: string;
  onUpdateScheduleCell: (caborId: string, dateKey: string, nextCode: ScheduleCode) => void;
}

const SCHEDULE_CODES: {
  code: ScheduleCode;
  label: string;
  desc: string;
  cellClass: string;
}[] = [
  {
    code: 'TM',
    label: 'TM',
    desc: 'Technical Meeting',
    cellClass: 'bg-sky-100 text-sky-900 border-sky-300 font-bold',
  },
  {
    code: 'TM/P',
    label: 'TM/P',
    desc: 'Technical Meeting & Pertandingan',
    cellClass: 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold',
  },
  {
    code: 'P',
    label: 'P',
    desc: 'Hari Pertandingan',
    cellClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold',
  },
  {
    code: 'UPM',
    label: 'UPM',
    desc: 'Upacara Penghormatan Pemenang (Medali)',
    cellClass: 'bg-amber-100 text-amber-950 border-amber-400 font-extrabold',
  },
  {
    code: 'UPN',
    label: 'UPN',
    desc: 'Upacara Pembukaan / Penutupan',
    cellClass: 'bg-rose-100 text-rose-900 border-rose-300 font-bold',
  },
];

const CYCLE_ORDER: ScheduleCode[] = ['', 'TM', 'TM/P', 'P', 'UPM', 'UPN'];

export default function ScheduleMatrixSection({
  cabors,
  role,
  activeOfficer,
  onUpdateScheduleCell,
}: ScheduleMatrixSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [officerFilter, setOfficerFilter] = useState<string>('ALL');
  const [codeFilter, setCodeFilter] = useState<string>('ALL');

  const filteredCabors = useMemo(() => {
    return cabors.filter((c) => {
      const matchesQuery =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.pic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.venueName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesOfficer =
        officerFilter === 'ALL' ||
        c.monevOfficer === officerFilter ||
        (c.coordinatingOfficers && c.coordinatingOfficers.includes(officerFilter));
      const matchesCode =
        codeFilter === 'ALL' ||
        Object.values(c.schedule).some((val) => val === codeFilter);
      return matchesQuery && matchesOfficer && matchesCode;
    });
  }, [cabors, searchQuery, officerFilter, codeFilter]);

  const getCellClasses = (code: ScheduleCode) => {
    const found = SCHEDULE_CODES.find((s) => s.code === code);
    if (!found) return 'bg-white text-slate-300 hover:bg-slate-50';
    return found.cellClass;
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-semibold text-[#0D9488]">
            Matriks Agenda Pertandingan Kontingen Kota Surabaya
          </p>
          <h2 className="text-2xl font-bold text-[#0A2540] tracking-tight mt-0.5">
            Jadwal Pertandingan 30 Cabor (29–31 Oktober & 1–11 November 2026)
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Matriks jadwal resmi POPDA XIV & PEPAPERDA II Jawa Timur 2026 lengkap dengan kode warna tahapan pertandingan.
            {role === 'ketum'
              ? ' (Mode Admin KETUM KONI: Klik pada sel tanggal untuk mengubah atau menambahkan status jadwal).'
              : ' (Jadwal bersifat statis — perubahan jadwal hanya dapat dilakukan oleh Admin / KETUM KONI).'}
          </p>
        </div>

        {/* Legend Kode Warna */}
        <div className="flex flex-wrap items-center gap-2">
          {SCHEDULE_CODES.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() =>
                setCodeFilter((prev) => (prev === item.code ? 'ALL' : item.code))
              }
              className={`px-2.5 py-1 rounded border text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                item.cellClass
              } ${
                codeFilter === item.code ? 'ring-2 ring-[#0A2540]' : 'opacity-95 hover:opacity-100'
              }`}
              title={`Filter berdasarkan ${item.desc}`}
            >
              <span className="font-mono">{item.label}</span>
              <span className="font-normal text-[11px] hidden sm:inline">
                = {item.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari cabang olahraga, PIC, atau venue..."
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
            <option value="ALL">Semua Petugas Monev (7 Petugas / 30 Cabor)</option>
            {MONEV_OFFICERS.map((off) => (
              <option key={off.name} value={off.name}>
                Petugas Monev: {off.name} ({off.primaryCaborCount} Cabor)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between gap-2 text-xs text-slate-600 px-2">
          <span>
            Menampilkan <strong className="font-mono tabular-nums">{filteredCabors.length}</strong> dari 30 Cabor
          </span>
          {(searchQuery || officerFilter !== 'ALL' || codeFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setOfficerFilter('ALL');
                setCodeFilter('ALL');
              }}
              className="text-[#0D9488] font-semibold hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#0A2540] text-white">
                <th
                  rowSpan={2}
                  className="py-3 px-3 text-left font-bold border-r border-slate-700 sticky left-0 bg-[#0A2540] z-10 min-w-[200px]"
                >
                  Cabor · PIC · Petugas Monev
                </th>
                <th
                  rowSpan={2}
                  className="py-3 px-3 text-left font-bold border-r border-slate-700 min-w-[160px]"
                >
                  Lokasi Venue
                </th>
                <th
                  colSpan={3}
                  className="py-1.5 px-2 text-center font-bold border-b border-r border-slate-700 bg-slate-800 text-[#F59E0B]"
                >
                  Oktober 2026
                </th>
                <th
                  colSpan={11}
                  className="py-1.5 px-2 text-center font-bold border-b border-slate-700 bg-teal-950 text-teal-200"
                >
                  November 2026
                </th>
              </tr>
              <tr className="bg-[#0A2540] text-slate-200 font-mono tabular-nums">
                {MONEV_DATES.map((d) => (
                  <th
                    key={d.key}
                    className="py-2 px-1.5 text-center border-r border-slate-700 min-w-[46px] font-semibold"
                  >
                    {d.short.split(' ')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCabors.map((cabor) => {
                // Only KETUM KONI (Admin) can modify or add schedule cells; Guest and Monev are strictly read-only
                const canEdit = role === 'ketum';

                return (
                  <tr key={cabor.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 border-r border-slate-200 sticky left-0 bg-white z-10">
                      <div className="font-bold text-[#0A2540]">
                        <span className="font-mono tabular-nums text-slate-400 mr-1.5">
                          {String(cabor.no).padStart(2, '0')}.
                        </span>
                        {cabor.name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        PIC {cabor.pic} · {cabor.monevOfficer}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-slate-600">
                      <div className="font-medium text-slate-800 line-clamp-1">
                        {cabor.venueName}
                      </div>
                      <div className="text-[11px] text-slate-500">{cabor.venueRegion}</div>
                    </td>
                    {MONEV_DATES.map((d) => {
                      const code = cabor.schedule[d.key] || '';
                      return (
                        <td
                          key={d.key}
                          className="p-1 border-r border-slate-200 text-center align-middle"
                        >
                          {canEdit ? (
                            <button
                              type="button"
                              onClick={() => {
                                const idx = CYCLE_ORDER.indexOf(code);
                                const next =
                                  CYCLE_ORDER[(idx + 1) % CYCLE_ORDER.length];
                                onUpdateScheduleCell(cabor.id, d.key, next);
                              }}
                              title={`${cabor.name} (${d.label}): Klik untuk ubah status jadwal`}
                              className={`w-full h-8 rounded border text-[11px] font-mono transition-colors cursor-pointer flex items-center justify-center ${getCellClasses(
                                code
                              )}`}
                            >
                              {code || '·'}
                            </button>
                          ) : (
                            <div
                              className={`w-full h-8 rounded border text-[11px] font-mono flex items-center justify-center ${
                                code
                                  ? getCellClasses(code)
                                  : 'border-transparent text-slate-300'
                              }`}
                            >
                              {code || '–'}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

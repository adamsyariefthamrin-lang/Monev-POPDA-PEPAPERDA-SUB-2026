'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Shield,
  UserCheck,
  MapPin,
  Eye,
  KeyRound,
  RotateCcw,
  X,
  PhoneCall,
  FileText,
  Scale,
  LogOut,
  Lock,
  RefreshCw,
} from 'lucide-react';
import {
  AthleteMedal,
  CaborItem,
  DailyReportEntry,
  INITIAL_CABOR_DATA,
  MONEV_OFFICERS,
  POSKO_MONEV,
  ScheduleCode,
  UserRole,
  canOfficerAccessCabor,
  syncCaborsWithLiveKlasemen,
} from '@/lib/monev-data';
import { PemkotSurabayaLogo, KoniSurabayaLogoJpeg } from '@/components/OfficialLogos';
import KlasemenCaborSection from '@/components/KlasemenCaborSection';
import MonevUpdateSection from '@/components/MonevUpdateSection';
import VenueMapSection from '@/components/VenueMapSection';
import ScheduleMatrixSection from '@/components/ScheduleMatrixSection';
import OfficialLetterModal from '@/components/OfficialLetterModal';

const STORAGE_KEY = 'papan_prestasi_surabaya_monev_2026_v1';

export default function PapanPrestasiSurabayaPage() {
  const [cabors, setCabors] = useState<CaborItem[]>(INITIAL_CABOR_DATA);
  const [hasEnteredRole, setHasEnteredRole] = useState<boolean>(false);
  const [role, setRole] = useState<UserRole>('guest');
  const [selectedOfficer, setSelectedOfficer] = useState<string>(
    MONEV_OFFICERS[0].name
  );
  const [monevPassword, setMonevPassword] = useState<string>('');
  const [monevError, setMonevError] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [adminError, setAdminError] = useState<string>('');
  const [activeSection, setActiveSection] = useState<
    'portal' | 'klasemen' | 'monev' | 'venue' | 'jadwal'
  >('portal');
  const [selectedCaborId, setSelectedCaborId] = useState<string>(
    INITIAL_CABOR_DATA[0].id
  );

  // Official Letter PDF Modal state
  const [isLetterModalOpen, setIsLetterModalOpen] = useState<boolean>(false);
  const [letterModalCaborId, setLetterModalCaborId] = useState<string | undefined>(
    undefined
  );

  // Footer Policy/Contact Modal state
  const [footerModal, setFooterModal] = useState<
    null | 'privacy' | 'terms' | 'contact'
  >(null);

  // Real-time Klasemen Sync State (https://popdapeparpedajatim.id/klasemen - Khusus Kota Surabaya)
  const [liveSyncInfo, setLiveSyncInfo] = useState<{
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
  }>({
    sourceUrl: 'https://popdapeparpedajatim.id/klasemen',
    podium: 'Podium 2',
    contributingCabors: 9,
    syncedAt: 'Sinkronisasi Otomatis Aktif',
    isSyncing: false,
    overall: {
      gold: 23,
      silver: 26,
      bronze: 31,
      total: 80,
    },
  });

  const fetchLiveSurabayaKlasemen = useCallback(async () => {
    setLiveSyncInfo((prev) => ({ ...prev, isSyncing: true }));
    try {
      const res = await fetch('/api/klasemen-surabaya', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (data && data.overall && data.byCaborName) {
        setCabors((prev) => syncCaborsWithLiveKlasemen(prev, data.byCaborName));
        setLiveSyncInfo({
          sourceUrl: data.sourceUrl || 'https://popdapeparpedajatim.id/klasemen',
          podium: data.podium || 'Podium 2',
          contributingCabors: data.contributingCabors || 9,
          syncedAt: data.syncedAt || 'Baru saja',
          isSyncing: false,
          overall: data.overall,
        });
      } else {
        setLiveSyncInfo((prev) => ({ ...prev, isSyncing: false }));
      }
    } catch {
      setLiveSyncInfo((prev) => ({ ...prev, isSyncing: false }));
    }
  }, []);

  // Load persisted daily reports & schedule from localStorage on mount, while keeping medals locked to live data
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length === 30) {
            setCabors((prev) =>
              prev.map((c) => {
                const savedItem = parsed.find((p: CaborItem) => p.id === c.id);
                if (!savedItem) return c;
                return {
                  ...c,
                  // Medals (gold, silver, bronze) are strictly locked; athletes, dailyReports, and schedule are preserved from storage
                  athletes: Array.isArray(savedItem.athletes)
                    ? savedItem.athletes
                    : c.athletes,
                  dailyReports: savedItem.dailyReports || c.dailyReports,
                  schedule: savedItem.schedule || c.schedule,
                };
              })
            );
          }
        }
      } catch {
        // Ignore storage errors
      }
      fetchLiveSurabayaKlasemen();
    }, 0);

    const interval = window.setInterval(() => {
      fetchLiveSurabayaKlasemen();
    }, 30000);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, [fetchLiveSurabayaKlasemen]);

  // Save state changes to localStorage
  const persistCabors = useCallback(
    (updater: (prev: CaborItem[]) => CaborItem[]) => {
      setCabors((prev) => {
        const next = updater(prev);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // Ignore quota errors
        }
        return next;
      });
    },
    []
  );

  const handleResetDefaultData = () => {
    setCabors(INITIAL_CABOR_DATA);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    fetchLiveSurabayaKlasemen();
  };

  // Role login handlers
  const handleEnterAsGuest = () => {
    setRole('guest');
    setHasEnteredRole(true);
    setMonevError('');
    setAdminError('');
    setActiveSection('klasemen');
  };

  const handleEnterAsMonev = (e: React.FormEvent) => {
    e.preventDefault();
    if (monevPassword.trim() === '250Emas') {
      setRole('monev');
      setHasEnteredRole(true);
      setMonevError('');
      setAdminError('');
      const firstOfficerCabor = cabors.find((c) =>
        canOfficerAccessCabor(selectedOfficer, c)
      );
      if (firstOfficerCabor) {
        setSelectedCaborId(firstOfficerCabor.id);
      }
      setActiveSection('monev');
    } else {
      setMonevError('Password petugas Monev yang dimasukkan tidak sesuai.');
    }
  };

  const handleEnterAsKetum = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword.trim() === '123456789') {
      setRole('ketum');
      setHasEnteredRole(true);
      setMonevError('');
      setAdminError('');
      setActiveSection('monev');
    } else {
      setAdminError('Password yang dimasukkan tidak sesuai.');
    }
  };

  const handleBackToPortal = () => {
    setHasEnteredRole(false);
    setActiveSection('portal');
    setMonevPassword('');
    setMonevError('');
    setAdminPassword('');
    setAdminError('');
  };

  // Data mutation handlers
  const handleAddAthlete = useCallback(
    (caborId: string, athlete: Omit<AthleteMedal, 'id'>) => {
      persistCabors((prev) =>
        prev.map((c) => {
          if (c.id !== caborId) return c;
          const newAth: AthleteMedal = {
            ...athlete,
            id: `ath-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          };
          return {
            ...c,
            athletes: [newAth, ...c.athletes],
          };
        })
      );
    },
    [persistCabors]
  );

  const handleDeleteAthlete = useCallback(
    (caborId: string, athleteId: string) => {
      persistCabors((prev) =>
        prev.map((c) => {
          if (c.id !== caborId) return c;
          return {
            ...c,
            athletes: c.athletes.filter((a) => a.id !== athleteId),
          };
        })
      );
    },
    [persistCabors]
  );

  const handleSaveDailyReport = useCallback(
    (caborId: string, dateKey: string, entry: DailyReportEntry) => {
      persistCabors((prev) =>
        prev.map((c) => {
          if (c.id !== caborId) return c;
          return {
            ...c,
            dailyReports: {
              ...c.dailyReports,
              [dateKey]: entry,
            },
          };
        })
      );
    },
    [persistCabors]
  );

  const handleUpdateScheduleCell = useCallback(
    (caborId: string, dateKey: string, nextCode: ScheduleCode) => {
      persistCabors((prev) =>
        prev.map((c) => {
          if (c.id !== caborId) return c;
          return {
            ...c,
            schedule: {
              ...c.schedule,
              [dateKey]: nextCode,
            },
          };
        })
      );
    },
    [persistCabors]
  );

  const handleOpenLetterModal = (caborId?: string) => {
    if (role === 'guest') return;
    setLetterModalCaborId(caborId);
    setIsLetterModalOpen(true);
  };

  // Summary metrics (Locked to official Kota Surabaya real-time standings)
  const totals = useMemo(() => {
    const gold = liveSyncInfo.overall.gold;
    const silver = liveSyncInfo.overall.silver;
    const bronze = liveSyncInfo.overall.bronze;
    const total = liveSyncInfo.overall.total;
    return {
      gold,
      silver,
      bronze,
      total,
    };
  }, [liveSyncInfo.overall]);

  // Cabors passed into OfficialLetterModal
  const letterCabors = useMemo(() => {
    if (role === 'monev') {
      return cabors.filter((c) => canOfficerAccessCabor(selectedOfficer, c));
    }
    return cabors;
  }, [cabors, role, selectedOfficer]);

  const activeLetterOfficerName = useMemo(() => {
    if (role === 'monev') return selectedOfficer;
    if (letterModalCaborId) {
      const found = cabors.find((c) => c.id === letterModalCaborId);
      if (found) return found.monevOfficer;
    }
    return role === 'ketum'
      ? 'Koordinator Tim Monev KONI Surabaya'
      : selectedOfficer;
  }, [role, selectedOfficer, letterModalCaborId, cabors]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0A2540]">
      {/* TOP BAR CONTRACT: White & Yellow Collaboration */}
      <header className="no-print sticky top-0 z-40 bg-gradient-to-r from-white via-yellow-50 to-amber-300 text-[#0A2540] border-b-2 border-amber-400 px-6 py-3.5 flex items-center justify-between gap-8 shadow-2xs">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={handleBackToPortal}
          className="text-base md:text-lg font-extrabold tracking-tight text-[#0A2540] whitespace-nowrap shrink-0 cursor-pointer text-left"
        >
          Kesekretariatan KONI Surabaya
        </button>

        {/* Zone 2: Navigation links (only active/accessible after role is selected) */}
        {hasEnteredRole ? (
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-700">
            <button
              type="button"
              onClick={() => setActiveSection('klasemen')}
              className={`hover:text-[#0A2540] transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activeSection === 'klasemen'
                  ? 'text-[#0A2540] border-b-2 border-[#0A2540]'
                  : ''
              }`}
            >
              Klasemen
            </button>
            {role !== 'guest' && (
              <button
                type="button"
                onClick={() => setActiveSection('monev')}
                className={`hover:text-[#0A2540] transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                  activeSection === 'monev'
                    ? 'text-[#0A2540] border-b-2 border-[#0A2540]'
                    : ''
                }`}
              >
                Update Monev
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveSection('venue')}
              className={`hover:text-[#0A2540] transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activeSection === 'venue'
                  ? 'text-[#0A2540] border-b-2 border-[#0A2540]'
                  : ''
              }`}
            >
              Peta Venue
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('jadwal')}
              className={`hover:text-[#0A2540] transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activeSection === 'jadwal'
                  ? 'text-[#0A2540] border-b-2 border-[#0A2540]'
                  : ''
              }`}
            >
              Jadwal Pertandingan
            </button>
          </nav>
        ) : (
          <div className="hidden lg:block" />
        )}

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          {hasEnteredRole ? (
            <button
              type="button"
              onClick={handleBackToPortal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0A2540] hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-amber-400" />
              Ganti Role Akses
            </button>
          ) : (
            <span className="text-xs font-extrabold text-[#0A2540] whitespace-nowrap shrink-0">
              KONI KOTA SURABAYA
            </span>
          )}
        </div>
      </header>

      {/* Mobile Secondary Navigation Strip (only shown after selecting a role) */}
      {hasEnteredRole && (
        <div className="no-print lg:hidden bg-amber-50 text-[#0A2540] px-4 py-2 flex items-center gap-2 overflow-x-auto border-b border-amber-300">
          {[
            { id: 'klasemen', label: 'Klasemen', show: true },
            { id: 'monev', label: 'Update Monev', show: role !== 'guest' },
            { id: 'venue', label: 'Peta Venue', show: true },
            { id: 'jadwal', label: 'Jadwal Pertandingan', show: true },
          ]
            .filter((t) => t.show)
            .map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveSection(
                    tab.id as 'portal' | 'klasemen' | 'monev' | 'venue' | 'jadwal'
                  )
                }
                className={`px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer ${
                  activeSection === tab.id
                    ? 'bg-[#0A2540] text-amber-300'
                    : 'text-[#0A2540] hover:bg-amber-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
        </div>
      )}

      {/* MAIN WORKSPACE CONTENT */}
      <main className="flex-1 w-full max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* OFFICIAL BRANDING HEADER: Collaboration of White and Yellow */}
        <div className="bg-white rounded-2xl border-2 border-amber-300 overflow-hidden shadow-xs">
          <div className="bg-gradient-to-r from-white via-amber-50/90 to-yellow-300/85 text-[#0A2540] p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Uploaded Logos & System Title */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="flex items-center gap-4 shrink-0 bg-white/90 px-4 py-2.5 rounded-xl border border-amber-200">
                  <PemkotSurabayaLogo className="w-16 h-16 md:w-20 md:h-20" />
                  <KoniSurabayaLogoJpeg
                    className="w-16 h-16 md:w-20 md:h-20"
                    showFormatLabel
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="text-xs font-extrabold text-amber-800 tracking-wider uppercase">
                    KONI KOTA SURABAYA
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-[#0A2540] leading-tight max-w-3xl">
                    Dashboard Laporan Petugas MONEV POPDA XV -PEPAPERDA III JAWA TIMUR 2026
                  </h1>
                  <p className="text-xs sm:text-sm font-bold text-slate-700">
                    Laporan Rutin Petugas Monev Kontingen Surabaya 2026
                  </p>
                </div>
              </div>

              {/* Active Session Status Box (Only shown after role is chosen) */}
              {hasEnteredRole && (
                <div className="bg-white/95 border border-amber-300 rounded-xl p-4 lg:max-w-xs w-full space-y-2.5 shrink-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Akses Aktif:</span>
                    <span className="font-extrabold text-[#0A2540]">
                      {role === 'guest'
                        ? 'Akses Publik'
                        : role === 'monev'
                        ? `Petugas Monev: ${selectedOfficer}`
                        : 'Akses Penuh KETUM KONI'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-amber-200 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveSection('venue')}
                      className="text-[11px] font-bold text-[#0D9488] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <MapPin className="w-3 h-3" />
                      Peta Posko & Venue
                    </button>
                    <button
                      type="button"
                      onClick={handleResetDefaultData}
                      title="Kembalikan ke data awal bawaan"
                      className="text-[11px] text-slate-600 hover:text-[#0A2540] flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Full-Width 4-Column Locked Executive KPI Strip (Only visible after user selects a role) */}
          {hasEnteredRole && (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-amber-200 bg-white border-t border-amber-200">
                <div className="p-4 text-center">
                  <div className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-slate-500">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>Medali Emas</span>
                  </div>
                  <p className="text-2xl font-extrabold text-amber-600 font-mono tabular-nums mt-0.5">
                    {totals.gold}
                  </p>
                </div>
                <div className="p-4 text-center">
                  <div className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-slate-500">
                    <Lock className="w-3 h-3 text-slate-500" />
                    <span>Medali Perak</span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-700 font-mono tabular-nums mt-0.5">
                    {totals.silver}
                  </p>
                </div>
                <div className="p-4 text-center">
                  <div className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-slate-500">
                    <Lock className="w-3 h-3 text-orange-700" />
                    <span>Medali Perunggu</span>
                  </div>
                  <p className="text-2xl font-extrabold text-orange-700 font-mono tabular-nums mt-0.5">
                    {totals.bronze}
                  </p>
                </div>
                <div className="p-4 text-center">
                  <div className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-slate-500">
                    <Lock className="w-3 h-3 text-[#0A2540]" />
                    <span>Total Medali Surabaya</span>
                  </div>
                  <p className="text-2xl font-extrabold text-[#0A2540] font-mono tabular-nums mt-0.5">
                    {totals.total}
                  </p>
                </div>
              </div>

              {/* Real-Time Sync Status Strip (Updated Date/Time & Refresh Only) */}
              <div className="bg-amber-50/90 border-t border-amber-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-[11px] text-slate-700 font-mono">
                  Updated: <strong className="text-[#0A2540]">{liveSyncInfo.syncedAt}</strong>
                </span>

                <button
                  type="button"
                  onClick={fetchLiveSurabayaKlasemen}
                  disabled={liveSyncInfo.isSyncing}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-amber-100 text-[#0A2540] border border-amber-300 rounded font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw
                    className={`w-3 h-3 text-[#0D9488] ${
                      liveSyncInfo.isSyncing ? 'animate-spin' : ''
                    }`}
                  />
                  {liveSyncInfo.isSyncing ? 'Menyinkronkan...' : 'Refresh Real-Time'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* HOMEPAGE PORTAL: ONLY THE 3 CLEAN ROLE CARDS (Before user enters a role) */}
        {!hasEnteredRole && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch pt-2">
            {/* CARD 1: Akses Publik */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-[#0A2540]">
                  Akses Publik
                </h2>
                <Eye className="w-5 h-5 text-[#0D9488] shrink-0" />
              </div>

              <button
                type="button"
                onClick={handleEnterAsGuest}
                className="w-full py-3 px-4 bg-[#0A2540] hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Masuk Akses Publik
              </button>
            </div>

            {/* CARD 2: Akses Petugas Monev (pilih nama anda sendiri) */}
            <form
              onSubmit={handleEnterAsMonev}
              className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-extrabold text-[#0A2540]">
                    Akses Petugas Monev (pilih nama anda sendiri)
                  </h2>
                  <UserCheck className="w-5 h-5 text-[#0D9488] shrink-0" />
                </div>

                <div className="space-y-2.5">
                  <select
                    value={selectedOfficer}
                    onChange={(e) => {
                      setSelectedOfficer(e.target.value);
                      setMonevError('');
                    }}
                    aria-label="Pilih Nama Petugas Monev"
                    className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-[#0A2540] focus:outline-none focus:border-[#0D9488]"
                  >
                    {MONEV_OFFICERS.map((off) => (
                      <option key={off.name} value={off.name}>
                        {off.name}
                      </option>
                    ))}
                  </select>

                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={monevPassword}
                      onChange={(e) => {
                        setMonevPassword(e.target.value);
                        setMonevError('');
                      }}
                      placeholder="Masukkan password"
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#0D9488]"
                    />
                  </div>
                  {monevError && (
                    <p className="text-[11px] font-semibold text-rose-600">
                      {monevError}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#0D9488] hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Masuk sebagai {selectedOfficer}
              </button>
            </form>

            {/* CARD 3: Akses Penuh KETUM KONI */}
            <form
              onSubmit={handleEnterAsKetum}
              className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-[#0A2540]">
                    Akses Penuh KETUM KONI
                  </h2>
                  <Shield className="w-5 h-5 text-[#F59E0B] shrink-0" />
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => {
                        setAdminPassword(e.target.value);
                        setAdminError('');
                      }}
                      placeholder="Masukkan password"
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#0A2540]"
                    />
                  </div>
                  {adminError && (
                    <p className="text-[11px] font-semibold text-rose-600">
                      {adminError}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#F59E0B] hover:bg-amber-400 text-[#0A2540] text-xs font-extrabold rounded-lg transition-colors cursor-pointer"
              >
                Masuk Akses Penuh KETUM KONI
              </button>
            </form>
          </div>
        )}

        {/* UNLOCKED SECTIONS AFTER SELECTING A ROLE */}
        {hasEnteredRole && activeSection === 'klasemen' && (
          <KlasemenCaborSection
            cabors={cabors}
            role={role}
            activeOfficer={selectedOfficer}
            liveSyncInfo={liveSyncInfo}
            onRefreshLiveKlasemen={fetchLiveSurabayaKlasemen}
            onJumpToUpdateCabor={(caborId) => {
              if (role === 'guest') return;
              setSelectedCaborId(caborId);
              setActiveSection('monev');
            }}
            onOpenLetterModal={handleOpenLetterModal}
          />
        )}

        {hasEnteredRole && role !== 'guest' && activeSection === 'monev' && (
          <MonevUpdateSection
            cabors={cabors}
            role={role}
            activeOfficer={selectedOfficer}
            selectedCaborId={selectedCaborId}
            syncedAt={liveSyncInfo.syncedAt}
            isSyncing={liveSyncInfo.isSyncing}
            onRefreshLiveKlasemen={fetchLiveSurabayaKlasemen}
            onSelectCaborId={setSelectedCaborId}
            onSelectOfficer={(name) => setSelectedOfficer(name)}
            onAddAthlete={handleAddAthlete}
            onDeleteAthlete={handleDeleteAthlete}
            onSaveDailyReport={handleSaveDailyReport}
            onOpenLetterModal={handleOpenLetterModal}
            onSwitchToRolePortal={handleBackToPortal}
          />
        )}

        {hasEnteredRole && activeSection === 'venue' && (
          <VenueMapSection cabors={cabors} />
        )}

        {hasEnteredRole && activeSection === 'jadwal' && (
          <ScheduleMatrixSection
            cabors={cabors}
            role={role}
            activeOfficer={selectedOfficer}
            onUpdateScheduleCell={handleUpdateScheduleCell}
          />
        )}
      </main>

      {/* MANDATORY FOOTER: White & Yellow Collaboration, without logos or title/posko text */}
      <footer className="no-print bg-gradient-to-r from-white via-yellow-50 to-amber-300 text-[#0A2540] border-t-2 border-amber-400 mt-12">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p className="font-extrabold text-[#0A2540] tracking-wide">
              Powered by PT Pilar Teknologi Surabaya (Pilargov) @2026
            </p>

            <div className="flex flex-wrap items-center gap-6 font-bold">
              <button
                type="button"
                onClick={() => setFooterModal('privacy')}
                className="text-[#0A2540] hover:text-amber-900 hover:underline transition-colors cursor-pointer"
              >
                Kebijakan Privasi
              </button>
              <button
                type="button"
                onClick={() => setFooterModal('terms')}
                className="text-[#0A2540] hover:text-amber-900 hover:underline transition-colors cursor-pointer"
              >
                Syarat & Ketentuan
              </button>
              <button
                type="button"
                onClick={() => setFooterModal('contact')}
                className="text-[#0A2540] hover:text-amber-900 hover:underline transition-colors cursor-pointer"
              >
                Kontak Layanan Pelanggan Resmi
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* OFFICIAL LETTER NARRATIVE & PRINT PDF MODAL (Restricted from Guest) */}
      {role !== 'guest' && (
        <OfficialLetterModal
          isOpen={isLetterModalOpen}
          onClose={() => setIsLetterModalOpen(false)}
          officerName={activeLetterOfficerName}
          cabors={letterCabors}
          selectedCaborId={letterModalCaborId}
        />
      )}

      {/* FOOTER LEGAL / CONTACT MODAL */}
      {footerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-[#0A2540] font-bold text-base">
                {footerModal === 'privacy' && (
                  <>
                    <FileText className="w-5 h-5 text-[#0D9488]" />
                    <span>Kebijakan Privasi Data Monev Kontingen Surabaya</span>
                  </>
                )}
                {footerModal === 'terms' && (
                  <>
                    <Scale className="w-5 h-5 text-[#0D9488]" />
                    <span>Syarat & Ketentuan Penggunaan Sistem</span>
                  </>
                )}
                {footerModal === 'contact' && (
                  <>
                    <PhoneCall className="w-5 h-5 text-[#0D9488]" />
                    <span>Kontak Layanan Pelanggan Resmi & Posko Monev</span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setFooterModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {footerModal === 'privacy' && (
              <div className="text-xs text-slate-700 space-y-2.5 leading-relaxed">
                <p>
                  Sistem <strong>Dashboard Laporan Petugas MONEV POPDA XV -PEPAPERDA III JAWA TIMUR 2026</strong> mengelola data perolehan medali, identitas atlet pelajar, dokumentasi pertandingan, dan laporan evaluasi harian secara eksklusif untuk kepentingan pembinaan olahraga KONI Kota Surabaya.
                </p>
                <p>
                  Seluruh data evaluasi atlet potensial menuju <strong>PORPROV Jawa Timur 2027</strong> dijaga kerahasiaannya sesuai standar tata kelola sistem yang dikembangkan — Powered by PT Pilar Teknologi Surabaya (Pilargov).
                </p>
              </div>
            )}

            {footerModal === 'terms' && (
              <div className="text-xs text-slate-700 space-y-2.5 leading-relaxed">
                <p>
                  1. <strong>Akses Publik</strong> diperuntukkan bagi pemantauan informasi klasemen, daftar atlet, peta venue, dan jadwal secara transparan.
                </p>
                <p>
                  2. <strong>Akses Petugas Monev (pilih nama anda sendiri)</strong> wajib melaporkan data medali, kondisi pertandingan, kondisi venue, dan kondisi atlet secara akurat sesuai fakta lapangan bersama PIC cabor.
                </p>
                <p>
                  3. <strong>Akses Penuh KETUM KONI</strong> memegang otoritas tertinggi dalam validasi laporan harian dan pengesahan narasi surat resmi.
                </p>
              </div>
            )}

            {footerModal === 'contact' && (
              <div className="text-xs text-slate-700 space-y-2.5 leading-relaxed">
                <p className="font-bold text-[#0A2540]">
                  Posko Utama: Hotel Riski Samudra, Jl. Basuki Rahmat, Winong, Margomulyo, Ngawi
                </p>
                <p>
                  <strong>Hotline Sekretariat Posko:</strong> {POSKO_MONEV.commandCenterContact}
                </p>
                <p className="pt-2 border-t border-slate-200">
                  <strong>Dukungan Teknis Sistem:</strong>
                  <br />
                  Powered by PT Pilar Teknologi Surabaya (Pilargov) · Helpdesk Command Center 24/7: support@pilargov.id
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setFooterModal(null)}
                className="px-4 py-2 bg-[#0A2540] text-white text-xs font-bold rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Tutup Informasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

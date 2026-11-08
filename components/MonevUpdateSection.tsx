'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileText,
  Award,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  Printer,
  ShieldCheck,
  UserCheck,
  Camera,
  Lock,
  Save,
  RefreshCw,
} from 'lucide-react';
import {
  AthleteMedal,
  CaborItem,
  DailyReportEntry,
  JURNAL_MONEV_DATES,
  MONEV_OFFICERS,
  UserRole,
  canOfficerAccessCabor,
  createDocumentationDataUrl,
} from '@/lib/monev-data';

const REPORT_DRAFTS_STORAGE_KEY = 'papan_prestasi_surabaya_report_drafts_v1';
const ATHLETE_DRAFTS_STORAGE_KEY = 'papan_prestasi_surabaya_athlete_drafts_v1';

interface ReportDraftItem {
  matchCondition: string;
  venueCondition: string;
  athleteCondition: string;
  additionalReport: string;
  validatedByKetum: boolean;
  ketumNote: string;
  photos: DailyReportEntry['photos'];
}

interface AthleteDraftItem {
  athName: string;
  athEvent: string;
  athMedal: 'Emas' | 'Perak' | 'Perunggu';
  athSchool: string;
  athNote: string;
  athPorprov: boolean;
}

interface MonevUpdateSectionProps {
  cabors: CaborItem[];
  role: UserRole;
  activeOfficer: string;
  selectedCaborId: string;
  onSelectCaborId: (id: string) => void;
  onSelectOfficer: (name: string) => void;
  onAddAthlete: (caborId: string, athlete: Omit<AthleteMedal, 'id'>) => void;
  onDeleteAthlete: (caborId: string, athleteId: string) => void;
  onSaveDailyReport: (caborId: string, dateKey: string, entry: DailyReportEntry) => void;
  onOpenLetterModal: (caborId?: string) => void;
  onSwitchToRolePortal: () => void;
  syncedAt: string;
  isSyncing: boolean;
  onRefreshLiveKlasemen: () => void;
}

export default function MonevUpdateSection({
  cabors,
  role,
  activeOfficer,
  selectedCaborId,
  onSelectCaborId,
  onSelectOfficer,
  onAddAthlete,
  onDeleteAthlete,
  onSaveDailyReport,
  onOpenLetterModal,
  onSwitchToRolePortal,
  syncedAt,
  isSyncing,
  onRefreshLiveKlasemen,
}: MonevUpdateSectionProps) {
  const [ketumOfficerFilter, setKetumOfficerFilter] = useState<string>('ALL');
  const [productivitySort, setProductivitySort] = useState<'percent' | 'name'>('percent');
  const [selectedDateKey, setSelectedDateKey] = useState<string>('2026-11-03');
  const [saveFeedback, setSaveFeedback] = useState<string>('');
  const [athleteFeedback, setAthleteFeedback] = useState<string>('');

  // Dynamic Productivity Calculation for 7 Petugas Monev (Kelengkapan, Kejelasan, Isi Day-by-Day, Foto)
  const officerProductivityStats = useMemo(() => {
    const stats = MONEV_OFFICERS.map((off) => {
      const officerCabors = cabors.filter((c) => canOfficerAccessCabor(off.name, c));
      const caborCount = officerCabors.length || 1;
      const gold = officerCabors.reduce((s, c) => s + c.gold, 0);
      const silver = officerCabors.reduce((s, c) => s + c.silver, 0);
      const bronze = officerCabors.reduce((s, c) => s + c.bronze, 0);

      let completeScoreSum = 0;
      let clarityScoreSum = 0;
      let totalDaysLogged = 0;
      let caborsWithPhotoCount = 0;
      let totalPhotos = 0;

      officerCabors.forEach((c) => {
        const reports = Object.values(c.dailyReports);
        totalDaysLogged += reports.length;

        // 1. Kelengkapan Laporan per Cabor: has athletes + all 4 fields filled in logged reports
        const hasAthletes = c.athletes.length > 0 ? 1 : 0;
        const completeReports = reports.filter(
          (r) =>
            r.matchCondition.trim().length > 10 &&
            r.venueCondition.trim().length > 10 &&
            r.athleteCondition.trim().length > 10 &&
            r.additionalReport.trim().length > 10
        ).length;
        const reportCompleteness = reports.length > 0 ? completeReports / reports.length : 0;
        completeScoreSum += hasAthletes * 0.4 + reportCompleteness * 0.6;

        // 2. Kejelasan Laporan per Cabor: narrative depth (character count of 4 fields + athlete notes)
        const avgChars =
          reports.length > 0
            ? reports.reduce(
                (acc, r) =>
                  acc +
                  r.matchCondition.length +
                  r.venueCondition.length +
                  r.athleteCondition.length +
                  r.additionalReport.length,
                0
              ) / reports.length
            : 0;
        const clarityRatio = Math.min(1, avgChars / 320);
        clarityScoreSum += clarityRatio;

        // 4. Foto Laporan per Cabor
        const photoCountInCabor = reports.reduce((acc, r) => acc + (r.photos?.length || 0), 0);
        totalPhotos += photoCountInCabor;
        if (photoCountInCabor > 0) {
          caborsWithPhotoCount += 1;
        }
      });

      const kelengkapanPct = Math.round((completeScoreSum / caborCount) * 100);
      const kejelasanPct = Math.round((clarityScoreSum / caborCount) * 100);
      // 3. Isi Laporan Day-by-Day (Target aktif minimal 3-4 hari evaluasi berjalan per cabor = 100%)
      const dayByDayPct = Math.min(
        100,
        Math.round((totalDaysLogged / (caborCount * 3.5)) * 100)
      );
      const fotoPct = Math.min(
        100,
        Math.round((caborsWithPhotoCount / caborCount) * 100)
      );

      const totalPercentage = Math.round(
        kelengkapanPct * 0.3 +
          kejelasanPct * 0.25 +
          dayByDayPct * 0.25 +
          fotoPct * 0.2
      );

      return {
        name: off.name,
        roleTitle: off.roleTitle,
        caborCount: off.primaryCaborCount,
        gold,
        silver,
        bronze,
        kelengkapanPct,
        kejelasanPct,
        dayByDayPct,
        fotoPct,
        totalDaysLogged,
        totalPhotos,
        totalPercentage,
      };
    });

    if (productivitySort === 'percent') {
      return [...stats].sort((a, b) => b.totalPercentage - a.totalPercentage);
    }
    return [...stats].sort((a, b) => a.name.localeCompare(b.name));
  }, [cabors, productivitySort]);

  // Accessible cabors based on role
  const accessibleCabors = useMemo(() => {
    if (role === 'ketum') {
      if (ketumOfficerFilter === 'ALL') return cabors;
      return cabors.filter((c) => canOfficerAccessCabor(ketumOfficerFilter, c));
    }
    if (role === 'monev') {
      return cabors.filter((c) => canOfficerAccessCabor(activeOfficer, c));
    }
    return cabors;
  }, [cabors, role, activeOfficer, ketumOfficerFilter]);

  const activeCabor = useMemo(() => {
    const found = accessibleCabors.find((c) => c.id === selectedCaborId);
    return found || accessibleCabors[0] || cabors[0];
  }, [accessibleCabors, selectedCaborId, cabors]);

  // Sync selectedCaborId when accessibleCabors changes
  useEffect(() => {
    if (
      accessibleCabors.length > 0 &&
      !accessibleCabors.some((c) => c.id === selectedCaborId)
    ) {
      onSelectCaborId(accessibleCabors[0].id);
    }
  }, [accessibleCabors, selectedCaborId, onSelectCaborId]);

  // Form states for new Athlete
  const [athName, setAthName] = useState('');
  const [athEvent, setAthEvent] = useState('');
  const [athMedal, setAthMedal] = useState<'Emas' | 'Perak' | 'Perunggu'>('Emas');
  const [athSchool, setAthSchool] = useState('');
  const [athNote, setAthNote] = useState('');
  const [athPorprov, setAthPorprov] = useState(true);

  // Form states for Daily Report (1 Nov - 11 Nov 2026)
  const currentReport = activeCabor.dailyReports[selectedDateKey];
  const dateObj =
    JURNAL_MONEV_DATES.find((d) => d.key === selectedDateKey) ||
    JURNAL_MONEV_DATES[2] ||
    JURNAL_MONEV_DATES[0];

  const [matchCondition, setMatchCondition] = useState('');
  const [venueCondition, setVenueCondition] = useState('');
  const [athleteCondition, setAthleteCondition] = useState('');
  const [additionalReport, setAdditionalReport] = useState('');
  const [validatedByKetum, setValidatedByKetum] = useState(false);
  const [ketumNote, setKetumNote] = useState('');
  const [photos, setPhotos] = useState<DailyReportEntry['photos']>([]);
  const [photoCaption, setPhotoCaption] = useState('');

  // Ref guards to ensure background polling or parent re-renders NEVER wipe active user inputs
  const loadedReportContextKeyRef = useRef<string>('');
  const loadedAthleteCaborIdRef = useRef<string>('');

  const persistReportDraft = (
    contextKey: string,
    draftPatch: Partial<ReportDraftItem>
  ) => {
    try {
      const raw = localStorage.getItem(REPORT_DRAFTS_STORAGE_KEY);
      const allDrafts: Record<string, ReportDraftItem> = raw ? JSON.parse(raw) : {};
      const existing = allDrafts[contextKey] || {
        matchCondition,
        venueCondition,
        athleteCondition,
        additionalReport,
        validatedByKetum,
        ketumNote,
        photos,
      };
      allDrafts[contextKey] = {
        ...existing,
        ...draftPatch,
      };
      localStorage.setItem(REPORT_DRAFTS_STORAGE_KEY, JSON.stringify(allDrafts));
    } catch {
      // Ignore storage quota errors
    }
  };

  const clearReportDraft = (contextKey: string) => {
    try {
      const raw = localStorage.getItem(REPORT_DRAFTS_STORAGE_KEY);
      if (!raw) return;
      const allDrafts: Record<string, ReportDraftItem> = JSON.parse(raw);
      delete allDrafts[contextKey];
      localStorage.setItem(REPORT_DRAFTS_STORAGE_KEY, JSON.stringify(allDrafts));
    } catch {
      // Ignore storage errors
    }
  };

  const persistAthleteDraft = (
    caborId: string,
    draftPatch: Partial<AthleteDraftItem>
  ) => {
    try {
      const raw = localStorage.getItem(ATHLETE_DRAFTS_STORAGE_KEY);
      const allDrafts: Record<string, AthleteDraftItem> = raw ? JSON.parse(raw) : {};
      const existing = allDrafts[caborId] || {
        athName,
        athEvent,
        athMedal,
        athSchool,
        athNote,
        athPorprov,
      };
      allDrafts[caborId] = {
        ...existing,
        ...draftPatch,
      };
      localStorage.setItem(ATHLETE_DRAFTS_STORAGE_KEY, JSON.stringify(allDrafts));
    } catch {
      // Ignore storage errors
    }
  };

  const clearAthleteDraft = (caborId: string) => {
    try {
      const raw = localStorage.getItem(ATHLETE_DRAFTS_STORAGE_KEY);
      if (!raw) return;
      const allDrafts: Record<string, AthleteDraftItem> = JSON.parse(raw);
      delete allDrafts[caborId];
      localStorage.setItem(ATHLETE_DRAFTS_STORAGE_KEY, JSON.stringify(allDrafts));
    } catch {
      // Ignore storage errors
    }
  };

  // Load athlete draft ONLY when activeCabor.id actually changes
  useEffect(() => {
    const caborId = activeCabor.id;
    if (loadedAthleteCaborIdRef.current === caborId) return;
    loadedAthleteCaborIdRef.current = caborId;

    let draft: AthleteDraftItem | undefined;
    try {
      const raw = localStorage.getItem(ATHLETE_DRAFTS_STORAGE_KEY);
      if (raw) {
        const allDrafts: Record<string, AthleteDraftItem> = JSON.parse(raw);
        draft = allDrafts[caborId];
      }
    } catch {
      // Ignore parse errors
    }

    const timer = window.setTimeout(() => {
      if (draft) {
        setAthName(draft.athName || '');
        setAthEvent(draft.athEvent || '');
        setAthMedal(draft.athMedal || 'Emas');
        setAthSchool(draft.athSchool || '');
        setAthNote(draft.athNote || '');
        setAthPorprov(draft.athPorprov ?? true);
      } else {
        setAthName('');
        setAthEvent('');
        setAthMedal('Emas');
        setAthSchool('');
        setAthNote('');
        setAthPorprov(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [activeCabor.id]);

  // Load current report fields ONLY when (activeCabor.id + selectedDateKey) changes
  const reportContextKey = `${activeCabor.id}::${selectedDateKey}`;
  useEffect(() => {
    if (loadedReportContextKeyRef.current === reportContextKey) return;
    loadedReportContextKeyRef.current = reportContextKey;

    let draft: ReportDraftItem | undefined;
    try {
      const raw = localStorage.getItem(REPORT_DRAFTS_STORAGE_KEY);
      if (raw) {
        const allDrafts: Record<string, ReportDraftItem> = JSON.parse(raw);
        draft = allDrafts[reportContextKey];
      }
    } catch {
      // Ignore parse errors
    }

    const rep = activeCabor.dailyReports[selectedDateKey];
    const timer = window.setTimeout(() => {
      if (draft) {
        setMatchCondition(draft.matchCondition ?? rep?.matchCondition ?? '');
        setVenueCondition(draft.venueCondition ?? rep?.venueCondition ?? '');
        setAthleteCondition(draft.athleteCondition ?? rep?.athleteCondition ?? '');
        setAdditionalReport(draft.additionalReport ?? rep?.additionalReport ?? '');
        setValidatedByKetum(draft.validatedByKetum ?? rep?.validatedByKetum ?? false);
        setKetumNote(draft.ketumNote ?? rep?.ketumNote ?? '');
        setPhotos(draft.photos ?? rep?.photos ?? []);
      } else if (rep) {
        setMatchCondition(rep.matchCondition);
        setVenueCondition(rep.venueCondition);
        setAthleteCondition(rep.athleteCondition);
        setAdditionalReport(rep.additionalReport);
        setValidatedByKetum(rep.validatedByKetum);
        setKetumNote(rep.ketumNote || '');
        setPhotos(rep.photos || []);
      } else {
        setMatchCondition('');
        setVenueCondition('');
        setAthleteCondition('');
        setAdditionalReport('');
        setValidatedByKetum(false);
        setKetumNote('');
        setPhotos([]);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [reportContextKey, activeCabor.dailyReports, selectedDateKey]);

  const canEdit =
    role === 'ketum' ||
    (role === 'monev' && canOfficerAccessCabor(activeOfficer, activeCabor));

  const handleSaveReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    const authorLabel =
      role === 'ketum'
        ? 'KETUM KONI Surabaya (Admin)'
        : activeOfficer || activeCabor.monevOfficer;

    const finalMatch =
      matchCondition.trim() ||
      `Pertandingan Cabor ${activeCabor.name} berjalan tertib dan kondusif sesuai jadwal.`;
    const finalVenue =
      venueCondition.trim() ||
      `Kondisi arena ${activeCabor.venueName} memenuhi standar teknis pertandingan.`;
    const finalAthlete =
      athleteCondition.trim() ||
      `Atlet Kontingen Surabaya dalam kondisi bugar dan siap bertanding.`;
    const finalAdditional =
      additionalReport.trim() ||
      `Koordinasi bersama PIC ${activeCabor.pic} berjalan lancar.`;

    const newEntry: DailyReportEntry = {
      dateKey: selectedDateKey,
      dateLabel: dateObj.label,
      matchCondition: finalMatch,
      venueCondition: finalVenue,
      athleteCondition: finalAthlete,
      additionalReport: finalAdditional,
      photos,
      validatedByKetum: role === 'ketum' ? validatedByKetum : currentReport?.validatedByKetum ?? false,
      ketumNote: ketumNote.trim() || undefined,
      updatedAt: `${dateObj.label}, diperbarui oleh ${authorLabel}`,
    };

    setMatchCondition(finalMatch);
    setVenueCondition(finalVenue);
    setAthleteCondition(finalAthlete);
    setAdditionalReport(finalAdditional);
    clearReportDraft(reportContextKey);
    onSaveDailyReport(activeCabor.id, selectedDateKey, newEntry);
    setSaveFeedback(`Laporan harian ${activeCabor.name} (${dateObj.short}) berhasil disimpan.`);
    setTimeout(() => setSaveFeedback(''), 3500);
  };

  const handleAddAthleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !athName.trim() || !athEvent.trim()) return;
    const addedName = athName.trim();
    onAddAthlete(activeCabor.id, {
      name: addedName,
      eventNumber: athEvent.trim(),
      medal: athMedal,
      schoolOrClub: athSchool.trim() || 'Kontingen Kota Surabaya',
      performanceNote:
        athNote.trim() || 'Tampil konsisten dan berkontribusi pada perolehan medali.',
      isPorprov2027Potential: athPorprov,
    });
    setAthName('');
    setAthEvent('');
    setAthSchool('');
    setAthNote('');
    setAthPorprov(true);
    clearAthleteDraft(activeCabor.id);
    setAthleteFeedback(`Atlet "${addedName}" (${athMedal}) berhasil ditambahkan ke daftar.`);
    setTimeout(() => setAthleteFeedback(''), 3500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const newPhoto = {
          id: `photo-${Date.now()}`,
          caption:
            photoCaption.trim() ||
            `Dokumentasi Cabor ${activeCabor.name} di ${activeCabor.venueName} (${dateObj.short})`,
          dataUrl: reader.result,
          uploadedAt: `${dateObj.short} 2026`,
        };
        setPhotos((prev) => {
          const next = [...prev, newPhoto];
          persistReportDraft(reportContextKey, { photos: next });
          return next;
        });
        setPhotoCaption('');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddSamplePhoto = () => {
    const newPhoto = {
      id: `photo-${Date.now()}`,
      caption:
        photoCaption.trim() ||
        `Verifikasi Lapangan Cabor ${activeCabor.name} bersama PIC ${activeCabor.pic}`,
      dataUrl: createDocumentationDataUrl(
        activeCabor.name,
        activeCabor.venueName,
        dateObj.label
      ),
      uploadedAt: `${dateObj.short} 2026`,
    };
    setPhotos((prev) => {
      const next = [...prev, newPhoto];
      persistReportDraft(reportContextKey, { photos: next });
      return next;
    });
    setPhotoCaption('');
  };

  const letterOfficerName =
    role === 'monev'
      ? activeOfficer
      : role === 'ketum' && ketumOfficerFilter !== 'ALL'
      ? ketumOfficerFilter
      : activeCabor.monevOfficer;

  return (
    <section className="space-y-6">
      {/* Top Section Header & PDF Action */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-semibold text-[#0D9488]">
            {role === 'ketum'
              ? 'Mode Administrator Penuh: KETUM KONI Kota Surabaya (30 Cabor & 7 Petugas Monev)'
              : role === 'monev'
              ? `Lembar Kerja Petugas Monev: ${activeOfficer}`
              : 'Mode Pratinjau Tamu (Read-Only) · Silakan Masuk sebagai Monev / Ketum KONI untuk Mengedit'}
          </p>
          <h2 className="text-2xl font-bold text-[#0A2540] tracking-tight mt-0.5">
            Evaluasi dan Dokumentasi
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {role === 'monev' && (
            <select
              value={activeOfficer}
              onChange={(e) => onSelectOfficer(e.target.value)}
              aria-label="Ganti Petugas Monev Aktif"
              className="px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-[#0A2540] focus:outline-none focus:border-[#0D9488]"
            >
              {MONEV_OFFICERS.map((off) => (
                <option key={off.name} value={off.name}>
                  Petugas: {off.name} ({off.primaryCaborCount} Cabor)
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => onOpenLetterModal(activeCabor.id)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A2540] hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-4 h-4 text-[#F59E0B]" />
            Generate Laporan PDF ({letterOfficerName})
          </button>
        </div>
      </div>

      {/* Guest Banner if in Guest Mode */}
      {role === 'guest' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-700 shrink-0" />
            <div className="text-xs text-amber-950">
              <p className="font-bold">
                Anda sedang mengakses dalam Mode Guest (Tamu Publik - Hanya Baca)
              </p>
              <p>
                Untuk melakukan pengisian medali, upload foto laporan, dan evaluasi harian, silakan masuk sebagai <strong>Petugas Monev</strong> atau <strong>KETUM KONI (Admin)</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onSwitchToRolePortal}
            className="px-4 py-2 bg-[#0A2540] text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            Pilih Peran Akses Masuk
          </button>
        </div>
      )}

      {/* KETUM KONI Admin Panel: Ringkasan Produktivitas Petugas Monev By Name & By Persentase */}
      {role === 'ketum' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-[#0A2540] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0D9488]" />
                Ringkasan Produktivitas 7 Petugas Monev (By Name & By Persentase Performa Pelaporan)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Evaluasi performa pelaporan real-time berdasarkan 4 indikator: <strong>Kelengkapan Laporan</strong>, <strong>Kejelasan Laporan</strong>, <strong>Isi Laporan Day-by-Day</strong>, dan <strong>Foto Laporan</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setProductivitySort('percent')}
                  className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    productivitySort === 'percent'
                      ? 'bg-[#0A2540] text-amber-300'
                      : 'text-slate-600 hover:text-[#0A2540]'
                  }`}
                >
                  By Persentase (%)
                </button>
                <button
                  type="button"
                  onClick={() => setProductivitySort('name')}
                  className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    productivitySort === 'name'
                      ? 'bg-[#0A2540] text-amber-300'
                      : 'text-slate-600 hover:text-[#0A2540]'
                  }`}
                >
                  By Name (Petugas)
                </button>
              </div>

              {ketumOfficerFilter !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setKetumOfficerFilter('ALL')}
                  className="px-3 py-1.5 bg-teal-50 text-[#0D9488] border border-teal-200 rounded-lg text-xs font-bold hover:bg-teal-100 cursor-pointer whitespace-nowrap"
                >
                  Tampilkan Seluruh 30 Cabor
                </button>
              )}
            </div>
          </div>

          {/* 7-Officer Cards Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {officerProductivityStats.map((stat) => {
              const isSelected = ketumOfficerFilter === stat.name;
              return (
                <button
                  key={stat.name}
                  type="button"
                  onClick={() =>
                    setKetumOfficerFilter((prev) =>
                      prev === stat.name ? 'ALL' : stat.name
                    )
                  }
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#0A2540] text-white border-[#0A2540] shadow-sm'
                      : 'bg-slate-50 text-[#0A2540] border-slate-200 hover:border-[#0D9488]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-[11px] font-mono tabular-nums font-extrabold ${
                          isSelected ? 'text-[#F59E0B]' : 'text-[#0D9488]'
                        }`}
                      >
                        {stat.totalPercentage}% Produktif
                      </span>
                      <span
                        className={`text-[10px] font-mono ${
                          isSelected ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {stat.caborCount} Cabor
                      </span>
                    </div>
                    <p className="text-xs font-extrabold truncate mt-1">
                      {stat.name}
                    </p>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isSelected ? 'bg-[#F59E0B]' : 'bg-[#0D9488]'
                        }`}
                        style={{ width: `${stat.totalPercentage}%` }}
                      />
                    </div>
                    <p
                      className={`text-[11px] font-mono tabular-nums font-bold ${
                        isSelected ? 'text-slate-200' : 'text-slate-700'
                      }`}
                    >
                      Medali: {stat.gold}E · {stat.silver}P · {stat.bronze}Pr
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Productivity Table by 4 Indicators */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#0A2540] text-white text-left">
                  <th className="py-3 px-4 font-bold">Nama Petugas Monev</th>
                  <th className="py-3 px-3 font-bold text-center">Cabor Tugas</th>
                  <th className="py-3 px-3 font-bold text-right">
                    1. Kelengkapan Laporan
                  </th>
                  <th className="py-3 px-3 font-bold text-right">
                    2. Kejelasan Laporan
                  </th>
                  <th className="py-3 px-3 font-bold text-right">
                    3. Isi Laporan Day-by-Day
                  </th>
                  <th className="py-3 px-3 font-bold text-right">
                    4. Foto Laporan
                  </th>
                  <th className="py-3 px-4 font-bold text-right text-[#F59E0B]">
                    Total Produktivitas (%)
                  </th>
                  <th className="py-3 px-4 font-bold text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {officerProductivityStats.map((stat) => {
                  const isSelected = ketumOfficerFilter === stat.name;
                  return (
                    <tr
                      key={stat.name}
                      className={`transition-colors ${
                        isSelected ? 'bg-amber-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#0A2540]">{stat.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {stat.roleTitle}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums font-semibold text-slate-700">
                        {stat.caborCount} Cabor
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums">
                        <span className="font-bold text-slate-800">
                          {stat.kelengkapanPct}%
                        </span>
                        <span className="block text-[10px] text-slate-500">
                          Atribut & Data Atlet
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums">
                        <span className="font-bold text-slate-800">
                          {stat.kejelasanPct}%
                        </span>
                        <span className="block text-[10px] text-slate-500">
                          Kedalaman Narasi
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums">
                        <span className="font-bold text-slate-800">
                          {stat.dayByDayPct}%
                        </span>
                        <span className="block text-[10px] text-slate-500">
                          {stat.totalDaysLogged} Entri Harian
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums">
                        <span className="font-bold text-slate-800">
                          {stat.fotoPct}%
                        </span>
                        <span className="block text-[10px] text-slate-500">
                          {stat.totalPhotos} Foto Bukti
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex flex-col items-end">
                          <span className="font-mono tabular-nums text-sm font-extrabold text-[#0D9488]">
                            {stat.totalPercentage}%
                          </span>
                          <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-[#0D9488] rounded-full"
                              style={{ width: `${stat.totalPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setKetumOfficerFilter((prev) =>
                                prev === stat.name ? 'ALL' : stat.name
                              )
                            }
                            className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-[#0A2540] text-amber-300'
                                : 'bg-slate-100 hover:bg-slate-200 text-[#0A2540]'
                            }`}
                          >
                            {isSelected ? 'Sedang Difilter' : 'Periksa Cabor'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cabor Selector Tabs (Filtered by Role / Officer) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-[#0A2540]">
            Pilih Cabang Olahraga Tanggung Jawab ({accessibleCabors.length} Cabor):
          </span>
          <span className="text-xs text-slate-500">
            Petugas Monev: <strong>{activeCabor.monevOfficer}</strong>
            {activeCabor.coordinatingOfficers?.length
              ? ` (+ Koordinasi: ${activeCabor.coordinatingOfficers.join(', ')})`
              : ''}{' '}
            · PIC Cabor: <strong>{activeCabor.pic}</strong>
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {accessibleCabors.map((c) => {
            const isSelected = c.id === activeCabor.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectCaborId(c.id)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#0D9488] text-white border-[#0D9488]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-[#0D9488] hover:text-[#0A2540]'
                }`}
              >
                <span className="font-mono tabular-nums opacity-75">
                  {String(c.no).padStart(2, '0')}.
                </span>
                <span>{c.name}</span>
                <span
                  className={`font-mono tabular-nums text-[11px] ${
                    isSelected ? 'text-teal-100' : 'text-slate-500'
                  }`}
                >
                  ({c.gold}E/{c.silver}P/{c.bronze}Pr)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Grid: Left Column (Medals & Athletes), Right Column (Day-by-Day Report & Photos) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 5 Cols: Medal Tally Updater & Athlete Roster */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Locked Medal Counter (Synced Real-Time from popdapeparpedajatim.id/klasemen) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0A2540]">
                  1. Perolehan Medali Cabor {activeCabor.name}
                </h3>
                <p className="text-xs text-slate-500">
                  PIC Cabor: {activeCabor.pic} · Venue: {activeCabor.venueName}
                </p>
              </div>
              <Award className="w-5 h-5 text-[#F59E0B] shrink-0" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Emas */}
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-center space-y-1">
                <span className="inline-flex items-center justify-center gap-1 text-[11px] font-bold text-amber-900">
                  <Lock className="w-3 h-3" /> EMAS
                </span>
                <p className="text-2xl font-extrabold text-amber-700 font-mono tabular-nums">
                  {activeCabor.gold}
                </p>
              </div>

              {/* Perak */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center space-y-1">
                <span className="inline-flex items-center justify-center gap-1 text-[11px] font-bold text-slate-700">
                  <Lock className="w-3 h-3" /> PERAK
                </span>
                <p className="text-2xl font-extrabold text-slate-700 font-mono tabular-nums">
                  {activeCabor.silver}
                </p>
              </div>

              {/* Perunggu */}
              <div className="p-3 bg-orange-50/60 border border-orange-200 rounded-lg text-center space-y-1">
                <span className="inline-flex items-center justify-center gap-1 text-[11px] font-bold text-orange-900">
                  <Lock className="w-3 h-3" /> PERUNGGU
                </span>
                <p className="text-2xl font-extrabold text-orange-800 font-mono tabular-nums">
                  {activeCabor.bronze}
                </p>
              </div>

              {/* Total */}
              <div className="p-3 bg-slate-100 border border-slate-300 rounded-lg text-center space-y-1">
                <span className="inline-flex items-center justify-center gap-1 text-[11px] font-bold text-[#0A2540]">
                  <Lock className="w-3 h-3" /> TOTAL
                </span>
                <p className="text-2xl font-extrabold text-[#0A2540] font-mono tabular-nums">
                  {activeCabor.gold + activeCabor.silver + activeCabor.bronze}
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-700">
              <span className="font-mono text-slate-600">
                Updated: <strong>{syncedAt}</strong>
              </span>
              <button
                type="button"
                onClick={onRefreshLiveKlasemen}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-amber-100/60 text-[#0A2540] border border-amber-300 font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 text-[#0D9488] ${isSyncing ? 'animate-spin' : ''}`} />
                Refresh Real-Time
              </button>
            </div>
          </div>

          {/* Card 2: Daftar Atlet Peraih Medali */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0A2540]">
                  2. Daftar Atlet Peraih Medali
                </h3>
                <p className="text-xs text-slate-500">
                  Rincian atlet dan nomor pertandingan peraih medali Kontingen Kota Surabaya
                </p>
              </div>
              <UserCheck className="w-5 h-5 text-[#0D9488]" />
            </div>

            {athleteFeedback && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{athleteFeedback}</span>
              </div>
            )}

            {/* Existing Athletes List */}
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {activeCabor.athletes.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">
                  Belum ada data atlet peraih medali di cabor ini.
                </p>
              ) : (
                activeCabor.athletes.map((ath) => (
                  <div
                    key={ath.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-[#0A2540] text-sm">{ath.name}</p>
                        <p className="text-slate-600">
                          {ath.eventNumber} · <strong>Medali {ath.medal}</strong> · {ath.schoolOrClub}
                        </p>
                      </div>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => onDeleteAthlete(activeCabor.id, ath.id)}
                          aria-label={`Hapus atlet ${ath.name}`}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-slate-600">{ath.performanceNote}</p>
                  </div>
                ))
              )}
            </div>

            {/* Form Add Athlete */}
            {canEdit && (
              <form
                onSubmit={handleAddAthleteSubmit}
                className="pt-3 border-t border-slate-200 space-y-3"
              >
                <p className="text-xs font-bold text-[#0A2540]">
                  + Tambah Catatan Atlet Peraih Medali
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    required
                    value={athName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAthName(val);
                      persistAthleteDraft(activeCabor.id, { athName: val });
                    }}
                    placeholder="Nama Lengkap Atlet / Beregu"
                    className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0D9488]"
                  />
                  <input
                    type="text"
                    required
                    value={athEvent}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAthEvent(val);
                      persistAthleteDraft(activeCabor.id, { athEvent: val });
                    }}
                    placeholder="Nomor Pertandingan / Kelas"
                    className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0D9488]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <select
                    value={athMedal}
                    onChange={(e) => {
                      const val = e.target.value as 'Emas' | 'Perak' | 'Perunggu';
                      setAthMedal(val);
                      persistAthleteDraft(activeCabor.id, { athMedal: val });
                    }}
                    aria-label="Pilih Medali"
                    className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-[#0D9488]"
                  >
                    <option value="Emas">Medali Emas</option>
                    <option value="Perak">Medali Perak</option>
                    <option value="Perunggu">Medali Perunggu</option>
                  </select>
                  <input
                    type="text"
                    value={athSchool}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAthSchool(val);
                      persistAthleteDraft(activeCabor.id, { athSchool: val });
                    }}
                    placeholder="Asal Sekolah / Klub Cabor"
                    className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0D9488]"
                  />
                </div>
                <input
                  type="text"
                  value={athNote}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAthNote(val);
                    persistAthleteDraft(activeCabor.id, { athNote: val });
                  }}
                  placeholder="Catatan rekor waktu / skor / evaluasi teknis..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0D9488]"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0D9488] hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Atlet
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right 7 Cols: Jurnal Laporan Tertulis (1 Nov - 11 Nov 2026) & Foto Dokumentasi */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-bold text-[#0A2540]">
                3. Jurnal Laporan Tertulis (1 Nov - 11 Nov 2026)
              </h3>
              <p className="text-xs text-slate-500">
                Cabor {activeCabor.name} · Pilih tanggal evaluasi harian di bawah ini
              </p>
            </div>
            <FileText className="w-5 h-5 text-[#0D9488]" />
          </div>

          {/* 11-Day Selector Strip (1 Nov - 11 Nov 2026) */}
          <div className="flex flex-wrap gap-1.5">
            {JURNAL_MONEV_DATES.map((d) => {
              const hasReport = Boolean(activeCabor.dailyReports[d.key]);
              const isSelected = d.key === selectedDateKey;
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setSelectedDateKey(d.key)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-mono tabular-nums border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0A2540] text-white border-[#0A2540] font-bold'
                      : hasReport
                      ? 'bg-teal-50 text-[#0D9488] border-teal-300 font-semibold hover:bg-teal-100'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {d.short}
                  {hasReport && ' ✓'}
                </button>
              );
            })}
          </div>

          {saveFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveFeedback}</span>
            </div>
          )}

          {/* Form Evaluasi Harian */}
          <form onSubmit={handleSaveReportSubmit} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-50 px-3.5 py-2.5 rounded-lg border border-slate-200">
              <span className="font-bold text-[#0A2540]">
                Tanggal Laporan: {dateObj.label}
              </span>
              <span className="text-slate-500">
                {currentReport
                  ? `Terakhir disimpan: ${currentReport.updatedAt}`
                  : 'Belum ada entri tersimpan pada tanggal ini'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0A2540]">
                  A. Kondisi Pertandingan
                </label>
                <textarea
                  rows={3}
                  disabled={!canEdit}
                  value={matchCondition}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMatchCondition(val);
                    persistReportDraft(reportContextKey, { matchCondition: val });
                  }}
                  placeholder="Uraikan jalannya pertandingan, kepemimpinan wasit/juri, hasil tanding, dan dinamika teknis..."
                  className="w-full p-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0D9488] disabled:bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0A2540]">
                  B. Kondisi Venue ({activeCabor.venueName})
                </label>
                <textarea
                  rows={3}
                  disabled={!canEdit}
                  value={venueCondition}
                  onChange={(e) => {
                    const val = e.target.value;
                    setVenueCondition(val);
                    persistReportDraft(reportContextKey, { venueCondition: val });
                  }}
                  placeholder="Evaluasi kelayakan arena, pencahayaan, fasilitas pemanasan, medis, dan keamanan venue..."
                  className="w-full p-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0D9488] disabled:bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0A2540]">
                  C. Kondisi Atlet
                </label>
                <textarea
                  rows={3}
                  disabled={!canEdit}
                  value={athleteCondition}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAthleteCondition(val);
                    persistReportDraft(reportContextKey, { athleteCondition: val });
                  }}
                  placeholder="Kondisi kebugaran fisik/mental atlet serta evaluasi kesiapan tanding..."
                  className="w-full p-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0D9488] disabled:bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0A2540]">
                  D. Laporan Tambahan (Akomodasi, Konsumsi & Transportasi)
                </label>
                <textarea
                  rows={3}
                  disabled={!canEdit}
                  value={additionalReport}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAdditionalReport(val);
                    persistReportDraft(reportContextKey, { additionalReport: val });
                  }}
                  placeholder="Catatan distribusi konsumsi, vitamin, transportasi dari Posko Hotel Riski Samudra, atau kendala non-teknis..."
                  className="w-full p-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0D9488] disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Section Upload Foto Dokumentasi Laporan */}
            <div className="pt-3 border-t border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-xs font-bold text-[#0A2540]">
                  E. Foto Dokumentasi Laporan ({photos.length} Foto)
                </label>
                {canEdit && (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={photoCaption}
                      onChange={(e) => setPhotoCaption(e.target.value)}
                      placeholder="Keterangan foto dokumentasi..."
                      className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0D9488]"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0A2540] text-xs font-semibold rounded-lg cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[#0D9488]" />
                      <span>Upload Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleAddSamplePhoto}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-[#0D9488] text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      + Kartu Bukti Visual
                    </button>
                  </div>
                )}
              </div>

              {photos.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {photos.map((ph) => (
                    <div
                      key={ph.id}
                      className="border border-slate-200 rounded-lg p-2 bg-slate-50 flex flex-col gap-1.5"
                    >
                      <img
                        src={ph.dataUrl}
                        alt={ph.caption}
                        referrerPolicy="no-referrer"
                        className="w-full h-32 object-cover rounded border border-slate-200 bg-white"
                      />
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium text-slate-700 truncate">
                          {ph.caption}
                        </span>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() =>
                              setPhotos((prev) => {
                                const next = prev.filter((item) => item.id !== ph.id);
                                persistReportDraft(reportContextKey, { photos: next });
                                return next;
                              })
                            }
                            className="text-rose-600 hover:underline text-[11px] font-semibold shrink-0 cursor-pointer"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Panel Khusus KETUM KONI: Validasi & Arahan */}
            {role === 'ketum' && (
              <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0A2540] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
                    Otoritas Validasi KETUM KONI Kota Surabaya (Admin)
                  </span>
                  <label className="flex items-center gap-2 text-xs font-bold text-[#0D9488] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={validatedByKetum}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setValidatedByKetum(val);
                        persistReportDraft(reportContextKey, { validatedByKetum: val });
                      }}
                      className="rounded border-teal-400 text-[#0D9488]"
                    />
                    Tandai Laporan Harian Ini Tervalidasi Resmi
                  </label>
                </div>
                <input
                  type="text"
                  value={ketumNote}
                  onChange={(e) => {
                    const val = e.target.value;
                    setKetumNote(val);
                    persistReportDraft(reportContextKey, { ketumNote: val });
                  }}
                  placeholder="Tambahkan disposisi / catatan evaluasi Ketua Umum KONI Surabaya..."
                  className="w-full px-3 py-2 text-xs bg-white border border-teal-300 rounded-lg focus:outline-none focus:border-[#0A2540]"
                />
              </div>
            )}

            {/* Submit & Print Buttons */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              {canEdit ? (
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0D9488] hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Simpan Laporan Harian ({dateObj.short})
                </button>
              ) : (
                <span className="text-xs text-slate-500">
                  Masuk sebagai Petugas Monev atau KETUM KONI untuk menyimpan perubahan.
                </span>
              )}

              <button
                type="button"
                onClick={() => onOpenLetterModal(activeCabor.id)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F59E0B] hover:bg-amber-400 text-[#0A2540] text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Generate Laporan PDF
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

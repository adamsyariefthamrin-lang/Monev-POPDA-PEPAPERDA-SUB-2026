'use client';

import React, { useState, useMemo } from 'react';
import { MapPin, Compass, Globe, ExternalLink, Building2, Navigation, Layers } from 'lucide-react';
import { CaborItem, POSKO_MONEV } from '@/lib/monev-data';

interface VenueMapSectionProps {
  cabors: CaborItem[];
}

interface VenueGroup {
  id: string;
  venueName: string;
  venueRegion: 'Posko Utama Ngawi' | 'Kab. Ngawi' | 'Kota Surabaya' | 'Kab. Kediri';
  venueAddress: string;
  lat: number;
  lng: number;
  cabors: CaborItem[];
  isPosko?: boolean;
}

export default function VenueMapSection({ cabors }: VenueMapSectionProps) {
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [mapMode, setMapMode] = useState<'m' | 'k'>('k'); // 'k' = Google Earth Satellite, 'm' = Google Road Map
  const [selectedVenueId, setSelectedVenueId] = useState<string>('posko-utama');

  const venueGroups = useMemo<VenueGroup[]>(() => {
    const poskoGroup: VenueGroup = {
      id: 'posko-utama',
      venueName: POSKO_MONEV.name,
      venueRegion: 'Posko Utama Ngawi',
      venueAddress: POSKO_MONEV.address,
      lat: POSKO_MONEV.lat,
      lng: POSKO_MONEV.lng,
      cabors: [],
      isPosko: true,
    };

    const grouped = new Map<string, VenueGroup>();
    cabors.forEach((c) => {
      const key = `${c.venueName}-${c.venueRegion}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          id: `venue-${c.no}`,
          venueName: c.venueName,
          venueRegion: c.venueRegion,
          venueAddress: c.venueAddress,
          lat: c.lat,
          lng: c.lng,
          cabors: [c],
        });
      } else {
        grouped.get(key)!.cabors.push(c);
      }
    });

    return [poskoGroup, ...Array.from(grouped.values())];
  }, [cabors]);

  const filteredVenues = useMemo(() => {
    if (regionFilter === 'ALL') return venueGroups;
    if (regionFilter === 'POSKO') return venueGroups.filter((v) => v.isPosko);
    return venueGroups.filter((v) => v.venueRegion === regionFilter);
  }, [venueGroups, regionFilter]);

  const activeVenue =
    venueGroups.find((v) => v.id === selectedVenueId) || venueGroups[0];

  const ngawiCount = venueGroups.filter(
    (v) => v.venueRegion === 'Kab. Ngawi' || v.isPosko
  ).length;
  const surabayaCount = venueGroups.filter(
    (v) => v.venueRegion === 'Kota Surabaya'
  ).length;
  const kediriCount = venueGroups.filter(
    (v) => v.venueRegion === 'Kab. Kediri'
  ).length;

  const googleEmbedUrl = `https://maps.google.com/maps?q=${activeVenue.lat},${activeVenue.lng}&hl=id&t=${mapMode}&z=16&output=embed`;
  const googleEarthUrl = `https://earth.google.com/web/search/${encodeURIComponent(
    `${activeVenue.venueName} ${activeVenue.venueAddress}`
  )}/@${activeVenue.lat},${activeVenue.lng},150a,850d,35y,0h,45t,0r`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${activeVenue.lat},${activeVenue.lng}`;

  return (
    <section className="space-y-6">
      {/* Header & Summary Filter Cards */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-semibold text-[#0D9488]">
            Sistem Informasi Geospasial Kontingen Kota Surabaya
          </p>
          <h2 className="text-2xl font-bold text-[#0A2540] tracking-tight mt-0.5">
            Peta Interaktif Venue Pertandingan & Posko Monev
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Klik kartu ringkasan wilayah atau daftar titik venue di bawah untuk memusatkan peta satelit/jalan di Kab. Ngawi, Kota Surabaya, dan Kab. Kediri.
          </p>
        </div>

        {/* Map View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg self-start md:self-auto">
          <button
            type="button"
            onClick={() => setMapMode('k')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              mapMode === 'k'
                ? 'bg-[#0A2540] text-white shadow-xs'
                : 'text-slate-700 hover:text-[#0A2540]'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-[#F59E0B]" />
            Citra Satelit (Google Earth)
          </button>
          <button
            type="button"
            onClick={() => setMapMode('m')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              mapMode === 'm'
                ? 'bg-[#0A2540] text-white shadow-xs'
                : 'text-slate-700 hover:text-[#0A2540]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#0D9488]" />
            Peta Jalan (Google Maps)
          </button>
        </div>
      </div>

      {/* 4 Kartu Ringkasan Wilayah di Atas Peta Interaktif */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => {
            setRegionFilter('ALL');
            setSelectedVenueId('posko-utama');
          }}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            selectedVenueId === 'posko-utama'
              ? 'bg-[#0A2540] text-white border-[#0A2540]'
              : 'bg-white text-[#0A2540] border-slate-200 hover:border-[#0D9488]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#F59E0B]">
              Posko Tim Monev
            </span>
            <Building2 className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <p className="text-base font-bold mt-1">Hotel Riski Samudra</p>
          <p
            className={`text-xs mt-1 ${
              selectedVenueId === 'posko-utama' ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Jl. Basuki Rahmat, Winong, Margomulyo, Ngawi
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            setRegionFilter('Kab. Ngawi');
            const firstNgawi = venueGroups.find((v) => v.venueRegion === 'Kab. Ngawi');
            if (firstNgawi) setSelectedVenueId(firstNgawi.id);
          }}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            regionFilter === 'Kab. Ngawi'
              ? 'bg-[#0D9488] text-white border-[#0D9488]'
              : 'bg-white text-[#0A2540] border-slate-200 hover:border-[#0D9488]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold ${
                regionFilter === 'Kab. Ngawi' ? 'text-teal-100' : 'text-slate-500'
              }`}
            >
              KLUSTER UTAMA TUAN RUMAH
            </span>
            <span className="text-lg font-extrabold font-mono tabular-nums">
              {ngawiCount} Titik
            </span>
          </div>
          <p className="text-base font-bold mt-1">Kabupaten Ngawi</p>
          <p
            className={`text-xs mt-1 ${
              regionFilter === 'Kab. Ngawi' ? 'text-teal-50' : 'text-slate-600'
            }`}
          >
            Stadion Ketonggo, GOR Bung Hatta, Alun-Alun Merdeka, Yonarmed 12
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            setRegionFilter('Kota Surabaya');
            const firstSby = venueGroups.find((v) => v.venueRegion === 'Kota Surabaya');
            if (firstSby) setSelectedVenueId(firstSby.id);
          }}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            regionFilter === 'Kota Surabaya'
              ? 'bg-[#0D9488] text-white border-[#0D9488]'
              : 'bg-white text-[#0A2540] border-slate-200 hover:border-[#0D9488]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold ${
                regionFilter === 'Kota Surabaya' ? 'text-teal-100' : 'text-slate-500'
              }`}
            >
              KLUSTER VENUE KHUSUS
            </span>
            <span className="text-lg font-extrabold font-mono tabular-nums">
              {surabayaCount} Titik
            </span>
          </div>
          <p className="text-base font-bold mt-1">Kota Surabaya</p>
          <p
            className={`text-xs mt-1 ${
              regionFilter === 'Kota Surabaya' ? 'text-teal-50' : 'text-slate-600'
            }`}
          >
            Kolam Renang Dispora Jatim (Akuatik & Selam), Gedung Nusantara (Senam)
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            setRegionFilter('Kab. Kediri');
            const firstKdr = venueGroups.find((v) => v.venueRegion === 'Kab. Kediri');
            if (firstKdr) setSelectedVenueId(firstKdr.id);
          }}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            regionFilter === 'Kab. Kediri'
              ? 'bg-[#0D9488] text-white border-[#0D9488]'
              : 'bg-white text-[#0A2540] border-slate-200 hover:border-[#0D9488]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold ${
                regionFilter === 'Kab. Kediri' ? 'text-teal-100' : 'text-slate-500'
              }`}
            >
              KLUSTER PERAIRAN & PENDUKUNG
            </span>
            <span className="text-lg font-extrabold font-mono tabular-nums">
              {kediriCount} Titik
            </span>
          </div>
          <p className="text-base font-bold mt-1">Kabupaten Kediri</p>
          <p
            className={`text-xs mt-1 ${
              regionFilter === 'Kab. Kediri' ? 'text-teal-50' : 'text-slate-600'
            }`}
          >
            Bendung Gerak Waru Turi (Dayung) & Danau Perairan Terpadu (Ski Air)
          </p>
        </button>
      </div>

      {/* Main Split: Interactive Google Map/Earth on Left (7 cols), Venue Directory on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Map Viewport */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
          {/* Active Venue Info Header */}
          <div className="p-4 bg-[#0A2540] text-white flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#F59E0B] font-semibold">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{activeVenue.venueRegion}</span>
                <span>·</span>
                <span className="font-mono tabular-nums">
                  {activeVenue.lat.toFixed(4)}, {activeVenue.lng.toFixed(4)}
                </span>
              </div>
              <h3 className="text-base font-bold mt-0.5">{activeVenue.venueName}</h3>
              <p className="text-xs text-slate-300 mt-0.5">{activeVenue.venueAddress}</p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={googleEarthUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0D9488] hover:bg-teal-600 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
              >
                <Globe className="w-3.5 h-3.5" />
                Google Earth 3D
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
              >
                <Navigation className="w-3.5 h-3.5 text-[#F59E0B]" />
                Rute Navigasi
              </a>
            </div>
          </div>

          {/* Embedded Google Map / Satellite Frame */}
          <div className="relative flex-1 min-h-[420px] bg-slate-900">
            <iframe
              key={`${activeVenue.lat}-${activeVenue.lng}-${mapMode}`}
              src={googleEmbedUrl}
              title={`Peta Lokasi ${activeVenue.venueName}`}
              className="w-full h-full min-h-[420px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          {/* Bottom Cabor Details inside Selected Venue (only for Cabor Venues, not Posko) */}
          {!activeVenue.isPosko && activeVenue.cabors.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
              <p className="text-xs font-bold text-[#0A2540]">
                Cabang Olahraga di Titik Venue Ini ({activeVenue.cabors.length} Cabor):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeVenue.cabors.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#0A2540]">{c.name}</p>
                      <p className="text-slate-500">
                        PIC: {c.pic} · Monev: {c.monevOfficer}
                      </p>
                    </div>
                    <div className="text-right font-mono tabular-nums font-bold text-slate-800">
                      {c.gold}E · {c.silver}P · {c.bronze}Pr
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Venue List */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-2 bg-slate-50">
            <div>
              <h3 className="text-sm font-bold text-[#0A2540]">
                Daftar Titik Venue ({filteredVenues.length} Lokasi)
              </h3>
              <p className="text-xs text-slate-500">
                Pilih lokasi untuk menampilkan koordinat satelit & rincian cabor
              </p>
            </div>
            {regionFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setRegionFilter('ALL')}
                className="text-xs font-semibold text-[#0D9488] hover:underline cursor-pointer whitespace-nowrap"
              >
                Tampilkan Semua
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-200 max-h-[540px] overflow-y-auto">
            {filteredVenues.map((v) => {
              const isSelected = v.id === activeVenue.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVenueId(v.id)}
                  className={`w-full text-left p-4 transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-teal-50/70'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-[#0D9488]">{v.venueRegion}</span>
                      <span>·</span>
                      <span className="font-mono tabular-nums">
                        {v.lat.toFixed(3)}, {v.lng.toFixed(3)}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-[#0A2540]">{v.venueName}</p>
                    <p className="text-xs text-slate-600">{v.venueAddress}</p>
                    {v.cabors.length > 0 && (
                      <p className="text-xs text-slate-700 pt-1">
                        <strong>Cabor:</strong>{' '}
                        {v.cabors.map((c) => `${c.name} (PIC ${c.pic})`).join(' · ')}
                      </p>
                    )}
                  </div>
                  <Compass
                    className={`w-4 h-4 shrink-0 mt-1 ${
                      isSelected ? 'text-[#0D9488]' : 'text-slate-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

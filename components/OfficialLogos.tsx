'use client';

import React from 'react';
import { SURABAYA_LOGO_DATA_URL, KONI_LOGO_DATA_URL } from '@/lib/logo-data';

export function PemkotSurabayaLogo({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      title="Logo Kota Surabaya"
    >
      <img
        src={SURABAYA_LOGO_DATA_URL}
        alt="Logo Kota Surabaya"
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain"
      />
    </div>
  );
}

export function KoniSurabayaLogoJpeg({
  className = 'w-16 h-16',
  showFormatLabel = false,
}: {
  className?: string;
  showFormatLabel?: boolean;
}) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      title="Logo KONI Surabaya (koni surabaya.png)"
    >
      <img
        src={KONI_LOGO_DATA_URL}
        alt="Logo KONI Kota Surabaya"
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain"
      />
      {showFormatLabel && (
        <span className="sr-only">koni surabaya.png</span>
      )}
    </div>
  );
}

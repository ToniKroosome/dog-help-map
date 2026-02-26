'use client';

import { useState } from 'react';
import { BANGKOK_ZONES, type Zone } from '@/lib/zones';
import type { Lang } from '@/lib/constants';

export default function ZonePicker({
  lang,
  selectedZone,
  onSelect,
  reportCounts,
}: {
  lang: Lang;
  selectedZone: Zone | null;
  onSelect: (zone: Zone | null) => void;
  reportCounts: Record<string, number>;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const popular = BANGKOK_ZONES.filter((z) => z.popular);
  const others = BANGKOK_ZONES.filter((z) => !z.popular);

  const filtered = search
    ? BANGKOK_ZONES.filter(
        (z) =>
          z.name.en.toLowerCase().includes(search.toLowerCase()) ||
          z.name.th.includes(search)
      )
    : null;

  const displayZones = filtered || null;

  return (
    <>
      {/* Zone button - shows selected zone or "Zones" */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed top-12 right-2 sm:top-14 sm:right-3 z-[900] rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium shadow-lg border transition-colors ${
          selectedZone
            ? 'bg-blue-500 text-white border-blue-400'
            : 'bg-white/95 backdrop-blur-sm border-gray-200 text-gray-700 hover:bg-white'
        }`}
      >
        {selectedZone ? (
          <span className="flex items-center gap-1">
            <span>{selectedZone.icon}</span>
            <span className="hidden sm:inline">{selectedZone.name[lang]}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(null);
              }}
              className="ml-0.5 bg-white/20 rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs"
            >
              ✕
            </button>
          </span>
        ) : (
          <span>{lang === 'th' ? '📍 โซน' : '📍 Zone'}</span>
        )}
      </button>

      {/* Zone picker dropdown */}
      {open && (
        <div className="fixed top-22 right-2 sm:top-24 sm:right-3 z-[900] w-64 sm:w-72 max-h-[55vh] sm:max-h-[60vh] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-slide-up panel-bg">
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'th' ? 'ค้นหาโซน...' : 'Search zone...'}
              className="w-full rounded-lg bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="overflow-y-auto max-h-[calc(60vh-52px)] scrollbar-hide">
            {/* Show all button */}
            {selectedZone && (
              <button
                onClick={() => {
                  onSelect(null);
                  setOpen(false);
                  setSearch('');
                }}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-blue-500 hover:bg-blue-50 border-b border-gray-100 flex items-center gap-2"
              >
                <span>🗺️</span>
                <span>{lang === 'th' ? 'แสดงทั้งหมด' : 'Show All'}</span>
              </button>
            )}

            {/* Search results */}
            {displayZones ? (
              displayZones.length === 0 ? (
                <div className="px-3 py-6 text-center text-gray-400 text-sm">
                  {lang === 'th' ? 'ไม่พบโซน' : 'No zones found'}
                </div>
              ) : (
                displayZones.map((z) => (
                  <ZoneRow
                    key={z.id}
                    zone={z}
                    lang={lang}
                    count={reportCounts[z.id] || 0}
                    selected={selectedZone?.id === z.id}
                    onSelect={() => {
                      onSelect(z);
                      setOpen(false);
                      setSearch('');
                    }}
                  />
                ))
              )
            ) : (
              <>
                {/* Popular */}
                <div className="px-3 pt-2 pb-1">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {lang === 'th' ? 'ยอดนิยม' : 'Popular'}
                  </span>
                </div>
                {popular.map((z) => (
                  <ZoneRow
                    key={z.id}
                    zone={z}
                    lang={lang}
                    count={reportCounts[z.id] || 0}
                    selected={selectedZone?.id === z.id}
                    onSelect={() => {
                      onSelect(z);
                      setOpen(false);
                    }}
                  />
                ))}

                {/* Others */}
                <div className="px-3 pt-3 pb-1">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {lang === 'th' ? 'ทั้งหมด' : 'All Areas'}
                  </span>
                </div>
                {others.map((z) => (
                  <ZoneRow
                    key={z.id}
                    zone={z}
                    lang={lang}
                    count={reportCounts[z.id] || 0}
                    selected={selectedZone?.id === z.id}
                    onSelect={() => {
                      onSelect(z);
                      setOpen(false);
                    }}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ZoneRow({
  zone,
  lang,
  count,
  selected,
  onSelect,
}: {
  zone: Zone;
  lang: Lang;
  count: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2.5 ${
        selected ? 'bg-blue-50' : ''
      }`}
    >
      <span className="text-base">{zone.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-700 truncate">{zone.name[lang]}</div>
      </div>
      {count > 0 && (
        <span className="shrink-0 bg-orange-100 text-orange-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  );
}

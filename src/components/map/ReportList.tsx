'use client';

import { useState, useMemo } from 'react';
import { DOG_STATUSES, T, type Lang } from '@/lib/constants';
import type { DogReport } from '@/lib/types';
import { findNearestZone, type Zone } from '@/lib/zones';

function timeAgo(dateStr: string, lang: Lang): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return T.justNow[lang];
  if (mins < 60) return `${mins} ${T.minutesAgo[lang]}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ${T.hoursAgo[lang]}`;
  const days = Math.floor(hrs / 24);
  return `${days} ${T.daysAgo[lang]}`;
}

export default function ReportList({
  lang,
  reports,
  onSelect,
  selectedZone,
}: {
  lang: Lang;
  reports: DogReport[];
  onSelect: (report: DogReport) => void;
  selectedZone: Zone | null;
}) {
  const [open, setOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'urgent'>('recent');

  const sorted = useMemo(() => {
    const arr = [...reports];
    if (sortBy === 'urgent') {
      const priority: Record<string, number> = {
        urgent: 0, hurt: 1, sick: 2, hungry: 3, aggressive: 4,
        spotted: 5, friendly: 6, fed: 7, bathed: 8, rescued: 9,
      };
      arr.sort((a, b) => (priority[a.status] ?? 99) - (priority[b.status] ?? 99));
    } else {
      arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return arr;
  }, [reports, sortBy]);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-[120px] sm:bottom-28 left-2 sm:left-3 z-[800] w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-base sm:text-lg hover:bg-gray-50 transition-colors"
        title="Report list"
      >
        {open ? '✕' : '📋'}
      </button>

      {/* List panel */}
      {open && (
        <div className="fixed bottom-[160px] sm:bottom-40 left-2 sm:left-3 z-[800] w-[calc(100vw-60px)] sm:w-72 max-h-[calc(100vh-200px)] sm:max-h-[50vh] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-slide-up panel-bg flex flex-col">
          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-700">
                {selectedZone
                  ? `${selectedZone.icon} ${selectedZone.name[lang]} (${reports.length})`
                  : lang === 'th'
                    ? `รายงานทั้งหมด (${reports.length})`
                    : `All Reports (${reports.length})`}
              </span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setSortBy('recent')}
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  sortBy === 'recent' ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                {lang === 'th' ? 'ล่าสุด' : 'Recent'}
              </button>
              <button
                onClick={() => setSortBy('urgent')}
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  sortBy === 'urgent' ? 'bg-red-100 text-red-600 font-medium' : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                {lang === 'th' ? 'เร่งด่วน' : 'Urgent'}
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1 min-h-0 scrollbar-hide">
            {sorted.length === 0 ? (
              <div className="px-3 py-8 text-center text-gray-400 text-sm">
                {T.noReports[lang]}
              </div>
            ) : (
              sorted.map((r) => {
                const cfg = DOG_STATUSES[r.status] || DOG_STATUSES.spotted;
                const zone = findNearestZone(r.latitude, r.longitude);
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      onSelect(r);
                      setOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 border-b border-gray-50 hover:bg-gray-50 transition-colors flex items-start gap-2.5"
                  >
                    <span
                      className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                      style={{ backgroundColor: cfg.bgColor }}
                    >
                      {cfg.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: cfg.bgColor, color: cfg.color }}
                        >
                          {cfg.label[lang]}
                        </span>
                        {r.dog_count > 1 && (
                          <span className="text-[10px] text-gray-400">
                            {r.dog_count} {T.dogs[lang]}
                          </span>
                        )}
                      </div>
                      {zone && (
                        <span className="text-[10px] text-gray-400 mt-0.5 block">
                          {zone.icon} {zone.name[lang]}
                        </span>
                      )}
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {r.description || `${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}`}
                      </p>
                      <span className="text-[10px] text-gray-300">{timeAgo(r.created_at, lang)}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </>
  );
}

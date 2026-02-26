'use client';

import { ALL_STATUSES, DOG_STATUSES, T, type DogStatus, type Lang } from '@/lib/constants';

export default function FilterBar({
  lang,
  activeFilters,
  onToggleFilter,
  showHeatmap,
  onToggleHeatmap,
}: {
  lang: Lang;
  activeFilters: Set<DogStatus>;
  onToggleFilter: (status: DogStatus) => void;
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[800] pointer-events-none">
      <div className="px-3 pb-3">
        <div className="pointer-events-auto panel-bg bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 px-3 py-2.5">
          {/* Heatmap toggle */}
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={onToggleHeatmap}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                showHeatmap
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              <span>{showHeatmap ? '🔥' : '📍'}</span>
              <span>{showHeatmap ? T.heatmap[lang] : T.pins[lang]}</span>
            </button>
            <span className="text-xs text-gray-400">{T.filter[lang]}:</span>
          </div>

          {/* Status filters */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
            <button
              onClick={() => {
                // Clear all filters = show all
                ALL_STATUSES.forEach((s) => {
                  if (activeFilters.has(s)) onToggleFilter(s);
                });
              }}
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                activeFilters.size === 0
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {T.all[lang]}
            </button>
            {ALL_STATUSES.map((s) => {
              const cfg = DOG_STATUSES[s];
              const active = activeFilters.has(s);
              return (
                <button
                  key={s}
                  onClick={() => onToggleFilter(s)}
                  className={`shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                    active ? 'ring-2 ring-offset-1' : 'opacity-50 hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: cfg.bgColor,
                    color: cfg.color,
                  }}
                >
                  <span>{cfg.icon}</span>
                  <span>{cfg.label[lang]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

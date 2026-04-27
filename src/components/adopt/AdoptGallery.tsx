'use client';

import { useState } from 'react';
import { DOG_STATUSES, T, type Lang } from '@/lib/constants';
import type { DogReport } from '@/lib/types';

function timeAgo(dateStr: string, lang: Lang): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return T.justNow[lang];
  if (mins < 60) return `${mins} ${T.minutesAgo[lang]}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ${T.hoursAgo[lang]}`;
  return `${Math.floor(hrs / 24)} ${T.daysAgo[lang]}`;
}

export default function AdoptGallery({ reports }: { reports: DogReport[] }) {
  const [lang, setLang] = useState<Lang>('th');
  const [petFilter, setPetFilter] = useState<'all' | 'dog' | 'cat'>('all');

  const filtered = petFilter === 'all'
    ? reports
    : reports.filter((r) => (r.pet_type ?? 'dog') === petFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-gray-400 hover:text-blue-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </a>
            <h1 className="text-base font-bold text-gray-800">
              {lang === 'th' ? '🏠 รับเลี้ยงสัตว์' : '🏠 Adopt a Pet'}
            </h1>
          </div>
          <button
            onClick={() => setLang((l) => (l === 'th' ? 'en' : 'th'))}
            className="rounded-lg px-2.5 py-1 text-xs font-bold border border-gray-200 hover:bg-gray-50 transition-all"
          >
            {lang === 'th' ? 'EN' : 'TH'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'dog', 'cat'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setPetFilter(f)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                petFilter === f
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? `🐾 ${T.all[lang]}` : f === 'dog' ? `🐕 ${T.dog[lang]}` : `🐱 ${T.cat[lang]}`}
              <span className={`text-xs rounded-full px-1.5 py-0.5 ${petFilter === f ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {f === 'all' ? reports.length : reports.filter((r) => (r.pet_type ?? 'dog') === f).length}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">🐾</div>
            <p className="text-gray-400">{T.noReports[lang]}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((report) => (
              <PetCard key={report.id} report={report} lang={lang} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function PetCard({ report, lang }: { report: DogReport; lang: Lang }) {
  const petType = report.pet_type ?? 'dog';
  const petEmoji = petType === 'cat' ? '🐱' : '🐕';
  const config = DOG_STATUSES[report.status];

  function timeAgoLocal(dateStr: string) {
    return timeAgo(dateStr, lang);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
      {/* Photo or placeholder */}
      <div className="relative h-44 bg-gray-100 flex items-center justify-center overflow-hidden">
        {report.photo_url ? (
          <img
            src={report.photo_url}
            alt="Pet"
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="text-6xl opacity-20">{petEmoji}</span>
        )}
        {/* Pet type badge */}
        <span className="absolute top-2 left-2 text-lg bg-white/90 rounded-full w-8 h-8 flex items-center justify-center shadow-sm">
          {petEmoji}
        </span>
        {/* Status badge */}
        <span
          className="absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: config.bgColor, color: config.color }}
        >
          {config.icon} {config.label[lang]}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
          {report.description || (lang === 'th' ? 'ไม่มีรายละเอียดเพิ่มเติม' : 'No description provided')}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-400">{timeAgoLocal(report.created_at)}</span>
          {report.dog_count > 1 && (
            <span className="text-xs text-gray-400">
              {report.dog_count} {T.dogs[lang]}
            </span>
          )}
        </div>
        <a
          href={`/adopt/${report.id}`}
          className="mt-3 w-full py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-1.5"
        >
          <span>🏠</span>
          <span>{T.applyToAdopt[lang]}</span>
        </a>
      </div>
    </div>
  );
}

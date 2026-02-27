'use client';

import { useState } from 'react';
import { T, DOG_STATUSES, ALL_STATUSES, type Lang, type DogStatus } from '@/lib/constants';
import type { DogReport } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

interface Props {
  reports: DogReport[];
  totalUsers: number;
  totalUpdates: number;
  reportsToday: number;
  statusCounts: Record<string, number>;
  dailyReports: { date: string; count: number }[];
  dailySignups: { date: string; count: number }[];
  totalViews: number;
  uniqueVisitors: number;
  viewsToday: number;
  visitorsToday: number;
  dailyViews: { date: string; count: number }[];
  dailyUniqueVisitors: { date: string; count: number }[];
}

/* ─── Mini Bar Chart ─── */
function MiniBarChart({
  data,
  color,
  gradientFrom,
  gradientTo,
}: {
  data: { date: string; count: number }[];
  color: string;
  gradientFrom: string;
  gradientTo: string;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl font-bold text-gray-800">{total}</span>
        <span className="text-[10px] text-gray-400 uppercase tracking-wide">7 days</span>
      </div>
      <div className="flex items-end gap-[6px] h-20">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            {/* Tooltip */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {d.count}
            </div>
            <div
              className="w-full rounded-md min-h-[3px] transition-all duration-300 group-hover:opacity-80"
              style={{
                height: `${Math.max((d.count / max) * 100, 4)}%`,
                background: d.count === 0
                  ? '#e5e7eb'
                  : `linear-gradient(to top, ${gradientFrom}, ${gradientTo})`,
              }}
            />
            <span className="text-[10px] text-gray-400 font-medium">{d.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({
  icon,
  label,
  value,
  subtitle,
  accent,
}: {
  icon: string;
  label: string;
  value: number;
  subtitle?: string;
  accent: string;
}) {
  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ background: accent }}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-800 tracking-tight">
            {value.toLocaleString()}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">{subtitle}</p>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
          style={{ background: `${accent}15` }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ─── Time Ago ─── */
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

/* ─── Main Dashboard ─── */
export default function AdminDashboard({
  reports: initialReports,
  totalUsers,
  totalUpdates,
  reportsToday,
  statusCounts,
  dailyReports,
  dailySignups,
  totalViews,
  uniqueVisitors,
  viewsToday,
  visitorsToday,
  dailyViews,
  dailyUniqueVisitors,
}: Props) {
  const [lang, setLang] = useState<Lang>('th');
  const [reports, setReports] = useState(initialReports);
  const [filterStatus, setFilterStatus] = useState<DogStatus | 'all'>('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = filterStatus === 'all'
    ? reports
    : reports.filter((r) => r.status === filterStatus);

  const handleDelete = async (id: string) => {
    if (!confirm(T.confirmDelete[lang])) return;
    setDeleting(id);
    const supabase = createClient();
    const { error } = await supabase.from('dog_reports').delete().eq('id', id);
    if (!error) {
      setReports((prev) => prev.filter((r) => r.id !== id));
    }
    setDeleting(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="flex items-center gap-1.5 text-gray-400 hover:text-blue-500 text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {T.backToMap[lang]}
            </a>
            <div className="h-5 w-px bg-gray-200" />
            <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="text-xl">🐕</span>
              {T.adminPanel[lang]}
            </h1>
          </div>
          <button
            onClick={() => setLang((l) => (l === 'th' ? 'en' : 'th'))}
            className="rounded-lg px-3 py-1.5 text-xs font-bold border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            {lang === 'th' ? 'EN' : 'TH'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Stat Cards */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            {lang === 'th' ? 'ภาพรวม' : 'Overview'}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              icon="📊"
              label={T.totalReports[lang]}
              value={reports.length}
              subtitle={ALL_STATUSES.map(
                (s) => statusCounts[s] ? `${DOG_STATUSES[s].icon}${statusCounts[s]}` : ''
              ).filter(Boolean).join('  ')}
              accent="#3b82f6"
            />
            <StatCard icon="👥" label={T.totalUsers[lang]} value={totalUsers} accent="#8b5cf6" />
            <StatCard icon="📌" label={T.reportsToday[lang]} value={reportsToday} accent="#f59e0b" />
            <StatCard
              icon="👁️"
              label={T.totalViews[lang]}
              value={totalViews}
              subtitle={`${lang === 'th' ? 'วันนี้' : 'Today'}: ${viewsToday}`}
              accent="#06b6d4"
            />
            <StatCard
              icon="🧑‍🤝‍🧑"
              label={T.uniqueVisitors[lang]}
              value={uniqueVisitors}
              subtitle={`${lang === 'th' ? 'วันนี้' : 'Today'}: ${visitorsToday}`}
              accent="#10b981"
            />
            <StatCard icon="🔄" label={T.statusUpdates[lang]} value={totalUpdates} accent="#ec4899" />
          </div>
        </section>

        {/* Charts */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            {lang === 'th' ? 'แนวโน้ม 7 วัน' : '7-Day Trends'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                {T.reportsLast7Days[lang]}
              </h3>
              <MiniBarChart
                data={dailyReports}
                color="#3b82f6"
                gradientFrom="#3b82f6"
                gradientTo="#60a5fa"
              />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                {T.signupsLast7Days[lang]}
              </h3>
              <MiniBarChart
                data={dailySignups}
                color="#22c55e"
                gradientFrom="#22c55e"
                gradientTo="#4ade80"
              />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                {T.viewsLast7Days[lang]}
              </h3>
              <MiniBarChart
                data={dailyViews}
                color="#a855f7"
                gradientFrom="#a855f7"
                gradientTo="#c084fc"
              />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                {lang === 'th' ? 'ผู้เข้าชม (7 วันล่าสุด)' : 'Unique Visitors (Last 7 Days)'}
              </h3>
              <MiniBarChart
                data={dailyUniqueVisitors}
                color="#10b981"
                gradientFrom="#10b981"
                gradientTo="#34d399"
              />
            </div>
          </div>
        </section>

        {/* Reports Table */}
        <section>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-base font-semibold text-gray-800">
                  {T.allReports[lang]}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {filtered.length} {lang === 'th' ? 'รายการ' : 'records'}
                </p>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    filterStatus === 'all'
                      ? 'bg-gray-800 text-white shadow-sm'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {T.all[lang]}
                </button>
                {ALL_STATUSES.map((s) => {
                  const cfg = DOG_STATUSES[s];
                  return (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`shrink-0 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        filterStatus === s
                          ? 'ring-2 ring-offset-1 shadow-sm'
                          : 'opacity-60 hover:opacity-90'
                      }`}
                      style={{ backgroundColor: cfg.bgColor, color: cfg.color }}
                    >
                      <span>{cfg.icon}</span>
                      <span>{cfg.label[lang]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="px-4 py-16 text-center">
                <div className="text-4xl mb-3">🐕</div>
                <p className="text-gray-400 text-sm">{T.noReports[lang]}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                      <th className="px-5 py-3 font-semibold">{T.status[lang]}</th>
                      <th className="px-5 py-3 font-semibold">{T.location[lang]}</th>
                      <th className="px-5 py-3 font-semibold">{T.description[lang]}</th>
                      <th className="px-5 py-3 font-semibold">{T.dogCount[lang]}</th>
                      <th className="px-5 py-3 font-semibold">{T.date[lang]}</th>
                      <th className="px-5 py-3 font-semibold">{T.actions[lang]}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((r) => {
                      const cfg = DOG_STATUSES[r.status] || DOG_STATUSES.spotted;
                      return (
                        <tr
                          key={r.id}
                          className="hover:bg-blue-50/30 transition-colors group"
                        >
                          <td className="px-5 py-3.5">
                            <span
                              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                              style={{ backgroundColor: cfg.bgColor, color: cfg.color }}
                            >
                              {cfg.icon} {cfg.label[lang]}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 text-xs font-mono">
                            {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                          </td>
                          <td className="px-5 py-3.5 text-gray-600 max-w-[200px] truncate">
                            {r.description || <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                              {r.dog_count}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                            {timeAgo(r.created_at, lang)}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <a
                                href={`/?lat=${r.latitude}&lng=${r.longitude}`}
                                className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 text-xs font-medium px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {T.viewOnMap[lang]}
                              </a>
                              <button
                                onClick={() => handleDelete(r.id)}
                                disabled={deleting === r.id}
                                className="inline-flex items-center gap-1 text-red-400 hover:text-red-600 text-xs font-medium px-2 py-1 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                              >
                                {deleting === r.id ? (
                                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                ) : (
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                )}
                                {T.deleteReport[lang]}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white/50 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-center">
          <p className="text-xs text-gray-300">
            Dog Help Map &middot; Admin Dashboard
          </p>
        </div>
      </footer>
    </div>
  );
}

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
}

function MiniBarChart({ data, color }: { data: { date: string; count: number }[]; color: string }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          <div
            className="w-full rounded-sm min-h-[2px] transition-all"
            style={{
              height: `${(d.count / max) * 100}%`,
              backgroundColor: color,
              opacity: d.count === 0 ? 0.2 : 1,
            }}
          />
          <span className="text-[9px] text-gray-400">{d.date}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
}: {
  icon: string;
  label: string;
  value: number;
  subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
    </div>
  );
}

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

export default function AdminDashboard({
  reports: initialReports,
  totalUsers,
  totalUpdates,
  reportsToday,
  statusCounts,
  dailyReports,
  dailySignups,
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              &larr; {T.backToMap[lang]}
            </a>
            <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>🐕</span>
              {T.adminPanel[lang]}
            </h1>
          </div>
          <button
            onClick={() => setLang((l) => (l === 'th' ? 'en' : 'th'))}
            className="rounded-lg px-2.5 py-1.5 text-xs font-bold border border-gray-200 hover:bg-gray-50"
          >
            {lang === 'th' ? 'EN' : 'TH'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon="📊"
            label={T.totalReports[lang]}
            value={reports.length}
            subtitle={ALL_STATUSES.map(
              (s) => statusCounts[s] ? `${DOG_STATUSES[s].icon}${statusCounts[s]}` : ''
            ).filter(Boolean).join(' ')}
          />
          <StatCard icon="👥" label={T.totalUsers[lang]} value={totalUsers} />
          <StatCard icon="🔄" label={T.statusUpdates[lang]} value={totalUpdates} />
          <StatCard icon="📌" label={T.reportsToday[lang]} value={reportsToday} />
        </div>

        {/* Mini Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="text-xs font-medium text-gray-500 mb-3">{T.reportsLast7Days[lang]}</h3>
            <MiniBarChart data={dailyReports} color="#3b82f6" />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="text-xs font-medium text-gray-500 mb-3">{T.signupsLast7Days[lang]}</h3>
            <MiniBarChart data={dailySignups} color="#22c55e" />
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-semibold text-gray-700">{T.allReports[lang]} ({filtered.length})</h3>
            <div className="flex gap-1.5 overflow-x-auto">
              <button
                onClick={() => setFilterStatus('all')}
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                  filterStatus === 'all'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
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
                    className={`shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                      filterStatus === s ? 'ring-2 ring-offset-1' : 'opacity-50 hover:opacity-80'
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
            <div className="px-4 py-12 text-center text-gray-400 text-sm">{T.noReports[lang]}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                    <th className="px-4 py-2 font-medium">{T.status[lang]}</th>
                    <th className="px-4 py-2 font-medium">{T.location[lang]}</th>
                    <th className="px-4 py-2 font-medium">{T.description[lang]}</th>
                    <th className="px-4 py-2 font-medium">{T.dogCount[lang]}</th>
                    <th className="px-4 py-2 font-medium">{T.date[lang]}</th>
                    <th className="px-4 py-2 font-medium">{T.actions[lang]}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const cfg = DOG_STATUSES[r.status] || DOG_STATUSES.spotted;
                    return (
                      <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2.5">
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{ backgroundColor: cfg.bgColor, color: cfg.color }}
                          >
                            {cfg.icon} {cfg.label[lang]}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-gray-500 text-xs">
                          {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                        </td>
                        <td className="px-4 py-2.5 text-gray-600 max-w-[200px] truncate">
                          {r.description || '-'}
                        </td>
                        <td className="px-4 py-2.5 text-gray-600">{r.dog_count}</td>
                        <td className="px-4 py-2.5 text-gray-400 text-xs whitespace-nowrap">
                          {timeAgo(r.created_at, lang)}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <a
                              href={`/?lat=${r.latitude}&lng=${r.longitude}`}
                              className="text-blue-500 hover:text-blue-700 text-xs"
                            >
                              {T.viewOnMap[lang]}
                            </a>
                            <button
                              onClick={() => handleDelete(r.id)}
                              disabled={deleting === r.id}
                              className="text-red-400 hover:text-red-600 text-xs disabled:opacity-50"
                            >
                              {deleting === r.id ? '...' : T.deleteReport[lang]}
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
      </main>
    </div>
  );
}

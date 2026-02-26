'use client';

import { useState, useEffect } from 'react';
import type { DogReport } from '@/lib/types';
import { DOG_STATUSES, T, type Lang } from '@/lib/constants';
import StatusBadge from './StatusBadge';
import StatusUpdateForm from './StatusUpdateForm';
import { useStatusUpdates } from '@/hooks/useReports';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

function timeAgo(dateStr: string, lang: Lang): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return T.justNow[lang];
  if (diff < 3600) return `${Math.floor(diff / 60)} ${T.minutesAgo[lang]}`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ${T.hoursAgo[lang]}`;
  return `${Math.floor(diff / 86400)} ${T.daysAgo[lang]}`;
}

export default function DogDetailPanel({
  report,
  lang,
  onClose,
  onStatusUpdated,
  onDeleted,
  onMovePin,
}: {
  report: DogReport;
  lang: Lang;
  onClose: () => void;
  onStatusUpdated: () => void;
  onDeleted?: () => void;
  onMovePin?: (reportId: string) => void;
}) {
  const { user } = useAuth();
  const { updates, addUpdate } = useStatusUpdates(report.id);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const config = DOG_STATUSES[report.status];

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]?.is_admin) setIsAdmin(true);
      });
  }, [user]);

  const handleDelete = async () => {
    if (!confirm(T.confirmDelete[lang])) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from('dog_reports').delete().eq('id', report.id);
    if (!error) {
      onClose();
      onDeleted?.();
    }
    setDeleting(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[1000] max-h-[70vh] overflow-y-auto rounded-t-2xl panel-bg bg-white shadow-2xl border-t border-gray-200 animate-slide-up">
      {/* Handle */}
      <div className="sticky top-0 bg-white pt-3 pb-2 px-4 flex justify-center rounded-t-2xl">
        <div className="h-1 w-10 rounded-full bg-gray-300" />
      </div>

      <div className="px-4 pb-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config?.icon}</span>
            <StatusBadge status={report.status} lang={lang} size="md" />
            {report.dog_count > 1 && (
              <span className="text-sm text-gray-500">
                {report.dog_count} {T.dogs[lang]}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1"
          >
            ✕
          </button>
        </div>

        {/* Photo */}
        {report.photo_url && (
          <img
            src={report.photo_url}
            alt="Dog"
            className="w-full h-48 object-cover rounded-xl mb-3"
          />
        )}

        {/* Description */}
        {report.description && (
          <p className="text-gray-700 text-sm mb-3">{report.description}</p>
        )}

        {/* Meta */}
        <div className="text-xs text-gray-400 mb-4">
          {report.profiles?.display_name && (
            <span>{T.reportedBy[lang]} {report.profiles.display_name} · </span>
          )}
          <span>{timeAgo(report.created_at, lang)}</span>
        </div>

        {/* Admin actions */}
        {isAdmin && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                onClose();
                onMovePin?.(report.id);
              }}
              className="flex-1 py-2 rounded-xl bg-blue-50 text-blue-500 text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              {lang === 'th' ? '📌 ย้ายหมุด' : '📌 Move Pin'}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 py-2 rounded-xl bg-red-50 text-red-500 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {deleting ? '...' : `🗑️ ${T.deleteReport[lang]}`}
            </button>
          </div>
        )}

        {/* Update status button */}
        {user && !showUpdateForm && (
          <button
            onClick={() => setShowUpdateForm(true)}
            className="w-full py-2.5 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors mb-4"
          >
            {T.updateStatus[lang]}
          </button>
        )}

        {/* Update form */}
        {showUpdateForm && (
          <StatusUpdateForm
            lang={lang}
            onSubmit={async (status, note) => {
              await addUpdate(status, note);
              setShowUpdateForm(false);
              onStatusUpdated();
            }}
            onCancel={() => setShowUpdateForm(false)}
          />
        )}

        {/* Status history */}
        {updates.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              {T.statusHistory[lang]}
            </h3>
            <div className="space-y-2">
              {updates.map((u) => (
                <div key={u.id} className="flex items-center gap-2 text-xs text-gray-500">
                  <StatusBadge status={u.status} lang={lang} />
                  {u.note && <span>— {u.note}</span>}
                  <span className="ml-auto shrink-0">{timeAgo(u.created_at, lang)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

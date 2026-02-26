'use client';

import { useState } from 'react';
import { ALL_STATUSES, DOG_STATUSES, T, type DogStatus, type Lang } from '@/lib/constants';

export default function StatusUpdateForm({
  lang,
  onSubmit,
  onCancel,
}: {
  lang: Lang;
  onSubmit: (status: DogStatus, note?: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [status, setStatus] = useState<DogStatus>('fed');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(status, note || undefined);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 p-3 mb-4 bg-gray-50">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {ALL_STATUSES.map((s) => {
          const cfg = DOG_STATUSES[s];
          return (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                status === s
                  ? 'ring-2 ring-offset-1 scale-105'
                  : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                backgroundColor: cfg.bgColor,
                color: cfg.color,
                outlineColor: status === s ? cfg.color : undefined,
              }}
            >
              <span>{cfg.icon}</span>
              <span>{cfg.label[lang]}</span>
            </button>
          );
        })}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={`${T.note[lang]} (${T.optional[lang]})`}
        className="w-full rounded-lg border border-gray-200 p-2 text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />

      <div className="flex gap-2 mt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100"
        >
          {T.cancel[lang]}
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
        >
          {submitting ? T.submitting[lang] : T.submit[lang]}
        </button>
      </div>
    </div>
  );
}

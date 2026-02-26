'use client';

import { DOG_STATUSES, type DogStatus, type Lang } from '@/lib/constants';

export default function StatusBadge({
  status,
  lang,
  size = 'sm',
}: {
  status: DogStatus;
  lang: Lang;
  size?: 'sm' | 'md';
}) {
  const config = DOG_STATUSES[status];
  if (!config) return null;

  const sizeClass = size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClass}`}
      style={{ backgroundColor: config.bgColor, color: config.color }}
    >
      <span>{config.icon}</span>
      <span>{config.label[lang]}</span>
    </span>
  );
}

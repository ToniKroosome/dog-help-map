'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

function getVisitorId(): string {
  const key = 'dog_map_visitor_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

async function getFingerprint(): Promise<string> {
  const raw = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency || '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).deviceMemory || '',
  ].join('|');

  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function usePageView() {
  useEffect(() => {
    const track = async () => {
      // Skip preview/localhost
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') return;

      const supabase = createClient();

      // Skip if user is admin
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', user.id)
          .limit(1)
          .single();
        if (profile?.is_admin) return;
      }

      const visitorId = getVisitorId();
      const fingerprint = await getFingerprint();
      const referrer = document.referrer || null;
      await supabase
        .from('page_views')
        .insert({ visitor_id: visitorId, fingerprint, path: window.location.pathname, referrer });
    };

    track();
  }, []);
}

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
      await supabase
        .from('page_views')
        .insert({ visitor_id: visitorId, path: window.location.pathname });
    };

    track();
  }, []);
}

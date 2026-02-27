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
    const visitorId = getVisitorId();
    const supabase = createClient();
    supabase
      .from('page_views')
      .insert({ visitor_id: visitorId, path: window.location.pathname })
      .then(() => {});
  }, []);
}

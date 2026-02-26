'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { T, type Lang } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';

export default function UserMenu({ lang }: { lang: Lang }) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  const name = user.user_metadata?.full_name || user.email || 'User';
  const avatar = user.user_metadata?.avatar_url;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-white px-2 sm:px-3 py-1.5 text-sm shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        {avatar ? (
          <img src={avatar} alt="" className="h-6 w-6 rounded-full" />
        ) : (
          <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
            {name[0].toUpperCase()}
          </div>
        )}
        <span className="text-gray-700 max-w-[60px] sm:max-w-[100px] truncate text-xs sm:text-sm">{name}</span>
      </button>

      {open && (
        <div className="fixed right-2 sm:right-3 top-12 sm:top-14 w-48 rounded-lg bg-white shadow-xl border border-gray-200 py-1 z-[9999]">
          {isAdmin && (
            <a
              href="/admin"
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              {T.adminPanel[lang]}
            </a>
          )}
          <button
            onClick={() => {
              signOut();
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            {T.signOut[lang]}
          </button>
        </div>
      )}
    </div>
  );
}

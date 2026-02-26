'use client';

import { useState, useRef, useEffect } from 'react';
import { T, type Lang } from '@/lib/constants';

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function SearchBar({
  lang,
  onSelect,
}: {
  lang: Lang;
  onSelect: (lat: number, lng: number, name: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const search = (q: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=th&limit=5`,
          { headers: { 'Accept-Language': lang === 'th' ? 'th' : 'en' } }
        );
        const data: SearchResult[] = await res.json();
        setResults(data);
        setOpen(data.length > 0);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div ref={ref} className="fixed top-12 left-2 right-20 sm:right-24 z-[900] pointer-events-auto max-w-md sm:top-14 sm:left-3">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            search(e.target.value);
          }}
          placeholder={lang === 'th' ? '🔍 ค้นหาสถานที่...' : '🔍 Search location...'}
          className="w-full rounded-xl panel-bg bg-white/95 backdrop-blur-sm px-4 py-2.5 text-sm shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 pr-8"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">...</div>
        )}
        {query && !loading && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="mt-1 rounded-xl bg-white shadow-lg border border-gray-200 overflow-hidden max-h-60 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => {
                onSelect(parseFloat(r.lat), parseFloat(r.lon), r.display_name);
                setQuery(r.display_name.split(',')[0]);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 border-b border-gray-100 last:border-0 transition-colors"
            >
              <span className="text-gray-400 mr-1.5">📍</span>
              {r.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

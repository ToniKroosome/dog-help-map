'use client';

import { useAuth } from '@/hooks/useAuth';
import { T, type Lang } from '@/lib/constants';
import LoginButton from '@/components/auth/LoginButton';
import UserMenu from '@/components/auth/UserMenu';

export default function Header({
  lang,
  onToggleLang,
  darkMode,
  onToggleDark,
}: {
  lang: Lang;
  onToggleLang: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
}) {
  const { user, loading } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-[900] pointer-events-none">
      <div className="flex items-center justify-between px-3 py-2">
        {/* Logo */}
        <div className={`pointer-events-auto backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border ${darkMode ? 'bg-gray-900/90 border-gray-700' : 'bg-white/90 border-gray-100'}`}>
          <h1 className={`text-base font-bold flex items-center gap-1.5 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <span>🐕</span>
            <span>{T.appName[lang]}</span>
          </h1>
        </div>

        {/* Right side */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Dark mode toggle */}
          <button
            onClick={onToggleDark}
            className={`rounded-lg backdrop-blur-sm px-2.5 py-1.5 text-sm shadow-md border transition-colors ${darkMode ? 'bg-gray-900/90 border-gray-700 hover:bg-gray-800' : 'bg-white/90 border-gray-200 hover:bg-white'}`}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {/* Language toggle */}
          <button
            onClick={onToggleLang}
            className={`rounded-lg backdrop-blur-sm px-2.5 py-1.5 text-xs font-bold shadow-md border transition-colors ${darkMode ? 'bg-gray-900/90 border-gray-700 text-white hover:bg-gray-800' : 'bg-white/90 border-gray-200 hover:bg-white'}`}
          >
            {lang === 'th' ? 'EN' : 'TH'}
          </button>

          {/* Auth */}
          {!loading && (
            user ? <UserMenu lang={lang} /> : <LoginButton lang={lang} />
          )}
        </div>
      </div>
    </header>
  );
}

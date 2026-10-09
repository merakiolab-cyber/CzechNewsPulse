import React from 'react';
import { Moon, Sun, RefreshCw, SlidersHorizontal, Bookmark } from 'lucide-react';

interface HeaderProps {
  currentTab: 'all' | 'breaking' | 'bookmarks';
  onSelectTab: (tab: 'all' | 'breaking' | 'bookmarks') => void;
  bookmarksCount: number;
  breakingCount: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenSourcesModal: () => void;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  bookmarksCount,
  breakingCount,
  isDarkMode,
  onToggleTheme,
  onOpenSourcesModal,
  isRefreshing,
  onRefresh,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-stone-300 dark:border-stone-800 bg-[#FAF9F6]/95 dark:bg-[#0C0D0F]/95 backdrop-blur-md transition-colors">
      {/* Institutional Top Banner */}
      <div className="w-full bg-stone-950 text-stone-300 dark:bg-stone-100 dark:text-stone-950 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-0.5 text-[10px] sm:text-[11px] font-mono tracking-widest uppercase flex items-center justify-between border-b border-stone-800 dark:border-stone-300">
        <span className="text-stone-400 dark:text-stone-600">PRAHA 2026</span>
        <span className="font-bold text-white dark:text-stone-950">ŽIVÉ RSS VYSÍLÁNÍ</span>
      </div>

      {/* Main Header Bar (Optimized Sleek Height: h-14 sm:h-16) */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 h-14 sm:h-16 flex items-center justify-between">
        {/* Zone 1: Wordmark */}
        <button
          onClick={() => onSelectTab('all')}
          className="text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D62] rounded-none inline-flex items-center"
        >
          <span className="font-serif text-xl sm:text-2xl lg:text-3xl tracking-tight font-extrabold text-stone-950 dark:text-stone-50 leading-none">
            CzechNews Pulse
          </span>
        </button>

        {/* Zone 2: Compact, High-Legibility Nav Links (10% tighter gap spacing) */}
        <nav className="hidden md:flex items-center gap-[21.6px] lg:gap-[28.8px] text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider font-sans">
          <button
            onClick={() => onSelectTab('all')}
            className={`cursor-pointer transition-colors whitespace-nowrap py-1 border-b-2 ${
              currentTab === 'all'
                ? 'border-[#0A3D62] text-[#0A3D62] dark:text-sky-400 font-extrabold'
                : 'border-transparent hover:text-stone-950 dark:hover:text-stone-50'
            }`}
          >
            Přehled zpráv
          </button>

          <button
            onClick={() => onSelectTab('breaking')}
            className={`cursor-pointer transition-colors whitespace-nowrap py-1 border-b-2 flex items-center gap-1.5 ${
              currentTab === 'breaking'
                ? 'border-[#0A3D62] text-[#0A3D62] dark:text-sky-400 font-extrabold'
                : 'border-transparent hover:text-[#0A3D62] dark:hover:text-sky-400'
            }`}
          >
            <span>Mimořádné</span>
            {breakingCount > 0 && (
              <span className="text-[11px] font-mono font-bold tabular-nums bg-[#0A3D62] text-white px-1.5 py-0.2 rounded-none">
                {breakingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('bookmarks')}
            className={`cursor-pointer transition-colors whitespace-nowrap py-1 border-b-2 flex items-center gap-1.5 ${
              currentTab === 'bookmarks'
                ? 'border-[#0A3D62] text-[#0A3D62] dark:text-sky-400 font-extrabold'
                : 'border-transparent hover:text-stone-950 dark:hover:text-stone-50'
            }`}
          >
            <span>K přečtení</span>
            {bookmarksCount > 0 && (
              <span className="text-[11px] font-mono font-bold tabular-nums bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-950 px-1.5 py-0.2 rounded-none">
                {bookmarksCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenSourcesModal}
            className="cursor-pointer transition-colors whitespace-nowrap py-1 border-b-2 border-transparent hover:text-stone-950 dark:hover:text-stone-50 flex items-center gap-1.5 text-stone-600 dark:text-stone-400 font-semibold"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Zdroje médií</span>
          </button>
        </nav>

        {/* Zone 3: Primary tools (Streamlined) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Aktualizovat zprávy"
            className="p-2 text-stone-800 dark:text-stone-200 hover:text-[#0A3D62] dark:hover:text-sky-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 rounded-none transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Aktualizovat feed"
          >
            <RefreshCw className={`w-4.5 h-4.5 ${isRefreshing ? 'animate-spin text-[#0A3D62]' : ''}`} />
          </button>

          <button
            onClick={onToggleTheme}
            title={isDarkMode ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
            className="p-2 text-stone-800 dark:text-stone-200 hover:text-[#0A3D62] dark:hover:text-sky-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 rounded-none transition-colors cursor-pointer"
            aria-label="Přepnout motiv"
          >
            {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar (Streamlined) */}
      <div className="md:hidden flex items-center justify-around border-t border-stone-200 dark:border-stone-800 px-2 py-1.5 text-xs font-mono uppercase tracking-wider">
        <button
          onClick={() => onSelectTab('all')}
          className={`px-2.5 py-1 rounded-none transition-colors ${
            currentTab === 'all'
              ? 'font-bold text-white bg-stone-950 dark:bg-stone-100 dark:text-stone-950'
              : 'text-stone-600 dark:text-stone-400'
          }`}
        >
          Přehled
        </button>
        <button
          onClick={() => onSelectTab('breaking')}
          className={`px-2.5 py-1 rounded-none transition-colors flex items-center gap-1 ${
            currentTab === 'breaking'
              ? 'font-bold text-white bg-[#0A3D62]'
              : 'text-stone-600 dark:text-stone-400'
          }`}
        >
          <span>Mimořádné</span>
          {breakingCount > 0 && <span className="font-mono text-[10px] font-bold">({breakingCount})</span>}
        </button>
        <button
          onClick={() => onSelectTab('bookmarks')}
          className={`px-2.5 py-1 rounded-none transition-colors flex items-center gap-1 ${
            currentTab === 'bookmarks'
              ? 'font-bold text-white bg-stone-950 dark:bg-stone-100 dark:text-stone-950'
              : 'text-stone-600 dark:text-stone-400'
          }`}
        >
          <Bookmark className="w-3 h-3" />
          <span>Uložené</span>
          {bookmarksCount > 0 && <span className="font-mono text-[10px] font-bold">({bookmarksCount})</span>}
        </button>
        <button
          onClick={onOpenSourcesModal}
          className="px-2.5 py-1 rounded-none text-stone-600 dark:text-stone-400 flex items-center gap-1"
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span>Zdroje</span>
        </button>
      </div>
    </header>
  );
};

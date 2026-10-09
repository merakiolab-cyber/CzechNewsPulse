import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Newspaper } from 'lucide-react';
import { NewsCategory, NewsSource } from '../types';

interface CategoryFilterProps {
  selectedCategory: NewsCategory;
  onSelectCategory: (category: NewsCategory) => void;
  selectedSourceId: string;
  onSelectSourceId: (sourceId: string) => void;
  sources: NewsSource[];
  sourceCounts: Record<string, number>;
  totalArticlesCount: number;
  activeSourcesCount?: number;
  totalSourcesCount?: number;
  onOpenSourcesModal?: () => void;
}

const CATEGORIES: { id: NewsCategory; label: string }[] = [
  { id: 'vse', label: 'Všechny rubriky' },
  { id: 'domaci', label: 'Domácí' },
  { id: 'svet', label: 'Svět' },
  { id: 'ekonomika', label: 'Ekonomika & Byznys' },
  { id: 'technologie', label: 'Věda & Technologie' },
  { id: 'kultura', label: 'Kultura' },
  { id: 'sport', label: 'Sport' },
  { id: 'nazory', label: 'Komentáře & Názory' },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedSourceId,
  onSelectSourceId,
  sources,
  sourceCounts,
  totalArticlesCount,
}) => {
  const [isRubrikaOpen, setIsRubrikaOpen] = useState(false);
  const [isZdrojOpen, setIsZdrojOpen] = useState(false);

  const rubrikaRef = useRef<HTMLDivElement>(null);
  const zdrojRef = useRef<HTMLDivElement>(null);

  // Close rollouts on outside click or escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rubrikaRef.current && !rubrikaRef.current.contains(target)) {
        setIsRubrikaOpen(false);
      }
      if (zdrojRef.current && !zdrojRef.current.contains(target)) {
        setIsZdrojOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsRubrikaOpen(false);
        setIsZdrojOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const activeCategory = CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];
  const activeSource = sources.find((s) => s.id === selectedSourceId);

  return (
    <div className="mb-6">
      {/* Streamlined Control Bar with Dynamic Slide-Out Menus */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {/* Rubrika: Rollout Dropdown */}
        <div className="relative flex-1 sm:flex-initial" ref={rubrikaRef}>
          <button
            type="button"
            onClick={() => {
              setIsRubrikaOpen((prev) => !prev);
              setIsZdrojOpen(false);
            }}
            aria-expanded={isRubrikaOpen}
            aria-haspopup="listbox"
            className={`w-full sm:w-auto inline-flex items-center justify-between gap-2.5 px-3.5 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-none border-2 transition-all cursor-pointer shadow-2xs select-none ${
              selectedCategory !== 'vse'
                ? 'bg-stone-950 text-white dark:bg-stone-50 dark:text-stone-950 border-stone-950 dark:border-stone-50'
                : 'bg-white dark:bg-[#121316] text-stone-900 dark:text-stone-100 border-stone-900 dark:border-stone-200 hover:border-[#0A3D62] dark:hover:border-sky-400'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 bg-[#0A3D62] shrink-0" aria-hidden="true" />
              <span className="text-stone-500 dark:text-stone-400 font-mono text-[11px] font-normal">Rubrika:</span>
              <span className="truncate max-w-[130px] sm:max-w-[180px] font-extrabold">{activeCategory.label}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                isRubrikaOpen ? 'rotate-180 text-[#0A3D62] dark:text-sky-400' : 'text-stone-500'
              }`}
            />
          </button>

          {/* Rubrika Dynamic Rollout Menu */}
          <div
            className={`absolute left-0 mt-1.5 w-64 sm:w-72 bg-white dark:bg-[#121316] border-2 border-stone-950 dark:border-stone-100 shadow-xl z-50 py-1 rounded-none origin-top transition-all duration-200 ease-out transform ${
              isRubrikaOpen
                ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto visible'
                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none invisible'
            }`}
          >
            <div className="py-1 max-h-80 overflow-y-auto">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      onSelectCategory(cat.id);
                      setIsRubrikaOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer rounded-none ${
                      isSelected
                        ? 'bg-[#0A3D62] text-white font-extrabold'
                        : 'text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/80'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span
                        className={`w-1.5 h-1.5 shrink-0 ${
                          isSelected ? 'bg-white' : 'bg-stone-400 dark:bg-stone-600'
                        }`}
                      />
                      <span className="truncate">{cat.label}</span>
                    </span>
                    {isSelected && <Check className="w-4 h-4 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Zdroj: Rollout Dropdown */}
        <div className="relative flex-1 sm:flex-initial" ref={zdrojRef}>
          <button
            type="button"
            onClick={() => {
              setIsZdrojOpen((prev) => !prev);
              setIsRubrikaOpen(false);
            }}
            aria-expanded={isZdrojOpen}
            aria-haspopup="listbox"
            className={`w-full sm:w-auto inline-flex items-center justify-between gap-2.5 px-3.5 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-none border-2 transition-all cursor-pointer shadow-2xs select-none ${
              selectedSourceId !== 'all'
                ? 'bg-stone-950 text-white dark:bg-stone-50 dark:text-stone-950 border-stone-950 dark:border-stone-50'
                : 'bg-white dark:bg-[#121316] text-stone-900 dark:text-stone-100 border-stone-900 dark:border-stone-200 hover:border-[#0A3D62] dark:hover:border-sky-400'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Newspaper className="w-3.5 h-3.5 text-[#0A3D62] dark:text-sky-400 shrink-0" />
              <span className="text-stone-500 dark:text-stone-400 font-mono text-[11px] font-normal">Zdroj:</span>
              <span className="truncate max-w-[120px] sm:max-w-[160px] font-extrabold">
                {activeSource ? activeSource.name : 'Všechna média'}
              </span>
              <span className="font-mono text-[11px] opacity-75 hidden lg:inline">
                ({activeSource ? sourceCounts[activeSource.id] || 0 : totalArticlesCount})
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                isZdrojOpen ? 'rotate-180 text-[#0A3D62] dark:text-sky-400' : 'text-stone-500'
              }`}
            />
          </button>

          {/* Zdroj Dynamic Rollout Menu */}
          <div
            className={`absolute left-0 mt-1.5 w-72 sm:w-80 bg-white dark:bg-[#121316] border-2 border-stone-950 dark:border-stone-100 shadow-xl z-50 py-1 rounded-none max-h-96 overflow-y-auto origin-top transition-all duration-200 ease-out transform ${
              isZdrojOpen
                ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto visible'
                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none invisible'
            }`}
          >
            <div className="px-3 py-1.5 border-b border-stone-200 dark:border-stone-800 text-[10px] font-mono tracking-widest text-stone-500 dark:text-stone-400 uppercase flex items-center justify-between">
              <span>Filtrovat médium</span>
              <span className="text-stone-500 font-mono">({sources.length} médií)</span>
            </div>

            {/* All Media Item */}
            <button
              type="button"
              onClick={() => {
                onSelectSourceId('all');
                setIsZdrojOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer rounded-none ${
                selectedSourceId === 'all'
                  ? 'bg-stone-950 text-white dark:bg-stone-50 dark:text-stone-950'
                  : 'text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/80'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-stone-500 rounded-none shrink-0" />
                <span>Všechna média</span>
              </span>
              <span className="font-mono text-xs opacity-75">({totalArticlesCount})</span>
            </button>

            <div className="border-t border-stone-200 dark:border-stone-800 my-1" />

            {/* Specific Sources List */}
            {sources.map((source) => {
              const isSelected = selectedSourceId === source.id;
              const count = sourceCounts[source.id] || 0;
              return (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => {
                    onSelectSourceId(source.id);
                    setIsZdrojOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer rounded-none ${
                    isSelected
                      ? 'bg-[#0A3D62] text-white font-extrabold'
                      : 'text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/80'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 shrink-0 rounded-none"
                      style={{ backgroundColor: source.color }}
                    />
                    <span className="truncate">{source.name}</span>
                  </span>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {count > 0 && <span className="font-mono text-xs opacity-75 tabular-nums">({count})</span>}
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

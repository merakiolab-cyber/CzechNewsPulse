import React from 'react';
import { Flame, ChevronRight, X } from 'lucide-react';
import { NewsArticle } from '../types';

interface BreakingBannerProps {
  article: NewsArticle | null;
  onSelectArticle: (article: NewsArticle) => void;
  onDismiss: () => void;
}

export const BreakingBanner: React.FC<BreakingBannerProps> = ({
  article,
  onSelectArticle,
  onDismiss,
}) => {
  if (!article) return null;

  return (
    <div className="bg-sky-50/95 dark:bg-[#07243c]/80 border-b border-sky-200 dark:border-sky-900/80 py-3 sm:py-3.5 transition-colors">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 overflow-hidden">
          <div className="flex items-center gap-2 shrink-0 text-[#0A3D62] dark:text-sky-300 font-bold text-xs sm:text-sm tracking-wider uppercase">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-none h-2.5 w-2.5 bg-[#0A3D62] dark:bg-sky-400"></span>
            </span>
            <Flame className="w-4 h-4 fill-[#0A3D62] text-[#0A3D62] dark:fill-sky-400 dark:text-sky-400" />
            <span>Mimořádná zpráva</span>
          </div>

          <div className="hidden sm:block text-stone-300 dark:text-stone-700" aria-hidden="true">
            ·
          </div>

          <button
            onClick={() => onSelectArticle(article)}
            className="text-left text-sm sm:text-base font-medium text-stone-950 dark:text-stone-50 hover:text-[#0A3D62] dark:hover:text-sky-300 transition-colors truncate cursor-pointer group"
          >
            <span className="font-bold text-stone-800 dark:text-stone-200 mr-2">
              [{article.sourceName}]
            </span>
            <span className="group-hover:underline underline-offset-2">{article.title}</span>
          </button>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => onSelectArticle(article)}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3.5 py-1.5 bg-[#0A3D62] text-white hover:bg-[#072C48] rounded-none transition-colors cursor-pointer"
          >
            <span>Číst zprávu</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={onDismiss}
            title="Skrýt upozornění"
            className="p-1.5 text-stone-500 hover:text-stone-950 dark:hover:text-stone-100 rounded-none cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

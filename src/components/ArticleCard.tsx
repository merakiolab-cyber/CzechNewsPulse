import React, { useState } from 'react';
import {
  Flame,
  Lock,
  ThumbsUp,
  ThumbsDown,
  Clock,
} from 'lucide-react';
import { NewsArticle } from '../types';
import { formatCzechRelativeTime } from '../utils/storage';

interface ArticleCardProps {
  article: NewsArticle;
  isBookmarked?: boolean;
  onToggleBookmark?: (article: NewsArticle) => void;
  onOpenArticle: (article: NewsArticle) => void;
  isFeatured?: boolean;
  isFullWidthBreak?: boolean;
  isLiked?: boolean;
  isDisliked?: boolean;
  onToggleLike?: (article: NewsArticle) => void;
  onToggleDislike?: (article: NewsArticle) => void;
  onHide?: (article: NewsArticle) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onOpenArticle,
  isFeatured = false,
  isFullWidthBreak = false,
  isLiked = false,
  isDisliked = false,
  onToggleLike,
  onToggleDislike,
}) => {
  const [imageError, setImageError] = useState(false);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'domaci': return 'Domácí politika & dění';
      case 'svet': return 'Zahraničí';
      case 'ekonomika': return 'Ekonomika & Byznys';
      case 'technologie': return 'Technologie & Věda';
      case 'kultura': return 'Kultura';
      case 'sport': return 'Sport';
      case 'nazory': return 'Názory & Analýzy';
      default: return 'Zpravodajství';
    }
  };

  // 1. FULL-WIDTH BREAK TILE (Every 12 items)
  if (isFullWidthBreak) {
    return (
      <article
        onClick={() => onOpenArticle(article)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenArticle(article);
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`Otevřít článek: ${article.title}`}
        className={`col-span-full group relative bg-stone-100/90 dark:bg-[#131418] ${
          isDisliked
            ? 'opacity-70 bg-rose-50/50 dark:bg-rose-950/20'
            : isLiked
            ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
            : ''
        } rounded-none overflow-hidden hover:bg-stone-200/80 dark:hover:bg-[#1A1C22] transition-all duration-200 shadow-2xs my-8 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D62]`}
      >
        {isDisliked && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-rose-100 dark:bg-rose-950/70 text-rose-900 dark:text-rose-100 text-xs font-mono uppercase tracking-wider px-6 py-2 flex items-center justify-between border-b border-rose-200 dark:border-rose-900"
          >
            <span>Tento typ zpráv byl označen jako méně zajímavý.</span>
            {onToggleDislike && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleDislike(article);
                }}
                className="underline text-rose-900 dark:text-rose-100 font-bold cursor-pointer ml-3"
              >
                Vrátit zpět
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
          {/* Visual Side */}
          {article.imageUrl && !imageError ? (
            <div className="lg:col-span-6 relative h-72 sm:h-96 lg:h-full min-h-[340px] bg-stone-200 dark:bg-stone-900 overflow-hidden">
              <img
                src={article.imageUrl}
                alt={article.title}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
              />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="bg-stone-950 text-stone-100 text-[11px] font-mono font-bold tracking-widest uppercase px-3 py-1.5 rounded-none shadow-xs">
                  Vybrané téma
                </span>
                {article.isBreaking && (
                  <span className="bg-[#0A3D62] text-white text-[11px] font-mono font-bold tracking-wider uppercase px-3 py-1.5 rounded-none shadow-xs flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    <span>Mimořádně</span>
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="lg:col-span-4 bg-stone-900 text-stone-100 p-10 flex items-center justify-center">
              <span className="font-serif text-3xl font-extrabold tracking-tight">UMPRUM PRESS</span>
            </div>
          )}

          {/* Content Side */}
          <div className={`${article.imageUrl && !imageError ? 'lg:col-span-6' : 'lg:col-span-8'} p-7 sm:p-10 lg:p-12 flex flex-col justify-between`}>
            <div>
              {/* Metadata */}
              <div className="flex items-center flex-wrap gap-2.5 text-xs sm:text-sm text-stone-600 dark:text-stone-400 mb-4 font-mono">
                <span className="font-bold text-stone-950 dark:text-stone-50 uppercase tracking-widest">{article.sourceName}</span>
                <span aria-hidden="true">·</span>
                <span className="uppercase text-stone-500">{getCategoryLabel(article.category)}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{article.readTimeMin} min čtení</span>

                {article.isPaywalled ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-amber-900 dark:text-amber-200 font-bold bg-amber-100 dark:bg-amber-950/70 px-2.5 py-0.5 rounded-none text-xs border border-amber-300 dark:border-amber-800">
                      <Lock className="w-3 h-3" />
                      <span>Placený obsah (náhled)</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-none text-xs border border-emerald-300 dark:border-emerald-800">
                      <span>Celý článek</span>
                    </span>
                  </>
                )}
              </div>

              {/* Title */}
              <h3
                className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-950 dark:text-stone-50 leading-[1.18] tracking-tight mb-5 group-hover:text-[#0A3D62] dark:group-hover:text-sky-400 transition-colors"
                style={{ textWrap: 'balance' }}
              >
                {article.title}
              </h3>

              {/* Excerpt */}
              <p className="text-stone-700 dark:text-stone-300 text-base sm:text-lg leading-relaxed line-clamp-4 mb-8">
                {article.description}
              </p>
            </div>

            {/* Bottom Bar: Publication Time Moved Here In Place of Button */}
            <div className="pt-6 border-t border-stone-200/80 dark:border-stone-800/80 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-mono font-bold">
                <Clock className="w-4 h-4 text-[#0A3D62] dark:text-sky-400" />
                <time dateTime={article.pubDate}>{formatCzechRelativeTime(article.pubDate)}</time>
              </div>

              {/* Action Buttons */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 text-stone-500"
              >
                {onToggleLike && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLike(article);
                    }}
                    title={isLiked ? 'Odebrat ze zájmů' : 'Tohle téma mě zajímá'}
                    className={`px-3 py-2 rounded-none transition-all cursor-pointer flex items-center gap-2 text-xs font-mono font-bold uppercase ${
                      isLiked
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-stone-700 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-white stroke-white' : ''}`} />
                    <span>{isLiked ? 'Zajímá ✓' : 'Zajímá'}</span>
                  </button>
                )}

                {onToggleDislike && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleDislike(article);
                    }}
                    title={isDisliked ? 'Zrušit označení' : 'Méně zpráv tohoto typu'}
                    className={`px-3 py-2 rounded-none transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold uppercase ${
                      isDisliked
                        ? 'bg-rose-600 text-white font-bold'
                        : 'text-stone-700 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700'
                    }`}
                  >
                    <ThumbsDown className={`w-3.5 h-3.5 ${isDisliked ? 'fill-white stroke-white' : ''}`} />
                    <span>{isDisliked ? 'Nezajímá ✕' : 'Nezajímá'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // 2. LEAD FEATURED STORY LAYOUT
  if (isFeatured) {
    return (
      <article
        onClick={() => onOpenArticle(article)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenArticle(article);
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`Otevřít článek: ${article.title}`}
        className={`group relative bg-stone-100/80 dark:bg-[#131418] ${
          isDisliked
            ? 'opacity-70 bg-rose-50/50 dark:bg-rose-950/20'
            : isLiked
            ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
            : ''
        } rounded-none overflow-hidden hover:bg-stone-200/70 dark:hover:bg-[#1A1C22] transition-all duration-200 shadow-2xs mb-12 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D62]`}
      >
        {isDisliked && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-rose-100 dark:bg-rose-950/70 text-rose-900 dark:text-rose-100 text-xs font-mono uppercase tracking-wider px-6 py-2 flex items-center justify-between border-b border-rose-200 dark:border-rose-900"
          >
            <span>Tento typ zpráv byl označen jako méně zajímavý.</span>
            {onToggleDislike && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleDislike(article);
                }}
                className="underline text-rose-900 dark:text-rose-100 font-bold cursor-pointer ml-3"
              >
                Vrátit zpět
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Visual Column */}
          {article.imageUrl && !imageError && (
            <div className="lg:col-span-7 relative h-80 sm:h-96 lg:h-full min-h-[360px] bg-stone-100 dark:bg-stone-900 overflow-hidden">
              <img
                src={article.imageUrl}
                alt={article.title}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
              {article.isBreaking && (
                <div className="absolute top-4 left-4 bg-[#0A3D62] text-white text-[11px] font-mono font-bold tracking-wider uppercase px-3 py-1.5 rounded-none shadow-xs flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-white" />
                  <span>Mimořádně</span>
                </div>
              )}
            </div>
          )}

          {/* Content Column */}
          <div className={`${article.imageUrl && !imageError ? 'lg:col-span-5' : 'lg:col-span-12'} p-8 sm:p-10 lg:p-12 flex flex-col justify-between`}>
            <div>
              {/* Metadata */}
              <div className="flex items-center flex-wrap gap-2.5 text-xs sm:text-sm text-stone-600 dark:text-stone-400 mb-4 font-mono">
                <span className="font-bold text-stone-950 dark:text-stone-50 uppercase tracking-widest">{article.sourceName}</span>
                <span aria-hidden="true">·</span>
                <span className="uppercase text-stone-500">{getCategoryLabel(article.category)}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{article.readTimeMin} min čtení</span>

                {article.isPaywalled && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-amber-900 dark:text-amber-200 font-bold bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-none text-xs border border-amber-300 dark:border-amber-800">
                      <Lock className="w-3 h-3" />
                      <span>Placený obsah</span>
                    </span>
                  </>
                )}
              </div>

              {/* Title */}
              <h2
                className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-950 dark:text-stone-50 leading-[1.14] tracking-tight mb-6 group-hover:text-[#0A3D62] dark:group-hover:text-sky-400 transition-colors"
                style={{ textWrap: 'balance' }}
              >
                {article.title}
              </h2>

              {/* Excerpt */}
              <p className="text-stone-700 dark:text-stone-300 text-base sm:text-lg lg:text-xl leading-relaxed line-clamp-4 mb-8 font-sans">
                {article.description}
              </p>
            </div>

            {/* Editorial Footer */}
            <div className="pt-6 border-t border-stone-200/80 dark:border-stone-800/80 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-mono font-bold">
                <Clock className="w-4 h-4 text-[#0A3D62] dark:text-sky-400" />
                <time dateTime={article.pubDate}>{formatCzechRelativeTime(article.pubDate)}</time>
              </div>

              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 text-stone-500"
              >
                {onToggleLike && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLike(article);
                    }}
                    title={isLiked ? 'Odebrat ze zájmů' : 'Tohle téma mě zajímá'}
                    className={`px-3 py-2 rounded-none transition-all cursor-pointer flex items-center gap-2 text-xs font-mono font-bold uppercase ${
                      isLiked
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-stone-700 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-white stroke-white' : ''}`} />
                    <span>{isLiked ? 'Zajímá ✓' : 'Zajímá'}</span>
                  </button>
                )}

                {onToggleDislike && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleDislike(article);
                    }}
                    title={isDisliked ? 'Zrušit označení' : 'Méně zpráv tohoto typu'}
                    className={`px-3 py-2 rounded-none transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold uppercase ${
                      isDisliked
                        ? 'bg-rose-600 text-white font-bold'
                        : 'text-stone-700 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700'
                    }`}
                  >
                    <ThumbsDown className={`w-3.5 h-3.5 ${isDisliked ? 'fill-white stroke-white' : ''}`} />
                    <span>{isDisliked ? 'Nezajímá ✕' : 'Nezajímá'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // 3. STANDARD EDITORIAL GRID CARD
  return (
    <article
      onClick={() => onOpenArticle(article)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenArticle(article);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Otevřít článek: ${article.title}`}
      className={`group relative bg-stone-100/70 dark:bg-[#131418] ${
        isDisliked
          ? 'opacity-70 bg-rose-50/50 dark:bg-rose-950/20'
          : isLiked
          ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
          : ''
      } rounded-none overflow-hidden hover:bg-stone-200/80 dark:hover:bg-[#1A1C22] transition-all duration-200 flex flex-col justify-between shadow-2xs cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D62]`}
    >
      {isDisliked && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-100 text-xs font-mono uppercase tracking-wider px-4 py-1.5 flex items-center justify-between border-b border-rose-200 dark:border-rose-900"
        >
          <span>Potlačeno</span>
          {onToggleDislike && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleDislike(article);
              }}
              className="underline text-rose-900 dark:text-rose-100 font-bold cursor-pointer"
            >
              Vrátit
            </button>
          )}
        </div>
      )}

      <div>
        {/* Visual Header if present */}
        {article.imageUrl && !imageError && (
          <div className="relative h-48 sm:h-52 w-full bg-stone-200 dark:bg-stone-900 overflow-hidden">
            <img
              src={article.imageUrl}
              alt={article.title}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            />
            {article.isBreaking && (
              <div className="absolute top-3 left-3 bg-[#0A3D62] text-white text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-none shadow-xs flex items-center gap-1">
                <Flame className="w-3 h-3 fill-white" />
                <span>Mimořádně</span>
              </div>
            )}
            {article.isPaywalled && (
              <div className="absolute top-3 right-3 bg-stone-950 text-amber-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-none shadow-xs flex items-center gap-1 border border-amber-500/40">
                <Lock className="w-3 h-3" />
                <span>Náhled</span>
              </div>
            )}
          </div>
        )}

        {/* Card Body */}
        <div className="p-6 sm:p-7">
          {/* Metadata */}
          <div className="flex items-center flex-wrap gap-2 text-xs text-stone-600 dark:text-stone-400 mb-3 font-mono">
            <span className="font-bold text-stone-950 dark:text-stone-100 uppercase tracking-widest">{article.sourceName}</span>
            <span aria-hidden="true">·</span>
            <span className="uppercase text-stone-500">{getCategoryLabel(article.category)}</span>

            {article.isPaywalled && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-amber-800 dark:text-amber-400 font-bold">
                  <Lock className="w-3 h-3" />
                  <span>Placený</span>
                </span>
              </>
            )}
          </div>

          {/* Headline */}
          <h3
            className="font-serif text-xl sm:text-2xl font-bold text-stone-950 dark:text-stone-50 leading-[1.22] tracking-tight mb-3.5 group-hover:text-[#0A3D62] dark:group-hover:text-sky-400 transition-colors"
            style={{ textWrap: 'balance' }}
          >
            {article.title}
          </h3>

          {/* Excerpt */}
          <p className="text-stone-700 dark:text-stone-300 text-sm sm:text-base leading-relaxed line-clamp-3 font-sans">
            {article.description}
          </p>
        </div>
      </div>

      {/* Card Footer: Publication Time Moved Directly Here Where the Button Was */}
      <div className="px-6 sm:px-7 pb-5 pt-4 border-t border-stone-200/80 dark:border-stone-800/80 flex items-center justify-between mt-2">
        {/* Publication Time in Place of the Old Button */}
        <div className="flex items-center gap-1.5 text-stone-800 dark:text-stone-200 text-xs font-mono font-bold">
          <Clock className="w-3.5 h-3.5 text-[#0A3D62] dark:text-sky-400 shrink-0" />
          <time dateTime={article.pubDate}>{formatCzechRelativeTime(article.pubDate)}</time>
        </div>

        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 text-stone-500"
        >
          {/* Quick Like toggle */}
          {onToggleLike && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike(article);
              }}
              title={isLiked ? 'Odebrat ze zájmů' : 'Zajímá mě toto téma'}
              className={`px-2.5 py-1.5 rounded-none transition-all cursor-pointer flex items-center gap-1 text-xs font-mono font-bold uppercase ${
                isLiked
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-stone-700 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-white stroke-white' : ''}`} />
              <span className="hidden sm:inline font-semibold">{isLiked ? '✓' : ''}</span>
            </button>
          )}

          {/* Quick Dislike toggle */}
          {onToggleDislike && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleDislike(article);
              }}
              title={isDisliked ? 'Zrušit potlačení' : 'Méně zpráv tohoto typu'}
              className={`px-2.5 py-1.5 rounded-none transition-all cursor-pointer flex items-center gap-1 text-xs font-mono font-bold uppercase ${
                isDisliked
                  ? 'bg-rose-600 text-white font-bold'
                  : 'text-stone-700 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700'
              }`}
            >
              <ThumbsDown className={`w-3.5 h-3.5 ${isDisliked ? 'fill-white stroke-white' : ''}`} />
              <span className="hidden sm:inline font-semibold">{isDisliked ? '✕' : ''}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

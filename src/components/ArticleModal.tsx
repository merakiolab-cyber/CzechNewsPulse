import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Share2,
  Check,
  Flame,
  Lock,
  Loader2,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { NewsArticle, ArticleFullContent } from '../types';
import { formatCzechRelativeTime } from '../utils/storage';

interface ArticleModalProps {
  article: NewsArticle | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (article: NewsArticle) => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  isOpen,
  onClose,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [fullContent, setFullContent] = useState<ArticleFullContent | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Dynamic animation transition state
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(article);

  useEffect(() => {
    if (isOpen && article) {
      setActiveArticle(article);
      setIsRendered(true);
      const frame = requestAnimationFrame(() => {
        setIsVisible(true);
      });
      return () => cancelAnimationFrame(frame);
    } else if (!isOpen && isRendered) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setActiveArticle(null);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen, article, isRendered]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 250);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isRendered && isVisible) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRendered, isVisible]);

  useEffect(() => {
    const targetArticle = activeArticle || article;
    if (!isOpen || !targetArticle) {
      setFullContent(null);
      setIsLoadingContent(false);
      setImageError(false);
      return;
    }

    let isMounted = true;
    setIsLoadingContent(true);
    setFullContent(null);

    async function loadFullArticle() {
      try {
        const res = await fetch(`/api/article-content?url=${encodeURIComponent(targetArticle!.link)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (isMounted) {
          if (data.success && Array.isArray(data.paragraphs) && data.paragraphs.length > 0) {
            setFullContent(data);
          }
        }
      } catch (err: any) {
        console.warn('Reader load error:', err);
      } finally {
        if (isMounted) {
          setIsLoadingContent(false);
        }
      }
    }

    loadFullArticle();

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeArticle, article]);

  const currentArticle = activeArticle || article;
  if (!isRendered || !currentArticle) return null;

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(currentArticle.link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // ignore
    }
  };

  const isCompleteArticle =
    !isLoadingContent &&
    fullContent &&
    fullContent.paragraphs.length > 0 &&
    !fullContent.isPaywalled &&
    !currentArticle.isPaywalled;

  const calculatedReadTime = fullContent?.wordCount
    ? Math.max(1, Math.ceil(fullContent.wordCount / 180))
    : currentArticle.readTimeMin;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/80 backdrop-blur-xs transition-opacity duration-250 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-[#FAF9F6] dark:bg-[#0E0F12] border-2 border-stone-900 dark:border-stone-100 rounded-none max-w-4xl lg:max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden transform transition-all duration-250 ease-out ${
          isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-4 sm:px-6 md:px-8 py-3 border-b-2 border-stone-900 dark:border-stone-100 flex items-center justify-between gap-3 bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-950">
          {/* Metadata */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-[11px] sm:text-xs font-mono uppercase tracking-widest min-w-0">
            <span className="w-2 h-2 bg-[#0A3D62] inline-block shrink-0" />
            <span className="font-extrabold text-white dark:text-stone-950">{currentArticle.sourceName}</span>
            <span>·</span>
            <span>{formatCzechRelativeTime(currentArticle.pubDate)}</span>
            <span className="hidden sm:inline">·</span>
            <span className="tabular-nums hidden sm:inline">{calculatedReadTime} MIN ČTENÍ</span>
            {fullContent?.wordCount && (
              <>
                <span className="hidden md:inline">·</span>
                <span className="tabular-nums hidden md:inline">{fullContent.wordCount} SLOV</span>
              </>
            )}

            {/* Header Tag for Completeness */}
            {!isLoadingContent && (
              <>
                <span>·</span>
                {isCompleteArticle ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-400 dark:text-emerald-700 bg-emerald-950 dark:bg-emerald-100 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs">
                    <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>CELÝ ČLÁNEK</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-amber-300 dark:text-amber-900 bg-amber-950 dark:bg-amber-100 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs">
                    <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>NÁHLED / ČÁST</span>
                  </span>
                )}
              </>
            )}
          </div>

          {/* Action buttons: share + bookmark + close */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={handleShare}
              title="Kopírovat odkaz článku"
              className="p-1.5 sm:p-2 text-stone-300 hover:text-white dark:text-stone-700 dark:hover:text-black rounded-none cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => onToggleBookmark(currentArticle)}
              title={isBookmarked ? 'Odebrat ze záložek' : 'Uložit k přečtení'}
              className="p-1.5 sm:p-2 text-stone-300 hover:text-white dark:text-stone-700 dark:hover:text-black rounded-none cursor-pointer transition-colors"
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-[#0A3D62] dark:text-sky-400" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={handleClose}
              className="p-1.5 sm:p-2 text-stone-400 hover:text-white dark:text-stone-600 dark:hover:text-black rounded-none cursor-pointer transition-colors ml-1"
              title="Zavřít čtečku (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Article Body */}
        <div className="overflow-y-auto p-6 sm:p-10 md:p-14 space-y-8 flex-1">
          {currentArticle.isBreaking && (
            <div className="inline-flex items-center gap-2 bg-[#0A3D62] text-white text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-none shadow-xs">
              <Flame className="w-4 h-4 fill-white text-white" />
              <span>Mimořádná zpráva</span>
            </div>
          )}

          {/* Paywall Warning Banner */}
          {(currentArticle.isPaywalled || fullContent?.isPaywalled) && (
            <div className="p-4 rounded-none bg-amber-100/90 dark:bg-amber-950/70 border-2 border-amber-400 dark:border-amber-800 text-amber-950 dark:text-amber-100 text-sm flex items-start gap-3.5">
              <Lock className="w-5 h-5 text-amber-700 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-base uppercase font-mono tracking-wider">Zpoplatněný obsah (dostupný perex / otevřená část)</p>
                <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 mt-1 leading-relaxed">
                  Tento článek je na webu {currentArticle.sourceName} v plném rozsahu určen pro předplatitele. Níže je k dispozici otevřený text a perex.
                </p>
              </div>
            </div>
          )}

          {/* Large Headline */}
          <h1
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-950 dark:text-stone-50 leading-[1.12] tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            {fullContent?.title || currentArticle.title}
          </h1>

          {/* Author & Source Info */}
          <div className="flex items-center gap-4 text-xs font-mono text-stone-600 dark:text-stone-400 pb-3 border-b-2 border-stone-300 dark:border-stone-800">
            <span className="font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
              {fullContent?.author || currentArticle.author ? `Autor: ${fullContent?.author || currentArticle.author}` : `Zdroj: ${currentArticle.sourceName}`}
            </span>
            <span>·</span>
            <span>{new Date(currentArticle.pubDate).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          {/* Lead Image */}
          {currentArticle.imageUrl && !imageError && (
            <div className="rounded-none overflow-hidden max-h-[460px] w-full bg-stone-200 dark:bg-stone-900 border-2 border-stone-900 dark:border-stone-100">
              <img
                src={currentArticle.imageUrl}
                alt={currentArticle.title}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Perex / Lead Paragraph */}
          {fullContent?.lead && (
            <div className="text-xl sm:text-2xl font-bold text-stone-950 dark:text-stone-50 leading-relaxed border-l-4 border-[#0A3D62] dark:border-sky-400 pl-6 py-1 italic font-serif">
              {fullContent.lead}
            </div>
          )}

          {/* Loading indicator */}
          {isLoadingContent && (
            <div className="p-10 text-center bg-stone-200/50 dark:bg-stone-900/50 border-2 border-stone-300 dark:border-stone-800 my-6 space-y-4 font-mono">
              <div className="flex items-center justify-center gap-3 text-stone-900 dark:text-stone-100 text-sm font-bold uppercase tracking-wider">
                <Loader2 className="w-5 h-5 animate-spin text-[#0A3D62] dark:text-sky-400" />
                <span>Načítám kompletní text z webu {currentArticle.sourceName}...</span>
              </div>
              <div className="space-y-3 max-w-xl mx-auto pt-2">
                <div className="h-4 bg-stone-300 dark:bg-stone-800 animate-pulse" />
                <div className="h-4 bg-stone-300 dark:bg-stone-800 animate-pulse w-5/6" />
                <div className="h-4 bg-stone-300 dark:bg-stone-800 animate-pulse w-4/6" />
              </div>
            </div>
          )}

          {/* Full Extracted Article Paragraphs */}
          {!isLoadingContent && fullContent && fullContent.paragraphs.length > 0 && (
            <div className="space-y-6 text-stone-900 dark:text-stone-100 leading-[1.85] text-lg sm:text-xl font-sans max-w-3xl">
              {fullContent.paragraphs.map((p, idx) => (
                <p
                  key={idx}
                  className={idx === 0 && !fullContent.lead ? 'first-letter:text-6xl first-letter:font-serif first-letter:font-extrabold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[#0A3D62] dark:first-letter:text-sky-400' : ''}
                >
                  {p}
                </p>
              ))}
            </div>
          )}

          {/* Fallback to description if full paragraphs not extracted */}
          {!isLoadingContent && (!fullContent || fullContent.paragraphs.length === 0) && (
            <div className="space-y-6 max-w-3xl">
              <div className="p-6 bg-stone-200/50 dark:bg-stone-900/50 border-2 border-stone-300 dark:border-stone-800 text-stone-900 dark:text-stone-100 leading-relaxed text-lg sm:text-xl">
                <p className="first-letter:text-6xl first-letter:font-serif first-letter:font-extrabold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[#0A3D62] dark:first-letter:text-sky-400">
                  {currentArticle.description}
                </p>
              </div>

              <div className="p-5 bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-950 border-2 border-stone-950 dark:border-stone-100 flex items-center justify-between gap-4 flex-wrap font-mono text-xs">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 shrink-0 text-[#0A3D62] dark:text-sky-400" />
                  <span>Kompletní článek s fotogalerií je k dispozici na původním serveru.</span>
                </div>
                <a
                  href={currentArticle.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#0A3D62] text-white font-bold rounded-none shrink-0 hover:bg-[#072C48] transition-colors inline-flex items-center gap-2 uppercase tracking-wider"
                >
                  <span>Přejít na článek</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* ALWAYS DISPLAYED END-OF-ARTICLE STATUS BADGE */}
          {!isLoadingContent && (
            <div className="mt-12 pt-8 border-t-2 border-stone-900 dark:border-stone-200 max-w-3xl">
              {isCompleteArticle ? (
                <div className="p-5 sm:p-6 bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-600 dark:border-emerald-500 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2 font-mono uppercase">
                        <span className="font-bold text-base text-emerald-950 dark:text-emerald-100">
                          Zobrazen celý článek v plném znění
                        </span>
                        <span className="bg-emerald-700 text-white text-xs font-bold px-2 py-0.5">
                          Kompletní
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 mt-1 leading-relaxed font-sans">
                        Text byl úspěšně stažen a zpracován v plném rozsahu ({fullContent?.paragraphs.length} odstavců, {calculatedReadTime} min čtení) ze serveru {currentArticle.sourceName}.
                      </p>
                    </div>
                  </div>

                  <a
                    href={currentArticle.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-mono font-bold uppercase rounded-none shrink-0 transition-colors"
                  >
                    <span>Původní web</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="p-5 sm:p-6 bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-500 dark:border-amber-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2 font-mono uppercase">
                        <span className="font-bold text-base text-amber-950 dark:text-amber-100">
                          Zobrazena pouze část článku / redakční náhled
                        </span>
                        <span className="bg-amber-600 text-white text-xs font-bold px-2 py-0.5">
                          Náhled
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 mt-1 leading-relaxed font-sans">
                        {currentArticle.isPaywalled || fullContent?.isPaywalled
                          ? `Tento článek je na webu ${currentArticle.sourceName} zpoplatněn. Zde je dostupný perex a otevřená část.`
                          : `V aplikaci je k dispozici otevřený výtah z článku. Plné multimediální znění najdete přímo na webu vydavatele.`}
                      </p>
                    </div>
                  </div>

                  <a
                    href={currentArticle.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-mono font-bold uppercase rounded-none shrink-0 transition-colors"
                  >
                    <span>Číst na {currentArticle.sourceName}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

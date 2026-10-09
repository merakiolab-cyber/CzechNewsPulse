import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { BreakingBanner } from './components/BreakingBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { ArticleCard } from './components/ArticleCard';
import { ArticleModal } from './components/ArticleModal';
import { SourceSettingsModal } from './components/SourceSettingsModal';
import { NewsArticle, NewsCategory, NewsSource, UserPreferences } from './types';
import {
  getSavedArticles,
  saveArticlesToStorage,
  getEnabledSourceIds,
  saveEnabledSourceIds,
  getStoredTheme,
  saveStoredTheme,
  getUserPreferences,
  saveUserPreferences,
  DEFAULT_USER_PREFERENCES,
} from './utils/storage';
import { Flame, Bookmark, Newspaper, AlertCircle, Check, X, RotateCcw, ArrowUp } from 'lucide-react';

interface ToastState {
  id: string;
  type: 'like' | 'dislike' | 'info';
  message: string;
  article?: NewsArticle;
}

export default function App() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [enabledSourceIds, setEnabledSourceIds] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<NewsArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('vse');
  const [selectedSourceId, setSelectedSourceId] = useState<string>('all');
  const [currentTab, setCurrentTab] = useState<'all' | 'breaking' | 'bookmarks'>('all');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);

  // Modals state
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);
  const [dismissedBreakingId, setDismissedBreakingId] = useState<string | null>(null);

  // Immediate visual feedback toast
  const [toast, setToast] = useState<ToastState | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Responsive grid column count for clean editorial layout alignment
  const [gridColumns, setGridColumns] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    const w = window.innerWidth;
    if (w >= 1536) return 5;
    if (w >= 1280) return 4;
    if (w >= 1024) return 3;
    if (w >= 768) return 2;
    return 1;
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      let cols = 1;
      if (w >= 1536) cols = 5;
      else if (w >= 1280) cols = 4;
      else if (w >= 1024) cols = 3;
      else if (w >= 768) cols = 2;
      setGridColumns((prev) => (prev !== cols ? cols : prev));
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll listener for bottom-right Scroll Up button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading & status
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Initialize theme, bookmarks & preferences
  useEffect(() => {
    const savedTheme = getStoredTheme();
    const isDark = savedTheme === 'dark';
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }

    setBookmarks(getSavedArticles());
    setUserPreferences(getUserPreferences());
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      saveStoredTheme(next ? 'dark' : 'light');
      if (next) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
      return next;
    });
  };

  // Fetch sources and initial news
  const fetchSourcesAndNews = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setFetchError(null);

    try {
      // 1. Fetch sources
      const sourcesRes = await fetch('/api/sources');
      if (sourcesRes.ok) {
        const sourcesData = await sourcesRes.json();
        const srcList: NewsSource[] = sourcesData.sources || [];
        setSources(srcList);

        // Load or initialize enabled sources
        setEnabledSourceIds((prev) => {
          if (prev.length > 0) return prev;
          const defaultIds = srcList.filter((s) => s.enabledByDefault).map((s) => s.id);
          const savedIds = getEnabledSourceIds(srcList.map((s) => s.id), defaultIds);
          return savedIds;
        });
      }

      // 2. Fetch news
      const newsRes = await fetch(`/api/news?force=${forceRefresh}`);
      if (!newsRes.ok) throw new Error('Nepodařilo se načíst zprávy ze serveru');

      const newsData = await newsRes.json();
      const fetchedArticles: NewsArticle[] = newsData.articles || [];
      setArticles(fetchedArticles);
      setLastUpdated(newsData.lastUpdated || new Date().toISOString());
    } catch (err: any) {
      console.error(err);
      setFetchError(err.message || 'Nastala chyba při stahování článků.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSourcesAndNews(false);

    // Auto-refresh interval every 3 minutes
    const interval = setInterval(() => {
      fetchSourcesAndNews(true);
    }, 3 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchSourcesAndNews]);

  // Handle toggling sources
  const handleToggleSource = (sourceId: string) => {
    const updated = enabledSourceIds.includes(sourceId)
      ? enabledSourceIds.filter((id) => id !== sourceId)
      : [...enabledSourceIds, sourceId];

    if (updated.length === 0) return; // Prevent disabling all
    setEnabledSourceIds(updated);
    saveEnabledSourceIds(updated);
  };

  const handleSelectAllSources = () => {
    const allIds = sources.map((s) => s.id);
    setEnabledSourceIds(allIds);
    saveEnabledSourceIds(allIds);
  };

  const handleResetDefaultSources = () => {
    const defaultIds = sources.filter((s) => s.enabledByDefault).map((s) => s.id);
    setEnabledSourceIds(defaultIds);
    saveEnabledSourceIds(defaultIds);
  };

  // Handle Bookmarks
  const handleToggleBookmark = (article: NewsArticle) => {
    const isAlreadyBookmarked = bookmarks.some((b) => b.id === article.id);
    let updated: NewsArticle[];
    if (isAlreadyBookmarked) {
      updated = bookmarks.filter((b) => b.id !== article.id);
      setToast({
        id: String(Date.now()),
        type: 'info',
        message: `Článek byl odebrán ze záložek.`,
      });
    } else {
      updated = [article, ...bookmarks];
      setToast({
        id: String(Date.now()),
        type: 'info',
        message: `Článek byl uložen k přečtení do záložek.`,
      });
    }
    setBookmarks(updated);
    saveArticlesToStorage(updated);
  };

  const isArticleBookmarked = (id: string) => {
    return bookmarks.some((b) => b.id === id);
  };

  // Preference Handlers (Zajímá mě / Nezajímá mě with Immediate Visual Feedback)
  const handleToggleLike = (article: NewsArticle) => {
    const isAlreadyLiked = userPreferences.likedArticleIds.includes(article.id);

    setUserPreferences((prev) => {
      const newLikedArticles = isAlreadyLiked
        ? prev.likedArticleIds.filter((id) => id !== article.id)
        : [...prev.likedArticleIds, article.id];

      // Remove from dislikes if liked
      const newDislikedArticles = prev.dislikedArticleIds.filter((id) => id !== article.id);

      let newLikedCategories = [...prev.likedCategories];
      if (!isAlreadyLiked && !newLikedCategories.includes(article.category)) {
        newLikedCategories.push(article.category);
      }
      let newLikedSources = [...prev.likedSourceIds];
      if (!isAlreadyLiked && !newLikedSources.includes(article.sourceId)) {
        newLikedSources.push(article.sourceId);
      }

      const updated: UserPreferences = {
        ...prev,
        likedArticleIds: newLikedArticles,
        dislikedArticleIds: newDislikedArticles,
        likedCategories: newLikedCategories,
        likedSourceIds: newLikedSources,
      };
      saveUserPreferences(updated);
      return updated;
    });

    if (!isAlreadyLiked) {
      setToast({
        id: String(Date.now()),
        type: 'like',
        message: `✓ Označeno jako zajímavé: Budeme upřednostňovat zprávy ze serveru ${article.sourceName}.`,
        article,
      });
    } else {
      setToast({
        id: String(Date.now()),
        type: 'info',
        message: `Označení článku bylo zrušeno.`,
      });
    }
  };

  const handleToggleDislike = (article: NewsArticle) => {
    const isAlreadyDisliked = userPreferences.dislikedArticleIds.includes(article.id);

    setUserPreferences((prev) => {
      const newDislikedArticles = isAlreadyDisliked
        ? prev.dislikedArticleIds.filter((id) => id !== article.id)
        : [...prev.dislikedArticleIds, article.id];

      // Remove from likes if disliked
      const newLikedArticles = prev.likedArticleIds.filter((id) => id !== article.id);

      let newDislikedCategories = [...prev.dislikedCategories];
      if (!isAlreadyDisliked && !newDislikedCategories.includes(article.category)) {
        newDislikedCategories.push(article.category);
      }

      const updated: UserPreferences = {
        ...prev,
        dislikedArticleIds: newDislikedArticles,
        likedArticleIds: newLikedArticles,
        dislikedCategories: newDislikedCategories,
      };
      saveUserPreferences(updated);
      return updated;
    });

    if (!isAlreadyDisliked) {
      setToast({
        id: String(Date.now()),
        type: 'dislike',
        message: `✕ Potlačeno: Zprávy tohoto typu budou ve vašem feedu upozaděny.`,
        article,
      });
    } else {
      setToast({
        id: String(Date.now()),
        type: 'info',
        message: `Potlačení článku bylo zrušeno.`,
      });
    }
  };

  const handleUndoPreference = (article: NewsArticle) => {
    setUserPreferences((prev) => {
      const updated: UserPreferences = {
        ...prev,
        likedArticleIds: prev.likedArticleIds.filter((id) => id !== article.id),
        dislikedArticleIds: prev.dislikedArticleIds.filter((id) => id !== article.id),
      };
      saveUserPreferences(updated);
      return updated;
    });
    setToast(null);
  };

  const handleResetPreferences = () => {
    setUserPreferences(DEFAULT_USER_PREFERENCES);
    saveUserPreferences(DEFAULT_USER_PREFERENCES);
    setToast({
      id: String(Date.now()),
      type: 'info',
      message: 'Uživatelské preference byly resetovány na výchozí.',
    });
  };

  // Predictable & Reliable Source Selection
  const handleSelectSource = (newSourceId: string) => {
    if (currentTab !== 'all') {
      setCurrentTab('all');
    }
    // Toggle: if clicked again, unselect to 'all'
    if (selectedSourceId === newSourceId) {
      setSelectedSourceId('all');
    } else {
      setSelectedSourceId(newSourceId);
    }
  };

  const handleSelectCategory = (newCat: NewsCategory) => {
    setSelectedCategory(newCat);
  };

  // Filtered articles calculation
  const breakingArticles = useMemo(() => {
    return articles.filter((a) => a.isBreaking);
  }, [articles]);

  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const art of articles) {
      counts[art.sourceId] = (counts[art.sourceId] || 0) + 1;
    }
    return counts;
  }, [articles]);

  const latestBreaking = useMemo(() => {
    if (!breakingArticles.length) return null;
    const item = breakingArticles[0];
    return item.id === dismissedBreakingId ? null : item;
  }, [breakingArticles, dismissedBreakingId]);

  const displayedArticles = useMemo(() => {
    let list: NewsArticle[] = [];

    if (currentTab === 'bookmarks') {
      list = [...bookmarks];
      if (selectedSourceId !== 'all') {
        list = list.filter((a) => a.sourceId === selectedSourceId);
      }
    } else if (currentTab === 'breaking') {
      list = articles.filter((a) => a.isBreaking);
      if (selectedSourceId !== 'all') {
        list = list.filter((a) => a.sourceId === selectedSourceId);
      }
    } else {
      // Main news feed:
      // If a specific media is chosen, show articles from that source directly!
      if (selectedSourceId !== 'all') {
        list = articles.filter((a) => a.sourceId === selectedSourceId);
      } else {
        list = articles.filter((a) => enabledSourceIds.includes(a.sourceId));
      }
    }

    // Exclude hidden articles
    if (userPreferences.hiddenArticleIds.length > 0) {
      list = list.filter((a) => !userPreferences.hiddenArticleIds.includes(a.id));
    }

    // Filter by Category
    if (selectedCategory !== 'vse') {
      list = list.filter((a) => a.category === selectedCategory);
    }

    // Always sort chronologically from the newest by default
    list.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    return list;
  }, [
    articles,
    bookmarks,
    currentTab,
    enabledSourceIds,
    selectedSourceId,
    selectedCategory,
  ]);

  const featuredArticle = useMemo(() => {
    if (currentTab !== 'all' || selectedCategory !== 'vse' || selectedSourceId !== 'all') {
      return null;
    }
    return displayedArticles.length > 0 ? displayedArticles[0] : null;
  }, [displayedArticles, currentTab, selectedCategory, selectedSourceId]);

  const secondaryArticles = useMemo(() => {
    if (featuredArticle) {
      return displayedArticles.slice(1);
    }
    return displayedArticles;
  }, [displayedArticles, featuredArticle]);

  // Set of indices that render as full-width editorial breaks.
  // Rule: There must NEVER be only 1 article card on a new line before a full-width break tile.
  // When a break is placed, previous rows must either be completely filled (no stranded tiles),
  // and specifically if tiles are on the current row, there must never be exactly 1 tile alone.
  const fullWidthBreakIndices = useMemo(() => {
    const breakSet = new Set<number>();
    const total = secondaryArticles.length;
    if (total === 0) return breakSet;

    // In single column mobile view, full-width break appears cleanly every 12 items
    if (gridColumns <= 1) {
      for (let i = 11; i < total; i += 12) {
        breakSet.add(i);
      }
      return breakSet;
    }

    let currentColPos = 0; // 0 to gridColumns - 1
    let itemsSinceLastBreak = 0;

    for (let i = 0; i < total; i++) {
      // We aim for an editorial break roughly every 10 to 14 items.
      // Strict rule: currentColPos !== 1 (there can never be only 1 card on the current row before the break).
      // Placing the break when currentColPos === 0 starts the break on its own fresh row, leaving no stranded tiles.
      const canPlaceBreak =
        itemsSinceLastBreak >= 10 &&
        currentColPos === 0;

      if (canPlaceBreak) {
        breakSet.add(i);
        itemsSinceLastBreak = 0;
        currentColPos = 0; // full width card spans all columns, next card starts at col 0
      } else {
        itemsSinceLastBreak++;
        currentColPos = (currentColPos + 1) % gridColumns;
      }
    }

    return breakSet;
  }, [secondaryArticles.length, gridColumns]);

  const activeSourceObj = sources.find((s) => s.id === selectedSourceId);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E0F12] text-stone-900 dark:text-stone-100 transition-colors">
      {/* 1. Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        bookmarksCount={bookmarks.length}
        breakingCount={breakingArticles.length}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onOpenSourcesModal={() => setIsSourcesModalOpen(true)}
        isRefreshing={isRefreshing}
        onRefresh={() => fetchSourcesAndNews(true)}
      />

      {/* 2. Breaking News Ribbon Banner */}
      <BreakingBanner
        article={latestBreaking}
        onSelectArticle={(art) => setSelectedArticle(art)}
        onDismiss={() => latestBreaking && setDismissedBreakingId(latestBreaking.id)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-5 sm:py-7">
        {/* Category & Source Selectors */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          selectedSourceId={selectedSourceId}
          onSelectSourceId={handleSelectSource}
          sources={sources}
          sourceCounts={sourceCounts}
          totalArticlesCount={articles.length}
          activeSourcesCount={enabledSourceIds.length}
          totalSourcesCount={sources.length}
          onOpenSourcesModal={() => setIsSourcesModalOpen(true)}
        />

        {/* Tab Subhead and Live Status & Sort Indicator with Optimized Spacing */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3.5 mb-6 gap-3">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-stone-950 dark:text-stone-50">
              {currentTab === 'bookmarks'
                ? 'Uložené články k přečtení'
                : currentTab === 'breaking'
                ? 'Mimořádné zpravodajství'
                : selectedSourceId !== 'all' && activeSourceObj
                ? `${activeSourceObj.name} — Zprávy`
                : 'Hlavní zprávy & aktuální dění'}
            </h1>
            <span className="text-xs sm:text-sm font-mono tabular-nums text-stone-500 dark:text-stone-400 font-semibold">
              ({displayedArticles.length} {displayedArticles.length === 1 ? 'článek' : displayedArticles.length >= 2 && displayedArticles.length <= 4 ? 'články' : 'článků'})
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-4 text-xs sm:text-sm">
            {/* Active user interest stats */}
            {(userPreferences.likedCategories.length > 0 ||
              userPreferences.likedArticleIds.length > 0 ||
              userPreferences.dislikedArticleIds.length > 0) && (
              <div className="hidden lg:flex items-center gap-2 text-stone-600 dark:text-stone-400 text-xs px-2.5 py-1.5 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <span className="w-2 h-2 rounded-none bg-emerald-500" />
                <span>Osobní preference aktivní ({userPreferences.likedArticleIds.length} lajků, {userPreferences.dislikedArticleIds.length} skrytých)</span>
                <button
                  onClick={handleResetPreferences}
                  className="text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-stone-100 underline cursor-pointer ml-1 font-bold"
                >
                  resetovat
                </button>
              </div>
            )}

            {lastUpdated && (
              <span className="font-mono text-xs text-stone-500 dark:text-stone-400">
                Aktualizováno: {new Date(lastUpdated).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {fetchError && (
          <div className="p-5 rounded-none bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900 text-amber-950 dark:text-amber-200 text-sm flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
              <span>{fetchError} Používáme záložní ověřený obsah.</span>
            </div>
            <button
              onClick={() => fetchSourcesAndNews(true)}
              className="px-4 py-1.5 bg-amber-600 text-white rounded-none text-xs font-bold cursor-pointer"
            >
              Obnovit
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-8">
            <div className="h-72 sm:h-96 bg-stone-200/60 dark:bg-stone-800/60 rounded-none animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-7 sm:gap-8 lg:gap-10">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="h-80 bg-stone-200/50 dark:bg-stone-800/50 rounded-none animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {/* Content Display */}
        {!isLoading && (
          <>
            {/* Empty State */}
            {displayedArticles.length === 0 ? (
              <div className="text-center py-20 px-6 border border-stone-300 dark:border-stone-800 bg-white/60 dark:bg-[#121316]/60">
                <div className="w-14 h-14 mx-auto rounded-none bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 mb-4 border border-stone-300 dark:border-stone-700">
                  {currentTab === 'bookmarks' ? (
                    <Bookmark className="w-7 h-7" />
                  ) : currentTab === 'breaking' ? (
                    <Flame className="w-7 h-7" />
                  ) : (
                    <Newspaper className="w-7 h-7" />
                  )}
                </div>
                <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
                  {currentTab === 'bookmarks'
                    ? 'Žádné uložené články v záložkách'
                    : selectedSourceId !== 'all' && selectedCategory !== 'vse'
                    ? `Server ${activeSourceObj?.name || ''} nemá žádné zprávy v této rubrice`
                    : 'Nenalezeny žádné zprávy odpovídající filtrům'}
                </h3>
                <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 max-w-lg mx-auto mb-6 leading-relaxed">
                  {currentTab === 'bookmarks'
                    ? 'Články si můžete uložit kliknutím na ikonu záložky na kartě libovolného článku.'
                    : selectedSourceId !== 'all' && selectedCategory !== 'vse'
                    ? `Zvolený server v této konkrétní rubrice momentálně nemá nově publikované články. Můžete si zobrazit všechny zprávy z tohoto serveru nebo přejít na jinou rubriku.`
                    : 'Zkuste zvolit jinou rubriku nebo povolit více zdrojů médií.'}
                </p>

                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {selectedSourceId !== 'all' && (
                    <button
                      onClick={() => setSelectedCategory('vse')}
                      className="px-5 py-2.5 text-sm font-bold bg-stone-950 dark:bg-stone-50 text-white dark:text-stone-950 rounded-none cursor-pointer"
                    >
                      Zobrazit všechny rubriky z {activeSourceObj?.name || 'tohoto zdroje'}
                    </button>
                  )}

                  {selectedCategory !== 'vse' && (
                    <button
                      onClick={() => setSelectedSourceId('all')}
                      className="px-5 py-2.5 text-sm font-bold border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-none cursor-pointer hover:border-stone-500"
                    >
                      Zobrazit tuto rubriku ze všech serverů
                    </button>
                  )}

                  {currentTab !== 'bookmarks' && (
                    <button
                      onClick={() => {
                        setSelectedCategory('vse');
                        setSelectedSourceId('all');
                        handleSelectAllSources();
                      }}
                      className="px-4 py-2 text-sm font-semibold text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-100 underline cursor-pointer"
                    >
                      Resetovat všechny filtry
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {/* 1. Lead Featured Story */}
                {featuredArticle && (
                  <ArticleCard
                    article={featuredArticle}
                    isBookmarked={isArticleBookmarked(featuredArticle.id)}
                    onToggleBookmark={handleToggleBookmark}
                    onOpenArticle={(art) => setSelectedArticle(art)}
                    isFeatured={true}
                    isLiked={userPreferences.likedArticleIds.includes(featuredArticle.id)}
                    isDisliked={userPreferences.dislikedArticleIds.includes(featuredArticle.id)}
                    onToggleLike={handleToggleLike}
                    onToggleDislike={handleToggleDislike}
                  />
                )}

                {/* 2. Secondary Editorial Grid (Fluid multi-column responsive grid with generous airy gaps) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-7 sm:gap-8 lg:gap-10">
                  {secondaryArticles.map((art, index) => {
                    const isBreak = fullWidthBreakIndices.has(index);
                    return (
                      <ArticleCard
                        key={`${art.id}-${index}`}
                        article={art}
                        isBookmarked={isArticleBookmarked(art.id)}
                        onToggleBookmark={handleToggleBookmark}
                        onOpenArticle={(article) => setSelectedArticle(article)}
                        isFeatured={false}
                        isFullWidthBreak={isBreak}
                        isLiked={userPreferences.likedArticleIds.includes(art.id)}
                        isDisliked={userPreferences.dislikedArticleIds.includes(art.id)}
                        onToggleLike={handleToggleLike}
                        onToggleDislike={handleToggleDislike}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Preference Feedback Toast Notification */}
      {toast && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-20 right-4 sm:right-8 z-50 max-w-md w-full bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-950 border border-stone-800 dark:border-stone-300 p-4 shadow-2xl flex items-start justify-between gap-3 animate-fade-in"
        >
          <div className="flex items-start gap-2.5">
            {toast.type === 'like' && (
              <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600 mt-0.5 shrink-0 stroke-[3]" />
            )}
            {toast.type === 'dislike' && (
              <X className="w-4 h-4 text-rose-400 dark:text-rose-600 mt-0.5 shrink-0 stroke-[3]" />
            )}
            {toast.type === 'info' && (
              <Check className="w-4 h-4 text-amber-400 dark:text-amber-600 mt-0.5 shrink-0" />
            )}
            <div>
              <p className="text-xs font-medium leading-relaxed">{toast.message}</p>
              {toast.article && (
                <button
                  onClick={() => handleUndoPreference(toast.article!)}
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-amber-300 dark:text-amber-700 font-bold hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Vrátit zpět</span>
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-stone-400 hover:text-white dark:hover:text-stone-950 cursor-pointer p-0.5"
            title="Zavřít"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}

      {/* Floating Scroll Up Button (Bottom Right - UMPRUM Style) */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          title="Zpět na začátek"
          aria-label="Přejít nahoru"
          className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-40 p-3 sm:p-4 bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-950 border-2 border-stone-950 dark:border-stone-100 shadow-2xl hover:bg-[#0A3D62] dark:hover:bg-[#0A3D62] dark:hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center group animate-fade-in"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-150" />
        </button>
      )}

      {/* Editorial Footer */}
      <footer className="mt-20 border-t-2 border-stone-900 dark:border-stone-200 bg-stone-950 text-stone-300 dark:bg-stone-100 dark:text-stone-900 py-10 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 text-xs font-mono transition-colors">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-serif font-extrabold text-lg text-white dark:text-stone-950">CzechNews Pulse</span>
            <span aria-hidden="true">·</span>
            <span className="uppercase text-stone-400 dark:text-stone-600">PRAHA 2026</span>
          </div>

          <div className="flex items-center flex-wrap justify-center gap-x-3 gap-y-1 text-stone-400 dark:text-stone-600 uppercase text-[11px] tracking-wider max-w-2xl text-center">
            {sources.map((s, idx) => (
              <span key={s.id} className="inline-flex items-center gap-2">
                <span>{s.name}</span>
                {idx < sources.length - 1 && <span className="opacity-40">·</span>}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 text-stone-400 dark:text-stone-600 uppercase">
            <span>KATALOG: {sources.length} MÉDIÍ</span>
          </div>
        </div>
      </footer>

      {/* Article Detail Reader Modal */}
      <ArticleModal
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        isBookmarked={selectedArticle ? isArticleBookmarked(selectedArticle.id) : false}
        onToggleBookmark={handleToggleBookmark}
      />

      {/* Sources Configuration Modal */}
      <SourceSettingsModal
        isOpen={isSourcesModalOpen}
        onClose={() => setIsSourcesModalOpen(false)}
        sources={sources}
        enabledSourceIds={enabledSourceIds}
        onToggleSource={handleToggleSource}
        onSelectAll={handleSelectAllSources}
        onResetDefaults={handleResetDefaultSources}
      />
    </div>
  );
}

import { NewsArticle, UserPreferences } from '../types';

const STORAGE_KEYS = {
  BOOKMARKS: 'czechnews_bookmarks',
  SOURCES: 'czechnews_sources',
  THEME: 'czechnews_theme',
  NOTIFICATIONS_ENABLED: 'czechnews_notifications_enabled',
  SEEN_BREAKING: 'czechnews_seen_breaking',
  AI_CACHE: 'czechnews_ai_cache',
  PREFERENCES: 'czechnews_user_preferences',
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  likedCategories: [],
  dislikedCategories: [],
  likedSourceIds: [],
  dislikedSourceIds: [],
  likedArticleIds: [],
  dislikedArticleIds: [],
  hiddenArticleIds: [],
};

export function getUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return raw ? { ...DEFAULT_USER_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_USER_PREFERENCES;
  } catch {
    return DEFAULT_USER_PREFERENCES;
  }
}

export function saveUserPreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  } catch (err) {
    console.error('Failed to save user preferences', err);
  }
}

export function getSavedArticles(): NewsArticle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveArticlesToStorage(articles: NewsArticle[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(articles));
  } catch (err) {
    console.error('Failed to save articles to localStorage', err);
  }
}

export function getEnabledSourceIds(allSourceIds: string[], defaultSourceIds?: string[]): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SOURCES);
    const defaults = defaultSourceIds || allSourceIds;
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const existingSet = new Set(parsed);
      const combined = [...parsed];
      for (const defId of defaults) {
        if (!existingSet.has(defId) && !localStorage.getItem(`cznews_disabled_${defId}`)) {
          combined.push(defId);
        }
      }
      return combined;
    }
    return defaults;
  } catch {
    return defaultSourceIds || allSourceIds;
  }
}

export function saveEnabledSourceIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(ids));
  } catch (err) {
    console.error('Failed to save sources to localStorage', err);
  }
}

export function getStoredTheme(): 'light' | 'dark' {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME);
    if (raw === 'dark' || raw === 'light') return raw;
    return 'light';
  } catch {
    return 'light';
  }
}

export function saveStoredTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (err) {
    console.error('Failed to save theme', err);
  }
}

export function getNotificationsEnabled(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
    return raw === 'true';
  } catch {
    return false;
  }
}

export function saveNotificationsEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, String(enabled));
  } catch (err) {
    console.error('Failed to save notifications setting', err);
  }
}

export function getCachedSummary(articleId: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AI_CACHE);
    const map = raw ? JSON.parse(raw) : {};
    return map[articleId] || null;
  } catch {
    return null;
  }
}

export function saveCachedSummary(articleId: string, summary: any) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AI_CACHE);
    const map = raw ? JSON.parse(raw) : {};
    map[articleId] = summary;
    localStorage.setItem(STORAGE_KEYS.AI_CACHE, JSON.stringify(map));
  } catch (err) {
    console.error('Failed to cache AI summary', err);
  }
}

// Relative time formatting in Czech
export function formatCzechRelativeTime(dateString: string): string {
  try {
    const now = Date.now();
    const then = new Date(dateString).getTime();
    const diffMs = now - then;
    const diffMin = Math.floor(diffMs / (1000 * 60));

    if (diffMin < 2) return 'před chvílí';
    if (diffMin < 60) return `před ${diffMin} min`;

    const diffHours = Math.floor(diffMin / 60);
    if (diffHours === 1) return 'před 1 hodinou';
    if (diffHours >= 2 && diffHours <= 4) return `před ${diffHours} hodinami`;
    if (diffHours < 24) return `před ${diffHours} hod`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'včera';
    if (diffDays >= 2 && diffDays <= 4) return `před ${diffDays} dny`;
    return `před ${diffDays} dny`;
  } catch {
    return 'dnes';
  }
}

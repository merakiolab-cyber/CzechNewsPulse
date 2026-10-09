export type NewsCategory =
  | 'vse'
  | 'domaci'
  | 'svet'
  | 'ekonomika'
  | 'technologie'
  | 'kultura'
  | 'sport'
  | 'nazory';

export interface NewsArticle {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  sourceId: string;
  sourceName: string;
  author?: string;
  description: string;
  contentSnippet?: string;
  imageUrl?: string;
  category: NewsCategory;
  isBreaking?: boolean;
  isPaywalled?: boolean;
  readTimeMin: number;
}

export interface UserPreferences {
  likedCategories: NewsCategory[];
  dislikedCategories: NewsCategory[];
  likedSourceIds: string[];
  dislikedSourceIds: string[];
  likedArticleIds: string[];
  dislikedArticleIds: string[];
  hiddenArticleIds: string[];
}

export interface NewsSource {
  id: string;
  name: string;
  rssUrl: string;
  siteUrl: string;
  color: string;
  description: string;
  enabledByDefault: boolean;
}

export interface ArticleFullContent {
  title: string;
  lead?: string;
  paragraphs: string[];
  author?: string;
  images?: string[];
  isPaywalled?: boolean;
  wordCount?: number;
  sourceUrl?: string;
}

// 統合RSS記事の型定義
export interface RssArticle {
  id: string;
  title: string;
  link: string;
  description: string;
  author: string;
  pubDate: string;
  ogImage?: string;
  avatarUrl?: string;
  siteName: string;
  site: 'qiita' | 'zenn'; // サイト識別子
  metadata?: any;
}

// 統合RSS記事レスポンスの型
export interface UnifiedRssResponse {
  articles: RssArticle[];
  totalCount: number;
  fetchedAt: string;
  qiitaCount: number;
  zennCount: number;
}

// 共通の状態管理型
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  type: 'error' | 'warning';
  message: string;
  subMessage?: string;
  showRetryButton?: boolean;
}

// 統合RSS記事用の状態管理
export interface UnifiedRssState {
  articles: RssArticle[];
  loading: LoadingState;
  error: ErrorState | null;
  lastUpdated: string | null;
}

// キャッシュデータ型
export interface CacheData {
  articles: RssArticle[];
  timestamp: string;
  expiresIn: number;
}
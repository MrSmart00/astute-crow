// 共通の状態管理型をインポート
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

// キャッシュデータ型
export interface CacheData {
  articles: QiitaRssArticle[];
  timestamp: string;
  expiresIn: number;
}

// RSS記事の型定義
export interface QiitaRssArticle {
  id: string;
  title: string;
  link: string;
  description: string;
  author: string;
  pubDate: string;
  ogImage?: string;
  avatarUrl?: string;
  siteName: string;
  metadata?: any;
}

// RSS記事レスポンスの型
export interface QiitaRssResponse {
  articles: QiitaRssArticle[];
  totalCount: number;
  fetchedAt: string;
}

// RSS記事用の状態管理
export interface QiitaRssState {
  articles: QiitaRssArticle[];
  loading: LoadingState;
  error: ErrorState | null;
  lastUpdated: string | null;
}
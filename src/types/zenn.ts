export interface ZennUser {
  username: string;
  name: string;
  avatarSmallUrl: string;
}

export interface ZennArticle {
  id: string;
  title: string;
  slug: string;
  likedCount: number;
  user: ZennUser;
  publishedAt: string;
  emoji: string;
  postType: 'Article';
  articleType: 'tech' | 'idea';
}

export type ZennPost = ZennArticle;

export interface ZennTrendResponse {
  articles: ZennArticle[];
}

export interface CacheData {
  articles: ZennArticle[];
  timestamp: string;
  expiresIn: number;
}

export interface ErrorState {
  type: 'error' | 'warning';
  message: string;
  subMessage?: string;
  showRetryButton?: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ZennTrendsState {
  articles: ZennArticle[];
  loading: LoadingState;
  error: ErrorState | null;
  lastUpdated: string | null;
}

// RSS記事の型定義
export interface ZennRssArticle {
  id: string;
  title: string;
  link: string;
  description: string;
  author: string;
  pubDate: string;
  ogImage?: string;
  avatarUrl?: string;
  siteName: string;
  thumbnail?: string;
}

// RSS記事レスポンスの型
export interface ZennRssResponse {
  articles: ZennRssArticle[];
  totalCount: number;
  fetchedAt: string;
}

// RSS記事用の状態管理
export interface ZennRssState {
  articles: ZennRssArticle[];
  loading: LoadingState;
  error: ErrorState | null;
  lastUpdated: string | null;
}
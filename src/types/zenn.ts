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
}

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
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

export interface ZennBook {
  id: string;
  title: string;
  slug: string;
  likedCount: number;
  user: ZennUser;
  publishedAt: string;
  emoji: string;
  postType: 'Book';
  price: number;
  isFree: boolean;
  summary: string;
}

export type ZennPost = ZennArticle | ZennBook;

export interface ZennTrendResponse {
  articles: ZennArticle[];
}

export interface CacheData {
  posts: ZennPost[];
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
  posts: ZennPost[];
  loading: LoadingState;
  error: ErrorState | null;
  lastUpdated: string | null;
}
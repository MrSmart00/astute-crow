// 共通型をrss.tsからインポート
import { LoadingState, ErrorState } from './rss';

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

export interface ZennTrendsState {
  articles: ZennArticle[];
  loading: LoadingState;
  error: ErrorState | null;
  lastUpdated: string | null;
}
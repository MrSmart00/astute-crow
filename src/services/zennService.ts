import { ZennArticle, ZennBook, ZennPost, CacheData } from '../types/zenn';

const CACHE_KEY = 'zenn-trends-cache';
const CACHE_DURATION = 3600000; // 1時間（ミリ秒）
const EXTENDED_CACHE_DURATION = 86400000; // 24時間（ミリ秒）

const mockPosts: ZennPost[] = [
  {
    id: 'mock-1',
    title: '【サンプル】TypeScriptの型安全性を極める',
    slug: 'typescript-type-safety',
    likedCount: 100,
    user: {
      username: 'sample_user',
      name: 'サンプル著者',
      avatarSmallUrl: 'https://via.placeholder.com/32'
    },
    publishedAt: new Date(Date.now() - 86400000).toISOString().split('T')[0], // 昨日の日付
    emoji: '📝',
    postType: 'Article',
    articleType: 'tech'
  },
  {
    id: 'mock-2',
    title: '【サンプル】React Hooksで状態管理をマスター',
    slug: 'react-hooks-state-management',
    likedCount: 85,
    user: {
      username: 'react_dev',
      name: 'React開発者',
      avatarSmallUrl: 'https://via.placeholder.com/32'
    },
    publishedAt: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    emoji: '⚛️',
    postType: 'Article',
    articleType: 'idea'
  },
  {
    id: 'mock-3',
    title: '【サンプル】Viteで爆速開発環境を構築',
    slug: 'vite-fast-development',
    likedCount: 72,
    user: {
      username: 'vite_master',
      name: 'Viteエキスパート',
      avatarSmallUrl: 'https://via.placeholder.com/32'
    },
    publishedAt: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    emoji: '⚡',
    postType: 'Book',
    price: 980,
    isFree: false,
    summary: 'Viteでモダンなフロントエンド開発環境を構築する方法を詳しく解説'
  },
  {
    id: 'mock-4',
    title: '【サンプル】無料で学ぶJavaScript基礎',
    slug: 'free-javascript-basics',
    likedCount: 95,
    user: {
      username: 'js_teacher',
      name: 'JS先生',
      avatarSmallUrl: 'https://via.placeholder.com/32'
    },
    publishedAt: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    emoji: '📚',
    postType: 'Book',
    price: 0,
    isFree: true,
    summary: 'プログラミング初心者向けのJavaScript入門書'
  }
];

class ZennService {
  private async fetchTechArticles(): Promise<ZennArticle[]> {
    const response = await fetch('/api/zenn/trendTech');
    if (!response.ok) {
      throw new Error(`Tech API request failed: ${response.status}`);
    }
    const data: ZennArticle[] = await response.json();
    return data.map(article => ({
      ...article,
      postType: 'Article',
      articleType: 'tech'
    }));
  }

  private async fetchIdeaArticles(): Promise<ZennArticle[]> {
    const response = await fetch('/api/zenn/trendIdea');
    if (!response.ok) {
      throw new Error(`Idea API request failed: ${response.status}`);
    }
    const data: ZennArticle[] = await response.json();
    return data.map(article => ({
      ...article,
      postType: 'Article',
      articleType: 'idea'
    }));
  }

  private async fetchBooks(): Promise<ZennBook[]> {
    const response = await fetch('/api/zenn/trendBook');
    if (!response.ok) {
      throw new Error(`Book API request failed: ${response.status}`);
    }
    const data: any[] = await response.json();
    return data.map(book => ({
      ...book,
      postType: 'Book',
      price: book.price || 0,
      isFree: book.isFree || book.price === 0,
      summary: book.summary || ''
    }));
  }

  private async fetchAllTrends(): Promise<ZennPost[]> {
    try {
      const [techArticles, ideaArticles, books] = await Promise.all([
        this.fetchTechArticles(),
        this.fetchIdeaArticles(),
        this.fetchBooks()
      ]);

      const allPosts: ZennPost[] = [...techArticles, ...ideaArticles, ...books];
      return allPosts.sort((a, b) => b.likedCount - a.likedCount);
    } catch (error) {
      console.error('Failed to fetch from Zenn APIs:', error);
      throw error;
    }
  }

  private getCacheData(): CacheData | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      return JSON.parse(cached) as CacheData;
    } catch (error) {
      console.error('Failed to parse cache data:', error);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  }

  private setCacheData(posts: ZennPost[]): void {
    try {
      const cacheData: CacheData = {
        posts,
        timestamp: new Date().toISOString(),
        expiresIn: CACHE_DURATION
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  private isCacheValid(cache: CacheData, maxAge: number = CACHE_DURATION): boolean {
    const now = Date.now();
    const cacheTime = new Date(cache.timestamp).getTime();
    return (now - cacheTime) < maxAge;
  }

  private filterYesterdayPosts(posts: ZennPost[]): ZennPost[] {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const filtered = posts.filter(post => {
      const publishedDate = post.publishedAt.split('T')[0];
      return publishedDate === yesterdayStr;
    });

    // もし昨日の投稿がない場合は、最新の投稿を返す（APIは人気順でソート済み）
    return filtered.length > 0 ? filtered.slice(0, 15) : posts.slice(0, 15);
  }

  async getTrendPosts(): Promise<{
    posts: ZennPost[];
    source: 'api' | 'cache' | 'extended-cache' | 'mock';
    cacheAge?: number;
  }> {
    // 1. メイン: API経由でデータ取得を試行
    try {
      const posts = await this.fetchAllTrends();
      const filtered = this.filterYesterdayPosts(posts);
      this.setCacheData(filtered);
      return { posts: filtered, source: 'api' };
    } catch (error) {
      console.warn('API fetch failed, checking cache:', error);
    }

    // 2. フォールバック1: 1時間以内のキャッシュデータ
    const cache = this.getCacheData();
    if (cache && this.isCacheValid(cache)) {
      const cacheAge = Date.now() - new Date(cache.timestamp).getTime();
      return {
        posts: cache.posts,
        source: 'cache',
        cacheAge: Math.floor(cacheAge / 60000) // 分単位
      };
    }

    // 3. フォールバック2: 24時間以内のキャッシュデータ（警告表示付き）
    if (cache && this.isCacheValid(cache, EXTENDED_CACHE_DURATION)) {
      const cacheAge = Date.now() - new Date(cache.timestamp).getTime();
      return {
        posts: cache.posts,
        source: 'extended-cache',
        cacheAge: Math.floor(cacheAge / 3600000) // 時間単位
      };
    }

    // 4. フォールバック3: モックデータ（開発環境のみ）
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      console.warn('Using mock data as fallback');
      return { posts: mockPosts, source: 'mock' };
    }

    // 5. すべて失敗した場合
    throw new Error('すべてのデータソースからの取得に失敗しました');
  }

  clearCache(): void {
    localStorage.removeItem(CACHE_KEY);
  }
}

export const zennService = new ZennService();
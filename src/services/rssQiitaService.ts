import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';
import { RssArticle, CacheData } from '../types/rss';

// Qiita専用のレスポンス型
interface QiitaRssResponse {
  articles: RssArticle[];
  totalCount: number;
  fetchedAt: string;
}

class RssQiitaService {
  private convex: ConvexHttpClient;
  private cache: Map<string, CacheData> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分
  private readonly CACHE_KEY = 'qiita-rss-articles';

  constructor() {
    // Convex URL を環境変数から取得（本番環境では適切に設定）
    const convexUrl = import.meta.env.VITE_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('Convex URL is not configured');
    }
    this.convex = new ConvexHttpClient(convexUrl);
  }

  /**
   * RSS記事を取得（メタデータ付き）
   */
  async fetchRssArticles(useCache = true): Promise<QiitaRssResponse> {
    // キャッシュチェック
    if (useCache) {
      const cachedData = this.getCachedData();
      if (cachedData) {
        console.log('Qiita RSS記事をキャッシュから取得');
        return {
          articles: cachedData.articles,
          totalCount: cachedData.articles.length,
          fetchedAt: cachedData.timestamp,
        };
      }
    }

    try {
      console.log('Qiita RSS記事をAPI経由で取得開始');

      const response = await this.convex.action(api.rssQiitaApi.fetchRssArticles, {});

      if (!response || !Array.isArray(response.articles)) {
        throw new Error('Invalid response format from API');
      }

      // レスポンスデータを変換
      const articles: RssArticle[] = response.articles.map((article: any) => ({
        id: article.id,
        title: article.title,
        link: article.link,
        author: article.author,
        pubDate: article.pubDate,
        avatarUrl: article.avatarUrl,
        siteName: article.siteName,
        site: 'qiita' as const,
        metadata: article.metadata,
      }));

      const result: QiitaRssResponse = {
        articles,
        totalCount: response.totalCount || articles.length,
        fetchedAt: response.fetchedAt || new Date().toISOString(),
      };

      // キャッシュに保存
      this.setCacheData(articles, result.fetchedAt);

      console.log(`Qiita RSS記事を取得完了: ${articles.length}件`);
      return result;

    } catch (error) {
      console.error('Qiita RSS記事の取得に失敗:', error);
      throw new Error('Qiita RSS記事の取得に失敗しました。ネットワーク接続を確認してください。');
    }
  }

  /**
   * RSS記事を高速取得（メタデータなし）
   */
  async fetchRssArticlesRaw(): Promise<QiitaRssResponse> {
    try {
      console.log('Qiita RSS記事を高速取得開始');

      const response = await this.convex.action(api.rssQiitaApi.fetchRssArticlesRaw, {});

      if (!response || !Array.isArray(response.articles)) {
        throw new Error('Invalid response format from API');
      }

      const articles: RssArticle[] = response.articles.map((article: any) => ({
        id: article.id,
        title: article.title,
        link: article.link,
        author: article.author,
        pubDate: article.pubDate,
        avatarUrl: article.avatarUrl,
        siteName: article.siteName,
        site: 'qiita' as const,
        metadata: article.metadata,
      }));

      const result: QiitaRssResponse = {
        articles,
        totalCount: response.totalCount || articles.length,
        fetchedAt: response.fetchedAt || new Date().toISOString(),
      };

      console.log(`Qiita RSS記事を高速取得完了: ${articles.length}件`);
      return result;

    } catch (error) {
      console.error('Qiita RSS記事の高速取得に失敗:', error);
      throw new Error('Qiita RSS記事の取得に失敗しました。');
    }
  }

  /**
   * キャッシュから試行
   */
  async fetchWithFallback(): Promise<QiitaRssResponse> {
    try {
      // まずメタデータ付きで取得を試行
      return await this.fetchRssArticles(true);
    } catch (error) {
      console.warn('Qiitaメタデータ付き取得に失敗、高速取得を試行:', error);

      try {
        // 高速取得を試行
        return await this.fetchRssArticlesRaw();
      } catch (fallbackError) {
        console.error('Qiita高速取得も失敗:', fallbackError);

        // 最後にキャッシュから取得を試行
        const cachedData = this.getCachedData(false); // 期限切れでも取得
        if (cachedData) {
          console.log('Qiita期限切れキャッシュから取得');
          return {
            articles: cachedData.articles,
            totalCount: cachedData.articles.length,
            fetchedAt: cachedData.timestamp,
          };
        }

        throw fallbackError;
      }
    }
  }

  /**
   * キャッシュクリア
   */
  clearCache(): void {
    this.cache.clear();
    console.log('Qiita RSSキャッシュをクリアしました');
  }

  /**
   * キャッシュデータ取得
   */
  private getCachedData(checkExpiry = true): CacheData | null {
    const cached = this.cache.get(this.CACHE_KEY);
    if (!cached) {
      return null;
    }

    if (checkExpiry) {
      const now = Date.now();
      const cacheTime = new Date(cached.timestamp).getTime();

      if (now - cacheTime > this.CACHE_DURATION) {
        this.cache.delete(this.CACHE_KEY);
        return null;
      }
    }

    return cached;
  }

  /**
   * キャッシュデータ設定
   */
  private setCacheData(articles: RssArticle[], timestamp: string): void {
    const cacheData: CacheData = {
      articles,
      timestamp,
      expiresIn: Date.now() + this.CACHE_DURATION,
    };

    this.cache.set(this.CACHE_KEY, cacheData);
  }

  /**
   * キャッシュ状態を取得
   */
  getCacheStatus() {
    const cached = this.getCachedData(false);
    if (!cached) {
      return { hasCache: false };
    }

    const now = Date.now();
    const cacheTime = new Date(cached.timestamp).getTime();
    const age = now - cacheTime;
    const isExpired = age > this.CACHE_DURATION;

    return {
      hasCache: true,
      isExpired,
      ageMinutes: Math.floor(age / (1000 * 60)),
      articleCount: cached.articles.length,
      timestamp: cached.timestamp,
    };
  }
}

export const rssQiitaService = new RssQiitaService();
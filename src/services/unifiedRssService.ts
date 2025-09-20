import { rssQiitaService } from './rssQiitaService';
import { rssZennService } from './rssZennService';
import { RssArticle, UnifiedRssResponse, CacheData } from '../types/rss';

class UnifiedRssService {
  private cache: Map<string, CacheData> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分
  private readonly CACHE_KEY = 'unified-rss-articles';

  /**
   * 両サービスからRSS記事を取得して統合
   */
  async fetchUnifiedRssArticles(useCache = true): Promise<UnifiedRssResponse> {
    // キャッシュチェック
    if (useCache) {
      const cachedData = this.getCachedData();
      if (cachedData) {
        console.log('統合RSS記事をキャッシュから取得');
        const qiitaCount = cachedData.articles.filter(a => a.site === 'qiita').length;
        const zennCount = cachedData.articles.filter(a => a.site === 'zenn').length;

        return {
          articles: cachedData.articles,
          totalCount: cachedData.articles.length,
          fetchedAt: cachedData.timestamp,
          qiitaCount,
          zennCount,
        };
      }
    }

    try {
      console.log('統合RSS記事をAPI経由で取得開始');

      // 両サービスから並行して記事を取得
      const [qiitaResponse, zennResponse] = await Promise.allSettled([
        rssQiitaService.fetchWithFallback(),
        rssZennService.fetchWithFallback()
      ]);

      // 記事を統合
      const allArticles: RssArticle[] = [];

      // Qiita記事を変換して追加
      if (qiitaResponse.status === 'fulfilled') {
        const qiitaArticles = qiitaResponse.value.articles.map(article => ({
          ...article,
          site: 'qiita' as const,
        }));
        allArticles.push(...qiitaArticles);
      } else {
        console.warn('Qiita記事の取得に失敗:', qiitaResponse.reason);
      }

      // Zenn記事を変換して追加
      if (zennResponse.status === 'fulfilled') {
        const zennArticles = zennResponse.value.articles.map(article => ({
          ...article,
          site: 'zenn' as const,
        }));
        allArticles.push(...zennArticles);
      } else {
        console.warn('Zenn記事の取得に失敗:', zennResponse.reason);
      }

      // 公開日時順（最新順）でソート
      allArticles.sort((a, b) => {
        const dateA = new Date(a.pubDate).getTime();
        const dateB = new Date(b.pubDate).getTime();
        return dateB - dateA; // 降順（最新が先頭）
      });

      const qiitaCount = allArticles.filter(a => a.site === 'qiita').length;
      const zennCount = allArticles.filter(a => a.site === 'zenn').length;
      const fetchedAt = new Date().toISOString();

      const result: UnifiedRssResponse = {
        articles: allArticles,
        totalCount: allArticles.length,
        fetchedAt,
        qiitaCount,
        zennCount,
      };

      // キャッシュに保存
      this.setCacheData(allArticles, fetchedAt);

      console.log(`統合RSS記事を取得完了: 総計${allArticles.length}件 (Qiita: ${qiitaCount}件, Zenn: ${zennCount}件)`);
      return result;

    } catch (error) {
      console.error('統合RSS記事の取得に失敗:', error);

      // 最後にキャッシュから取得を試行
      const cachedData = this.getCachedData(false); // 期限切れでも取得
      if (cachedData) {
        console.log('期限切れキャッシュから統合RSS記事を取得');
        const qiitaCount = cachedData.articles.filter(a => a.site === 'qiita').length;
        const zennCount = cachedData.articles.filter(a => a.site === 'zenn').length;

        return {
          articles: cachedData.articles,
          totalCount: cachedData.articles.length,
          fetchedAt: cachedData.timestamp,
          qiitaCount,
          zennCount,
        };
      }

      throw new Error('統合RSS記事の取得に失敗しました。ネットワーク接続を確認してください。');
    }
  }

  /**
   * キャッシュクリア
   */
  clearCache(): void {
    this.cache.clear();
    // 個別のサービスのキャッシュもクリア
    rssQiitaService.clearCache();
    rssZennService.clearCache();
    console.log('統合RSSキャッシュをクリアしました');
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

    const qiitaCount = cached.articles.filter(a => a.site === 'qiita').length;
    const zennCount = cached.articles.filter(a => a.site === 'zenn').length;

    return {
      hasCache: true,
      isExpired,
      ageMinutes: Math.floor(age / (1000 * 60)),
      articleCount: cached.articles.length,
      qiitaCount,
      zennCount,
      timestamp: cached.timestamp,
    };
  }
}

export const unifiedRssService = new UnifiedRssService();
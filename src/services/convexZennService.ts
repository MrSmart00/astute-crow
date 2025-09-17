// import { ConvexHttpClient } from "convex/browser"; // 将来の実装用
import { ZennPost } from "../types/zenn";

export class ConvexZennService {
  // 将来のConvex統合のため、現在はコメントアウト
  // private client: ConvexHttpClient;

  constructor() {
    // 開発段階ではConvexクライアントを初期化しない
    console.log('ConvexZennService initialized (development mode)');
  }

  /**
   * すべてのトレンド投稿を取得
   */
  async getTrendPosts(_forceRefresh: boolean = false): Promise<ZennPost[]> {
    try {
      // 開発段階ではフォールバックAPIを使用
      return await this.fallbackToDirectApi();
    } catch (error) {
      console.error('getTrendPosts error:', error);
      throw new Error('トレンドデータの取得に失敗しました');
    }
  }

  /**
   * 技術記事のトレンドを取得
   */
  async getTechTrends(): Promise<ZennPost[]> {
    try {
      return await this.fallbackToDirectApi();
    } catch (error) {
      console.error('getTechTrends error:', error);
      throw new Error('技術記事の取得に失敗しました');
    }
  }

  /**
   * アイデア記事のトレンドを取得
   */
  async getIdeaTrends(): Promise<ZennPost[]> {
    try {
      return await this.fallbackToDirectApi();
    } catch (error) {
      console.error('getIdeaTrends error:', error);
      throw new Error('アイデア記事の取得に失敗しました');
    }
  }

  /**
   * 本のトレンドを取得
   */
  async getBookTrends(): Promise<ZennPost[]> {
    try {
      return await this.fallbackToDirectApi();
    } catch (error) {
      console.error('getBookTrends error:', error);
      throw new Error('本の取得に失敗しました');
    }
  }

  /**
   * 手動でデータを更新
   */
  async refreshTrends(): Promise<ZennPost[]> {
    try {
      return await this.fallbackToDirectApi();
    } catch (error) {
      console.error('refreshTrends error:', error);
      throw new Error('データの更新に失敗しました');
    }
  }

  /**
   * キャッシュをクリア
   */
  async clearCache(): Promise<void> {
    console.log('キャッシュクリア（開発段階では何もしません）');
  }

  /**
   * フォールバック処理：Convexが利用できない場合の処理
   */
  private async fallbackToDirectApi(): Promise<ZennPost[]> {
    console.warn('Convex fallback: using direct API calls');

    try {
      const [techRes, ideaRes, bookRes] = await Promise.all([
        fetch('https://zenn-api.vercel.app/api/trendTech'),
        fetch('https://zenn-api.vercel.app/api/trendIdea'),
        fetch('https://zenn-api.vercel.app/api/trendBook')
      ]);

      const [techArticles, ideaArticles, books] = await Promise.all([
        techRes.ok ? techRes.json() : [],
        ideaRes.ok ? ideaRes.json() : [],
        bookRes.ok ? bookRes.json() : []
      ]);

      const allPosts: ZennPost[] = [
        ...techArticles.map((article: any) => ({
          ...article,
          postType: 'Article',
          articleType: 'tech'
        })),
        ...ideaArticles.map((article: any) => ({
          ...article,
          postType: 'Article',
          articleType: 'idea'
        })),
        ...books.map((book: any) => ({
          ...book,
          emoji: book.emoji || '📚',
          postType: 'Book',
          price: book.price || 0,
          isFree: book.isFree || book.price === 0,
          summary: book.summary || ''
        }))
      ];

      return allPosts;
    } catch (error) {
      console.error('Fallback API error:', error);
      throw error;
    }
  }
}
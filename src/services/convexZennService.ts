import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { ZennPost } from "../types/zenn";

type TrendsFilter = {
  forceRefresh?: boolean;
  postType?: "Article" | "Book";
  articleType?: "tech" | "idea";
};

export class ConvexZennService {
  private client: ConvexHttpClient | null = null;
  private initializationError: Error | null = null;

  constructor() {
    const convexUrl = import.meta.env.VITE_CONVEX_URL;

    if (!convexUrl) {
      const message = "VITE_CONVEX_URL が設定されていないため、Convex に接続できません";
      console.error(message);
      this.initializationError = new Error(message);
      return;
    }

    try {
      this.client = new ConvexHttpClient(convexUrl);
      console.info("Convex クライアントを初期化しました", { convexUrl });
    } catch (error) {
      console.error("Convex クライアントの初期化に失敗しました", error);
      this.initializationError = new Error("Convex クライアントの初期化に失敗しました");
      this.client = null;
    }
  }

  /**
   * すべてのトレンド投稿を取得
   */
  async getTrendPosts(forceRefresh: boolean = false): Promise<ZennPost[]> {
    return this.fetchFromConvex({ forceRefresh });
  }

  /**
   * 技術記事のトレンドを取得
   */
  async getTechTrends(): Promise<ZennPost[]> {
    return this.fetchFromConvex({ postType: "Article", articleType: "tech" });
  }

  /**
   * アイデア記事のトレンドを取得
   */
  async getIdeaTrends(): Promise<ZennPost[]> {
    return this.fetchFromConvex({ postType: "Article", articleType: "idea" });
  }

  /**
   * 本のトレンドを取得
   */
  async getBookTrends(): Promise<ZennPost[]> {
    return this.fetchFromConvex({ postType: "Book" });
  }

  /**
   * 手動でデータを更新
   */
  async refreshTrends(): Promise<ZennPost[]> {
    try {
      const client = this.ensureClient();
      const posts = await client.action(api.trends.refreshTrends, {});
      return posts as ZennPost[];
    } catch (error) {
      console.error("Convex refreshTrends アクションが失敗しました", error);
      throw new Error("Convex からトレンドを更新できませんでした");
    }
  }

  /**
   * キャッシュをクリア
   */
  async clearCache(): Promise<void> {
    try {
      const client = this.ensureClient();
      await client.mutation(api.trends.clearCache, {});
      console.info("Convex キャッシュをクリアしました");
    } catch (error) {
      console.error("Convex clearCache ミューテーションが失敗しました", error);
      throw new Error("Convex のキャッシュクリアに失敗しました");
    }
  }

  /**
   * Convex からの取得を共通化
   */
  private async fetchFromConvex(filter: TrendsFilter): Promise<ZennPost[]> {
    try {
      const client = this.ensureClient();
      const posts = await client.action(api.trends.getTrends, filter);
      return posts as ZennPost[];
    } catch (error) {
      console.error("Convex からのデータ取得に失敗しました", error);
      throw new Error("Convex からトレンドデータを取得できませんでした");
    }
  }

  private ensureClient(): ConvexHttpClient {
    if (this.client) {
      return this.client;
    }

    if (this.initializationError) {
      throw this.initializationError;
    }

    throw new Error("Convex クライアントが初期化されていません");
  }
}

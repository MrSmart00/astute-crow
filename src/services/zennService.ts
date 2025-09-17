import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { ZennArticle } from "../types/zenn";

type TrendsFilter = {
  forceRefresh?: boolean;
  articleType?: "tech" | "idea";
};

export class ZennService {
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
   * すべてのトレンド記事を取得
   */
  async getTrendArticles(forceRefresh: boolean = false): Promise<ZennArticle[]> {
    return this.fetchFromConvex({ forceRefresh });
  }

  /**
   * 技術記事のトレンドを取得
   */
  async getTechTrends(): Promise<ZennArticle[]> {
    return this.fetchFromConvex({ articleType: "tech" });
  }

  /**
   * アイデア記事のトレンドを取得
   */
  async getIdeaTrends(): Promise<ZennArticle[]> {
    return this.fetchFromConvex({ articleType: "idea" });
  }

  /**
   * 手動でデータを更新
   */
  async refreshTrends(): Promise<ZennArticle[]> {
    try {
      const client = this.ensureClient();
      const articles = await client.action(api.trends.refreshTrends, {});
      return articles as ZennArticle[];
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
  private async fetchFromConvex(filter: TrendsFilter): Promise<ZennArticle[]> {
    try {
      const client = this.ensureClient();
      const articles = await client.action(api.trends.getTrends, filter);
      return articles as ZennArticle[];
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

import { action, query, mutation } from "./_generated/server";
import { v } from "convex/values";

const CACHE_DURATION = 5 * 60 * 1000; // 5分

// メイン関数：トレンドデータを取得または更新
export const getTrends = action({
  args: {
    forceRefresh: v.optional(v.boolean()),
    postType: v.optional(v.union(v.literal("Article"), v.literal("Book"))),
    articleType: v.optional(v.union(v.literal("tech"), v.literal("idea"))),
  },
  handler: async (ctx, args) => {
    const cacheKey = `trends_${args.postType || 'all'}_${args.articleType || 'all'}`;
    const now = Date.now();

    // キャッシュ確認
    if (!args.forceRefresh) {
      const cacheInfo = await ctx.runQuery("zennData:getCacheInfo", { cacheKey });
      if (cacheInfo && cacheInfo.isValid && cacheInfo.expiresAt > now) {
        // キャッシュが有効な場合、DB からデータを取得
        return await ctx.runQuery("zennData:getTrendPosts", {
          postType: args.postType,
          articleType: args.articleType,
        });
      }
    }

    // 新しいデータを取得してDBを更新
    const freshData = await ctx.runAction("zennApi:fetchAllTrends", {});

    // データをDBに保存
    await ctx.runMutation("trends:syncPostsToDatabase", { posts: freshData });

    // キャッシュ情報を更新
    await ctx.runMutation("zennData:updateCacheInfo", {
      cacheKey,
      expiresAt: now + CACHE_DURATION,
    });

    // フィルタされたデータを返す
    return await ctx.runQuery("zennData:getTrendPosts", {
      postType: args.postType,
      articleType: args.articleType,
    });
  },
});

// データベースに投稿データを同期
export const syncPostsToDatabase = mutation({
  args: {
    posts: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    for (const post of args.posts) {
      // ユーザーを作成または取得
      const userId = await ctx.runMutation("zennData:upsertUser", {
        username: post.user.username,
        name: post.user.name,
        avatarSmallUrl: post.user.avatarSmallUrl,
      });

      // 投稿を作成または更新
      await ctx.runMutation("zennData:upsertPost", {
        externalId: post.id,
        title: post.title,
        slug: post.slug,
        likedCount: post.likedCount,
        publishedAt: post.publishedAt,
        emoji: post.emoji,
        postType: post.postType,
        articleType: post.articleType,
        price: post.price,
        isFree: post.isFree,
        summary: post.summary,
        userId,
      });
    }
  },
});

// すべてのトレンドを取得（フロントエンド用）
export const getAllTrends = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.runQuery("zennData:getTrendPosts", {});
  },
});

// 技術記事のトレンドを取得
export const getTechTrends = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.runQuery("zennData:getTrendPosts", {
      postType: "Article",
      articleType: "tech",
    });
  },
});

// アイデア記事のトレンドを取得
export const getIdeaTrends = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.runQuery("zennData:getTrendPosts", {
      postType: "Article",
      articleType: "idea",
    });
  },
});

// 本のトレンドを取得
export const getBookTrends = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.runQuery("zennData:getTrendPosts", {
      postType: "Book",
    });
  },
});

// 手動でデータを更新
export const refreshTrends = action({
  args: {},
  handler: async (ctx) => {
    return await ctx.runAction("trends:getTrends", { forceRefresh: true });
  },
});

// キャッシュをクリア
export const clearCache = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.runMutation("zennData:clearAllCache", {});
  },
});
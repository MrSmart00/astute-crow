import { action, query, mutation, type ActionCtx } from "./_generated/server";
import { v } from "convex/values";

const CACHE_DURATION = 5 * 60 * 1000; // 5分

type TrendsArgs = {
  forceRefresh?: boolean;
  postType?: "Article" | "Book";
  articleType?: "tech" | "idea";
};

type TrendsResult = Promise<any[]>;

const getTrendsHandler = async (ctx: ActionCtx, args: TrendsArgs): TrendsResult => {
  const cacheKey = `trends_${args.postType || "all"}_${args.articleType || "all"}`;
  const now = Date.now();

  if (!args.forceRefresh) {
    const cacheInfo = await ctx.runQuery("zennData:getCacheInfo" as any, { cacheKey });
    if (cacheInfo && cacheInfo.isValid && cacheInfo.expiresAt > now) {
      return await ctx.runQuery("zennData:getTrendPosts" as any, {
        postType: args.postType,
        articleType: args.articleType,
      });
    }
  }

  const freshData = await ctx.runAction("zennApi:fetchAllTrends" as any, {});

  await ctx.runMutation("trends:syncPostsToDatabase" as any, { posts: freshData });

  await ctx.runMutation("zennData:updateCacheInfo" as any, {
    cacheKey,
    expiresAt: now + CACHE_DURATION,
  });

  return await ctx.runQuery("zennData:getTrendPosts" as any, {
    postType: args.postType,
    articleType: args.articleType,
  });
};

// メイン関数：トレンドデータを取得または更新
export const getTrends = action({
  args: {
    forceRefresh: v.optional(v.boolean()),
    postType: v.optional(v.union(v.literal("Article"), v.literal("Book"))),
    articleType: v.optional(v.union(v.literal("tech"), v.literal("idea"))),
  },
  handler: getTrendsHandler,
});

// データベースに投稿データを同期
export const syncPostsToDatabase = mutation({
  args: {
    posts: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    for (const post of args.posts) {
      const userId = await ctx.runMutation("zennData:upsertUser" as any, {
        username: post.user.username,
        name: post.user.name,
        avatarSmallUrl: post.user.avatarSmallUrl,
      });

      await ctx.runMutation("zennData:upsertPost" as any, {
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
    return await ctx.runQuery("zennData:getTrendPosts" as any, {});
  },
});

// 技術記事のトレンドを取得
export const getTechTrends = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.runQuery("zennData:getTrendPosts" as any, {
      postType: "Article",
      articleType: "tech",
    });
  },
});

// アイデア記事のトレンドを取得
export const getIdeaTrends = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.runQuery("zennData:getTrendPosts" as any, {
      postType: "Article",
      articleType: "idea",
    });
  },
});

// 本のトレンドを取得
export const getBookTrends = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.runQuery("zennData:getTrendPosts" as any, {
      postType: "Book",
    });
  },
});

// 手動でデータを更新
export const refreshTrends = action({
  args: {},
  handler: async (ctx) => getTrendsHandler(ctx, { forceRefresh: true }),
});

// キャッシュをクリア
export const clearCache = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.runMutation("zennData:clearAllCache" as any, {});
  },
});

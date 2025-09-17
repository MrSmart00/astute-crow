import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ユーザーを作成または取得
export const upsertUser = mutation({
  args: {
    username: v.string(),
    name: v.string(),
    avatarSmallUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // 既存ユーザーを検索
    const existingUser = await ctx.db
      .query("zennUsers")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (existingUser) {
      // ユーザー情報を更新
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        avatarSmallUrl: args.avatarSmallUrl,
      });
      return existingUser._id;
    } else {
      // 新規ユーザーを作成
      return await ctx.db.insert("zennUsers", args);
    }
  },
});

// 記事を作成または更新
export const upsertPost = mutation({
  args: {
    externalId: v.string(),
    title: v.string(),
    slug: v.string(),
    likedCount: v.number(),
    publishedAt: v.string(),
    emoji: v.string(),
    postType: v.literal("Article"),
    articleType: v.union(v.literal("tech"), v.literal("idea")),
    userId: v.id("zennUsers"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // 既存投稿を検索
    const existingPost = await ctx.db
      .query("zennPosts")
      .withIndex("by_external_id", (q) => q.eq("externalId", args.externalId))
      .first();

    if (existingPost) {
      // 投稿を更新
      await ctx.db.patch(existingPost._id, {
        ...args,
        updatedAt: now,
      });
      return existingPost._id;
    } else {
      // 新規投稿を作成
      return await ctx.db.insert("zennPosts", {
        ...args,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// トレンド記事を取得（ライク数順）
export const getTrendPosts = query({
  args: {
    limit: v.optional(v.number()),
    articleType: v.optional(v.union(v.literal("tech"), v.literal("idea"))),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    let postsQuery = ctx.db.query("zennPosts").withIndex("by_likes");

    // 記事タイプでフィルタ
    if (args.articleType) {
      postsQuery = postsQuery.filter((q) => q.eq(q.field("articleType"), args.articleType));
    }

    const posts = await postsQuery.order("desc").take(limit);

    // ユーザー情報を結合
    const postsWithUsers = await Promise.all(
      posts.map(async (post) => {
        const user = await ctx.db.get(post.userId);
        return {
          id: post.externalId,
          title: post.title,
          slug: post.slug,
          likedCount: post.likedCount,
          publishedAt: post.publishedAt,
          emoji: post.emoji,
          postType: post.postType,
          articleType: post.articleType,
          user: user ? {
            username: user.username,
            name: user.name,
            avatarSmallUrl: user.avatarSmallUrl,
          } : null,
        };
      })
    );

    return postsWithUsers.filter(post => post.user !== null);
  },
});

// キャッシュ情報を管理
export const updateCacheInfo = mutation({
  args: {
    cacheKey: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const existing = await ctx.db
      .query("trendCache")
      .withIndex("by_cache_key", (q) => q.eq("cacheKey", args.cacheKey))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        expiresAt: args.expiresAt,
        lastFetched: now,
        isValid: true,
      });
    } else {
      await ctx.db.insert("trendCache", {
        cacheKey: args.cacheKey,
        expiresAt: args.expiresAt,
        lastFetched: now,
        isValid: true,
      });
    }
  },
});

export const getCacheInfo = query({
  args: {
    cacheKey: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trendCache")
      .withIndex("by_cache_key", (q) => q.eq("cacheKey", args.cacheKey))
      .first();
  },
});

export const clearAllCache = mutation({
  args: {},
  handler: async (ctx) => {
    const allCache = await ctx.db.query("trendCache").collect();
    await Promise.all(
      allCache.map(cache => ctx.db.patch(cache._id, { isValid: false }))
    );
  },
});
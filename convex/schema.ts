import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Zennユーザー情報
  zennUsers: defineTable({
    username: v.string(),
    name: v.string(),
    avatarSmallUrl: v.string(),
  }).index("by_username", ["username"]),

  // Zenn記事データ
  zennPosts: defineTable({
    externalId: v.string(), // ZennのAPI上のID
    title: v.string(),
    slug: v.string(),
    likedCount: v.number(),
    publishedAt: v.string(),
    emoji: v.string(),
    postType: v.literal("Article"),

    // 記事のタイプ
    articleType: v.union(v.literal("tech"), v.literal("idea")),

    // ユーザー情報への参照
    userId: v.id("zennUsers"),

    // メタデータ
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_external_id", ["externalId"])
    .index("by_article_type", ["articleType"])
    .index("by_likes", ["likedCount"])
    .index("by_published", ["publishedAt"]),

  // トレンドデータのキャッシュ情報
  trendCache: defineTable({
    cacheKey: v.string(), // "trends_all", "trends_tech", "trends_idea", "trends_books"
    expiresAt: v.number(),
    lastFetched: v.number(),
    isValid: v.boolean(),
  }).index("by_cache_key", ["cacheKey"]),
});
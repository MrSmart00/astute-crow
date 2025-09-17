import { action } from "./_generated/server";
import { v } from "convex/values";

// Zenn APIからデータを取得するアクション関数
export const fetchTechArticles = action({
  args: {},
  handler: async () => {
    const response = await fetch('https://zenn-api.vercel.app/api/trendTech');
    if (!response.ok) {
      throw new Error(`Tech API request failed: ${response.status}`);
    }
    const data: any[] = await response.json();
    return data.map(article => ({
      ...article,
      postType: 'Article' as const,
      articleType: 'tech' as const
    }));
  },
});

export const fetchIdeaArticles = action({
  args: {},
  handler: async () => {
    const response = await fetch('https://zenn-api.vercel.app/api/trendIdea');
    if (!response.ok) {
      throw new Error(`Idea API request failed: ${response.status}`);
    }
    const data: any[] = await response.json();
    return data.map(article => ({
      ...article,
      postType: 'Article' as const,
      articleType: 'idea' as const
    }));
  },
});

export const fetchBooks = action({
  args: {},
  handler: async () => {
    const response = await fetch('https://zenn-api.vercel.app/api/trendBook');
    if (!response.ok) {
      throw new Error(`Book API request failed: ${response.status}`);
    }
    const data: any[] = await response.json();
    return data.map(book => ({
      ...book,
      emoji: book.emoji || '📚',
      postType: 'Book' as const,
      price: book.price || 0,
      isFree: book.isFree || book.price === 0,
      summary: book.summary || ''
    }));
  },
});

export const fetchAllTrends = action({
  args: {},
  handler: async (ctx) => {
    const [techArticles, ideaArticles, books] = await Promise.all([
      ctx.runAction("zennApi:fetchTechArticles", {}),
      ctx.runAction("zennApi:fetchIdeaArticles", {}),
      ctx.runAction("zennApi:fetchBooks", {}),
    ]);

    return [...techArticles, ...ideaArticles, ...books];
  },
});
import { action } from "./_generated/server";

const fetchTechArticlesRaw = async () => {
  const response = await fetch("https://zenn-api.vercel.app/api/trendTech");
  if (!response.ok) {
    throw new Error(`Tech API request failed: ${response.status}`);
  }
  const data: any[] = await response.json();
  return data.map(article => ({
    ...article,
    id: String(article.id ?? article.slug ?? `tech-${Math.random().toString(36).slice(2)}`),
    postType: "Article" as const,
    articleType: "tech" as const
  }));
};

const fetchIdeaArticlesRaw = async () => {
  const response = await fetch("https://zenn-api.vercel.app/api/trendIdea");
  if (!response.ok) {
    throw new Error(`Idea API request failed: ${response.status}`);
  }
  const data: any[] = await response.json();
  return data.map(article => ({
    ...article,
    id: String(article.id ?? article.slug ?? `idea-${Math.random().toString(36).slice(2)}`),
    postType: "Article" as const,
    articleType: "idea" as const
  }));
};


// Zenn APIからデータを取得するアクション関数
export const fetchTechArticles = action({
  args: {},
  handler: fetchTechArticlesRaw,
});

export const fetchIdeaArticles = action({
  args: {},
  handler: fetchIdeaArticlesRaw,
});


export const fetchAllTrends = action({
  args: {},
  handler: async () => {
    const [techArticles, ideaArticles] = await Promise.all([
      fetchTechArticlesRaw(),
      fetchIdeaArticlesRaw(),
    ]);

    return [...techArticles, ...ideaArticles];
  },
});

import { action } from "./_generated/server";
import { internal } from "./_generated/api";

interface RssArticle {
  id: string;
  title: string;
  link: string;
  description: string;
  author: string;
  pubDate: string;
  thumbnail: string | null;
}

interface RssArticleWithMetadata extends RssArticle {
  ogImage: string | null;
  avatarUrl: string | null;
  siteName: string;
}

// RSSから記事情報を取得し、メタデータで補完
export const fetchRssArticles = action({
  args: {},
  handler: async (ctx): Promise<{
    articles: RssArticleWithMetadata[];
    totalCount: number;
    fetchedAt: string;
  }> => {
    try {
      // Zenn RSSフィードを取得
      const rssResponse = await fetch("https://zenn.dev/feed");
      if (!rssResponse.ok) {
        throw new Error(`RSS fetch failed: ${rssResponse.status}`);
      }

      const rssText = await rssResponse.text();

      // RSS記事を解析
      const articles = parseRssArticles(rssText);

      // 各記事のメタデータを並列で取得（最初の10件のみ）
      const articlesWithMetadata: RssArticleWithMetadata[] = await Promise.all(
        articles.slice(0, 10).map(async (article): Promise<RssArticleWithMetadata> => {
          try {
            const metadata: any = await ctx.runAction(internal.metadataFetcher.fetchMetadataInternal, {
              url: article.link,
            });

            return {
              ...article,
              ogImage: metadata.ogp?.image || null,
              avatarUrl: metadata.meta?.['zenn:image'] || null,
              siteName: metadata.ogp?.site_name || 'Zenn',
            };
          } catch (error) {
            console.error(`Failed to fetch metadata for ${article.link}:`, error);
            // メタデータ取得に失敗してもRSS情報は保持
            return {
              ...article,
              ogImage: null,
              avatarUrl: null,
              siteName: 'Zenn',
            };
          }
        })
      );

      return {
        articles: articlesWithMetadata,
        totalCount: articles.length,
        fetchedAt: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Error fetching RSS articles:', error);
      throw new Error(`RSS fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// RSS記事の高速取得（メタデータなし）
export const fetchRssArticlesRaw = action({
  args: {},
  handler: async (): Promise<{
    articles: RssArticleWithMetadata[];
    totalCount: number;
    fetchedAt: string;
  }> => {
    try {
      const rssResponse = await fetch("https://zenn.dev/feed");
      if (!rssResponse.ok) {
        throw new Error(`RSS fetch failed: ${rssResponse.status}`);
      }

      const rssText = await rssResponse.text();
      const articles = parseRssArticles(rssText);

      return {
        articles: articles.map(article => ({
          ...article,
          ogImage: null,
          avatarUrl: null,
          siteName: 'Zenn',
        })),
        totalCount: articles.length,
        fetchedAt: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Error fetching RSS articles:', error);
      throw new Error(`RSS fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// RSSテキストを解析して記事リストを生成
function parseRssArticles(rssText: string): RssArticle[] {
  const articles: RssArticle[] = [];

  // item要素を全て抽出
  const itemMatches = rssText.match(/<item>[\s\S]*?<\/item>/g);

  if (!itemMatches) {
    return articles;
  }

  for (const itemText of itemMatches) {
    try {
      const article = parseRssItem(itemText);
      if (article) {
        articles.push(article);
      }
    } catch (error) {
      console.error('Error parsing RSS item:', error);
      // 個別記事の解析エラーは無視して続行
    }
  }

  return articles;
}

// 個別のRSSアイテムを解析
function parseRssItem(itemText: string): RssArticle | null {
  const extractText = (tag: string) => {
    const match = itemText.match(new RegExp(`<${tag}([^>]*)>([^<]*)<\/${tag}>`, 'i'));
    return match ? match[2].trim() : '';
  };

  const extractCData = (tag: string) => {
    const match = itemText.match(new RegExp(`<${tag}([^>]*)><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${tag}>`, 'i'));
    if (match) {
      return match[2].trim();
    }
    return extractText(tag);
  };

  const title = extractCData('title');
  const link = extractText('link');
  const guid = extractText('guid');

  if (!title || !link) {
    return null;
  }

  return {
    id: guid || link,
    title,
    link,
    description: extractCData('description'),
    author: extractText('dc:creator'),
    pubDate: extractText('pubDate'),
    // enclosureからサムネイル画像を取得
    thumbnail: extractThumbnailFromEnclosure(itemText),
  };
}

// enclosureタグからサムネイル画像URLを抽出
function extractThumbnailFromEnclosure(itemText: string): string | null {
  const enclosureMatch = itemText.match(/<enclosure[^>]*url="([^"]*)"[^>]*\/>/i);
  return enclosureMatch ? enclosureMatch[1] : null;
}
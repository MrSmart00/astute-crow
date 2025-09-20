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
      // Qiita RSSフィードを取得
      const rssResponse = await fetch("https://qiita.com/popular-items/feed");
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
              avatarUrl: metadata.meta?.['qiita:user_image'] || null,
              siteName: metadata.ogp?.site_name || 'Qiita',
            };
          } catch (error) {
            console.error(`Failed to fetch metadata for ${article.link}:`, error);
            // メタデータ取得に失敗してもRSS情報は保持
            return {
              ...article,
              ogImage: null,
              avatarUrl: null,
              siteName: 'Qiita',
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
      const rssResponse = await fetch("https://qiita.com/popular-items/feed");
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
          siteName: 'Qiita',
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

// フィードテキストを解析して記事リストを生成（RSS/Atom自動判定）
function parseRssArticles(feedText: string): RssArticle[] {
  // Atom形式の場合
  if (feedText.includes('<entry>')) {
    return parseAtomArticles(feedText);
  }
  // RSS形式の場合
  if (feedText.includes('<item>')) {
    return parseRssItems(feedText);
  }
  return [];
}

// RSS形式の記事を解析
function parseRssItems(rssText: string): RssArticle[] {
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

// Atom形式の記事を解析
function parseAtomArticles(atomText: string): RssArticle[] {
  const articles: RssArticle[] = [];

  // entry要素を全て抽出（Atom形式）
  const entryMatches = atomText.match(/<entry>[\s\S]*?<\/entry>/g);

  if (!entryMatches) {
    return articles;
  }

  for (const entryText of entryMatches) {
    try {
      const article = parseAtomEntry(entryText);
      if (article) {
        articles.push(article);
      }
    } catch (error) {
      console.error('Error parsing Atom entry:', error);
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

// 個別のAtomエントリを解析
function parseAtomEntry(entryText: string): RssArticle | null {
  const extractText = (text: string, tag: string) => {
    const match = text.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'i'));
    return match ? match[1].trim() : '';
  };

  const title = extractText(entryText, 'title');
  const link = extractAtomLink(entryText);
  const id = extractText(entryText, 'id');
  const published = extractText(entryText, 'published');
  const content = extractText(entryText, 'content');
  const authorName = extractAuthorName(entryText);

  if (!title || !link) {
    return null;
  }

  return {
    id: id || link,
    title,
    link,
    description: content || '',
    author: authorName || 'Unknown',
    pubDate: published || '',
    thumbnail: null
  };
}

// Atomのlink要素からhref属性を抽出
function extractAtomLink(entryText: string): string {
  const linkMatch = entryText.match(/<link[^>]*rel="alternate"[^>]*href="([^"]*)"[^>]*\/?>/i);
  return linkMatch ? linkMatch[1] : '';
}

// author/name要素から著者名を抽出
function extractAuthorName(entryText: string): string {
  const authorMatch = entryText.match(/<author>\s*<name>([^<]*)<\/name>\s*<\/author>/i);
  return authorMatch ? authorMatch[1].trim() : '';
}

// enclosureタグからサムネイル画像URLを抽出（RSS用）
function extractThumbnailFromEnclosure(itemText: string): string | null {
  const enclosureMatch = itemText.match(/<enclosure[^>]*url="([^"]*)"[^>]*\/>/i);
  return enclosureMatch ? enclosureMatch[1] : null;
}
import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// URLからメタデータを取得する（外部用）
export const fetchMetadata = action({
  args: {
    url: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.runAction(internal.metadataFetcher.fetchMetadataInternal, args);
  },
});

// HTML属性を解析するヘルパー関数
function parseAttributes(attributeString: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrPattern = /(\w+)(?:="([^"]*)")?/g;
  let match;

  while ((match = attrPattern.exec(attributeString)) !== null) {
    const [, name, value] = match;
    attrs[name.toLowerCase()] = value || '';
  }

  return attrs;
}

// 内部用のメタデータ取得関数
export const fetchMetadataInternal = internalAction({
  args: {
    url: v.string(),
  },
  handler: async (_, args): Promise<any> => {
    try {
      // HTMLを取得
      const response = await fetch(args.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const html = await response.text();

      // メタタグを抽出する正規表現パターン
      const metaTagPattern = /<meta\s+([^>]*?)>/gi;
      const linkTagPattern = /<link\s+([^>]*?)>/gi;
      const titlePattern = /<title>([^<]*)<\/title>/i;

      const metadata: Record<string, any> = {
        url: args.url,
        fetchedAt: new Date().toISOString(),
        meta: {},
        ogp: {},
        twitter: {},
        other: {},
        links: [],
      };

      // titleタグを取得
      const titleMatch = html.match(titlePattern);
      if (titleMatch) {
        metadata.title = titleMatch[1].trim();
      }

      // メタタグを解析
      let match;
      while ((match = metaTagPattern.exec(html)) !== null) {
        const attributes = parseAttributes(match[1]);

        // OGPタグ
        if (attributes.property?.startsWith('og:')) {
          const key = attributes.property.replace('og:', '');
          metadata.ogp[key] = attributes.content || '';
        }
        // Twitterカード
        else if (attributes.name?.startsWith('twitter:')) {
          const key = attributes.name.replace('twitter:', '');
          metadata.twitter[key] = attributes.content || '';
        }
        // 一般的なメタタグ
        else if (attributes.name) {
          metadata.meta[attributes.name] = attributes.content || '';
        }
        // その他のメタタグ
        else if (attributes.property) {
          metadata.other[attributes.property] = attributes.content || '';
        }
      }

      // linkタグを解析（canonical, RSS feedなど）
      while ((match = linkTagPattern.exec(html)) !== null) {
        const attributes = parseAttributes(match[1]);
        if (attributes.rel && attributes.href) {
          metadata.links.push({
            rel: attributes.rel,
            href: attributes.href,
            type: attributes.type,
            title: attributes.title,
          });
        }
      }

      // 構造化データ（JSON-LD）を探す
      const jsonLdPattern = /<script\s+type="application\/ld\+json"[^>]*>([^<]+)<\/script>/gi;
      const jsonLdMatches = [];
      while ((match = jsonLdPattern.exec(html)) !== null) {
        try {
          const jsonData = JSON.parse(match[1].trim());
          jsonLdMatches.push(jsonData);
        } catch (e) {
          // JSON解析エラーは無視
        }
      }
      if (jsonLdMatches.length > 0) {
        metadata.jsonLd = jsonLdMatches;
      }

      return metadata;

    } catch (error) {
      console.error('Error fetching metadata:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        url: args.url,
        fetchedAt: new Date().toISOString(),
      };
    }
  },
});

// Zenn記事のサンプルURLでメタデータを検証
export const verifyZennMetadata = action({
  args: {},
  handler: async (ctx): Promise<any> => {
    // Zennの最新記事を取得してテスト
    const rssResponse = await fetch("https://zenn.dev/feed");
    const rssText = await rssResponse.text();

    // item要素内のlinkタグを抽出（最初のitemの中のlink）
    const itemMatch = rssText.match(/<item>[\s\S]*?<\/item>/);
    if (!itemMatch) {
      return { error: "No item found in RSS feed" };
    }

    const linkMatch = itemMatch[0].match(/<link>([^<]+)<\/link>/);
    if (!linkMatch || !linkMatch[1]) {
      return { error: "No article URL found in RSS item" };
    }

    const articleUrl = linkMatch[1];
    console.log('Verifying metadata for article:', articleUrl);

    // メタデータを取得（内部アクションを使用）
    const metadata = await ctx.runAction(internal.metadataFetcher.fetchMetadataInternal, {
      url: articleUrl,
    });

    return {
      articleUrl,
      metadata,
      summary: {
        hasOGP: Object.keys(metadata.ogp || {}).length > 0,
        hasTwitterCard: Object.keys(metadata.twitter || {}).length > 0,
        hasJsonLd: !!metadata.jsonLd,
        metaTagsCount: Object.keys(metadata.meta || {}).length,
        linksCount: metadata.links?.length || 0,
      }
    };
  },
});
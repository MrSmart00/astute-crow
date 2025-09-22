# Zenn RSS フィード統合実装計画

## 概要
既存のZenn Trend APIと並行して、Zenn RSSフィード（https://zenn.dev/feed）からコンテンツを取得し、OGPメタデータを追加取得してリッチなコンテンツ表示を実現する。

## 現在の実装状況

### 既存のアーキテクチャ
- **バックエンド**: Convex を使用
  - `convex/zennApi.ts`: Zenn Trend API からデータ取得
  - Tech記事とIdea記事の取得機能
- **フロントエンド**: TypeScript + Vite
  - `src/components/ZennTrends.ts`: トレンド表示コンポーネント
  - `src/services/zennService.ts`: APIサービス層
  - キャッシュ管理機能実装済み

## 実装計画

### 1. バックエンド実装（Convex）

#### 1.1 新規ファイル作成

**convex/rssZennApi.ts**
```typescript
// RSS フィードからのデータ取得と処理
- RSS フィードのフェッチとパース
- 各記事URLからOGPメタデータの取得
- データの整形と返却
```

#### 1.2 スキーマ定義の拡張

**convex/schema.ts**
```typescript
// RSS記事用のテーブル定義
rssArticles: defineTable({
  id: v.string(),
  title: v.string(),
  description: v.string(),
  link: v.string(),
  author: v.string(),
  pubDate: v.string(),
  thumbnail: v.optional(v.string()),
  ogpData: v.optional(v.object({
    title: v.string(),
    description: v.string(),
    image: v.string(),
    siteName: v.string(),
  })),
  fetchedAt: v.string(),
})
```

### 2. フロントエンド実装

#### 2.1 型定義の拡張

**src/types/zenn.ts**
```typescript
export interface ZennRssArticle {
  id: string;
  title: string;
  description: string;
  link: string;
  author: string;
  pubDate: string;
  thumbnail?: string;
  ogpData?: {
    title: string;
    description: string;
    image: string;
    siteName: string;
  };
}

export interface ZennRssFeedResponse {
  articles: ZennRssArticle[];
  lastBuildDate: string;
}
```

#### 2.2 新規コンポーネント作成

**src/components/ZennRssFeed.ts**
- 既存の`ZennTrends`コンポーネントと同様の設計パターン
- OGPデータを活用したリッチカード表示
- スケルトンローディング
- エラーハンドリング
- 自動更新機能

#### 2.3 サービス層の追加

**src/services/rssZennService.ts**
- Convex APIとの通信
- キャッシュ管理（既存実装と同様）
- エラーハンドリング

#### 2.4 メインファイルの更新

**src/main.ts**
```typescript
// 新しいセクションの追加
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="container">
    <section id="zenn-trends"></section>
    <section id="zenn-rss-feed"></section> <!-- 新規追加 -->
  </div>
`

// コンポーネントの初期化
const zennRssFeed = new ZennRssFeed('zenn-rss-feed');
zennRssFeed.init().catch(console.error);
```

### 3. 技術的考慮事項

#### 3.1 CORS制約への対応
- RSS フィードとOGPデータの取得はバックエンド（Convex）で実行
- フロントエンドは処理済みデータを受け取るのみ

#### 3.2 パフォーマンス最適化
- OGPデータの取得は非同期・並列処理
- キャッシュ戦略：
  - RSS フィード: 5分間隔
  - OGPデータ: 1時間キャッシュ
- ページネーション対応

#### 3.3 エラーハンドリング
- RSS フィード取得失敗時のフォールバック
- OGPデータ取得失敗時は基本情報のみ表示
- ユーザーへの適切なエラーメッセージ表示

### 4. UI/UX設計

#### 4.1 表示レイアウト
- 既存のトレンドセクションの下に新セクション追加
- カード型レイアウトでOGP画像を活用
- レスポンシブデザイン対応

#### 4.2 インタラクション
- 無限スクロール or ページネーション
- リフレッシュボタン
- 記事クリックで新規タブで開く

### 5. 実装順序

1. **Phase 1: バックエンド基盤**
   - Convex API実装（RSS取得のみ）
   - 基本的なデータ構造の定義

2. **Phase 2: フロントエンド基本実装**
   - 型定義とサービス層
   - 基本的な表示コンポーネント

3. **Phase 3: OGP機能追加**
   - OGPメタデータ取得機能
   - リッチカード表示

4. **Phase 4: 最適化**
   - キャッシュ実装
   - パフォーマンス改善
   - エラーハンドリング強化

### 6. 必要な依存関係

検討中の追加パッケージ：
- RSSパーサー: `rss-parser` or カスタム実装
- OGPパーサー: `open-graph-scraper` or カスタム実装

※Convex環境での動作確認が必要

### 7. テスト計画

- RSS フィード取得のユニットテスト
- OGPデータ取得のモックテスト
- コンポーネントの表示テスト
- エラーケースのテスト

## 今後の拡張可能性

- Qiita RSS フィードの統合
- X (Twitter) API連携
- 統合ダッシュボード機能
- フィルタリング・検索機能
- お気に入り機能
- 記事の既読管理
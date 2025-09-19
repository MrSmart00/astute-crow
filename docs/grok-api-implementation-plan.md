# Grok API Tech トレンド機能追加計画

## 概要

Grok APIを使用してTechトレンドを取得する機能を astute-crow プロジェクトに追加します。
Convex連携は不要で、独立したサービスとして実装します。

## 現在のコードベース構造

- **メインエントリーポイント**: `src/main.ts`
- **既存コンポーネント**: `src/components/ZennTrends.ts` (Zennトレンド表示)
- **既存サービス**: `src/services/zennService.ts` (Convex連携)
- **型定義**: `src/types/zenn.ts`
- **スタイル**: `src/style.css`

## 実装計画

### 1. Grok API サービスの作成

**ファイル**: `src/services/grokService.ts`

#### 主要機能
- Grok APIとの通信管理
- APIキー管理（環境変数 `VITE_GROK_API_KEY`）
- レート制限対応
- エラーハンドリング
- ローカルキャッシュ機能（localStorage使用）

#### 実装メソッド
```typescript
class GrokService {
  async getTechTrends(): Promise<GrokTrend[]>
  async refreshTrends(): Promise<GrokTrend[]>
  clearCache(): void
  private handleApiError(error: any): void
  private getCachedData(): GrokTrend[] | null
  private setCachedData(data: GrokTrend[]): void
}
```

### 2. 型定義の追加

**ファイル**: `src/types/grok.ts`

#### 定義する型
```typescript
interface GrokTrend {
  id: string
  title: string
  description: string
  url: string
  category: string
  score: number
  publishedAt: string
  source: string
}

interface GrokTrendsResponse {
  trends: GrokTrend[]
  metadata: {
    totalCount: number
    lastUpdated: string
  }
}

interface GrokTrendsState {
  trends: GrokTrend[]
  loading: LoadingState
  error: ErrorState | null
  lastUpdated: string | null
}
```

### 3. Grokトレンドコンポーネントの作成

**ファイル**: `src/components/GrokTrends.ts`

#### 設計方針
- ZennTrendsコンポーネントと同様の構造
- 状態管理（loading, error, success）
- カード形式でのトレンド表示
- 手動更新機能

#### 主要メソッド
```typescript
class GrokTrends {
  init(): Promise<void>
  loadTrends(): Promise<void>
  refresh(): Promise<void>
  render(): void
  private createTrendCard(trend: GrokTrend): string
  private createLoadingState(): string
  private createErrorState(): string
}
```

### 4. メインファイルの更新

**ファイル**: `src/main.ts`

#### 変更内容
- HTMLテンプレートに新しいセクション追加
- GrokTrendsコンポーネントの初期化
- 既存のZennTrendsと並行表示

```typescript
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="container">
    <section id="zenn-trends"></section>
    <section id="grok-trends"></section>
  </div>
`

// コンポーネント初期化
const zennTrends = new ZennTrends('zenn-trends');
const grokTrends = new GrokTrends('grok-trends');

Promise.all([
  zennTrends.init(),
  grokTrends.init()
]).catch(console.error);
```

### 5. スタイルの調整

**ファイル**: `src/style.css`

#### 追加内容
- Grokトレンド用のスタイル
- 共通カードスタイルのリファクタリング
- セクション間のマージン調整
- レスポンシブデザイン対応

### 6. 環境変数の設定

#### 新規ファイル
- `.env.example`: 設定例の追加

#### 内容
```
# Grok API
VITE_GROK_API_KEY=your_grok_api_key_here

# Convex (existing)
VITE_CONVEX_URL=your_convex_url_here
```

## 実装詳細

### API エンドポイント
- Grok APIの具体的なエンドポイントURL（要確認）
- 認証方法（APIキー、Bearer token等）
- レスポンス形式の詳細

### エラーハンドリング戦略
1. **ネットワークエラー**: リトライ機能付き
2. **APIエラー**: 適切なエラーメッセージ表示
3. **認証エラー**: 設定確認メッセージ
4. **レート制限**: 自動的な遅延処理

### キャッシュ戦略
- **保存場所**: localStorage
- **有効期限**: 30分
- **キャッシュクリア**: 手動更新時

### セキュリティ考慮事項
- APIキーの安全な管理
- HTTPS通信の確保
- XSS対策（HTMLエスケープ）

## 開発フェーズ

### Phase 1: 基本実装
1. GrokService の作成
2. 型定義の追加
3. 基本的なAPI通信テスト

### Phase 2: UI実装
1. GrokTrendsコンポーネントの作成
2. メインファイルの更新
3. 基本スタイルの適用

### Phase 3: 機能強化
1. エラーハンドリングの充実
2. キャッシュ機能の実装
3. UI/UX の改善

### Phase 4: 最終調整
1. スタイルの最適化
2. パフォーマンステスト
3. エラーケースのテスト

## 注意事項

- Convex連携は実装しない（要件通り）
- Grok APIのドキュメント確認が必要
- APIキーの取得方法の確認が必要
- レート制限の詳細確認が必要

## 今後の拡張可能性

- フィルタリング機能（カテゴリ別）
- ソート機能（スコア順、日付順）
- 詳細表示モーダル
- お気に入り機能
- エクスポート機能
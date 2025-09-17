<p align="center">
  <img width="500" alt="ChatGPT Image 2025年9月18日 01_00_12" src="https://github.com/user-attachments/assets/8520303b-c4c9-4748-a921-e15f58c6d1dc" />
</p>


TypeScript + Vite を使用したモダンな Web アプリケーションです。Zenn のトレンド記事を表示し、リアルタイムで更新される技術記事とアイデア記事を閲覧できます。Convex をバックエンドとして使用し、記事データのキャッシュや永続化を実現しています。

## 🚀 特徴

- ⚡ **Vite**: 高速な開発サーバーとビルドツール
- 🎯 **TypeScript**: 型安全な JavaScript 開発
- 🎨 **モダンCSS**: CSS Variables、Grid、Flexbox を使用したレスポンシブデザイン
- 🌙 **ダークテーマ**: 目に優しいダークモードUI
- 📈 **Convex バックエンド連携**: Convex による記事トレンドデータの取得・キャッシュ・永続化
- 🌐 **フォールバックAPI**: Convex が利用できない環境でも Zenn 非公式 API 経由でデータを取得

## 📋 必要な環境

- Node.js 18.0.0 以上
- npm または yarn
- Convex アカウント（バックエンドを稼働させる場合）

## 🛠️ セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/MrSmart00/astute-crow.git
cd astute-crow

# 依存関係をインストール
npm install

# Convex の型定義を生成（初回のみ）
npm run convex:codegen

# .env.local を作成して Convex の URL を設定
cat <<'EOF' > .env.local
VITE_CONVEX_URL=https://your-project.convex.cloud
EOF
# 既存の .env.local がある場合は上書きしないよう注意し、URL を自身のものに変更してください

# 開発サーバーを起動
npm run dev
```

Convex の開発サーバーをローカルで起動する場合は別ターミナルで以下を実行します。

```bash
npm run convex:dev
```

## 📱 使用方法

開発サーバーを起動すると、自動的にブラウザが開きます。ポートが使用中の場合は、利用可能なポート（通常は3001など）で起動します。Convex が利用可能であれば Convex 経由で記事データを取得し、利用できない場合は自動的に Zenn API にフォールバックします。

## 🔧 利用可能なコマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | プロダクション用ビルドを作成 |
| `npm run preview` | ビルド結果をプレビュー |
| `npm run convex:dev` | Convex の開発サーバー（ローカル）を起動 |
| `npm run convex:codegen` | Convex の型定義を生成 |

## 📁 プロジェクト構造

```
├── src/
│   ├── main.ts              # エントリーポイント
│   ├── style.css            # スタイルシート
│   ├── components/
│   │   └── ZennTrends.ts    # Zennトレンド表示コンポーネント
│   ├── services/
│   │   └── zennService.ts   # Convex統合とフォールバック機能
│   └── types/
│       └── zenn.ts          # Zenn関連の型定義
├── convex/                  # Convex 関連のサーバーコード
│   ├── schema.ts            # Convex データモデル
│   ├── trends.ts            # トレンド取得アクション/クエリ
│   ├── zennApi.ts           # Zenn 非公式API呼び出しアクション
│   └── zennData.ts          # DB とのやり取り（クエリ/ミューテーション）
├── index.html               # HTMLテンプレート
├── tsconfig.json            # TypeScript設定
├── vite.config.ts           # Vite設定
├── convex.json              # Convex CLI 設定
├── .env.local               # Convex URL などの環境変数（各自作成、Git未追跡）
└── package.json             # パッケージ設定
```

## 🚧 開発状況

### 完成済み
- TypeScript + Vite の開発環境
- ダークテーマ対応のモダンUI
- Convex バックエンドとの統合とフォールバックロジック
- Zenn 記事トレンド表示機能（Tech/Idea記事対応）
- Convex による記事データのキャッシュと永続化
- リアルタイム記事表示とスケルトン UI

### 開発中
- UI/UX の改善とレスポンシブ対応の強化

### 今後の予定
- Qiita トレンド表示機能
- X（Twitter）反応データ連携
- 総合スコア算出とランキング表示
- 前日のトレンド動向表示

## 🏗️ 技術スタック

- **TypeScript 5.9+**: 型安全性とモダンな開発体験
- **Vite 7.1+**: 高速なバンドラーと開発ツール
- **Convex 1.27+**: サーバーレスなリアルタイムバックエンド
- **ES2020**: モダンな JavaScript 機能
- **CSS3**: フレキシブルレイアウトとアニメーション

## 🔗 外部API

本プロジェクトでは以下の非公式APIを使用しています：
- **Zenn Trend API** - [kaisugi/zenn-trend-api](https://github.com/kaisugi/zenn-trend-api)
  - Zennのトレンド記事（Tech/Idea）をJSON形式で取得する非公式API
  - 技術記事エンドポイント: `https://zenn-api.vercel.app/api/trendTech`
  - アイデア記事エンドポイント: `https://zenn-api.vercel.app/api/trendIdea`

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルをご確認ください。

## 👨‍💻 作者

**Hiroya Hinomori** - [@MrSmart00](https://github.com/MrSmart00)

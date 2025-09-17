# Astute Crow

TypeScript + Vite を使用したモダンな Web アプリケーションです。現在は Hello World をベースとしつつ、Zenn トレンド表示機能の開発を進めています。Convex をバックエンドとして導入し、トレンドデータのキャッシュや永続化に対応しました。

## 🚀 特徴

- ⚡ **Vite**: 高速な開発サーバーとビルドツール
- 🎯 **TypeScript**: 型安全な JavaScript 開発
- 🎨 **モダンCSS**: CSS Variables、Grid、Flexbox を使用したレスポンシブデザイン
- 🌙 **ダークテーマ**: 目に優しいダークモードUI
- 📈 **Convex バックエンド連携**: Convex によるトレンドデータの取得・キャッシュ・永続化
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

開発サーバーを起動すると、自動的にブラウザが開きます。ポートが使用中の場合は、利用可能なポート（通常は3001など）で起動します。Convex が利用可能であれば Convex 経由で、利用できない場合は自動的に Zenn API にフォールバックします。

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
│   │   ├── convexZennService.ts # Convex 連携とフォールバックロジック
│   │   └── zennService.ts       # フォールバックAPI用サービス（開発検証用）
│   └── types/
│       └── zenn.ts          # Zenn関連の型定義
├── convex/                  # Convex 関連のサーバーコード
│   ├── schema.ts            # Convex データモデル
│   ├── trends.ts            # トレンド取得アクション/クエリ
│   ├── zennApi.ts           # Zenn 非公式API呼び出しアクション
│   └── zennData.ts          # DB とのやり取り（クエリ/ミューテーション）
├── backend/                 # バックエンド用ディレクトリ（将来の拡張予定）
├── frontend/                # フロントエンド用ディレクトリ（将来の拡張予定）
├── index.html               # HTMLテンプレート
├── tsconfig.json            # TypeScript設定
├── vite.config.ts           # Vite設定
├── convex.json              # Convex CLI 設定
├── .env.local               # Convex URL などの環境変数（各自作成、Git未追跡）
└── package.json             # パッケージ設定
```

## 🚧 開発状況

### 完成済み
- Hello World アプリケーションのベース
- TypeScript + Vite の開発環境
- ダークテーマ対応のモダンUI
- Convex バックエンドとの統合とフォールバックロジック

### 開発中
- Zenn トレンド表示機能
- Zenn API からの記事情報取得

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
  - Zennのトレンド記事をJSON形式で取得する非公式API
  - エンドポイント: `https://zenn-api.vercel.app/api/`

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルをご確認ください。

## 👨‍💻 作者

**Hiroya Hinomori** - [@MrSmart00](https://github.com/MrSmart00)

# Astute Crow

TypeScript + Vite を使用したモダンな Web アプリケーションです。現在は Hello World をベースとしつつ、Zenn トレンド表示機能の開発を進めています。

## 🚀 特徴

- ⚡ **Vite**: 高速な開発サーバーとビルドツール
- 🎯 **TypeScript**: 型安全な JavaScript 開発
- 🎨 **モダンCSS**: CSS Variables、Grid、Flexbox を使用したレスポンシブデザイン
- 🌙 **ダークテーマ**: 目に優しいダークモードUI
- 📈 **Zennトレンド表示**: [非公式API](https://github.com/kaisugi/zenn-trend-api)を利用したZennの人気記事情報の取得・表示（開発中）

## 📋 必要な環境

- Node.js 18.0.0 以上
- npm または yarn

## 🛠️ セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/MrSmart00/astute-crow.git
cd astute-crow

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

## 📱 使用方法

開発サーバーを起動すると、自動的にブラウザが開きます。ポートが使用中の場合は、利用可能なポート（通常は3001など）で起動します。

## 🔧 利用可能なコマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | プロダクション用ビルドを作成 |
| `npm run preview` | ビルド結果をプレビュー |

## 📁 プロジェクト構造

```
├── src/
│   ├── main.ts              # エントリーポイント
│   ├── style.css            # スタイルシート
│   ├── components/
│   │   └── ZennTrends.ts    # Zennトレンド表示コンポーネント
│   ├── services/
│   │   └── zennService.ts   # Zenn API連携サービス
│   └── types/
│       └── zenn.ts          # Zenn関連の型定義
├── frontend/                # フロントエンド用ディレクトリ（将来の拡張予定）
├── backend/                 # バックエンド用ディレクトリ（将来の拡張予定）
├── index.html               # HTMLテンプレート
├── tsconfig.json            # TypeScript設定
├── vite.config.ts           # Vite設定
└── package.json             # パッケージ設定
```

## 🚧 開発状況

### 完成済み
- Hello World アプリケーションのベース
- TypeScript + Vite の開発環境
- ダークテーマ対応のモダンUI

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
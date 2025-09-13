# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 言語設定

**重要**: このリポジトリで作業する際は、すべてのチャットレスポンスを日本語で行ってください。

## プロジェクト概要

これは Hiroya Hinomori による astute-crow プロジェクトです。TypeScript + Vite を使用した Hello World Web アプリケーションです。

## 技術スタック

- **TypeScript**: 型安全な JavaScript 開発
- **Vite**: 高速な開発サーバーとビルドツール
- **CSS**: モダンなスタイリング（CSS Variables、Grid、Flexbox）

## 開発コマンド

### 主要コマンド
- `npm run dev`: 開発サーバーを起動（localhost:3000で自動的にブラウザが開きます）
- `npm run build`: プロダクション用ビルドを作成
- `npm run preview`: ビルドしたファイルのプレビューサーバーを起動

### その他のコマンド
- `npm install`: 依存関係をインストール
- `tsc`: TypeScript の型チェックのみ実行

## プロジェクト構造

```
├── src/
│   ├── main.ts          # エントリーポイント（Hello World の実装）
│   └── style.css        # スタイルシート
├── index.html           # HTMLテンプレート
├── tsconfig.json        # TypeScript設定
├── vite.config.ts       # Vite設定
└── package.json         # パッケージ設定と依存関係
```

## アーキテクチャ

- **エントリーポイント**: `src/main.ts` が HTML の `#app` 要素に Hello World コンテンツを動的に挿入
- **スタイリング**: CSS Variables を使用したダークテーマ、レスポンシブデザイン対応
- **ビルド**: TypeScript コンパイル後に Vite でバンドル、ES2020 ターゲット
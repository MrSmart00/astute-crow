# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 言語設定

**重要**: このリポジトリで作業する際は、すべてのチャットレスポンスを日本語で行ってください。

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

## 設計原則

### SOLID原則
- **Single Responsibility（単一責任）**: 1つのクラス/関数は1つの責任のみを持つ
- **Open/Closed（開放閉鎖）**: 拡張に対して開いており、修正に対して閉じている
- **Liskov Substitution（リスコフの置換）**: 派生型は基底型と置換可能である
- **Interface Segregation（インターフェース分離）**: 不要なインターフェースへの依存を避ける
- **Dependency Inversion（依存関係逆転）**: 抽象に依存し、具象に依存しない

### その他の重要原則
- **YAGNI** (You Aren't Gonna Need It): 必要になるまで実装しない - 推測による機能追加を避ける
- **KISS** (Keep It Simple, Stupid): シンプルに保つ - 複雑さを避け、理解しやすいコードを書く
- **DRY** (Don't Repeat Yourself): 重複を避ける - 同じロジックを複数箇所に書かない

### リファクタリング指針
- **レガシーコード対策**: 古い実装を発見したら積極的にリファクタリングまたは削除
- **技術移行の完全性**: 新技術導入時は既存コードの移行を完全に行い、古い実装を残さない
- **一元化**: データ取得、キャッシュ管理、状態管理などは可能な限り一元化する
- **命名の一貫性**: 同様の機能には一貫した命名規則を適用する

### 避けるべきパターン
- レガシーコードと新実装の並存（例: `zennService.ts`と`convexZennService.ts`の同時存在）
- 同じ責任を持つ複数のサービスクラス
- 未使用のインポートや関数の放置
- モックデータの本番コードへの混在
# CROSS連携ギャラリーサービス 実装ブリーフ

## 目的

CROSSで生成したクロスステッチ図案JSONを投稿・共有できる匿名ギャラリーサービスを作る。

ユーザーはCROSSから出力したJSONをアップロードし、タイトル・作者表示名・コメントなどを入力して、公開用の図案ページを作成できる。アカウント登録は不要とし、投稿後に発行される管理URLで編集・削除できるようにする。

## 前提

- CROSS本体とは別プロジェクトとして実装する。
- フロントエンドはSvelteKitを想定する。
- UIコンポーネント・デザイン基盤には `ccl-svelte-kit` を使う。
- サイトデザインはCROSSを踏襲する。
- CROSS側のJSON出力は `ccl-cross-pattern` v1形式。

補足: 現行CROSSでは `cclkit4svelte` を使っている。新プロジェクトで指定パッケージ名が `ccl-svelte-kit` と異なる場合は、実際に利用可能なCCL系Svelte UIライブラリ名を確認して導入すること。

## CROSS JSON v1

CROSSから出力されるJSONは以下の形式。

```json
{
  "format": "ccl-cross-pattern",
  "version": "1.0",
  "createdAt": "2026-05-07T04:30:00.000Z",
  "generator": {
    "name": "CROSS",
    "url": "https://ccl-cross.netlify.app/"
  },
  "pattern": {
    "width": 50,
    "height": 50,
    "brand": "DMC",
    "cells": [
      ["310", "321", "321"],
      ["310", "310", "321"]
    ]
  },
  "palette": [
    {
      "code": "310",
      "name": "Black",
      "rgb": "#000000",
      "count": 120,
      "symbol": "A"
    }
  ],
  "settings": {
    "maxColors": 30,
    "symbolColorMode": "color"
  }
}
```

### バリデーション方針

- `format` は `ccl-cross-pattern` のみ受け付ける。
- `version` はまず `1.0` のみ受け付ける。
- `pattern.width` と `pattern.height` は正の整数。
- `pattern.cells.length` は `pattern.height` と一致する。
- 各行の長さは `pattern.width` と一致する。
- `pattern.cells` 内の色コードは `palette[].code` に存在する必要がある。
- `palette[].rgb` は `#RRGGBB` 形式を基本とする。
- 過大な図案を避けるため、初期MVPでは上限を設ける。例: 最大200 x 200。

## MVP機能

1. JSONアップロード
2. JSONバリデーション
3. 図案プレビュー
4. 使用糸一覧表示
5. 投稿フォーム
6. 公開ページ生成
7. 新着一覧ページ
8. 管理URLによる編集・削除

## 投稿フォーム

必須項目:

- タイトル
- CROSS JSON

任意項目:

- 作者表示名
- コメント
- 完成画像または参考画像
- 公開範囲

公開範囲:

- `public`: ギャラリー一覧に表示する
- `unlisted`: URLを知っている人だけ閲覧できる

## URL設計

```text
/                  トップ・新着ギャラリー
/new               投稿作成
/p/[slug]          公開ページ
/p/[slug]/edit     管理URL経由の編集ページ
```

管理URL例:

```text
https://example.com/p/abc123/edit?key=secret-token
```

管理URLは投稿完了画面で一度明確に表示する。アカウントがないため、管理URLを失くすと編集・削除できない前提にする。

## データモデル案

```ts
type GalleryPattern = {
  id: string;
  slug: string;
  title: string;
  authorName?: string;
  comment?: string;
  crossJson: ExportedPatternJson;
  previewImageUrl?: string;
  editTokenHash: string;
  visibility: 'public' | 'unlisted';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};
```

### 注意

- `editToken` はDBに平文保存しない。保存するのはハッシュのみ。
- 公開ページでは `editTokenHash` を絶対に返さない。
- CROSS JSONは原本として保存する。
- 表示高速化が必要になったら、`width`, `height`, `brand`, `palette` などを別カラムに冗長化する。

## 画面要件

### トップ

- CROSS連携ギャラリーであることが分かる説明
- 投稿ボタン
- 新着図案カード一覧
- 各カードにタイトル、作者表示名、ブランド、サイズ、使用色数を表示

### 投稿作成

- JSONファイル選択
- 読み込み後に図案プレビューを表示
- 使用糸一覧を表示
- タイトル、作者表示名、コメント、公開範囲を入力
- 投稿前プレビュー

### 公開ページ

- タイトル
- 作者表示名
- コメント
- 図案プレビュー
- 使用糸一覧
- CROSSで作成されたことの表示
- 元JSONのダウンロード

### 編集ページ

- 管理キーが正しい場合のみ表示
- タイトル、作者表示名、コメント、公開範囲を編集
- 削除操作
- JSON自体の差し替えはMVPでは不要。必要なら後続対応。

## デザイン方針

CROSS本体の雰囲気を踏襲する。

- メインカラーはメロングリーン系を使う。
- ロゴ、ヘッダー、フッター、ボタンの雰囲気はCROSSに寄せる。
- 図案を主役にするため、背景は白基調で余白を広めに取る。
- ギャラリーカードは軽い影と角丸を使い、手芸・クラフト感のある柔らかい印象にする。
- スマホでも閲覧しやすいように、図案プレビューは横スクロールまたは縮小表示に対応する。

`ccl-svelte-kit` のコンポーネントを優先して使うこと。独自CSSは必要な範囲に限定し、CROSSと同じサービス群に見える統一感を優先する。

## 図案プレビュー方針

MVPではSVGやCanvasではなく、まずCSS Gridで表示してよい。

- `pattern.width` を列数にする。
- 各セルの背景色は `palette` の `rgb` を使う。
- セルサイズは画面幅に応じて調整する。
- 大きい図案では描画負荷が高くなるため、200 x 200程度を初期上限とする。

後続で必要なら以下を検討する。

- Canvas描画
- SVG生成
- サムネイル画像のサーバー生成
- 10マス区切り線
- 記号付き表示

## スパム・安全対策

MVPでも最低限以下を入れる。

- 投稿JSONサイズ制限
- 図案サイズ制限
- 画像アップロードを許す場合は容量・形式制限
- honeypotフィールド
- 投稿頻度制限
- 通報リンク
- 管理URLなしでは編集・削除不可

## 実装優先順位

1. SvelteKitプロジェクト作成
2. `ccl-svelte-kit` 導入
3. CROSS JSON v1の型定義とバリデーション
4. JSONアップロードとプレビュー
5. 投稿データ保存
6. 公開ページ
7. 新着一覧
8. 管理URL発行
9. 編集・削除
10. 画像アップロードや通報などの追加機能

## 新プロジェクト側Codexへの指示例

```text
このプロジェクトはCROSS連携の匿名図案ギャラリーです。
docs/gallery-service-brief.md の仕様に従って実装してください。
SvelteKitを使い、UIは ccl-svelte-kit を優先してください。
デザインはCROSS本体を踏襲し、メロングリーン基調、白背景、柔らかいカードUIにしてください。
まずはMVPとして、CROSS JSON v1のアップロード、バリデーション、図案プレビュー、投稿作成、公開ページ、新着一覧、管理URLでの編集・削除までを実装してください。
```

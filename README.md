# 栗原直行オフィシャルサイト

栗原直行さんのプロフィール、出演情報、お知らせ、活動実績などを掲載する公式サイトです。

## 公開URL

https://tomturner14.github.io/kurihara-naoyuki-official/

## 公開方式

- GitHub Pages
- 静的HTML / CSS / JavaScript
- Googleスプレッドシートから表示内容を読み込み

## 管理シート

以下のシートをCSV公開して、サイト側で読み込んでいます。

| シート名 | 用途 |
|---|---|
| site | サイトタイトル、トップ文言、コピーライト |
| profile | プロフィール |
| news | お知らせ |
| schedule | 出演・イベント情報 |
| contact | お問い合わせ |
| manual | 入力ルール説明 |
| _options | プルダウン候補 |

## 更新ルール

- `表示する` にチェックが入っている行だけサイトに表示する
- 未公開情報、個人連絡先、内部メモ、出演料、関係者限定URLは入力しない
- `site` シートの `設定キー` は変更しない
- `news`、`schedule`、`profile`、`contact` はスプレッドシートを編集すればサイトに反映される
- 反映まで数十秒〜数分かかる場合がある

## 開発メモ

- `index.html`：ページ構造
- `styles.css`：見た目
- `script.js`：GoogleスプレッドシートCSV読み込み処理

## キャッシュ対策

CSSやJSを更新した場合は、`index.html` 側の読み込みURLのバージョンを上げます。

例：

```html
<link rel="stylesheet" href="styles.css?v=20260616-4" />
<script src="script.js?v=20260616-6" defer></script>

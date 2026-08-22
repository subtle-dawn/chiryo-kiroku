# 治療記録

病気ごとの治療経過、通院、薬、検査、メモを時系列で記録する個人用Webアプリです。

記録したデータは、この端末のブラウザ内に保存されます。運営者のサーバーへ治療記録が送信されることはありません。

## 起動

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

## GitHub Pages

Vite の `base` は相対パスにしてあり、React Router は `HashRouter` を使っています。`dist` を GitHub Pages の公開対象にしてください。

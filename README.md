# blog-articles

ZennとQiitaの記事を管理するリポジトリです。

## 構成

- `articles/` - Zennの記事
- `public/` - Qiitaの記事
- `images/` - Zennで使用する画像

## 投稿方法

mainブランチにpushすると自動でZenn・Qiitaに反映されます。

## 記事の書き方

1. `source/` フォルダに `.md` ファイルを作成
2. frontmatterを独自フォーマットで記述
3. `git push origin main` で自動変換・投稿される

### frontmatterの例

```yaml
---
title: "記事タイトル"
emoji: "🎉"
type: "tech"
tags: ["Next.js", "React"]
zenn: true
qiita: true
private: false
---
```

### 投稿先の制御

| zenn  | qiita | 結果                           |
|-------|-------|--------------------------------|
| true  | true  | 両方に投稿                     |
| true  | false | Zennのみ                       |
| false | true  | Qiitaのみ                      |
| false | false | どちらにも投稿しない（下書き） |

# API Catalog for Morning Dashboard

学生が使いやすく、CORS制限や複雑な認証が少ないAPIのリストです。

## 1. 天気 (Weather)

- **OpenWeatherMap**: 定番。Current Weather APIは無料枠が広い。
- **Weather API (weatherapi.com)**: JSONが非常に見やすく、初心者向け。

## 2. ニュース (News)

- **NewsAPI**: 非常に強力だが、ローカル環境(localhost)以外からのリクエストには有料プランが必要な場合がある。
- **RSS to JSON**: NHKや各種ニュースサイトのRSSをJSONに変換して利用する手法を推奨。

## 3. モチベーション・占い (Quotes & Fortune)

- **Slip Advice API**: シンプルな格言が手に入る。
- **Ameba占い (非公式API等)**: 日本の学生には馴染み深いが、スクレイピングや非公式なものを扱う際は注意が必要。

## 4. 鉄道運行情報 (Railway)

- **公共交通オープンデータセンター**: 東京メトロやJR東日本の運行情報が取得可能（要登録）。

## 5. その他

- **Dog API / Cat API**: 朝から癒やされたい人向け。
- **Qiita API**: 技術系のニュースを表示したい人向け。

---

### 注意点

- **APIキーの管理**: `.env` ファイルを使い、`.gitignore` に含めることを徹底してください。
- **レート制限**: 短時間に何度もリクエストを送るとブロックされる可能性があるため、`useEffect` の依存配列には注意してください。

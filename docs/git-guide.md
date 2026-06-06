# Git & GitHub Team Workflow

このワークショップでは、以下のワークフローを推奨します。

## 1. ブランチ戦略
- `main`: 常に動く状態（本番用）。
- `develop`: 開発中の最新コード。
- `feature/xxx`: 各機能の開発用（例: `feature/weather`, `feature/todo`）。

## 2. 基本の流れ
1. `develop` から自分のブランチを作る: `git checkout -b feature/my-feature`
2. コードを書く & コミット: `git commit -m "add: weather icon"`
3. リモートに送る: `git push origin feature/my-feature`
4. GitHub上で `develop` に向けて **Pull Request** を作成。
5. チームメンバー1人以上にレビューしてもらい、LGTM（Looks Good To Me）をもらったらマージ。

## 3. コンフリクトが起きたら
同じファイルの同じ場所を2人が編集すると発生します。
- `git pull origin develop` をして、VS Codeの「競合を解決」エディタを使ってどちらを残すか選んでください。
- 怖がらずに、チームメイトと一緒に解決するのが一番の近道です。

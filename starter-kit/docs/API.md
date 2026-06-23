# ODPT API 実装ガイド（東西線）

このドキュメントは `api_init` ブランチで実装した **ODPT API 連携** をチームで共有・引き継ぐためのものです。

## 0. 前提：ODPTとは

**ODPT（公共交通オープンデータセンター）** は鉄道各社のオープンデータを配信するプラットフォームです。本アプリでは東京メトロ**東西線**の駅・運行情報・列車位置を取得しています。

- ベースURL: `https://api.odpt.org/api/v4`
- 認証: 各クエリに `acl:consumerKey` としてトークンを付与
- 公式ドキュメント: https://developer.odpt.org/

### セットアップ（各メンバー必須）

`.env` は Git 管理外なので、各自で用意します。

```bash
cd starter-kit
cp .env.example .env
# .env を開き、ODPTで取得した自分のトークンを VITE_ODPT_TOKEN に設定
```

トークンは https://developer.odpt.org/ で無料登録すると取得できます。Vite が `import.meta.env.VITE_ODPT_TOKEN` 経由で注入します（`VITE_` プレフィックス必須）。

---

## 1. レイヤー構成

実装は3層に分離されています。役割分担の理解がこのコードの肝です。

```
┌─────────────────────────────────────────────┐
│ UIコンポーネント                              │
│  stations.tsx / trainInformation.tsx          │  ← 描画のみ
└───────────────▲─────────────────────────────┘
                │ Reactフック（状態・自動更新・エラー処理）
┌───────────────┴─────────────────────────────┐
│ useOdpt.ts                                    │  ← useState/useEffect/setInterval
└───────────────▲─────────────────────────────┘
                │ async関数（fetch・型変換）
┌───────────────┴─────────────────────────────┐
│ odpt.ts                                       │  ← API通信・データ変換ロジック
└─────────────────────────────────────────────┘
```

| ファイル | 責務 | 中身 |
|---|---|---|
| `src/odpt.ts` | API通信・型変換（**React非依存・純粋関数**） | `fetchTozai*` 系の取得関数、ODPT→アプリ型への変換 |
| `src/useOdpt.ts` | Reactフック化（状態管理・周期更新・エラー処理） | `useTozai*` 系フック |
| `src/stations.tsx` / `src/trainInformation.tsx` | 描画 | フックを呼んで結果を表示 |

---

## 2. odpt.ts — API通信レイヤー

共通の fetch ヘルパー `getJson()` がトークン付与・URL組み立て・エラー化を一手に担います。各取得関数はこれを呼ぶだけです。

取得している4種類のODPTリソース：

| 関数 | ODPTリソース | 内容 | 備考 |
|---|---|---|---|
| `fetchTozaiStations` | `odpt:Railway` | 駅一覧（中野→西船橋順） | `index` から駅ナンバリング `T04` を生成 |
| `fetchTozaiTrainInformation` | `odpt:TrainInformation` | 運行情報（遅延・運転見合わせ等） | `status` が無ければ平常運転 |
| `fetchTozaiTrains` | `odpt:Train` | 列車の実位置 | ⚠️ 東京メトロは当キーで非公開 → 現状空配列 |
| `fetchTozaiTimetables` | `odpt:TrainTimetable` | 列車時刻表 | 実位置の代替として位置推定に使用 |

**設計のポイント：** ODPTのレスポンスは `odpt:trainInformationStatus` のようなコロン付きの冗長なキーを持ちます。これを各関数内で `OdptStation` / `OdptTrain` などのアプリ用シンプル型に変換してから返すので、UI側はODPTの内部仕様を知らずに済みます。

---

## 3. 目玉機能：時刻表ベースの列車位置「推定」

東京メトロは当APIキーでは `odpt:Train`（実際の列車位置）を公開していません。そこで **時刻表の各駅発車時刻と現在時刻を照合して、列車が今どこにいるかを推定** しています。これがこのブランチの一番の工夫です。

- `parseTimetable()`：時刻表を「0時起点の分」に変換。**日跨ぎ（23:58→00:03）を `+1440分` して単調増加に正規化**するのがポイント。
- `estimateTrainsFromTimetable()`：現在時刻が `駅A発車 ≤ 今 < 駅B発車` の区間にある列車を抽出し、**駅間の経過割合で線形補間**して連続的な位置 `idxA + f*(idxB-idxA)` を算出。
- `calendarForDate()`：`@holiday-jp/holiday_jp` で**日本の祝日も判定**し、平日/土休日ダイヤを切り替え。

推定した列車は `trains.tsx` で**破線枠＋「推定」ラベル**で表示し、実位置と視覚的に区別します（`source: 'timetable'`）。

---

## 4. useOdpt.ts — Reactフックレイヤー

すべてのフックが `AsyncState<T> = { data, loading, error }` という統一形を返すので、UI側のローディング/エラー処理が一貫します。

| フック | 更新間隔 | 設計意図 |
|---|---|---|
| `useTozaiStations` | マウント時1回 | 駅は変わらない |
| `useTozaiTrainInformation` | 60秒 | レート制限配慮 |
| `useTozaiTrains` | 20秒 | 位置は変化が速い |
| `useTozaiTimetables` | マウント時1回 | 時刻表は日中不変 |
| `useNowMinutes` | 15秒 | 推定位置の再計算トリガー |

**共通テクニック：**

- `let active = true` フラグ＋クリーンアップで**アンマウント後のstate更新を防止**。
- `setInterval` を `useEffect` 内で張り、クリーンアップで `clearInterval`。
- 自動更新中のエラーは `setState(prev => ...)` で**既存データを保持したままエラーだけ更新**。
- 時刻判定は `Intl.DateTimeFormat` の `Asia/Tokyo` で行い、**端末のタイムゾーンに依存しない**。

---

## 5. UI連携と3段フォールバック

`stations.tsx` の列車位置は **3段階で優雅に劣化** します：

```
① odpt:Train 実位置  →  ② 時刻表ベース推定  →  ③ モックデータ
（現状メトロは未提供）   （実質これが表示される）   （取得失敗時の最終手段）
```

```js
const shownTrains = realtimeTrains ?? estimatedTrains ?? fallbackTrains;
```

駅一覧も同様に、API取得前・失敗時はモックの3駅（高田馬場・早稲田・神楽坂）にフォールバックします。**APIが落ちても画面は壊れない**設計です。

運行情報パネル `trainInformation.tsx` は loading / error / 平常 / 異常 の4状態を出し分けています。

---

## 6. 引き継ぎチェックリスト

1. **各自トークン設定**：`starter-kit/.env` に `VITE_ODPT_TOKEN=自分のキー` を記入（ODPTで無料取得）。
2. **他路線への拡張**：`TOZAI_RAILWAY` 定数を変えれば横展開可能。`fetchTozai*` の汎用化が次の課題。
3. **位置はインデックス基準**：`position` は「全駅の連番（0.5 = 駅間中点）」。px は `stations.tsx` の `stationLeftPx()` で変換。
4. **メトロが実位置を公開し始めたら**：コード変更不要で ① が自動的に有効化される設計。

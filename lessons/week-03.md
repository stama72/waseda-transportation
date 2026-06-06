---
marp: true
theme: default
paginate: true
header: "Web Development Workshop: Week 03"
footer: "Morning Dashboard Project - API & useEffect"
---
<style>
section {
    background-color: #f8fafc;
    color: #334155;
    font-family: 'Inter', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Noto Sans JP', sans-serif;
}
h1, h2, h3 {
    color: #0ea5e9;
}
footer, header {
    color: #64748b;
    opacity: 0.8;
}
a {
    color: #0284c7;
}
code, pre {
    background-color: #1e293b !important;
    color: #e2e8f0 !important;
}
.box {
    border: 2px dashed #0ea5e9;
    padding: 10px;
    margin: 10px 0;
    border-radius: 8px;
    background: #e0f2fe;
}
.failure {
    border: 2px solid #ef4444;
    background: #fef2f2;
    padding: 10px;
    border-radius: 8px;
}
</style>

# 第3週: API通信と魔法のフック
## 〜 外の世界からデータを取ってくる 〜

<!-- 
【講師用台本】
第3週へようこそ！
先週は画面を綺麗な「箱（コンポーネント）」に分けました。しかし、今の箱の中身はダミーデータです。
今日は、いよいよ外の世界（API）から本物のデータを取ってきて、箱に流し込みます。
ここで立ちはだかるのが「非同期処理」と「無限ループの罠」です。
一歩間違えるとブラウザがフリーズするので、しっかりルールを学んでいきましょう！
-->

---

## 本日のメニュー

1. **APIとは？:** インターネット上の情報レストラン
2. **非同期処理:** カレーを作りながらサラダを作る
3. **失敗例:** 恐怖の無限ループ
4. **解決策:** 魔法のフック `useEffect`
5. **おもてなし:** ローディングとエラー処理
6. **実践タイム:** 自分のウィジェットに命を吹き込もう！

---

## 1. APIとは？（情報レストラン）

API（Application Programming Interface）は、インターネット上にある**「情報レストラン」**です。

<div class="box" style="font-family: monospace; line-height: 1.6;">
📱 <b>あなた (Client)</b><br>
&nbsp;│ ①「東京の天気を教えて！」(<b>Request</b>)<br>
&nbsp;▼<br>
💁‍♂️ <b>ウェイター (API)</b><br>
&nbsp;│ ② 厨房の巨大なデータベースを検索<br>
&nbsp;▼<br>
🍳 <b>厨房 (Server)</b><br>
&nbsp;│ ③「晴れ」のデータをJSONに調理<br>
&nbsp;▼<br>
💁‍♂️ <b>ウェイター (API)</b><br>
&nbsp;│ ④「晴れです」とお届け (<b>Response</b>)<br>
&nbsp;▼<br>
📱 <b>あなた (画面に表示)</b>
</div>

この注文をするためのJavaScriptの命令が **`fetch`** です。

---

## 2. 非同期処理とは？（フードコートの呼び出しベル）

APIに注文してからデータが届くまで、**「待ち時間」**が発生します。

- ❌ **同期処理（ダメな例）**:
  レジの前で立ち尽くして待つ。他の人は注文できず、お店の時間が止まる。（＝**画面がフリーズ！**）

- ⭕ **非同期処理（Reactの書き方）**:
  注文したら**「呼び出しベル（Promise）」**をもらって席に着く。
  待っている間は、お水を飲んだり会話したりする（＝**先に画面の枠だけ描画する**）。
  ベルが鳴ったら（`.then`）、料理（データ）を受け取る！

---

## 3. 恐怖の失敗例

「じゃあ、コンポーネントの中でAPIを呼んで、結果を `useState` に入れよう！」
...実はこれ、**絶対にやってはいけない書き方**です。

<div class="failure">

```tsx
function WeatherWidget() {
  const [temp, setTemp] = useState(0);

  // ❌ コンポーネントの中に直接fetchを書く
  fetch("https://api.weather.com/tokyo")
    .then(res => res.json()) // ベルが鳴ったら
    .then(data => {
      setTemp(data.temp);    // 👈 状態を更新！
    });

  return <p>{temp}度</p>;
}
```

</div>

---

## 3. なぜ無限ループするのか？（図解）

先週学んだルールのせいで、**「恐怖のデス・ループ」**が起きてしまいます。
**ルール：`useState` の値が更新されると、コンポーネントは再描画（上から再実行）される**

<div class="box">
🔄 <b>無限ループの仕組み</b><br><br>
1️⃣ 画面を描画<br>
 ⬇️<br>
2️⃣ fetch でデータ取得<br>
 ⬇️<br>
3️⃣ setTemp でデータを保存<br>
 ⬇️ （Stateが変わると...）<br>
4️⃣ React「値が変わった！画面を描き直さなきゃ！」👉 <b>1️⃣へ戻る</b><br>
 ⬇️<br>
5️⃣ 画面を描画（再）👉 そして再び fetch... 💣💥
</div>

※ 数秒で数千回APIを叩くことになり、API提供元から**アカウントをBAN**されます。

---

## 4. 解決策：魔法のフック `useEffect`

「最初に画面が表示された時だけ、1回だけAPIを呼びたい」。
それを叶えるのが **`useEffect`** です。

```tsx
import { useState, useEffect } from 'react';

function WeatherWidget() {
  const [temp, setTemp] = useState(0);

  // useEffect( やりたいこと, [いつやるか] )
  useEffect(() => {
    fetch("https://api.weather.com/tokyo")
      .then(res => res.json())
      .then(data => setTemp(data.temp));
  }, []); // 👈 この空の配列 [] が「最初の一回だけ」の呪文！

  return <p>{temp}度</p>;
}
```

---

## 4. 依存配列 `[]` を絶対に忘れないで！

`useEffect` の第2引数にある配列 `[]` を **「依存配列」** と呼びます。

- `[]` (空っぽ): **「最初の一回だけ」** 実行される。（データ取得によく使う）
- `[keyword]`: 変数 `keyword` の中身が**「変わった時だけ」** 実行される。（検索機能などに使う）
- **書き忘れる**: 毎回実行される（＝無限ループの恐怖再び）。

**★ APIを叩くときは、必ず `[]` がついているか指差し確認しましょう！**

---

## 5. おもてなし：ローディング表示

APIを待っている間、画面が真っ白だとユーザーは不安になります。「今データを取ってきているよ」と伝えるのがプロの仕事です。

```tsx
function WeatherWidget() {
  const [temp, setTemp] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // 👈 ローディング状態を追加

  useEffect(() => {
    fetch("...")
      .then(res => res.json())
      .then(data => {
        setTemp(data.temp);
        setIsLoading(false); // 👈 データが来たらローディング終了！
      });
  }, []);

  if (isLoading) {
    return <p className="text-slate-400 animate-pulse">読み込み中...</p>;
  }

  return <p>{temp}度</p>;
}
```

---

## 6. API実装レシピ集（CRUDとエラー処理）

ここからはコピペで使えるAPI通信の基本レシピです。

**レシピ1: データのリストを取得・表示する (GET)**
ニュースや予定のリストなど、複数のデータを配列で取得する場合の書き方です。
```tsx
const [items, setItems] = useState([]); // 👈 初期値は空の配列 [] にする！

useEffect(() => {
  fetch("https://api.example.com/items")
    .then(res => res.json())
    .then(data => setItems(data)); // 配列を丸ごと保存
}, []);

// 表示する時は map を使い、必ず key を設定する
return (
  <ul>
    {items.map(item => <li key={item.id}>{item.title}</li>)}
  </ul>
);
```

---

## 6. API実装レシピ集（続き）

**レシピ2: データを送信・追加する (POST)**
Todoリストの追加など、自分のデータをサーバーに送る書き方です。
（※これは `useEffect` ではなく、ボタンのクリックなどで実行します）

```tsx
const handleAdd = () => {
  const newTask = { title: "牛乳を買う" };
  
  fetch("https://api.example.com/tasks", {
    method: "POST", // 👈 送信を意味するメソッド
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTask) // 👈 JSのオブジェクトをJSON文字列に変換
  })
  .then(res => res.json())
  .then(data => console.log("保存完了！", data));
};
```

---

## 6. API実装レシピ集（エラーハンドリング）

**レシピ3: エラーから復活する (catch)**
APIが落ちていたり、スマホが圏外の時に画面を壊さないためのプロの作法です。

```tsx
const [error, setError] = useState(null);

useEffect(() => {
  fetch("https://api.example.com/data")
    .then(res => {
      if (!res.ok) throw new Error("データの取得に失敗しました");
      return res.json();
    })
    .then(data => setData(data))
    .catch(err => setError(err.message)); // 👈 エラーを捕まえて状態に保存
}, []);

// エラーが発生していたら、専用のメッセージを表示する
if (error) return <p className="text-red-500 font-bold">🚨 {error}</p>;
```

---

## 7. 実践タイム: 自分のウィジェットに命を吹き込もう

**今日のチームミッション：**

1. `docs/api-catalog.md` を開いて、使いたいAPIをチームで1つ選ぼう。
2. 選んだAPIのURLをコピーして、先週作ったウィジェットコンポーネントの中で `useEffect` を使って `fetch` してみよう。
3. `console.log` を使って、取得したデータがどんな形（JSON）をしているか「ブラウザの検証ツール（F12）」で確認しよう。
4. 取得したデータを `useState` に保存して、画面に表示させてみよう！

※ APIキーが必要な場合は、コードに直接書かずに `.env` ファイルを使います（講師に聞いてね）。

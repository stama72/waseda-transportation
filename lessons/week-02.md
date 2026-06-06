---
marp: true
theme: default
paginate: true
header: "Web Development Workshop: Week 02"
footer: "Morning Dashboard Project - React Basics & UI"
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

# 第2週: Reactの基礎とUI構築

## 〜 魔法の構文「JSX」と「状態管理」 〜

<!-- 
【講師用台本】
第2週へようこそ！
今週は、いよいよ本格的にReactのコードを触っていきます。
Reactは最初に覚えるべきルールがいくつかありますが、それを理解すればパズルのように楽しい開発が待っています。
今日は「フォルダ構成の意味」「React特有の書き方（JSX）」、そして初心者が一番つまずく「状態管理（useState）」について、図解や失敗例を交えてマスターしましょう。
-->

---

## 本日のメニュー

1. **全体像の把握:** フォルダ構成と `package.json`
2. **Reactの基本:** JSX（HTMLとJSの融合）
3. **部品化:** なぜコンポーネントに分けるのか？
4. **状態管理:** 普通の変数 vs `useState`
5. **データ渡し:** Propsの魔法
6. **実践タイム:** ウィジェットを分割・配置しよう！

---

## 1. 全体像の把握：プロジェクトの中身

スターターキットの中には様々なファイルがあります。まずは主要な登場人物の役割を覚えましょう。

* **`package.json`**: プロジェクトの「設計図」。必要なパッケージ（部品）のリストが書かれています。
* **`node_modules/`**: `npm install` でダウンロードされた、実際のパッケージ（部品の本体）が入る倉庫。**絶対に直接触らない・Gitに上げない（重すぎるため）**。
* **`src/`**: 皆さんがメインで開発作業を行う場所です。
  * **`main.tsx`**: アプリの心臓部。Reactを起動し、HTMLに合体させる場所。
  * **`App.tsx`**: アプリのメイン画面（大元のコンポーネント）。今日はここを解体していきます。

---

## 2. Reactの基本：JSXとは？

`App.tsx` を見ると、JavaScript（関数）の中に直接HTMLが書かれています。
これを **JSX (JavaScript XML)** と呼びます。

```tsx
function App() {
  // JavaScriptの世界
  const name = "WINC";
  const userAge = 20;

  return (
    // HTMLの世界 (JSX)
    <div>
      <h1>Hello, {name}!</h1>
      <p>年齢: {userAge * 2}歳（計算もできる！）</p>
    </div>
  );
}
```

**ポイント:** `{}` (波括弧) を使うと、HTMLの中でJavaScriptの変数や計算式を**直接埋め込む**ことができます。

---

## 3. なぜコンポーネントに分けるのか？

今の `App.tsx` は、1つのファイルにすべての画面要素が書かれています。

**問題点：**
* **読みにくい:** 数百行になると、どこに何があるか迷子になる。
* **再利用できない:** 別の場所で「同じボタン」を使いたい時にコピペになる。
* **チーム開発の敵:** 全員が同じ `App.tsx` を編集すると「Gitコンフリクト（競合）」が起きて開発が止まります。

**解決策 ＝ 画面を「小さなレゴブロック」に分割する（コンポーネント化）**

---

## 4. コンポーネントを作る鉄則

コンポーネントは、ただの「HTML（JSX）を返すJavaScriptの関数」です。

<div class="box">
  <strong>4つの鉄則:</strong><br>
  1. ファイル名は大文字から始める (Header.tsx)<br>
  2. 関数の名前も大文字から始める (function Header())<br>
  3. return で1つのまとまったタグを返す<br>
  4. 最後に export default で外に公開する
</div>

```tsx
// src/components/Header.tsx
export default function Header() {
  // ここに処理を書くよ
  return <header>Good Morning!</header>;
  // returnの中にDOMを書くよ
}
```

---

## 5. 普通の変数ではダメな理由（失敗例）

ここでクイズです。「ボタンを押したら数字が増える」機能を作ります。普通の変数で書くとどうなるでしょう？

<div class="failure">

```tsx
function Counter() {
  let count = 0; // 普通の変数

  const handleClick = () => {
    count = count + 1;
    console.log("現在の値:", count); // 裏側では増えているが...
  };

  return (
    <button onClick={handleClick}>
      Count: {count} {/* 画面は永遠に「0」のまま！ */}
    </button>
  );
}
```

</div>

**なぜ動かない？**
Reactは「変数の値が変わったこと」に気づけません。そのため、**画面の再描画（再レンダリング）が行われない**のです。

---

## 6. 状態管理：魔法の変数 `useState`

値の変更に合わせて**画面を更新**したいなら、React専用の **`useState` (ステート)** を使います。

```tsx
import { useState } from 'react';

function Counter() {
  // [現在の値, 値を更新する専用の関数] = useState(初期値)
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1); // 👈 専用関数を使うと...
  };

  return (
    // Reactが変更を検知して、自動で画面を再描画（再レンダリング）する！
    <button onClick={handleClick}>Count: {count}</button>
  );
}
```

---

## 7. データの受け渡し：Props

親（`App.tsx`）から子（`WeatherWidget.tsx`）へ、データを渡したい時は **Props** を使います。
HTMLの属性のように渡し、関数の引数として受け取ります。

**親（渡す側）**

```tsx
<WeatherWidget temp="24" condition="Sunny" />
```

**子（受け取る側）**

```tsx
type WeatherProps = {
  temp: string;
  condition: string;
};

export default function WeatherWidget({ temp, condition }: WeatherProps) {
  return <p>{temp}度 / {condition}</p>;
}
```

---

## 8. よく使うUIレシピ集（Tailwind CSS）

ここからはコピペで使える、現場でよく使うUI部品のレシピです。
自分のウィジェットを飾り付ける時の参考にしてください。

**レシピ1: 立体的なカード (Card)**
```tsx
<div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
  <h3 className="font-bold text-lg mb-2">タイトル</h3>
  <p className="text-slate-600">カードの中身です。</p>
</div>
```

---

## 8. よく使うUIレシピ集（続き）

**レシピ2: 綺麗なボタン (Button)**
```tsx
<button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
  クリック！
</button>
```

**レシピ3: タグ / バッジ (Badge)**
```tsx
<span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
  Important
</span>
```

---

## 9. 実践タイム: UIを解体・構築しよう

**今日のチームミッション：**

1. **フォルダの確認:** `package.json` と `src/` の中身をチームで確認しよう。
2. **コンポーネント分割:** `src/components/` の中に `WeatherWidget.tsx`, `NewsWidget.tsx`, `TaskWidget.tsx` を作り、`App.tsx` の巨大なコードから切り出そう。
3. **Propsの活用:** `App.tsx` にある現在時刻 (`time`) のステートを、新しく作った `Header.tsx` にPropsとして渡してみよう。
4. **デザイン調整:** 先ほどのレシピや Tailwind CSS を使って、自分たちのターゲットユーザーに合わせた色やレイアウトに変更しよう！

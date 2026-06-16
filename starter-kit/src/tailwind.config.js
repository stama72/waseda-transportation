/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 👇ここを追加（font-digital というクラス名を作ります）
      fontFamily: {
        digital: ['"DSDigital"', 'monospace'],
      },
    },
  },
  plugins: [],
}
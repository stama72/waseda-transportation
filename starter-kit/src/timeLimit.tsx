import { useState, useEffect } from 'react';

type TimeLimitProps = {
  /** 初期設定の秒数（テストしやすいように既定値を65秒にしています） */
  initialSeconds?: number;
};

// ゼロ埋め関数（5を "05" にする）
function pad(n: number): string {
  return Math.max(0, Math.floor(n)).toString().padStart(2, '0');
}

export default function TimeLimit({ initialSeconds = 2 * 60 }: TimeLimitProps) {
  // 時間の管理（ミリ秒）
  const [timeLeftMs, setTimeLeftMs] = useState<number>(initialSeconds * 1000);

  // タイマーのエンジン（0.01秒ごとに更新）
  useEffect(() => {
    if (timeLeftMs <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeftMs((prev) => prev - 10);
    }, 10);

    return () => clearInterval(timerId);
  }, [timeLeftMs]);

  // ① 1分（60,000ミリ秒）を切っているかどうかの判定
  const isUnderOneMinute = timeLeftMs < 60000;

  // 分・秒・ミリ秒の計算
  const minutes = Math.floor(timeLeftMs / 60000);
  const seconds = Math.floor((timeLeftMs % 60000) / 1000);
  const ms = Math.floor((timeLeftMs % 1000) / 10);

  // ② 表示する文字の切り替え
  // 1分未満なら「59.99」、1分以上なら「01:05」
  const display = isUnderOneMinute
    ? `${pad(seconds)}.${pad(ms)}`
    : `${pad(minutes)}:${pad(seconds)}`;

  // ③ ゴースト（背景）の切り替え
  // 実際の文字に合わせて、背景も「.」か「:」を切り替える
  const ghost = isUnderOneMinute ? '88.88' : '88:88';

  return (
    <div className="rounded-2xl bg-slate-900 px-6 py-5 text-center shadow-md">
      <p className="mb-1 text-sm font-medium tracking-widest text-slate-400">
        Time Limit
      </p>
      <div className="relative inline-block" style={{ fontFamily: 'DSDigital, monospace' }}>
        {/* ゴースト（背景） */}
        <span
          aria-hidden
          className="text-8xl font-bold tabular-nums tracking-wider text-slate-700/40"
        >
          {ghost}
        </span>
        {/* 実際の数値（赤色・発光） */}
        <span
          className="absolute inset-0 text-8xl font-bold tabular-nums tracking-wider text-red-500"
          style={{ textShadow: '0 0 12px rgba(255, 0, 0, 0.6)' }}
        >
          {display}
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        始業に間に合う最終電車まで
      </p>
    </div>
  );
}
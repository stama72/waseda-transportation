// 「Time Limit」のデジタル風カウントダウン表示。
// 始業に間に合う最終電車までの残り時間を MM:SS で表示する想定。
// ※ ロジック（実時間計算）は未実装。secondsLeft をそのまま表示するモック。

type TimeLimitProps = {
  /** 残り秒数（モック既定値: 33分） */
  secondsLeft?: number;
};

function pad(n: number): string {
  return Math.max(0, Math.floor(n)).toString().padStart(2, '0');
}

export default function TimeLimit({ secondsLeft = 33 * 60 }: TimeLimitProps) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const display = `${pad(minutes)}:${pad(seconds)}`;

  return (
    <div className="rounded-2xl bg-slate-900 px-6 py-5 text-center shadow-md">
      <p className="mb-1 text-sm font-medium tracking-widest text-slate-400">
        Time Limit
      </p>
      <div className="relative inline-block font-mono">
        {/* ゴースト（点灯していないセグメント風の背景） */}
        <span
          aria-hidden
          className="text-6xl font-bold tabular-nums tracking-wider text-slate-700/40"
        >
          88:88
        </span>
        {/* 実際の数値 */}
        <span
          className="absolute inset-0 text-6xl font-bold tabular-nums tracking-wider text-emerald-400"
          style={{ textShadow: '0 0 12px rgba(52, 211, 153, 0.6)' }}
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

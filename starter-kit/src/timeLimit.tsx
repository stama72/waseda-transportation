import { useState, useEffect } from 'react';

// ゼロ埋め関数
function pad(n: number): string {
  return Math.max(0, Math.floor(n)).toString().padStart(2, '0');
}

// 外から受け取るデータ（Props）の型を定義
type TimeLimitProps = {
  targetTime?: string | null; // 例: "08:15"
};

export default function TimeLimit({ targetTime }: TimeLimitProps) {
  const [timeLeftMs, setTimeLeftMs] = useState<number>(0);

  // タイマーのエンジン
  useEffect(() => {
    if (!targetTime) {
      setTimeLeftMs(0);
      return;
    }

    const [h, m] = targetTime.split(':').map(Number);
    const targetDate = new Date();
    targetDate.setHours(h, m, 0, 0);

    if (targetDate.getTime() < new Date().getTime() - 60000) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    const timerId = setInterval(() => {
      const now = new Date();
      let diff = targetDate.getTime() - now.getTime();
      if (diff < 0) diff = 0;
      setTimeLeftMs(diff);
    }, 10);

    return () => clearInterval(timerId);
  }, [targetTime]);

  const isOverOneHour = timeLeftMs >= 3600000;
  const isUnderOneMinute = timeLeftMs > 0 && timeLeftMs < 60000;

  const hours = Math.floor(timeLeftMs / 3600000);
  const minutesOnly = Math.floor((timeLeftMs % 3600000) / 60000);
  const totalMinutes = Math.floor(timeLeftMs / 60000);
  const seconds = Math.floor((timeLeftMs % 60000) / 1000);
  const ms = Math.floor((timeLeftMs % 1000) / 10);

  let displayStr = '';
  let ghostStr = '';

  if (!targetTime || timeLeftMs === 0) {
    displayStr = '00:00';
    ghostStr = '88:88';
  } else if (isOverOneHour) {
    displayStr = `${pad(hours)}:${pad(minutesOnly)}`;
    ghostStr = '88:88';
  } else if (isUnderOneMinute) {
    displayStr = `${pad(seconds)}.${pad(ms)}`;
    ghostStr = '88.88';
  } else {
    displayStr = `${pad(totalMinutes)}:${pad(seconds)}`;
    ghostStr = '88:88';
  }

  const renderDigits = (str: string, isGhost: boolean) => (
    <div
      aria-hidden={isGhost ? true : undefined}
      className={`flex justify-center text-8xl font-bold tracking-wider ${
        isGhost ? 'text-slate-700/40' : 'absolute inset-0 text-red-500'
      }`}
      style={!isGhost ? { textShadow: '0 0 12px rgba(255, 0, 0, 0.6)' } : undefined}
    >
      {str.split('').map((char, index) => {
        const isSeparator = char === ':' || char === '.';
        return (
          <span key={index} className={`inline-block text-center ${isSeparator ? 'w-[0.4ch]' : 'w-[1ch]'}`}>
            {char}
          </span>
        );
      })}
    </div>
  );

  return (
    <div className="rounded-2xl bg-slate-900 px-6 py-5 text-center shadow-md">
      
      
      <p className="mb-1 text-sm font-medium tracking-widest text-slate-400">
        Time Limit
      </p>
      
      <div className="relative inline-block" style={{ fontFamily: 'DSDigital, monospace' }}>
        {renderDigits(ghostStr, true)}
        {renderDigits(displayStr, false)}
      </div>
      
      {/* ついでに下のテキストも汎用的なものに変更しています */}
      <p className="mt-3 text-xs text-slate-400">
        出発までの残り時間
      </p>
    </div>
  );
}
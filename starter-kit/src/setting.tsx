import { useState } from 'react';
import { stations } from './stations';

// 設定画面。最寄り駅・方面・始業時間などを設定するモック。
// ※ 入力値はローカルstateで保持するだけ。保存処理やバリデーションは未実装。

export default function Setting() {
  const [nearestStation, setNearestStation] = useState('t03');
  const [direction, setDirection] = useState('nishifunabashi');
  const [startTime, setStartTime] = useState('09:00');
  const [walkMinutes, setWalkMinutes] = useState('10');
  const [notify, setNotify] = useState(true);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-bold text-slate-900">設定</h1>
        <p className="text-sm text-slate-500">通勤・通学の条件を登録します</p>
      </header>

      <div className="divide-y divide-slate-100 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        {/* 最寄り駅 */}
        <label className="flex items-center justify-between gap-3 p-4">
          <span className="text-sm font-medium text-slate-700">最寄り駅</span>
          <select
            value={nearestStation}
            onChange={(e) => setNearestStation(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-900"
          >
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}（{s.code}）
              </option>
            ))}
          </select>
        </label>

        {/* 方面 */}
        <label className="flex items-center justify-between gap-3 p-4">
          <span className="text-sm font-medium text-slate-700">方面</span>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-900"
          >
            <option value="nishifunabashi">西船橋方面</option>
            <option value="nakano">中野方面</option>
          </select>
        </label>

        {/* 始業時間 */}
        <label className="flex items-center justify-between gap-3 p-4">
          <span className="text-sm font-medium text-slate-700">始業時間</span>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-900"
          />
        </label>

        {/* 駅までの徒歩時間 */}
        <label className="flex items-center justify-between gap-3 p-4">
          <span className="text-sm font-medium text-slate-700">駅までの徒歩時間</span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={0}
              value={walkMinutes}
              onChange={(e) => setWalkMinutes(e.target.value)}
              className="w-16 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-right text-sm text-slate-900"
            />
            <span className="text-sm text-slate-500">分</span>
          </div>
        </label>

        {/* 通知 */}
        <div className="flex items-center justify-between gap-3 p-4">
          <span className="text-sm font-medium text-slate-700">出発リマインド通知</span>
          <button
            type="button"
            onClick={() => setNotify((v) => !v)}
            className={[
              'relative h-6 w-11 rounded-full transition-colors',
              notify ? 'bg-sky-500' : 'bg-slate-300',
            ].join(' ')}
            aria-pressed={notify}
          >
            <span
              className={[
                'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                notify ? 'translate-x-[22px]' : 'translate-x-0.5',
              ].join(' ')}
            />
          </button>
        </div>
      </div>

      <button
        type="button"
        className="w-full rounded-xl bg-sky-500 py-3 text-sm font-bold text-white shadow-sm active:bg-sky-600"
      >
        保存する
      </button>
    </div>
  );
}

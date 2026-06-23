import React, { useState } from 'react';
import { stations } from './stations';
import { useTozaiStations } from './useOdpt';

interface Station {
  id: string;
  name: string;
  code: string;
}

// 設定画面。最寄り駅・方面・始業時間などを設定するモック。
// ※ 入力値はローカルstateで保持するだけ。保存処理やバリデーションは未実装。

export default function Setting(): JSX.Element {
  // ODPTから東西線の全駅を取得。取得前・失敗時はモックの3駅にフォールバック。
  const { data: allStations } = useTozaiStations();
  const fullStations: Station[] = allStations ?? stations;

  const [nearestStation, setNearestStation] = useState<string>(
    () => {
      const savedStation = localStorage.getItem('nearestStation');
      return savedStation ? savedStation : 't03';
    }
  );
  const [transferStation, setTransferStation] = useState<string>(
    () => {
      const savedStation = localStorage.getItem('transferStation');
      return savedStation ? savedStation : 't03';
    }
  );
  const [direction, setDirection] = useState(
    () => {
      const savedDirection = localStorage.getItem('direction');
      return savedDirection ? savedDirection : 'nishifunabashi';
    }
  );
  const [startTime, setStartTime] = useState(
    () => {
      const savedStartTime = localStorage.getItem('startTime');
      return savedStartTime ? savedStartTime : '09:00';
    }
  );
  const [walkMinutes, setWalkMinutes] = useState(
    () => {
      const savedWalkMinutes = localStorage.getItem('walkMinutes');
      return savedWalkMinutes ? savedWalkMinutes : '10';
    }
  );
  const [notify, setNotify] = useState(
    () => {
      const savedNotify = localStorage.getItem('notify');
      return savedNotify ? JSON.parse(savedNotify) : true;
    }
  );
  async function saveSettings(): Promise<void> {
    localStorage.setItem('nearestStation', nearestStation);
    localStorage.setItem('transferStation', transferStation);
    localStorage.setItem('direction', direction);
    localStorage.setItem('startTime', startTime);
    localStorage.setItem('walkMinutes', walkMinutes);
    localStorage.setItem('notify', notify.toString());
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-bold text-slate-900">設定</h1>
        <p className="text-sm text-slate-500">通勤・通学の条件を登録します</p>
      </header>

      <div className="divide-y divide-slate-100 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        {/* 大学の最寄り駅 */}
        <label className="flex items-center justify-between gap-3 p-4">
          <span className="text-sm font-medium text-slate-700">降りる駅(大学の最寄り駅)</span>
          <select
            value={nearestStation}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNearestStation(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-900"
          >
            {stations.map((s: Station) => (
              <option key={s.id} value={s.id}>
                {s.name}（{s.code}）
              </option>
            ))}
          </select>
        </label>

        {/* 乗る駅 */}
        <label className="flex items-center justify-between gap-3 p-4">
          <span className="text-sm font-medium text-slate-700">乗る駅</span>
          <select
            value={transferStation}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTransferStation(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-900"
          >
            {fullStations.map((s: Station) => (
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
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDirection(e.target.value)}
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartTime(e.target.value)}
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWalkMinutes(e.target.value)}
              className="w-16 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-right text-sm text-slate-900"
            />
            <span className="text-sm text-slate-500">分</span>
          </div>
        </label>

        {/* 通知 */}
{/*        <div className="flex items-center justify-between gap-3 p-4">
          <span className="text-sm font-medium text-slate-700">出発リマインド通知</span>
          <button
            type="button"
            onClick={() => setNotify((v: boolean) => !v)}
            className={[
              'relative h-6 w-11 rounded-full transition-colors',
              notify ? 'bg-sky-500' : 'bg-slate-300',
            ].join(' ')}
            aria-pressed={notify}
          >
            <span
              className={[
                'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                notify ? 'translate-x-[0px]' : 'translate-x-[-22px]',
              ].join(' ')}
            />
          </button>
        </div>*/}
      </div>

      <button
        type="button" onClick={saveSettings} 
        className="w-full rounded-xl bg-sky-500 py-3 text-sm font-bold text-white shadow-sm active:bg-sky-600"
      >
        保存する
      </button>
    </div>
  );
}

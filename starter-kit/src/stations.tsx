import { trains as mockTrains, Train, TrainMarker } from './trains';
import { useState } from 'react';
import RecordPopup from './recordPopup';

// 東西線（Tozai Line）の駅データ。今回はホーム周辺の3駅のみを表示するモック。
export type Station = {
  id: string;
  /** 駅ナンバリング（例: T04） */
  code: string;
  name: string;
};

export const stations: Station[] = [
  { id: 't03', code: 'T03', name: '高田馬場' },
  { id: 't04', code: 'T04', name: '早稲田' },
  { id: 't05', code: 'T05', name: '神楽坂' },
];

/** 駅インデックス(0..n-1)を線路上の左右位置(%)に変換する */
function toLeftPercent(index: number): number {
  const margin = 16; // 両端の余白(%)
  if (stations.length === 1) return 50;
  return margin + (index / (stations.length - 1)) * (100 - margin * 2);
}

type StationsLineProps = {
  trains?: Train[];
  /** 最寄り駅（強調表示する駅のid） */
  nearestStationId?: string;
  onAddRecord: (entry: any) => void; // 記録を追加するための関数を受け取る
};

/** ホーム画面の路線図。線路・駅・列車マーカーを重ねて描画する。 */
export default function StationsLine({
  onAddRecord,
  trains = mockTrains,
  nearestStationId = 't04',
}: StationsLineProps) {
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);// 選択された列車のポップアップを表示する
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      {/* 方面ラベル */}
      <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
        <span>◀ 中野方面</span>
        <span>西船橋方面 ▶</span>
      </div>

      <div className="relative h-40">
        {/* 線路 */}
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-sky-400" />

        {/* 列車マーカー（線路の上側に配置） */}
        {trains.map((train) => (
          <div
            key={train.id}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-[180%] cursor-pointer active:scale-90 transition-transform"
            style={{ left: `${toLeftPercent(train.position)}%` }}
            onClick={() => setSelectedTrain(train)}
          >
            <TrainMarker train={train} />
          </div>
        ))}

        {/* 駅 */}
        {stations.map((station, index) => {
          const isNearest = station.id === nearestStationId;
          return (
            <div
              key={station.id}
              className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: `${toLeftPercent(index)}%` }}
            >
              <div
                className={[
                  'flex h-11 w-11 flex-col items-center justify-center rounded-full border-2 bg-white text-center leading-none',
                  isNearest
                    ? 'border-sky-500 ring-4 ring-sky-100'
                    : 'border-slate-300',
                ].join(' ')}
              >
                <span className="text-[9px] font-semibold text-sky-600">T</span>
                <span className="text-[11px] font-bold text-slate-700">
                  {station.code.replace('T', '')}
                </span>
              </div>
              <span
                className={[
                  'mt-1 whitespace-nowrap text-[11px]',
                  isNearest ? 'font-bold text-slate-900' : 'text-slate-500',
                ].join(' ')}
              >
                {station.name}
              </span>
            </div>
          );
        })}
      </div>
      {/* 選択した電車のデータと、ポップアップを閉じる関数、記録を追加する関数を RecordPopup によこしてる */}
      {selectedTrain && (
        <RecordPopup 
          train={selectedTrain} 
          onClose={() => setSelectedTrain(null)} 
          onAddRecord={onAddRecord}
        />
      )}
    </div>
  );
}

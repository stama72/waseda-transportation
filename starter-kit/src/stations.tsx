import { trains as mockTrains, Train, TrainMarker } from './trains';
import { useState, useEffect, useRef } from 'react';
import RecordPopup from './recordPopup';
import {
  useTozaiStations,
  useTozaiTrains,
  useTozaiTimetables,
  useNowMinutes,
} from './useOdpt';
import { odptTrainToPosition, estimateTrainsFromTimetable } from './odpt';

// 東西線（Tozai Line）の駅データ。
export type Station = {
  id: string;
  /** 駅ナンバリング（例: T04） */
  code: string;
  name: string;
};

// API取得に失敗した場合のフォールバック（ホーム周辺の3駅）。
export const mockStations: Station[] = [
  { id: 't03', code: 'T03', name: '高田馬場' },
  { id: 't04', code: 'T04', name: '早稲田' },
];

// 横スクロールする路線図のレイアウト定数（ピクセル）。
const SEGMENT_PX = 84; // 隣り合う駅の間隔
const EDGE_PX = 44; // 路線両端の余白（端の駅が見切れないように）

// ODPTから東西線の全駅を取得し、横スクロールで全駅を表示する。
// 取得前・失敗時はモックの3駅にフォールバック。
const { data: allStations } = useTozaiStations();
const fullStations = allStations ?? mockStations;
const count = fullStations.length;

// 列車位置は3段フォールバック: ①odpt:Train（実位置）→ ②時刻表ベースの推定 → ③モック。
  // 東京メトロは現状このAPIキーで①を返さないため、実質②（推定）が表示される。
  // いずれも全駅インデックス基準の position を持ち、線路全体（横スクロール）に直接描画する。
  const { data: odptTrains } = useTozaiTrains();
  const { data: timetables } = useTozaiTimetables();

  const indexById = allStations
    ? new Map(allStations.map((s, i) => [s.id, i]))
    : null;


/** 駅インデックス(全駅基準)を線路上の左位置(px)に変換する */
function stationLeftPx(index: number): number {
  return EDGE_PX + index * SEGMENT_PX;
}

/** 駅数から線路全体の幅(px)を求める */
function trackWidthPx(count: number): number {
  return EDGE_PX * 2 + Math.max(0, count - 1) * SEGMENT_PX;
}


function getStationNameByCode(code: string): string {
  const station = fullStations.find((s) => s.code === code);
  return station ? station.name : '';
}


type StationsLineProps = {
  trains?: Train[];
  /** 最寄り駅（強調表示する駅ナンバリング。例: T04） */
  nearestStationCode?: string;
  onAddRecord: (entry: any) => void; // 記録を追加するための関数を受け取る
};

/** ホーム画面の路線図。線路・駅・列車マーカーを重ねて描画する。 */
export default function StationsLine({
  onAddRecord,
  trains = mockTrains,
  nearestStationCode = 'T04',
}: StationsLineProps) {
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);// 選択された列車のポップアップを表示する

  const nearestIdx = fullStations.findIndex((s) => s.code === nearestStationCode);
  const nowMin = useNowMinutes();

  // ① 実位置（odpt:Train）
  const realtimeTrains =
    indexById && odptTrains && odptTrains.length > 0
      ? odptTrains
          .map((t) => odptTrainToPosition(t, indexById))
          .filter((t): t is Train => t !== null)
      : null;

  // ② 時刻表ベースの推定位置
  const estimatedTrains =
    indexById && timetables
      ? estimateTrainsFromTimetable(timetables, nowMin, indexById)
      : null;

  // ③ モック（最寄り駅周辺に寄せて表示）。position は最寄り駅起点の相対値なのでずらす。
  const fallbackTrains = trains.map((t) => ({
    ...t,
    position: t.position + Math.max(0, nearestIdx - 1),
  }));

  const shownTrains = realtimeTrains ?? estimatedTrains ?? fallbackTrains;

  // 初回（および駅数が変わった）タイミングで最寄り駅が中央に来るよう横スクロール位置を合わせる。
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || nearestIdx < 0) return;
    el.scrollLeft = Math.max(0, stationLeftPx(nearestIdx) - el.clientWidth / 2);
  }, [count, nearestIdx]);


  // 時刻に間に合う最終電車をピックアップ
/*
  const finalTrain = trains.map((t) => ({
    ...t,
    position: t.position + Math.max(0, nearestIdx - 1),
  })).filter((t) => isFinalTrain(t));
*/
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      {/* 方面ラベル */}
      <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
        <span>◀ 中野方面</span>
        <span>西船橋方面 ▶</span>
      </div>

      {/* 横スクロールできる路線図。全駅をピクセル間隔で並べ、最寄り駅を初期表示で中央に。 */}
      <div ref={scrollRef} className="overflow-x-auto pb-2">
        <div className="relative h-40" style={{ width: trackWidthPx(count) }}>
          {/* 線路 */}
          <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-sky-400" />

          {/* 列車マーカー（方面別に線路の上下へ配置：西船橋方面=上、中野方面=下） */}
          {shownTrains.map((train) => (
            <div
              key={train.id}
              className={[
                'absolute top-1/2 -translate-x-1/2 cursor-pointer active:scale-90 transition-transform',
                train.direction === 'nakano'
                  ? 'translate-y-[100%]'
                  : '-translate-y-[180%]',
              ].join(' ')}
              style={{ left: stationLeftPx(train.position) }}
              onClick={() => setSelectedTrain(train)}
            >
              <TrainMarker train={train} />
            </div>
          ))}

          {/* 駅 */}
          {fullStations.map((station, index) => {
            const isNearest = station.code === nearestStationCode;
            return (
              <div
                key={station.id}
                className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                style={{ left: stationLeftPx(index) }}
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
                    {station.code.replace(/^T/, '')}
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

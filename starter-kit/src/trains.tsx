// 東西線（Tozai Line）を走る列車のモックデータ。
// position は駅インデックス基準の連続値（0 = T03, 1 = T04, 2 = T05, 0.5 = T03とT04の中間）。
// direction は進行方向。nishifunabashi が右（西船橋方面）、nakano が左（中野方面）。

export type Direction = 'nishifunabashi' | 'nakano';

/** 位置情報の出所。realtime=実位置, timetable=時刻表推定, mock=モック。 */
export type TrainSource = 'realtime' | 'timetable' | 'mock';

export type Train = {
  id: string;
  /** 駅インデックス基準の位置（0〜stations.length-1） */
  position: number;
  direction: Direction;
  /** 種別ラベル（各停 / 快速 など） */
  kind: string;
  /** 遅延（秒）。ODPT実データのときのみ入る。 */
  delay?: number;
  /** 位置情報の出所。未指定はモック相当として扱う。 */
  source?: TrainSource;
};

// モック：実際の運行情報APIは未接続。
export const trains: Train[] = [
  { id: 'A', position: -0.35, direction: 'nishifunabashi', kind: '各停' },
  { id: 'B', position: 0.55, direction: 'nishifunabashi', kind: '快速' },
  { id: 'C', position: 1.7, direction: 'nishifunabashi', kind: '各停' },
];

type TrainMarkerProps = {
  train: Train;
  onClick?: () => void; // 列車の箱がクリックされたときの処理
};

/** 線路上に重ねて表示する列車マーカー（小さな箱） */
export function TrainMarker({ train, onClick }: TrainMarkerProps) {
  const arrow = train.direction === 'nishifunabashi' ? '▶' : '◀';
  // 時刻表ベースの推定位置は、実位置と区別するため破線枠＋「推定」ラベルにする。
  const isEstimated = train.source === 'timetable';
  return (
    <div className="flex flex-col items-center gap-0.5 select-none cursor-pointer active:scale-95 transition-transform" onClick={onClick}>
      <div
        className={[
          'flex items-center gap-1 rounded-md bg-white px-2 py-1 shadow-sm',
          isEstimated ? 'border-2 border-dashed border-sky-400' : 'border-2 border-sky-500',
        ].join(' ')}
      >
        <span className="text-[10px] font-bold leading-none text-sky-700">{train.kind}</span>
        <span className="text-[10px] leading-none text-sky-500">{arrow}</span>
      </div>
      {isEstimated && (
        <span className="text-[8px] leading-none text-slate-400">推定</span>
      )}
    </div>
  );
}

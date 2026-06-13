import { Check, X } from 'lucide-react';

// 記録（履歴）画面。過去にどの電車に乗ったかをさかのぼって確認するモック。
// ※ データは仮置き。永続化やAPI連携は未実装。

type RecordEntry = {
  id: string;
  date: string;
  station: string;
  kind: string;
  destination: string;
  boardedAt: string;
  /** 始業に間に合ったか */
  onTime: boolean;
};

const records: RecordEntry[] = [
  { id: '1', date: '6/13 (金)', station: '高田馬場', kind: '快速', destination: '西船橋行', boardedAt: '07:42', onTime: true },
  { id: '2', date: '6/12 (木)', station: '高田馬場', kind: '各停', destination: '西船橋行', boardedAt: '07:55', onTime: true },
  { id: '3', date: '6/11 (水)', station: '高田馬場', kind: '各停', destination: '東葉勝田台行', boardedAt: '08:10', onTime: false },
  { id: '4', date: '6/10 (火)', station: '高田馬場', kind: '快速', destination: '西船橋行', boardedAt: '07:38', onTime: true },
  { id: '5', date: '6/9 (月)', station: '高田馬場', kind: '各停', destination: '西船橋行', boardedAt: '07:50', onTime: true },
];

export default function Record() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-bold text-slate-900">記録</h1>
        <p className="text-sm text-slate-500">乗車履歴をさかのぼって確認できます</p>
      </header>

      <ul className="space-y-3">
        {records.map((r) => (
          <li
            key={r.id}
            className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
          >
            {/* 間に合ったかどうかのバッジ */}
            <div
              className={[
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                r.onTime ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600',
              ].join(' ')}
            >
              {r.onTime ? <Check size={20} /> : <X size={20} />}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-bold text-slate-900">{r.date}</span>
                <span className="font-mono text-sm tabular-nums text-slate-700">
                  {r.boardedAt}
                </span>
              </div>
              <p className="truncate text-xs text-slate-500">
                {r.station}駅 ・ {r.kind} {r.destination}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

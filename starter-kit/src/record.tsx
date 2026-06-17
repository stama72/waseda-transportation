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

export default function Record({ records }: { records: RecordEntry[] }) {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-bold text-slate-900">記録</h1>
        <p className="text-sm text-slate-500">乗車履歴をさかのぼって確認できます</p>
      </header>

      {/* 記録がまだないとき用 */}
      {records.length === 0 && (
        <div className="text-center py-10 text-slate-400 text-sm">
          まだ記録がありません。
        </div>
      )}

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

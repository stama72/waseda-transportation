import { Check, X } from 'lucide-react';
import { useState } from 'react';

// 記録（履歴）画面。過去にどの電車に乗ったかをさかのぼって確認するモック。
// ※ データは仮置き。永続化やAPI連携は未実装。

export type RecordEntry = {
  id: string;
  arivalDate: string;
  arrivedAt: string;
  arivalStation: string;
  boardedStation: string;
  kind: string;
  destination: string;
  /** 始業に間に合ったか */
  onTime: boolean;
};

type RecordProps = {
  records: RecordEntry[];
  clearRecord: () => void;
};

export default function Record({ records, clearRecord }: RecordProps) {
  const [isRecordClear, setIsRecordClear] = useState(false);

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
                <span className="text-sm font-bold text-slate-900">{r.arivalDate}</span>
                <span className="text-sm font-bold text-slate-900">{r.arrivedAt}</span>
              </div>
              <p className="truncate text-xs text-slate-500">
                {r.boardedStation}駅 → {r.arivalStation}駅 ・ {r.kind} {r.destination}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <div  onClick={() => setIsRecordClear(true)} className="w-full rounded-xl bg-sky-500 py-3 my-4 text-sm text-center font-bold text-white shadow-sm active:bg-sky-600 active:scale-90 transition-transform">
        <button>記録を削除</button>
      </div>

      {isRecordClear && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                <div className="relative bg-white p-6 rounded-2xl w-80">
                    <h2 className="text-lg font-bold text-slate-900">本当に記録を削除しますか？</h2>
                    <div className="mt-6 flex flex-col gap-2">
                    {/* 実際に削除を実行するボタン */}
                    <button
                      onClick={() => {
                        clearRecord();        // 親(App.tsx)の削除関数を呼ぶ
                        setIsRecordClear(false); // ポップアップを閉じる
                      }}
                      className="w-full bg-rose-500 text-white font-bold py-3 rounded-xl active:bg-rose-600 active:scale-90 transition-transform"
                    >
                      削除する
                    </button>
                    <button
                      onClick={() => setIsRecordClear(false)}
                      className="w-full py-2 text-slate-400 text-sm active:scale-90 transition-transform"
                    >
                      キャンセル
                    </button>
                    </div>
                </div>
        </div>
      )}
    </div>
  );
}

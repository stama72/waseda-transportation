import { AlertTriangle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { useTozaiTrainInformation } from './useOdpt';

/** dc:date（ISO文字列）を「HH:MM 更新」表記にする。 */
function formatUpdated(date?: string): string | null {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm} 更新`;
}

/** 東西線のリアルタイム運行情報パネル（ODPT odpt:TrainInformation）。 */
export default function TrainInformation() {
  const { data, loading, error } = useTozaiTrainInformation();

  // 初回読み込み中（まだデータが無い）
  if (loading && !data) {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-sm ring-1 ring-slate-100">
        <Loader2 size={16} className="animate-spin" />
        運行情報を取得中…
      </div>
    );
  }

  // データが取れていない状態でのエラー
  if (error && !data) {
    return (
      <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700 shadow-sm ring-1 ring-rose-100">
        <div className="flex items-center gap-2 font-medium">
          <AlertTriangle size={16} />
          運行情報を取得できませんでした
        </div>
        <p className="mt-1 text-xs text-rose-500">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const isNormal = data.isNormal;
  const updated = formatUpdated(data.date);

  return (
    <div
      className={[
        'rounded-2xl p-4 shadow-sm ring-1',
        isNormal
          ? 'bg-white ring-slate-100'
          : 'bg-amber-50 ring-amber-200',
      ].join(' ')}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isNormal ? (
            <CheckCircle2 size={18} className="text-emerald-500" />
          ) : (
            <AlertTriangle size={18} className="text-amber-500" />
          )}
          <span className="text-sm font-semibold text-slate-700">運行情報</span>
          {!isNormal && data.status && (
            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
              {data.status}
            </span>
          )}
        </div>
        {/* 自動更新中の控えめなインジケーター */}
        {loading && <RefreshCw size={14} className="animate-spin text-slate-300" />}
      </div>

      <p
        className={[
          'text-sm leading-relaxed',
          isNormal ? 'text-slate-600' : 'text-amber-800',
        ].join(' ')}
      >
        {data.text}
      </p>

      {updated && (
        <p className="mt-2 text-right text-[11px] text-slate-400">{updated}</p>
      )}
    </div>
  );
}

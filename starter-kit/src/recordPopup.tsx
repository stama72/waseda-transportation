import { useState } from 'react';
import { X } from 'lucide-react';

export default function RecordPopup({ train, onClose, onAddRecord }) {
    const now = new Date();
    const [isSuccess, setIsSuccess] = useState(false);

    if(isSuccess) {
        return (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center" onClick={onClose}>
                <div className="relative bg-white p-6 rounded-2xl w-80">
                    <h2 className="text-lg font-bold text-slate-900">記録が完了しました</h2>
                </div>
            </div>
        );
    }
    
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="relative bg-white p-6 rounded-2xl w-80">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>
        <h2 className="text-lg font-bold text-slate-900">電車の詳細</h2>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          <li>種別: {train.kind}</li>
          <li>行き先: {train.direction === 'nishifunabashi' ? '西船橋行' : '中野行'}</li>
          <li>時刻: {now.toLocaleString()}</li>
          <li>ステータス: 遅延</li>
        </ul>
        {train.source === 'timetable' && (
          <p className="mt-2 text-xs text-slate-400">※ 位置は時刻表ベースの推定です</p>
        )}
        <h2 className="text-lg font-bold text-slate-900 space-y-2 mt-4">この電車で記録しますか？</h2>
        <button type="button" onClick={() => {
            const newEntry = {
                id: Date.now().toString(),
                date: "6/17 (水)", // 本来は new Date() から作る
                station: "高田馬場",
                kind: train.kind,
                destination: "西船橋行",
                boardedAt: "08:00",
                onTime: true
            };
            onAddRecord(newEntry); // ここで App.tsx の保存処理が動く
            setIsSuccess(true);
        }}
        className="w-full rounded-xl bg-sky-500 py-3 my-4 text-sm font-bold text-white shadow-sm active:bg-sky-600 active:scale-90 transition-transform"
        >記録する</button>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { DelayCheck } from './delayCheck';
import { Train } from './trains';
import { getStationNameByCode, mockStations, Station } from './stations';
import { getDepartureTime} from './odpt';

type RecordPopupProps = {
  train: Train;
  onClose: () => void;
  onAddRecord: (entry: any) => void;
  stations?: Station[];
};

export default function RecordPopup({ train, onClose, onAddRecord, stations = mockStations }: RecordPopupProps) {
    const now = new Date();
    const month = now.getMonth() + 1
    const day =  now.getDate()
    const week = ["日", "月", "火", "水", "木", "金", "土"][now.getDay()];
    
    const [arivalTime, setArivalTime] = useState("00:00");

    useEffect(() => {
        getDepartureTime(train.id, localStorage.getItem('destinationStation') ?? "T04")
            .then((time) => setArivalTime(time ?? "00:00"));
    }, [train.id]);

    const [isSuccess, setIsSuccess] = useState(false);
    const status = (DelayCheck(arivalTime)) ? "定刻" : "遅刻";

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
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors active:scale-90 transition-transform"
        >
          <X size={20} />
        </button>
        <h2 className="text-lg font-bold text-slate-900">電車の詳細</h2>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          <li>種別: {train.kind}</li>
          <li>行き先: {train.direction === 'nishifunabashi' ? '西船橋行' : '中野行'}</li>
          <li>時刻: {now.toLocaleString()}</li>
          <li>ステータス: {status}</li>
        </ul>
        {train.source === 'timetable' && (
          <p className="mt-2 text-xs text-slate-400">※ 位置は時刻表ベースの推定です</p>
        )}
        <h2 className="text-lg font-bold text-slate-900 space-y-2 mt-4">この電車で記録しますか？</h2>
        <button type="button" onClick={() => {
            const newEntry = {
                id: Date.now().toString(),
                date: `${month}/${day} (${week})`, // 本来は new Date() から作る
                boardedStation: getStationNameByCode(localStorage.getItem('transferStation') ?? '', stations),
                arivalStation: getStationNameByCode(localStorage.getItem('destinationStation') ?? 'T04', stations),
                kind: train.kind,
                destination: "西船橋行",
                arivalDate: `${month}/${day} (${week})`,
                arrivedAt: arivalTime,
                onTime: DelayCheck(arivalTime)
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
import { useState, useEffect } from 'react';
// ※APIのインポート元はご自身のファイル名（./odpt や ./api など）に合わせてください
import { getNextDepartureTime } from './odpt';
import TimeLimit from './timeLimit';

export default function TakadanobabaNextTrain() {
  const [nishifunaTime, setNishifunaTime] = useState<string | null>(null);

  const TAKADANOBABA_ID = 'odpt.Station:TokyoMetro.Tozai.Takadanobaba';

  useEffect(() => {
    async function fetchTimes() {
      try {
        // 西船橋方面の時間だけを取得する（通信速度の最適化）
        const nishifuna = await getNextDepartureTime(TAKADANOBABA_ID, 'nishifunabashi');
        setNishifunaTime(nishifuna);
      } catch (error) {
        console.error(error);
      }
    }
    fetchTimes();
  }, []);

  return (
    <div>
      {/* 見出し文字を削除し、タイマー本体だけをポンと置く */}
      <div>
        <h3 className="text-lg font-bold mb-2">次の電車 ({nishifunaTime})</h3>
        {/* ② 取得した時間を targetTime として渡す！ */}
        <TimeLimit targetTime={nishifunaTime} />
      </div>
    </div>
  );
}
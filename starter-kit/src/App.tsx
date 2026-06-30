import { useState, useEffect } from 'react';
import { Home, ClipboardList, Settings } from 'lucide-react';

// ❌ 変更前: import TimeLimit from './timeLimit';
// ⭕️ 変更後: 時間を取得するコンポーネントをインポートする
import TakadanobabaNextTrain from './lefttime'; 

import StationsLine from './stations';
import TrainInformation from './trainInformation';
import Record, { RecordEntry } from './record';
import Setting from './setting';

type Tab = 'home' | 'record' | 'setting';

const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'ホーム', icon: Home },
  { id: 'record', label: '記録', icon: ClipboardList },
  { id: 'setting', label: '設定', icon: Settings },
];

/** ホーム画面：Time Limit と路線図 */
function HomeScreen({ onAddRecord }: { onAddRecord: (entry: RecordEntry) => void }) {
  return (
    <div className="space-y-4">
      {/* 路線シンボル（東西線） */}
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-white">
          T
        </span>
        <span className="text-sm font-medium text-slate-600">東西線</span>
      </div>

      {/* ❌ 変更前: <TimeLimit /> */}
      {/* ⭕️ 変更後: 時間を取得してタイマーに渡してくれる大元のコンポーネントを置く */}
      <TakadanobabaNextTrain />
      
      <TrainInformation />
      <StationsLine onAddRecord={onAddRecord}/>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const [records, setRecords] = useState<RecordEntry[]>(() => {
    const saved = localStorage.getItem('train_records');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('train_records', JSON.stringify(records));
  }, [records]); 

  const addRecord = (entry: RecordEntry) => {
    setRecords([entry, ...records]); 
  };

  const clearRecord = () =>{
    localStorage.removeItem('train_records');
    setRecords([]);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-slate-50">
      {/* メインコンテンツ */}
      <main className="flex-1 px-4 pb-24 pt-6">
        {activeTab === 'home' && <HomeScreen onAddRecord={addRecord} />}
        {activeTab === 'record' && <Record records={records} clearRecord={clearRecord} />}
        {activeTab === 'setting' && <Setting />}

        <footer className="mt-12 text-center text-xs text-slate-400">
          &copy; 2026 Waseda Transportation team in WINC
        </footer>
      </main>

      {/* ボトムナビゲーション */}
      <nav className="fixed inset-x-0 bottom-0 mx-auto max-w-md border-t border-slate-200 bg-white">
        <div className="flex">
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={[
                  'flex flex-1 flex-col items-center gap-1 py-3 transition-colors',
                  active ? 'text-sky-600' : 'text-slate-400',
                ].join(' ')}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                <span className="text-[11px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default App;
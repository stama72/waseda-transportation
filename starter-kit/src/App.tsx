import { useState } from 'react';
import { Home, ClipboardList, Settings } from 'lucide-react';
import TimeLimit from './timeLimit';
import StationsLine from './stations';
import Record from './record';
import Setting from './setting';

type Tab = 'home' | 'record' | 'setting';

const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'ホーム', icon: Home },
  { id: 'record', label: '記録', icon: ClipboardList },
  { id: 'setting', label: '設定', icon: Settings },
];

/** ホーム画面：Time Limit と路線図 */
function HomeScreen() {
  return (
    <div className="space-y-4">
      {/* 路線シンボル（東西線） */}
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-white">
          T
        </span>
        <span className="text-sm font-medium text-slate-600">東西線</span>
      </div>

      <TimeLimit />
      <StationsLine />
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-slate-50">
      {/* メインコンテンツ */}
      <main className="flex-1 px-4 pb-24 pt-6">
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'record' && <Record />}
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

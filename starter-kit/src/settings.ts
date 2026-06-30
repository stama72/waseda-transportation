// アプリの設定（localStorage）の初期値と初期化処理。
// 設定値は destination / transferStation など個別のキーで localStorage に保存される。
// 各画面のフォールバック値と矛盾しないよう、初期値はここに集約する。

export const DEFAULT_SETTINGS = {
  destinationStation: 't03',          // 降りる駅(大学の最寄り駅)
  transferStation: 't02',      // 乗る駅
  direction: 'nishifunabashi', // 方面
  startTime: '08:50',          // 始業時間
  walkMinutes: '10',           // 駅までの徒歩時間(分)
  notify: 'true',              // 出発リマインド通知
} as const;

// 初期化済みかどうかを記録するキー。これが存在すれば初回利用ではない。
const INIT_FLAG_KEY = 'settingsInitialized';

/**
 * 初回利用時に設定の初期値を localStorage へ書き込む。
 * 2回目以降は何もしない。既にユーザーが保存した値は上書きしない。
 */
export function initSettings(): void {
  if (localStorage.getItem(INIT_FLAG_KEY)) return;

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    // 既存の値があれば尊重し、未設定のキーだけ初期値で埋める。
    if (localStorage.getItem(key) === null) {
      localStorage.setItem(key, value);
    }
  }

  localStorage.setItem(INIT_FLAG_KEY, 'true');
}

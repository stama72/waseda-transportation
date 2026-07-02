// ODPT（公共交通オープンデータセンター）APIクライアント。
// 東京メトロ東西線の駅情報・運行情報を取得する。
// APIキーは .env の VITE_ODPT_TOKEN（Viteが import.meta.env 経由で注入）。
// ドキュメント: https://developer.odpt.org/

import holidayJp from '@holiday-jp/holiday_jp';
import type { Train } from './trains';

const BASE = 'https://api.odpt.org/api/v4';
const TOKEN = import.meta.env.VITE_ODPT_TOKEN as string | undefined;

/** 東西線の路線ID（ODPTの識別子） */
export const TOZAI_RAILWAY = 'odpt.Railway:TokyoMetro.Tozai';

/** ODPTの多言語タイトル（必要な言語だけ持つ） */
type MultilingualTitle = {
  ja?: string;
  en?: string;
  [lang: string]: string | undefined;
};

/** odpt:Railway の駅順序エントリ */
type StationOrder = {
  'odpt:index': number;
  'odpt:station': string;
  'odpt:stationTitle'?: MultilingualTitle;
};

/** odpt:Railway（路線情報）のレスポンス */
type RailwayResponse = {
  'owl:sameAs': string;
  'dc:title'?: string;
  'odpt:color'?: string;
  'odpt:lineCode'?: string;
  'odpt:stationOrder'?: StationOrder[];
};

/** odpt:TrainInformation（運行情報）のレスポンス */
type TrainInformationResponse = {
  'dc:date'?: string;
  'odpt:railway'?: string;
  'odpt:trainInformationStatus'?: MultilingualTitle;
  'odpt:trainInformationText'?: MultilingualTitle;
};

/** odpt:Train（列車ロケーション）のレスポンス */
type TrainResponse = {
  'owl:sameAs': string;
  'odpt:trainNumber'?: string;
  'odpt:trainType'?: string;
  'odpt:railDirection'?: string;
  /** 直前に発車した（=現在いる）駅 */
  'odpt:fromStation'?: string | null;
  /** 次の停車駅。駅停車中は null になりうる。 */
  'odpt:toStation'?: string | null;
  'odpt:delay'?: number;
};

/** アプリ内で使う列車ロケーション */
export type OdptTrain = {
  id: string;
  fromStation: string | null;
  toStation: string | null;
  railDirection?: string;
  trainType?: string;
  /** 遅延（秒） */
  delay?: number;
};

/** アプリ内で使う駅情報 */
export type OdptStation = {
  id: string;
  /** 駅ナンバリング（例: T04） */
  code: string;
  name: string;
};

/** アプリ内で使う運行情報 */
export type OdptTrainInformation = {
  /** 運行状況の見出し（遅延・運転見合わせ等）。平常時は undefined。 */
  status?: string;
  /** 運行状況の本文（例: 現在、平常通り運転しています。） */
  text: string;
  /** 情報の更新時刻（ISO文字列） */
  date?: string;
  /** status が無い＝平常運転 */
  isNormal: boolean;
};

/** 路線色（取得できなければ東西線の既定色を返す） */
export const TOZAI_COLOR = '#009BBF';

/** ODPTへGETしてJSONを返す。トークン未設定やHTTPエラーは例外にする。 */
async function getJson<T>(path: string, params: Record<string, string>): Promise<T> {
  if (!TOKEN) {
    throw new Error('VITE_ODPT_TOKEN が設定されていません（.env を確認してください）');
  }
  const url = new URL(`${BASE}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set('acl:consumerKey', TOKEN);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`ODPT APIエラー: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/** 東西線の駅一覧を中野→西船橋の順で取得する。 */
export async function fetchTozaiStations(): Promise<OdptStation[]> {
  const railways = await getJson<RailwayResponse[]>('odpt:Railway', {
    'owl:sameAs': TOZAI_RAILWAY,
  });
  const railway = railways[0];
  const order = railway?.['odpt:stationOrder'] ?? [];
  const lineCode = railway?.['odpt:lineCode'] ?? 'T';

  return [...order]
    .sort((a, b) => a['odpt:index'] - b['odpt:index'])
    .map((entry) => {
      const index = entry['odpt:index'];
      const stationId = entry['odpt:station'];
      return {
        id: stationId,
        // 例: lineCode "T" + index 4 → "T04"
        code: `${lineCode}${String(index).padStart(2, '0')}`,
        name: entry['odpt:stationTitle']?.ja ?? stationId.split('.').pop() ?? '',
      };
    });
}

/** 東西線の運行情報を取得する。 */
export async function fetchTozaiTrainInformation(): Promise<OdptTrainInformation> {
  const list = await getJson<TrainInformationResponse[]>('odpt:TrainInformation', {
    'odpt:railway': TOZAI_RAILWAY,
  });
  const info = list[0];
  const status = info?.['odpt:trainInformationStatus']?.ja;
  const text = info?.['odpt:trainInformationText']?.ja ?? '運行情報を取得できませんでした';

  return {
    status,
    text,
    date: info?.['dc:date'],
    isNormal: !status,
  };
}

/**
 * 東西線の走行中列車を取得する。
 * 注意: 東京メトロはこのAPIキーの提供範囲では odpt:Train（列車位置）を
 * 公開していないため、現状は空配列が返ります（都営などは取得可能）。
 * データが提供され次第、そのまま動作します。
 */
export async function fetchTozaiTrains(): Promise<OdptTrain[]> {
  const list = await getJson<TrainResponse[]>('odpt:Train', {
    'odpt:railway': TOZAI_RAILWAY,
  });
  return list.map((t) => ({
    id: t['odpt:trainNumber'] ?? t['owl:sameAs'],
    fromStation: t['odpt:fromStation'] ?? null,
    toStation: t['odpt:toStation'] ?? null,
    railDirection: t['odpt:railDirection'],
    trainType: t['odpt:trainType'],
    delay: t['odpt:delay'],
  }));
}

/** railDirection（ODPT識別子）を進行方向に変換する。既定は西船橋方面。 */
function directionFromRail(railDirection?: string): 'nishifunabashi' | 'nakano' {
  if (railDirection?.includes('Nakano')) return 'nakano';
  return 'nishifunabashi';
}

/** trainType（ODPT識別子）を日本語の種別ラベルに変換する。 */
function trainTypeLabel(trainType?: string): string {
  const suffix = trainType?.split('.').pop() ?? '';
  const map: Record<string, string> = {
    Local: '各停',
    Rapid: '快速',
    CommuterRapid: '通勤快速',
    Express: '快速',
  };
  return map[suffix] ?? (suffix || '各停');
}

/**
 * ODPTの列車を、路線図用の位置（東西線全駅の連続インデックス）に変換する。
 * - 駅停車中（toStation が無い）: その駅のインデックス
 * - 駅間走行中: from と to の中点
 * 駅IDが全駅リストに見つからない場合は null（描画対象外）。
 *
 * @param indexById 駅ID → 全駅リスト内インデックス のマップ
 */
export function odptTrainToPosition(
  train: OdptTrain,
  indexById: Map<string, number>,
): Train | null {
  const fromIdx = train.fromStation != null ? indexById.get(train.fromStation) : undefined;
  const toIdx = train.toStation != null ? indexById.get(train.toStation) : undefined;

  let position: number;
  if (fromIdx == null && toIdx == null) return null;
  else if (fromIdx == null) position = toIdx as number;
  else if (toIdx == null) position = fromIdx;
  else position = (fromIdx + toIdx) / 2;

  return {
    id: train.id,
    position,
    direction: directionFromRail(train.railDirection),
    kind: trainTypeLabel(train.trainType),
    delay: train.delay,
    source: 'realtime',
  };
}

// ───────────────────────────────────────────────────────────
// 列車時刻表（odpt:TrainTimetable）による在線位置の推定
// 東京メトロは odpt:Train（実位置）を当APIキーで公開していないため、
// 時刻表の各駅発車時刻と現在時刻を照合して位置を推定する。
// ───────────────────────────────────────────────────────────

/** odpt:TrainTimetable の各停車エントリ */
type TrainTimetableObject = {
  'odpt:departureTime'?: string;
  'odpt:arrivalTime'?: string;
  'odpt:departureStation'?: string;
  'odpt:arrivalStation'?: string;
};

/** odpt:TrainTimetable（列車時刻表）のレスポンス */
type TrainTimetableResponse = {
  'owl:sameAs': string;
  'odpt:trainNumber'?: string;
  'odpt:trainType'?: string;
  'odpt:railDirection'?: string;
  'odpt:trainTimetableObject'?: TrainTimetableObject[];
};

/** パース済みの列車時刻表（時刻は0時起点の分に変換し、日跨ぎは単調増加に正規化） */
export type TozaiTimetable = {
  id: string;
  railDirection?: string;
  trainType?: string;
  /** 通過順の停車駅と発車（終着のみ到着）時刻（分） */
  stops: { stationId: string; timeMin: number }[];
};

/** "HH:MM" を0時起点の分に変換する。不正な値は null。 */
function parseHHMM(hhmm?: string): number | null {
  if (!hhmm) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** ODPTの時刻表レスポンスをパース型へ変換する。 */
function parseTimetable(res: TrainTimetableResponse): TozaiTimetable {
  const objects = res['odpt:trainTimetableObject'] ?? [];
  const stops: { stationId: string; timeMin: number }[] = [];
  let prev = -Infinity;
  let dayOffset = 0; // 日跨ぎ（時刻が前より小さくなる）たびに +1440

  for (const o of objects) {
    const stationId = o['odpt:departureStation'] ?? o['odpt:arrivalStation'];
    const raw = parseHHMM(o['odpt:departureTime'] ?? o['odpt:arrivalTime']);
    if (!stationId || raw == null) continue;
    let timeMin = raw + dayOffset;
    if (timeMin < prev) {
      // 例: 23:58 → 00:03。翌日分として +1440 して単調増加を保つ。
      dayOffset += 1440;
      timeMin = raw + dayOffset;
    }
    prev = timeMin;
    stops.push({ stationId, timeMin });
  }

  return {
    id: res['owl:sameAs'],
    railDirection: res['odpt:railDirection'],
    trainType: res['odpt:trainType'],
    stops,
  };
}

/** 東西線の列車時刻表を指定カレンダーで取得する（1リクエストで全件）。 */
export async function fetchTozaiTimetables(calendar: string): Promise<TozaiTimetable[]> {
  const list = await getJson<TrainTimetableResponse[]>('odpt:TrainTimetable', {
    'odpt:railway': TOZAI_RAILWAY,
    'odpt:calendar': calendar,
  });
  return list.map(parseTimetable).filter((t) => t.stops.length >= 2);
}

/**
 * 現在時刻(分)に在線している列車を時刻表から推定し、路線図用の位置（全駅インデックス）に変換する。
 * @param nowMin 0時起点の現在分（JST）
 * @param indexById 駅ID → 全駅インデックス のマップ
 */
export function estimateTrainsFromTimetable(
  timetables: TozaiTimetable[],
  nowMin: number,
  indexById: Map<string, number>,
): Train[] {
  const result: Train[] = [];

  for (const tt of timetables) {
    const stops = tt.stops;
    const first = stops[0].timeMin;
    const last = stops[stops.length - 1].timeMin;

    // 日跨ぎ列車も拾えるよう、今・翌日換算の両方で在線判定する。
    const candidates = [nowMin, nowMin + 1440].filter((t) => t >= first && t < last);
    if (candidates.length === 0) continue;
    const t = candidates[0];

    // t を含む区間 stops[i].timeMin <= t < stops[i+1].timeMin を探す
    let i = 0;
    while (i < stops.length - 1 && !(stops[i].timeMin <= t && t < stops[i + 1].timeMin)) {
      i++;
    }
    const a = stops[i];
    const b = stops[i + 1];
    const idxA = indexById.get(a.stationId);
    const idxB = indexById.get(b.stationId);
    if (idxA == null || idxB == null) continue; // 全駅マップ外（直通先など）は除外

    const span = b.timeMin - a.timeMin;
    const f = span > 0 ? (t - a.timeMin) / span : 0;
    const position = idxA + f * (idxB - idxA);

    result.push({
      id: tt.id,
      position,
      direction: directionFromRail(tt.railDirection),
      kind: trainTypeLabel(tt.trainType),
      source: 'timetable',
    });
  }

  return result;
}

/**
 * 指定日のODPTカレンダー種別を返す。
 * 土日・日本の祝日は SaturdayHoliday、それ以外は Weekday。
 */
export function calendarForDate(date: Date): 'odpt.Calendar:Weekday' | 'odpt.Calendar:SaturdayHoliday' {
  const day = date.getDay(); // 0=日, 6=土
  const isWeekend = day === 0 || day === 6;
  const isHolidayJp = holidayJp.isHoliday(date);
  return isWeekend || isHolidayJp
    ? 'odpt.Calendar:SaturdayHoliday'
    : 'odpt.Calendar:Weekday';
}
/**
 * 指定した駅・方向の、直近の出発時刻（時刻表ベース）を取得する。
 * @param stationId 基準にする駅のID（例: 'odpt.Station:TokyoMetro.Tozai.NishiFunabashi'）
 * @param direction 進行方向
 * @returns 次の発車時刻の文字列（例: "08:15"）。本日の最終電車が終わっている場合は null。
 */
export async function getNextDepartureTime(
  stationId: string,
  direction: 'nakano' | 'nishifunabashi'
): Promise<string | null> {
  const now = new Date();
  // 現在時刻を「0時起点の分」に変換（例: 8時10分 -> 490）
  const nowMin = now.getHours() * 60 + now.getMinutes();
  
  // 今日のカレンダー（平日 or 土日祝）を取得
  const calendar = calendarForDate(now);
  
  // 今日の時刻表を全件取得
  const timetables = await fetchTozaiTimetables(calendar);

  let nextTrainMin = Infinity;

  // 全ての列車の時刻表をループして、条件に合う最短の時間を探す
  for (const tt of timetables) {
    // 1. 進行方向が違う列車はスキップ
    if (directionFromRail(tt.railDirection) !== direction) continue;

    // 2. この列車が該当の駅に停車するか確認
    const stop = tt.stops.find((s) => s.stationId === stationId);
    if (!stop) continue;

    // 3. 現在時刻以降で、かつ今まで見つけた時間より早いものを記録
    // （※深夜の日跨ぎ考慮として、timeMinは24時以降を1440以上として扱っています）
    if (stop.timeMin >= nowMin && stop.timeMin < nextTrainMin) {
      nextTrainMin = stop.timeMin;
    }
  }

  // もし該当する電車がない（終電後など）場合はnullを返す
  if (nextTrainMin === Infinity) return null;

  // 「分」の数値を "HH:MM" のフォーマットに戻す
  const h = Math.floor(nextTrainMin / 60) % 24; // % 24 は 25:10 のような表記を 01:10 に直すため
  const m = nextTrainMin % 60;
  
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * 指定した駅・方向の、指定した時刻以前で最後の出発電車（時刻表ベース）を取得する。
 * @param stationId 基準にする駅のID（例: 'odpt.Station:TokyoMetro.Tozai.NishiFunabashi'）
 * @param direction 進行方向
 * @param timeLimit 制限する時刻（この時刻以前の電車を探す）
 * @returns 次の発車時刻の文字列（例: "08:15"）。本日の最終電車が終わっている場合は null。
 */
export async function getLastDepartureTime(
  stationId: string,
  direction: 'nakano' | 'nishifunabashi',
  timeLimit: Date
): Promise<string | null> {
  // 現在時刻を「0時起点の分」に変換（例: 8時10分 -> 490）
  const nowMin = timeLimit.getHours() * 60 + timeLimit.getMinutes();
  
  // 今日のカレンダー（平日 or 土日祝）を取得
  const calendar = calendarForDate(timeLimit);
  
  // 今日の時刻表を全件取得
  const timetables = await fetchTozaiTimetables(calendar);

  let lastTrainMin = -Infinity;
  let lastTrainid = null;

  // 全ての列車の時刻表をループして、条件に合う最短の時間を探す
  for (const tt of timetables) {
    // 1. 進行方向が違う列車はスキップ
    if (directionFromRail(tt.railDirection) !== direction) continue;

    // 2. この列車が該当の駅に停車するか確認
    const stop = tt.stops.find((s) => s.stationId === stationId);
    if (!stop) continue;

    // 3. 現在時刻以前で、かつ今まで見つけた時間より遅いものを記録
    // （※深夜の日跨ぎ考慮として、timeMinは24時以降を1440以上として扱っています）
    if (stop.timeMin <= nowMin && stop.timeMin > lastTrainMin) {
      lastTrainMin = stop.timeMin;
      lastTrainid = tt.id;
    }
  }

  // もし該当する電車がない（終電後など）場合はnullを返す
  return lastTrainid;
}

/**
 * 指定された電車が指定された駅を発車する時刻を特定する 
 * @param stationId 基準にする駅のID（例: 'odpt.Station:TokyoMetro.Tozai.NishiFunabashi'）
 * @param direction 進行方向
 * @param trainid 電車のID(odpt:Train owl:sameAs)
 * @returns 次の発車時刻の文字列（例: "08:15"）。本日の最終電車が終わっている場合は null。
 */
export async function getDepartureTime(
  stationId: string,
  trainid: string,
): Promise<string | null> {
  const now = new Date();
  // 現在時刻を「0時起点の分」に変換（例: 8時10分 -> 490）
  const nowMin = now.getHours() * 60 + now.getMinutes();
  
  // 今日のカレンダー（平日 or 土日祝）を取得
  const calendar = calendarForDate(now);
  
  // 今日の時刻表を全件取得
  const timetables = await fetchTozaiTimetables(calendar);

  let nextTrainMin = Infinity;

  // 全ての列車の時刻表をループして、条件に合う最短の時間を探す
  for (const tt of timetables) {
    // 1. 指定された列車以外はスキップ
    if (tt.id !== trainid) continue;

    // 2. この列車が該当の駅に停車するか確認
    const stop = tt.stops.find((s) => s.stationId === stationId);
    if (!stop) continue;

    // 3. 現在時刻以降で、かつ今まで見つけた時間より早いものを記録
    // （※深夜の日跨ぎ考慮として、timeMinは24時以降を1440以上として扱っています）
    if (stop.timeMin < nextTrainMin) {
      nextTrainMin = stop.timeMin;
    }
  }

  // もし該当する電車がない（終電後など）場合はnullを返す
  if (nextTrainMin === Infinity) return null;

  // 「分」の数値を "HH:MM" のフォーマットに戻す
  const h = Math.floor(nextTrainMin / 60) % 24; // % 24 は 25:10 のような表記を 01:10 に直すため
  const m = nextTrainMin % 60;
  
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}



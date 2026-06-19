import { useEffect, useState } from 'react';
import {
  calendarForDate,
  fetchTozaiStations,
  fetchTozaiTimetables,
  fetchTozaiTrainInformation,
  fetchTozaiTrains,
  OdptStation,
  OdptTrain,
  OdptTrainInformation,
  TozaiTimetable,
} from './odpt';

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

/** 東西線の駅一覧を取得する。マウント時に一度だけ読み込む。 */
export function useTozaiStations(): AsyncState<OdptStation[]> {
  const [state, setState] = useState<AsyncState<OdptStation[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true; // アンマウント後の状態更新を防ぐ
    fetchTozaiStations()
      .then((stations) => {
        if (active) setState({ data: stations, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (active)
          setState({ data: null, loading: false, error: errorMessage(err) });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}

/**
 * 東西線の運行情報を取得する。
 * @param refreshMs 自動更新の間隔（ミリ秒）。既定は60秒。レート制限に配慮し短くしすぎない。
 */
export function useTozaiTrainInformation(
  refreshMs = 60_000,
): AsyncState<OdptTrainInformation> {
  const [state, setState] = useState<AsyncState<OdptTrainInformation>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;

    const load = () => {
      fetchTozaiTrainInformation()
        .then((info) => {
          if (active) setState({ data: info, loading: false, error: null });
        })
        .catch((err: unknown) => {
          // 取得済みデータは残しつつエラーだけ更新する
          if (active)
            setState((prev) => ({ ...prev, loading: false, error: errorMessage(err) }));
        });
    };

    load();
    const timerId = setInterval(load, refreshMs);
    return () => {
      active = false;
      clearInterval(timerId);
    };
  }, [refreshMs]);

  return state;
}

/**
 * 東西線の走行中列車を取得する。
 * @param refreshMs 自動更新の間隔（ミリ秒）。既定は20秒（列車位置は変化が速いため運行情報より短め）。
 */
export function useTozaiTrains(refreshMs = 20_000): AsyncState<OdptTrain[]> {
  const [state, setState] = useState<AsyncState<OdptTrain[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;

    const load = () => {
      fetchTozaiTrains()
        .then((trains) => {
          if (active) setState({ data: trains, loading: false, error: null });
        })
        .catch((err: unknown) => {
          if (active)
            setState((prev) => ({ ...prev, loading: false, error: errorMessage(err) }));
        });
    };

    load();
    const timerId = setInterval(load, refreshMs);
    return () => {
      active = false;
      clearInterval(timerId);
    };
  }, [refreshMs]);

  return state;
}

/**
 * 今日のカレンダー（平日/土休日）に対応する東西線の列車時刻表を取得する。
 * 時刻表は日中ほぼ不変なのでマウント時に1回だけ取得する。
 */
export function useTozaiTimetables(): AsyncState<TozaiTimetable[]> {
  const [state, setState] = useState<AsyncState<TozaiTimetable[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    const calendar = calendarForDate(jstDate());
    fetchTozaiTimetables(calendar)
      .then((timetables) => {
        if (active) setState({ data: timetables, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (active)
          setState({ data: null, loading: false, error: errorMessage(err) });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}

/**
 * JSTの現在時刻を「0時起点の分(0-1439)」で返し、一定間隔で更新する。
 * 列車位置の再計算トリガーに使う。
 * @param refreshMs 更新間隔（ミリ秒）。既定15秒。
 */
export function useNowMinutes(refreshMs = 15_000): number {
  const [nowMin, setNowMin] = useState<number>(() => jstMinutes());

  useEffect(() => {
    const tick = () => setNowMin(jstMinutes());
    tick();
    const timerId = setInterval(tick, refreshMs);
    return () => clearInterval(timerId);
  }, [refreshMs]);

  return nowMin;
}

/** JSTの現在時刻を0時起点の分で返す（端末のタイムゾーンに依存しない）。 */
function jstMinutes(): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tokyo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
  return (hour % 24) * 60 + minute;
}

/** JSTの「今日」の暦日を表す Date（ローカル0時）を返す。曜日・祝日判定に使う。 */
function jstDate(): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const year = Number(parts.find((p) => p.type === 'year')?.value);
  const month = Number(parts.find((p) => p.type === 'month')?.value);
  const day = Number(parts.find((p) => p.type === 'day')?.value);
  return new Date(year, month - 1, day);
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : '不明なエラーが発生しました';
}

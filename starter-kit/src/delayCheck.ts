export const DelayCheck= (arrivedAt: string): boolean => {
  const deadline = localStorage.getItem('startTime') ?? "09:00";
  return arrivedAt <= deadline; // 9時以前なら true を返す
};
export const DelayCheck= (boardedAt: string): boolean => {
  const deadline = localStorage.getItem('startTime') ?? "09:00";
  return boardedAt <= deadline; // 9時以前なら true を返す
};
import { getDepartureTime } from './odpt';
import { TrainSource } from './trains';

export const DelayCheck= async ({ trainId, targetId }: { trainId: string, targetId: string }): Promise<boolean> => {
  const deadline = localStorage.getItem('startTime') ?? "09:00";
  const hour = Number(deadline.split(":")[0]); 
  const min = Number(deadline.split(":")[1]);
  const deadlineMinutes = hour * 60 + min;
  const arrivalTime = await getDepartureTime(targetId, trainId) ?? "09:00";

  if(!arrivalTime) return false;

  const arrivalHour = Number(arrivalTime.split(":")[0]);
  const arrivalMin = Number(arrivalTime.split(":")[1]);
  const arrivalMinutes = arrivalHour * 60 + arrivalMin;
  return arrivalMinutes <= deadlineMinutes - Number(localStorage.getItem('walkMinutes'));
}
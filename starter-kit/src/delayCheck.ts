import { getDepartureTime } from './odpt';
import { TrainSource } from './trains';

export const DelayCheck = async (arrivalTime: string): Promise<boolean> => {
  const deadline = localStorage.getItem('startTime') ?? "09:00";
  const hour = Number(deadline.split(":")[0]); 
  const min = Number(deadline.split(":")[1]);
  const deadlineMinutes = hour * 60 + min;

  const arrivalHour = Number(arrivalTime.split(":")[0]);
  const arrivalMin = Number(arrivalTime.split(":")[1]);
  const arrivalMinutes = arrivalHour * 60 + arrivalMin;
  return arrivalMinutes <= deadlineMinutes - Number(localStorage.getItem('walkMinutes'));
}

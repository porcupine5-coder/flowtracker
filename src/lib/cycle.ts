export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

export interface CycleSettings {
  lastPeriodStart: number | string | Date;
  averageCycleLength: number;
  averagePeriodLength: number;
}

export function getCurrentPhase(settings: CycleSettings): CyclePhase | null {
  if (!settings.lastPeriodStart) return null;
  
  const lastPeriodDate = new Date(settings.lastPeriodStart);
  const today = new Date();
  
  // Reset time to midnight for accurate day calculation
  today.setHours(0, 0, 0, 0);
  lastPeriodDate.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - lastPeriodDate.getTime();
  const daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const cycleLength = settings.averageCycleLength;
  const periodLength = settings.averagePeriodLength;

  if (daysSince < 0) return null;
  
  // The cycle repeats, so we use modulo
  const cycleDay = (daysSince % cycleLength) + 1;

  if (cycleDay <= periodLength) return "menstrual";
  if (cycleDay <= Math.floor(cycleLength / 2) - 2) return "follicular";
  if (cycleDay <= Math.floor(cycleLength / 2) + 2) return "ovulation";
  return "luteal";
}

export function getCycleDay(settings: CycleSettings): number | null {
  if (!settings.lastPeriodStart) return null;
  const lastPeriodDate = new Date(settings.lastPeriodStart);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastPeriodDate.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - lastPeriodDate.getTime();
  const daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return (daysSince % settings.averageCycleLength) + 1;
}

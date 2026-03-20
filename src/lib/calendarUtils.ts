/**
 * Pure utility functions for calendar phase/period calculations.
 * Extracted for testability — no React or side-effect dependencies.
 */

export interface CycleRecord {
  startDate: string;
  endDate?: string;
  /** Per-cycle period length override (days). Falls back to defaultPeriodLength. */
  periodLength?: number;
}

export interface UserSettingsLike {
  lastPeriodStart?: string;
  averageCycleLength?: number;
  averagePeriodLength?: number;
}

/**
 * Returns the 1-based day-within-period for `dateString`, or 0 if the date
 * is not a period day for any of the supplied cycles.
 *
 * A period day is strictly defined as the first `periodLength` days from a
 * cycle's startDate.  cycle.endDate marks the end of the *full* menstrual
 * cycle (i.e., the day the next cycle started) — it does NOT extend the
 * period window.  Using endDate to gate period days was the source of the
 * visual regression where all historical logs turned red after starting a
 * new cycle.
 */
export function getPeriodDay(
  dateString: string,
  cycles: CycleRecord[],
  defaultPeriodLength: number
): number {
  if (!cycles || cycles.length === 0) return 0;

  const checkDate = new Date(dateString);

  for (const cycle of cycles) {
    const startDate = new Date(cycle.startDate);
    const daysDiff = Math.floor(
      (checkDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Use per-cycle period length when available, otherwise the user average.
    const periodLength = cycle.periodLength ?? defaultPeriodLength;

    // Period is ONLY the first periodLength days — never the full cycle span.
    if (daysDiff >= 0 && daysDiff < periodLength) {
      return daysDiff + 1;
    }
  }

  return 0;
}

/**
 * Returns the cycle phase for `dateString` based on user settings, or null
 * if no lastPeriodStart is configured or the date predates the last period.
 */
export function getPhaseForDate(
  dateString: string,
  settings: UserSettingsLike
): "menstrual" | "follicular" | "ovulation" | "luteal" | null {
  if (!settings?.lastPeriodStart) return null;

  const lastStart = new Date(settings.lastPeriodStart);
  const checkDate = new Date(dateString);
  const diff = Math.floor(
    (checkDate.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diff < 0) return null;

  const cycle = settings.averageCycleLength ?? 28;
  const period = settings.averagePeriodLength ?? 5;
  const dayInCycle = diff % cycle;

  if (dayInCycle < period) return "menstrual";
  if (dayInCycle < Math.floor(cycle / 2) - 2) return "follicular";
  if (dayInCycle < Math.floor(cycle / 2) + 2) return "ovulation";
  return "luteal";
}

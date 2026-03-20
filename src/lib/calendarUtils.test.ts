import { describe, it, expect } from "vitest";
import { getPeriodDay, getPhaseForDate } from "./calendarUtils";
import type { CycleRecord, UserSettingsLike } from "./calendarUtils";

// ---------------------------------------------------------------------------
// Pure helper that mirrors what endPeriodEarly mutation stores:
//   periodLength = daysDiff(startDate, periodEndDate) + 1
// ---------------------------------------------------------------------------
function computePeriodLength(startDate: string, periodEndDate: string): number {
  const start = new Date(startDate);
  const end = new Date(periodEndDate);
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Offset `baseDate` by `days` days and return an ISO date string. */
function addDays(baseDate: string, days: number): string {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

// ---------------------------------------------------------------------------
// getPeriodDay
// ---------------------------------------------------------------------------

describe("getPeriodDay – basic", () => {
  const cycleStart = "2026-03-01";
  const periodLength = 5;
  const cycle: CycleRecord = { startDate: cycleStart };

  it("returns 1 for the first day of the cycle (day 0 offset)", () => {
    expect(getPeriodDay(cycleStart, [cycle], periodLength)).toBe(1);
  });

  it("returns the correct day number within period (day 3 offset → day 4)", () => {
    expect(getPeriodDay(addDays(cycleStart, 3), [cycle], periodLength)).toBe(4);
  });

  it("returns the last day of period (day offset = periodLength - 1)", () => {
    expect(getPeriodDay(addDays(cycleStart, periodLength - 1), [cycle], periodLength)).toBe(periodLength);
  });

  it("returns 0 for the day immediately after period ends", () => {
    expect(getPeriodDay(addDays(cycleStart, periodLength), [cycle], periodLength)).toBe(0);
  });

  it("returns 0 for a date before the cycle start", () => {
    expect(getPeriodDay(addDays(cycleStart, -1), [cycle], periodLength)).toBe(0);
  });

  it("returns 0 for an empty cycles array", () => {
    expect(getPeriodDay(cycleStart, [], periodLength)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getPeriodDay – THE BUG FIX regression test
// ---------------------------------------------------------------------------

describe("getPeriodDay – cycle.endDate must NOT extend the period window (regression)", () => {
  /**
   * Scenario that triggered the bug:
   *   • Cycle 1 started on Mar 1 (period: 5 days)
   *   • New cycle started on Mar 29 → Cycle 1 endDate = "2026-03-29"
   * Before the fix, Mar 10 (day 9) was treated as a period day because
   * it fell within [startDate, endDate].  After the fix it must return 0.
   */
  const cycle1: CycleRecord = {
    startDate: "2026-03-01",
    endDate: "2026-03-29", // end of cycle (start of next), NOT end of period
  };

  it("does NOT mark day 9 as a period day even when endDate is set far in future", () => {
    expect(getPeriodDay("2026-03-10", [cycle1], 5)).toBe(0);
  });

  it("does NOT mark day 6 as a period day when periodLength is 5", () => {
    expect(getPeriodDay("2026-03-07", [cycle1], 5)).toBe(0);
  });

  it("still marks day 1 of cycle as period day when endDate is set", () => {
    expect(getPeriodDay("2026-03-01", [cycle1], 5)).toBe(1);
  });

  it("still marks day 5 (last period day) as period day when endDate is set", () => {
    expect(getPeriodDay("2026-03-05", [cycle1], 5)).toBe(5);
  });

  it("marks day 6 (first non-period day) as 0 even when endDate is far away", () => {
    expect(getPeriodDay("2026-03-06", [cycle1], 5)).toBe(0);
  });

  it("the day matching endDate itself is NOT a period day", () => {
    expect(getPeriodDay("2026-03-29", [cycle1], 5)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getPeriodDay – late/delayed cycle start
// ---------------------------------------------------------------------------

describe("getPeriodDay – late cycle start", () => {
  /**
   * User didn't log their period on time.  They started a new cycle 40 days
   * after the previous one, with no endDate yet on the older cycle.  The older
   * cycle should still only paint the first periodLength days.
   */
  const oldCycle: CycleRecord = { startDate: "2026-01-01" }; // no endDate yet
  const newCycle: CycleRecord = { startDate: "2026-02-10" };  // started 40 days later

  it("old cycle: day 1 is a period day", () => {
    expect(getPeriodDay("2026-01-01", [oldCycle, newCycle], 5)).toBe(1);
  });

  it("old cycle: day 5 is still a period day", () => {
    expect(getPeriodDay("2026-01-05", [oldCycle, newCycle], 5)).toBe(5);
  });

  it("old cycle: day 10 is NOT a period day", () => {
    expect(getPeriodDay("2026-01-11", [oldCycle, newCycle], 5)).toBe(0);
  });

  it("new cycle: its day 1 is a period day", () => {
    expect(getPeriodDay("2026-02-10", [oldCycle, newCycle], 5)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// getPeriodDay – per-cycle periodLength override
// ---------------------------------------------------------------------------

describe("getPeriodDay – per-cycle periodLength override", () => {
  const cycle: CycleRecord = { startDate: "2026-03-01", periodLength: 7 };

  it("uses cycle.periodLength when present (day 7 is still a period day)", () => {
    expect(getPeriodDay("2026-03-07", [cycle], 5)).toBe(7);
  });

  it("day 8 is not a period day even though defaultPeriodLength is only 5", () => {
    expect(getPeriodDay("2026-03-08", [cycle], 5)).toBe(0);
  });

  it("falls back to defaultPeriodLength when cycle.periodLength is absent", () => {
    const cycleNoOverride: CycleRecord = { startDate: "2026-03-01" };
    expect(getPeriodDay("2026-03-05", [cycleNoOverride], 5)).toBe(5);
    expect(getPeriodDay("2026-03-06", [cycleNoOverride], 5)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getPeriodDay – multiple cycles
// ---------------------------------------------------------------------------

describe("getPeriodDay – multiple cycles", () => {
  const cycles: CycleRecord[] = [
    { startDate: "2026-01-01", endDate: "2026-01-29" },
    { startDate: "2026-01-29", endDate: "2026-02-26" },
    { startDate: "2026-02-26" },
  ];

  it("correctly identifies period days across three cycles", () => {
    // Cycle 1
    expect(getPeriodDay("2026-01-01", cycles, 5)).toBe(1);
    expect(getPeriodDay("2026-01-05", cycles, 5)).toBe(5);
    expect(getPeriodDay("2026-01-06", cycles, 5)).toBe(0);
    // Cycle 2
    expect(getPeriodDay("2026-01-29", cycles, 5)).toBe(1);
    expect(getPeriodDay("2026-02-02", cycles, 5)).toBe(5);
    expect(getPeriodDay("2026-02-03", cycles, 5)).toBe(0);
    // Cycle 3 (current, no endDate)
    expect(getPeriodDay("2026-02-26", cycles, 5)).toBe(1);
    expect(getPeriodDay("2026-03-01", cycles, 5)).toBe(4);
  });

  it("dates far between cycles (non-period follicular days) return 0", () => {
    expect(getPeriodDay("2026-01-15", cycles, 5)).toBe(0);
    expect(getPeriodDay("2026-02-10", cycles, 5)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getPeriodDay – rapid log creation / same-day edge cases
// ---------------------------------------------------------------------------

describe("getPeriodDay – rapid log creation edge cases", () => {
  it("handles multiple logs on the same day (same date used twice)", () => {
    const cycle: CycleRecord = { startDate: "2026-03-01" };
    const date = "2026-03-03";
    // Both calls must return the same value regardless of order
    expect(getPeriodDay(date, [cycle], 5)).toBe(3);
    expect(getPeriodDay(date, [cycle], 5)).toBe(3);
  });

  it("cycle started today (day 0 offset) returns 1", () => {
    const today = new Date().toISOString().split("T")[0];
    const cycle: CycleRecord = { startDate: today };
    expect(getPeriodDay(today, [cycle], 5)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// getPhaseForDate
// ---------------------------------------------------------------------------

describe("getPhaseForDate", () => {
  const settings: UserSettingsLike = {
    lastPeriodStart: "2026-03-01",
    averageCycleLength: 28,
    averagePeriodLength: 5,
  };

  it("returns 'menstrual' for cycle day 1", () => {
    expect(getPhaseForDate("2026-03-01", settings)).toBe("menstrual");
  });

  it("returns 'menstrual' for cycle day 5 (last period day)", () => {
    expect(getPhaseForDate("2026-03-05", settings)).toBe("menstrual");
  });

  it("returns 'follicular' for cycle day 6", () => {
    expect(getPhaseForDate("2026-03-06", settings)).toBe("follicular");
  });

  it("returns 'ovulation' around mid-cycle (day 12–16 for 28-day cycle)", () => {
    // midpoint = 14; ovulation window = 12..15
    expect(getPhaseForDate("2026-03-13", settings)).toBe("ovulation");
    expect(getPhaseForDate("2026-03-14", settings)).toBe("ovulation");
    expect(getPhaseForDate("2026-03-15", settings)).toBe("ovulation");
  });

  it("returns 'luteal' after ovulation", () => {
    expect(getPhaseForDate("2026-03-17", settings)).toBe("luteal");
    expect(getPhaseForDate("2026-03-28", settings)).toBe("luteal");
  });

  it("returns 'menstrual' again after a full cycle (day 29 wraps back to day 1)", () => {
    expect(getPhaseForDate("2026-03-29", settings)).toBe("menstrual");
  });

  it("returns null for a date before lastPeriodStart", () => {
    expect(getPhaseForDate("2026-02-28", settings)).toBeNull();
  });

  it("returns null when lastPeriodStart is missing", () => {
    expect(getPhaseForDate("2026-03-10", {})).toBeNull();
  });

  it("handles late cycle start (cycle longer than average)", () => {
    // If the user tracks a delayed/late cycle we just use modulo — result
    // must still be a valid phase name, never null for dates after start.
    const lateSettings: UserSettingsLike = {
      lastPeriodStart: "2026-01-01",
      averageCycleLength: 28,
      averagePeriodLength: 5,
    };
    const phase = getPhaseForDate("2026-03-19", lateSettings);
    expect(["menstrual", "follicular", "ovulation", "luteal"]).toContain(phase);
  });
});

// ---------------------------------------------------------------------------
// Early period termination regression suite
//
// Mirrors what endPeriodEarly mutation does:
//   cycle.periodLength = (periodEndDate - startDate in days) + 1
//
// Runs for 1–7 days early relative to a 5-day predicted period.
// ---------------------------------------------------------------------------

describe("getPeriodDay – early period termination (1–7 days early)", () => {
  const cycleStart = "2026-03-01";
  const defaultPeriodLength = 5; // predicted

  // daysEarly=1 → last flow day = day 4 (offset 3), actualPeriodLength = 4
  // daysEarly=2 → last flow day = day 3 (offset 2), actualPeriodLength = 3
  // etc.
  for (let daysEarly = 1; daysEarly <= Math.min(7, defaultPeriodLength - 1); daysEarly++) {
    const lastFlowOffset = defaultPeriodLength - 1 - daysEarly; // 0-based
    const actualPeriodLength = lastFlowOffset + 1;
    const periodEndDate = addDays(cycleStart, lastFlowOffset);
    const dayAfterEnd = addDays(cycleStart, lastFlowOffset + 1);
    const originalLastDay = addDays(cycleStart, defaultPeriodLength - 1);

    describe(`${daysEarly} day(s) early → actualPeriodLength=${actualPeriodLength}`, () => {
      const cycle: CycleRecord = {
        startDate: cycleStart,
        periodLength: actualPeriodLength,
      };

      it("cycle day 1 is always a period day", () => {
        expect(getPeriodDay(cycleStart, [cycle], defaultPeriodLength)).toBe(1);
      });

      it("last actual flow day is a period day", () => {
        expect(getPeriodDay(periodEndDate, [cycle], defaultPeriodLength)).toBe(actualPeriodLength);
      });

      it("day after last actual flow day is NOT a period day (red removed)", () => {
        expect(getPeriodDay(dayAfterEnd, [cycle], defaultPeriodLength)).toBe(0);
      });

      it("original predicted last day is NOT a period day after early end", () => {
        if (originalLastDay !== periodEndDate) {
          expect(getPeriodDay(originalLastDay, [cycle], defaultPeriodLength)).toBe(0);
        }
      });
    });
  }

  it("ending on day 1 (single-day period) marks only day 1 as period", () => {
    const cycle: CycleRecord = { startDate: cycleStart, periodLength: 1 };
    expect(getPeriodDay(cycleStart, [cycle], defaultPeriodLength)).toBe(1);
    expect(getPeriodDay(addDays(cycleStart, 1), [cycle], defaultPeriodLength)).toBe(0);
    expect(getPeriodDay(addDays(cycleStart, 4), [cycle], defaultPeriodLength)).toBe(0);
  });

  it("computePeriodLength matches endPeriodEarly mutation logic", () => {
    expect(computePeriodLength("2026-03-01", "2026-03-01")).toBe(1);  // same day
    expect(computePeriodLength("2026-03-01", "2026-03-05")).toBe(5);  // full 5-day period
    expect(computePeriodLength("2026-03-01", "2026-03-03")).toBe(3);  // 2 days early
    expect(computePeriodLength("2026-03-01", "2026-03-04")).toBe(4);  // 1 day early
  });

  it("endPeriodEarly with endDate=cycleStart sets periodLength=1, no reds after day 1", () => {
    const cycle: CycleRecord = {
      startDate: cycleStart,
      periodLength: computePeriodLength(cycleStart, cycleStart),
    };
    expect(cycle.periodLength).toBe(1);
    expect(getPeriodDay(cycleStart, [cycle], defaultPeriodLength)).toBe(1);
    for (let d = 1; d < defaultPeriodLength; d++) {
      expect(getPeriodDay(addDays(cycleStart, d), [cycle], defaultPeriodLength)).toBe(0);
    }
  });
});

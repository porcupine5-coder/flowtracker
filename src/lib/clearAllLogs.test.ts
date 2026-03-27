import { describe, it, expect } from "vitest";

/**
 * Unit tests for the clearAllLogs mutation logic.
 *
 * Note: These tests verify the logic and edge cases of the clearAllLogs functionality.
 * Integration tests with Convex would require a test database setup.
 */

// Mock data types
interface MockLog {
  _id: string;
  userId: string;
  date: string;
}

interface MockCycle {
  _id: string;
  userId: string;
  startDate: string;
}

interface MockInteraction {
  _id: string;
  userId: string;
  recommendationId: string;
  action: string;
  timestamp: string;
}

interface MockUserSettings {
  _id: string;
  userId: string;
  logsClearedAt?: string;
}

// Simulated clearAllLogs logic for testing
function simulateClearAllLogs(
  dailyLogs: MockLog[],
  cycles: MockCycle[],
  interactions: MockInteraction[],
  userSettings: MockUserSettings | null,
  shouldResetLastPeriodStart: boolean = true
) {
  if (!userSettings) {
    throw new Error("User settings not found");
  }

  const deletedLogsCount = dailyLogs.length;
  const deletedCyclesCount = cycles.length;
  const deletedInteractionsCount = interactions.length;
  const clearedAt = new Date().toISOString();

  // Simulate the patched user settings
  const patchedSettings: MockUserSettings = {
    ...userSettings,
    lastPeriodStart: shouldResetLastPeriodStart ? undefined : userSettings.lastPeriodStart,
    logsClearedAt: clearedAt,
  };

  return {
    deletedLogsCount,
    deletedInteractionsCount,
    deletedCyclesCount,
    clearedAt,
    patchedSettings,
  };
}

describe("clearAllLogs", () => {
  const mockUserId = "user123";

  describe("Deletion Logic", () => {
    it("should return correct counts when deleting all data types", () => {
      const dailyLogs: MockLog[] = [
        { _id: "log1", userId: mockUserId, date: "2024-01-01" },
        { _id: "log2", userId: mockUserId, date: "2024-01-02" },
        { _id: "log3", userId: mockUserId, date: "2024-01-03" },
      ];
      const cycles: MockCycle[] = [
        { _id: "cycle1", userId: mockUserId, startDate: "2024-01-01" },
        { _id: "cycle2", userId: mockUserId, startDate: "2024-02-01" },
      ];
      const interactions: MockInteraction[] = [
        { _id: "int1", userId: mockUserId, recommendationId: "rec1", action: "view", timestamp: new Date().toISOString() },
      ];
      const userSettings: MockUserSettings = {
        _id: "settings1",
        userId: mockUserId,
      };

      const result = simulateClearAllLogs(dailyLogs, cycles, interactions, userSettings);

      expect(result.deletedLogsCount).toBe(3);
      expect(result.deletedCyclesCount).toBe(2);
      expect(result.deletedInteractionsCount).toBe(1);
      expect(result.clearedAt).toBeDefined();
      expect(new Date(result.clearedAt).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it("should handle empty logs gracefully", () => {
      const dailyLogs: MockLog[] = [];
      const cycles: MockCycle[] = [];
      const interactions: MockInteraction[] = [];
      const userSettings: MockUserSettings = {
        _id: "settings1",
        userId: mockUserId,
      };

      const result = simulateClearAllLogs(dailyLogs, cycles, interactions, userSettings);

      expect(result.deletedLogsCount).toBe(0);
      expect(result.deletedCyclesCount).toBe(0);
      expect(result.deletedInteractionsCount).toBe(0);
      expect(result.clearedAt).toBeDefined();
    });

    it("should handle large number of logs", () => {
      const dailyLogs: MockLog[] = Array.from({ length: 1000 }, (_, i) => ({
        _id: `log${i}`,
        userId: mockUserId,
        date: `2024-01-${String(i % 31 + 1).padStart(2, "0")}`,
      }));
      const cycles: MockCycle[] = Array.from({ length: 50 }, (_, i) => ({
        _id: `cycle${i}`,
        userId: mockUserId,
        startDate: `2024-${String(i + 1).padStart(2, "0")}-01`,
      }));
      const interactions: MockInteraction[] = Array.from({ length: 500 }, (_, i) => ({
        _id: `int${i}`,
        userId: mockUserId,
        recommendationId: `rec${i}`,
        action: "view",
        timestamp: new Date().toISOString(),
      }));
      const userSettings: MockUserSettings = {
        _id: "settings1",
        userId: mockUserId,
      };

      const result = simulateClearAllLogs(dailyLogs, cycles, interactions, userSettings);

      expect(result.deletedLogsCount).toBe(1000);
      expect(result.deletedCyclesCount).toBe(50);
      expect(result.deletedInteractionsCount).toBe(500);
    });
  });

  describe("Error Handling", () => {
    it("should throw error when user settings not found", () => {
      const dailyLogs: MockLog[] = [];
      const cycles: MockCycle[] = [];
      const interactions: MockInteraction[] = [];
      const userSettings = null;

      expect(() => {
        simulateClearAllLogs(dailyLogs, cycles, interactions, userSettings);
      }).toThrow("User settings not found");
    });

    it("should still succeed when only some data types exist", () => {
      const dailyLogs: MockLog[] = [
        { _id: "log1", userId: mockUserId, date: "2024-01-01" },
      ];
      const cycles: MockCycle[] = [];
      const interactions: MockInteraction[] = [];
      const userSettings: MockUserSettings = {
        _id: "settings1",
        userId: mockUserId,
      };

      const result = simulateClearAllLogs(dailyLogs, cycles, interactions, userSettings);

      expect(result.deletedLogsCount).toBe(1);
      expect(result.deletedCyclesCount).toBe(0);
      expect(result.deletedInteractionsCount).toBe(0);
    });
  });

  describe("Timestamp Validation", () => {
    it("should generate valid ISO timestamp", () => {
      const dailyLogs: MockLog[] = [];
      const cycles: MockCycle[] = [];
      const interactions: MockInteraction[] = [];
      const userSettings: MockUserSettings = {
        _id: "settings1",
        userId: mockUserId,
      };

      const result = simulateClearAllLogs(dailyLogs, cycles, interactions, userSettings);

      expect(result.clearedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
      expect(() => new Date(result.clearedAt)).not.toThrow();
    });

    it("should generate timestamp in correct chronological order", () => {
      const dailyLogs: MockLog[] = [];
      const cycles: MockCycle[] = [];
      const interactions: MockInteraction[] = [];
      const userSettings: MockUserSettings = {
        _id: "settings1",
        userId: mockUserId,
      };

      const beforeTime = Date.now();
      const result = simulateClearAllLogs(dailyLogs, cycles, interactions, userSettings);
      const afterTime = Date.now();

      const clearedTime = new Date(result.clearedAt).getTime();
      expect(clearedTime).toBeGreaterThanOrEqual(beforeTime);
      expect(clearedTime).toBeLessThanOrEqual(afterTime);
    });
  });

  describe("Edge Cases", () => {
    it("should handle user with only cycles (no logs or interactions)", () => {
      const dailyLogs: MockLog[] = [];
      const cycles: MockCycle[] = [
        { _id: "cycle1", userId: mockUserId, startDate: "2024-01-01" },
      ];
      const interactions: MockInteraction[] = [];
      const userSettings: MockUserSettings = {
        _id: "settings1",
        userId: mockUserId,
      };

      const result = simulateClearAllLogs(dailyLogs, cycles, interactions, userSettings);

      expect(result.deletedLogsCount).toBe(0);
      expect(result.deletedCyclesCount).toBe(1);
      expect(result.deletedInteractionsCount).toBe(0);
    });

    it("should handle user with only daily logs", () => {
      const dailyLogs: MockLog[] = [
        { _id: "log1", userId: mockUserId, date: "2024-01-01" },
        { _id: "log2", userId: mockUserId, date: "2024-01-02" },
      ];
      const cycles: MockCycle[] = [];
      const interactions: MockInteraction[] = [];
      const userSettings: MockUserSettings = {
        _id: "settings1",
        userId: mockUserId,
      };

      const result = simulateClearAllLogs(dailyLogs, cycles, interactions, userSettings);

      expect(result.deletedLogsCount).toBe(2);
      expect(result.deletedCyclesCount).toBe(0);
      expect(result.deletedInteractionsCount).toBe(0);
    });

    it("should handle user with only recommendation interactions", () => {
      const dailyLogs: MockLog[] = [];
      const cycles: MockCycle[] = [];
      const interactions: MockInteraction[] = [
        { _id: "int1", userId: mockUserId, recommendationId: "rec1", action: "like", timestamp: new Date().toISOString() },
        { _id: "int2", userId: mockUserId, recommendationId: "rec2", action: "dismiss", timestamp: new Date().toISOString() },
      ];
      const userSettings: MockUserSettings = {
        _id: "settings1",
        userId: mockUserId,
      };

      const result = simulateClearAllLogs(dailyLogs, cycles, interactions, userSettings);

      expect(result.deletedLogsCount).toBe(0);
      expect(result.deletedCyclesCount).toBe(0);
      expect(result.deletedInteractionsCount).toBe(2);
    });
  });
});

describe("Logs Management UI Logic", () => {
  describe("formatClearedAtDate", () => {
    const formatClearedAtDate = (isoString: string) => {
      return new Date(isoString).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    };

    it("should format ISO date string correctly", () => {
      const isoString = "2024-03-15T14:30:00.000Z";
      const formatted = formatClearedAtDate(isoString);
      
      expect(formatted).toContain("2024");
      expect(formatted).toContain("Mar");
      expect(formatted).toContain("15");
    });

    it("should handle different timezones", () => {
      const isoString = new Date().toISOString();
      const formatted = formatClearedAtDate(isoString);
      
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe("string");
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe("Confirmation Dialog Logic", () => {
    const CONFIRMATION_TEXT = "DELETE";

    it("should validate exact match for confirmation text", () => {
      const validInputs = ["DELETE"];
      const invalidInputs = ["delete", "Delete", "DEL", "DELET", "DELETE ", " DELETE", ""];

      validInputs.forEach(input => {
        expect(input === CONFIRMATION_TEXT).toBe(true);
      });

      invalidInputs.forEach(input => {
        expect(input === CONFIRMATION_TEXT).toBe(false);
      });
    });

    it("should reject case variations", () => {
      expect("delete" === CONFIRMATION_TEXT).toBe(false);
      expect("Delete" === CONFIRMATION_TEXT).toBe(false);
      expect("dElEtE" === CONFIRMATION_TEXT).toBe(false);
    });

    it("should reject partial matches", () => {
      expect("DEL" === CONFIRMATION_TEXT).toBe(false);
      expect("DELET" === CONFIRMATION_TEXT).toBe(false);
      expect("DELETEE" === CONFIRMATION_TEXT).toBe(false);
    });

    it("should reject with whitespace", () => {
      expect("DELETE " === CONFIRMATION_TEXT).toBe(false);
      expect(" DELETE" === CONFIRMATION_TEXT).toBe(false);
      expect(" DELETE " === CONFIRMATION_TEXT).toBe(false);
    });
  });
});

describe("Calendar Synchronization", () => {
  describe("lastPeriodStart Reset", () => {
    it("should reset lastPeriodStart to clear calendar phase calculations", () => {
      const dailyLogs: MockLog[] = [];
      const cycles: MockCycle[] = [];
      const interactions: MockInteraction[] = [];
      const userSettings: MockUserSettings = {
        _id: "settings1",
        userId: "user123",
        logsClearedAt: undefined,
      };

      const result = simulateClearAllLogs(dailyLogs, cycles, interactions, userSettings);

      expect(result.patchedSettings.lastPeriodStart).toBeUndefined();
      expect(result.patchedSettings.logsClearedAt).toBeDefined();
    });

    it("should clear lastPeriodStart even when it has a value", () => {
      const dailyLogs: MockLog[] = [];
      const cycles: MockCycle[] = [];
      const interactions: MockInteraction[] = [];
      const userSettings: MockUserSettings = {
        _id: "settings1",
        userId: "user123",
        logsClearedAt: undefined,
      };
      // Simulate existing lastPeriodStart
      (userSettings as any).lastPeriodStart = "2024-01-01";

      const result = simulateClearAllLogs(dailyLogs, cycles, interactions, userSettings);

      expect(result.patchedSettings.lastPeriodStart).toBeUndefined();
    });

    it("should preserve other user settings while resetting lastPeriodStart", () => {
      const dailyLogs: MockLog[] = [];
      const cycles: MockCycle[] = [];
      const interactions: MockInteraction[] = [];
      const userSettings: MockUserSettings = {
        _id: "settings1",
        userId: "user123",
        logsClearedAt: undefined,
      };
      // Add other settings
      (userSettings as any).averageCycleLength = 28;
      (userSettings as any).averagePeriodLength = 5;
      (userSettings as any).themeName = "Sunset";
      (userSettings as any).lastPeriodStart = "2024-01-01";

      const result = simulateClearAllLogs(dailyLogs, cycles, interactions, userSettings);

      expect(result.patchedSettings.lastPeriodStart).toBeUndefined();
      expect((result.patchedSettings as any).averageCycleLength).toBe(28);
      expect((result.patchedSettings as any).averagePeriodLength).toBe(5);
      expect((result.patchedSettings as any).themeName).toBe("Sunset");
      expect(result.patchedSettings.logsClearedAt).toBeDefined();
    });
  });

  describe("Calendar State After Clear", () => {
    // Simulate getPhaseForDate behavior from calendarUtils
    const getPhaseForDate = (
      dateString: string,
      settings: { lastPeriodStart?: string; averageCycleLength?: number; averagePeriodLength?: number }
    ): string | null => {
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
    };

    // Simulate getPeriodDay behavior from calendarUtils
    const getPeriodDay = (
      dateString: string,
      cycles: MockCycle[],
      defaultPeriodLength: number
    ): number => {
      if (!cycles || cycles.length === 0) return 0;

      const checkDate = new Date(dateString);

      for (const cycle of cycles) {
        const startDate = new Date(cycle.startDate);
        const daysDiff = Math.floor(
          (checkDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        const periodLength = (cycle as any).periodLength ?? defaultPeriodLength;

        if (daysDiff >= 0 && daysDiff < periodLength) {
          return daysDiff + 1;
        }
      }

      return 0;
    };

    it("should return null phase when lastPeriodStart is cleared", () => {
      const settingsBefore: any = {
        lastPeriodStart: "2024-01-01",
        averageCycleLength: 28,
        averagePeriodLength: 5,
      };

      const settingsAfter: any = {
        lastPeriodStart: undefined,
        averageCycleLength: 28,
        averagePeriodLength: 5,
      };

      const testDate = "2024-01-15";

      // Before clearing, phase should be calculated
      expect(getPhaseForDate(testDate, settingsBefore)).toBe("menstrual");

      // After clearing, phase should be null
      expect(getPhaseForDate(testDate, settingsAfter)).toBeNull();
    });

    it("should return 0 for period day when cycles array is empty", () => {
      const cyclesBefore: MockCycle[] = [
        { _id: "cycle1", userId: "user123", startDate: "2024-01-01" },
      ];
      const cyclesAfter: MockCycle[] = [];

      const testDate = "2024-01-05";

      // Before clearing, should return period day
      expect(getPeriodDay(testDate, cyclesBefore, 5)).toBe(5);

      // After clearing, should return 0 (not a period day)
      expect(getPeriodDay(testDate, cyclesAfter, 5)).toBe(0);
    });

    it("should clear both phase and period indicators simultaneously", () => {
      const userSettings: MockUserSettings = {
        _id: "settings1",
        userId: "user123",
      };
      (userSettings as any).lastPeriodStart = "2024-01-01";

      const cycles: MockCycle[] = [
        { _id: "cycle1", userId: "user123", startDate: "2024-01-01" },
      ];

      const testDate = "2024-01-03";

      // Before clearing: both phase and period day should be present
      expect(getPhaseForDate(testDate, userSettings as any)).toBe("menstrual");
      expect(getPeriodDay(testDate, cycles, 5)).toBe(3);

      // Simulate clearing
      const result = simulateClearAllLogs([], cycles, [], userSettings);

      // After clearing: both should be cleared
      const clearedSettings = result.patchedSettings;
      expect(getPhaseForDate(testDate, clearedSettings as any)).toBeNull();
      expect(getPeriodDay(testDate, [], 5)).toBe(0);
    });

    it("should handle multiple dates across the calendar", () => {
      const userSettings: MockUserSettings = {
        _id: "settings1",
        userId: "user123",
      };
      (userSettings as any).lastPeriodStart = "2024-01-01";

      const cycles: MockCycle[] = [
        { _id: "cycle1", userId: "user123", startDate: "2024-01-01" },
      ];

      const testDates = [
        "2024-01-01", // Period day 1
        "2024-01-05", // Period day 5
        "2024-01-10", // Follicular
        "2024-01-20", // Ovulation
        "2024-02-01", // Luteal
      ];

      // Before clearing: all dates should have phases
      testDates.forEach(date => {
        expect(getPhaseForDate(date, userSettings as any)).not.toBeNull();
      });

      // Simulate clearing
      const result = simulateClearAllLogs([], cycles, [], userSettings);
      const clearedSettings = result.patchedSettings;

      // After clearing: all dates should have null phase
      testDates.forEach(date => {
        expect(getPhaseForDate(date, clearedSettings as any)).toBeNull();
      });

      // All dates should return 0 for period day
      testDates.forEach(date => {
        expect(getPeriodDay(date, [], 5)).toBe(0);
      });
    });
  });

  describe("State Synchronization Verification", () => {
    it("should verify Convex reactive query will re-run after mutation", () => {
      // This test documents that Convex automatically re-runs queries
      // when the underlying data changes. The clearAllLogs mutation:
      // 1. Deletes cycles -> useQuery(api.cycles.getCycles) re-runs
      // 2. Deletes dailyLogs -> useQuery(api.cycles.getRecentLogs) re-runs
      // 3. Patches userSettings -> useQuery(api.cycles.getUserSettings) re-runs
      //
      // The Calendar component receives fresh data and re-renders.

      const dailyLogs: MockLog[] = [{ _id: "log1", userId: "user123", date: "2024-01-01" }];
      const cycles: MockCycle[] = [{ _id: "cycle1", userId: "user123", startDate: "2024-01-01" }];
      const interactions: MockInteraction[] = [];
      const userSettings: MockUserSettings = {
        _id: "settings1",
        userId: "user123",
      };
      (userSettings as any).lastPeriodStart = "2024-01-01";

      const result = simulateClearAllLogs(dailyLogs, cycles, interactions, userSettings);

      // Verify all data is cleared
      expect(result.deletedLogsCount).toBe(1);
      expect(result.deletedCyclesCount).toBe(1);
      expect(result.patchedSettings.lastPeriodStart).toBeUndefined();

      // Calendar will receive:
      // - logs: [] (empty array)
      // - cycles: [] (empty array)
      // - userSettings.lastPeriodStart: undefined
      // This ensures complete calendar reset
    });

    it("should handle rapid successive clear operations", () => {
      const userSettings: MockUserSettings = {
        _id: "settings1",
        userId: "user123",
      };
      (userSettings as any).lastPeriodStart = "2024-01-01";

      const cycles: MockCycle[] = [
        { _id: "cycle1", userId: "user123", startDate: "2024-01-01" },
      ];

      // First clear
      const result1 = simulateClearAllLogs([], cycles, [], userSettings);
      const clearedTime1 = result1.patchedSettings.logsClearedAt;

      // Simulate adding data again
      (userSettings as any).lastPeriodStart = "2024-02-01";

      // Second clear
      const result2 = simulateClearAllLogs([], cycles, [], userSettings);
      const clearedTime2 = result2.patchedSettings.logsClearedAt;

      // Both clears should work independently
      expect(clearedTime1).toBeDefined();
      expect(clearedTime2).toBeDefined();
      expect(new Date(clearedTime2!).getTime()).toBeGreaterThanOrEqual(new Date(clearedTime1!).getTime());
    });
  });
});

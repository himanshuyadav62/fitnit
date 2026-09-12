import { describe, expect, it } from "vitest";

import { buildConsistencyCalendar } from "./consistency";

describe("consistency calendar", () => {
  it("groups completed workouts in the profile timezone and calculates streaks", () => {
    const calendar = buildConsistencyCalendar([
      { completedAt: new Date("2026-09-10T12:00:00Z"), sets: 5 },
      { completedAt: new Date("2026-09-11T05:00:00Z"), sets: 12 },
      { completedAt: new Date("2026-09-11T12:00:00Z"), sets: 8 },
    ], "Asia/Kolkata", new Date("2026-09-12T06:00:00Z"));

    expect(calendar.currentStreak).toBe(2);
    expect(calendar.longestStreak).toBe(2);
    expect(calendar.activeDays).toBe(2);
    expect(calendar.totalWorkouts).toBe(3);
    expect(calendar.weeks.flat().find((day) => day.key === "2026-09-11")?.level).toBe(4);
  });

  it("falls back safely when a saved timezone is invalid", () => {
    const calendar = buildConsistencyCalendar([{ completedAt: new Date("2026-09-12T01:00:00Z"), sets: 1 }], "invalid/timezone", new Date("2026-09-12T06:00:00Z"));
    expect(calendar.activeDays).toBe(1);
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";

import { calculateNutritionTarget, coachReply, getAge } from "./fitness";

afterEach(() => vi.useRealTimers());

describe("fitness calculations", () => {
  it("calculates an age without rounding before the birthday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-06T10:00:00Z"));
    expect(getAge("2001-09-07")).toBe(24);
    expect(getAge("2001-09-06")).toBe(25);
  });

  it("creates higher energy targets for muscle gain than fat loss", () => {
    const baseline = {
      weightKg: 52,
      heightCm: 170,
      age: 25,
      sexAtBirth: "male" as const,
      activityLevel: "moderate",
    };
    const gain = calculateNutritionTarget({ ...baseline, goal: "build_muscle" });
    const loss = calculateNutritionTarget({ ...baseline, goal: "lose_fat" });
    expect(gain.calories).toBeGreaterThan(loss.calories);
    expect(gain.proteinG).toBe(94);
  });
});

describe("mock coach guardrails", () => {
  it("prioritizes a safety response when pain is mentioned", () => {
    const reply = coachReply("I feel sharp chest pain", { workoutCount: 2, proteinTarget: 90 });
    expect(reply).toMatch(/medical guidance/i);
  });

  it("uses the member protein target in nutrition guidance", () => {
    const reply = coachReply("How much vegan protein?", { workoutCount: 2, proteinTarget: 96 });
    expect(reply).toContain("96 g");
  });
});

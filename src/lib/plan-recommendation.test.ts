import { describe, expect, it } from "vitest";

import { recommendPlanSlug } from "./plan-recommendation";

describe("recommendPlanSlug", () => {
  it("matches two through six day schedules to purpose-built plans", () => {
    expect(recommendPlanSlug(2, "build_muscle", "vegan")).toBe("minimalist-full-body-2-day");
    expect(recommendPlanSlug(4, "build_muscle")).toBe("upper-lower-builder-4-day");
    expect(recommendPlanSlug(5, "general_fitness")).toBe("strength-athletic-5-day");
    expect(recommendPlanSlug(6, "build_muscle")).toBe("push-pull-legs-6-day");
  });

  it("selects the three-day strength track when strength is the goal", () => {
    expect(recommendPlanSlug(3, "get_stronger", "vegan")).toBe("strength-foundations-3-day");
  });
});

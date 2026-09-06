export const PLAN_OPTIONS = [
  { slug: "minimalist-full-body-2-day", days: 2, label: "Minimalist Full Body", level: "Beginner", goal: "General fitness" },
  { slug: "beginner-vegan-muscle-gain-3-day", days: 3, label: "Vegan Muscle Gain", level: "Beginner", goal: "Build muscle" },
  { slug: "strength-foundations-3-day", days: 3, label: "Strength Foundations", level: "Beginner", goal: "Get stronger" },
  { slug: "upper-lower-builder-4-day", days: 4, label: "Upper / Lower Builder", level: "Intermediate", goal: "Build muscle" },
  { slug: "strength-athletic-5-day", days: 5, label: "Strength + Athletic", level: "Intermediate", goal: "General fitness" },
  { slug: "push-pull-legs-6-day", days: 6, label: "Push / Pull / Legs", level: "Intermediate", goal: "Build muscle" },
] as const;

export function recommendPlanSlug(days: number, goal: string, diet?: string) {
  if (days <= 2) return "minimalist-full-body-2-day";
  if (days === 3 && goal === "get_stronger") return "strength-foundations-3-day";
  if (days === 3 && (goal === "build_muscle" || diet === "vegan")) return "beginner-vegan-muscle-gain-3-day";
  if (days === 3) return "strength-foundations-3-day";
  if (days === 4) return "upper-lower-builder-4-day";
  if (days === 5) return "strength-athletic-5-day";
  return "push-pull-legs-6-day";
}

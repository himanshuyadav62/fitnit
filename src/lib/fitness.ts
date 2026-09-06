export type NutritionInput = {
  weightKg: number;
  heightCm: number;
  age: number;
  sexAtBirth: "male" | "female" | "intersex" | "prefer_not_to_say";
  activityLevel: string;
  goal: "build_muscle" | "lose_fat" | "get_stronger" | "general_fitness";
};

export function calculateNutritionTarget(input: NutritionInput) {
  const sexAdjustment = input.sexAtBirth === "male" ? 5 : input.sexAtBirth === "female" ? -161 : -78;
  const bmr = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age + sexAdjustment;
  const activityMultiplier: Record<string, number> = {
    low: 1.3,
    moderate: 1.5,
    high: 1.7,
  };
  const goalAdjustment = input.goal === "lose_fat" ? -300 : input.goal === "build_muscle" ? 250 : 0;
  const calories = Math.round((bmr * (activityMultiplier[input.activityLevel] ?? 1.4) + goalAdjustment) / 50) * 50;
  const proteinMultiplier = input.goal === "build_muscle" || input.goal === "lose_fat" ? 1.8 : 1.6;
  return {
    calories: Math.max(1400, calories),
    proteinG: Math.round(input.weightKg * proteinMultiplier),
  };
}

export function getAge(birthDate: string) {
  const birth = new Date(`${birthDate}T00:00:00Z`);
  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday =
    now.getUTCMonth() < birth.getUTCMonth() ||
    (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() < birth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

export function coachReply(message: string, context: { workoutCount: number; proteinTarget?: number | null }) {
  const lower = message.toLowerCase();
  if (/pain|injur|dizz|chest|faint/.test(lower)) {
    return "Pause the exercise and avoid training through sharp, worsening, or unexplained pain. I can help with a low-stress alternative, but chest pain, fainting, severe shortness of breath, or a new injury needs prompt medical guidance.";
  }
  if (/protein|vegan|food|meal/.test(lower)) {
    return `Aim for about ${context.proteinTarget ?? 90} g protein across 3–5 meals. Useful vegan anchors include tofu, tempeh, seitan, lentils, beans, soy milk, and a pea/soy blend. Increase fiber gradually and include a reliable B12 source.`;
  }
  if (/weight|load|progress|strong/.test(lower)) {
    return "Use double progression: keep the same load until every set reaches the top of its rep range with about 2 reps left in reserve. Then add the smallest available load and work back up from the lower end.";
  }
  if (/sore|tired|sleep|recover/.test(lower)) {
    return "Keep today easy if warm-ups feel unusually heavy. Reduce each lift by one set or 5–10% load, keep 3–4 reps in reserve, and prioritize sleep and regular meals. Persistent fatigue is a signal to review total training and life stress.";
  }
  return context.workoutCount === 0
    ? "Start with your first planned workout and keep every set technically comfortable—about 2–3 reps in reserve. Log the result, then I can guide the next small progression."
    : "Keep the next step small: repeat clean technique, add a rep where you can, and only add load after you own the top of the rep range. What exercise or recovery issue should we look at?";
}

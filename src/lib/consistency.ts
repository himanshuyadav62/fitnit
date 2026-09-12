export type ConsistencySession = { completedAt: Date | null; sets: number };
export type ConsistencyDay = { date: Date; key: string; workouts: number; sets: number; level: 0 | 1 | 2 | 3 | 4; future: boolean };

function dateKey(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function buildConsistencyCalendar(sessions: ConsistencySession[], requestedTimeZone: string, now = new Date()) {
  let timeZone = requestedTimeZone;
  try { new Intl.DateTimeFormat("en-US", { timeZone }).format(now); } catch { timeZone = "UTC"; }
  const todayKey = dateKey(now, timeZone);
  const today = new Date(`${todayKey}T00:00:00Z`);
  const start = addDays(today, -(today.getUTCDay() + 52 * 7));
  const activity = new Map<string, { workouts: number; sets: number }>();

  for (const session of sessions) {
    if (!session.completedAt) continue;
    const key = dateKey(session.completedAt, timeZone);
    const current = activity.get(key) ?? { workouts: 0, sets: 0 };
    activity.set(key, { workouts: current.workouts + 1, sets: current.sets + session.sets });
  }

  const days: ConsistencyDay[] = Array.from({ length: 53 * 7 }, (_, index) => {
    const date = addDays(start, index);
    const key = date.toISOString().slice(0, 10);
    const value = activity.get(key) ?? { workouts: 0, sets: 0 };
    const level = value.workouts === 0 ? 0 : value.workouts >= 2 || value.sets >= 18 ? 4 : value.sets >= 12 ? 3 : value.sets >= 6 ? 2 : 1;
    return { date, key, ...value, level, future: key > todayKey };
  });

  const activeKeys = new Set(days.filter((day) => !day.future && day.workouts > 0).map((day) => day.key));
  let streakDate = activeKeys.has(todayKey) ? today : addDays(today, -1);
  let currentStreak = 0;
  while (activeKeys.has(streakDate.toISOString().slice(0, 10))) { currentStreak++; streakDate = addDays(streakDate, -1); }
  let longestStreak = 0;
  let runningStreak = 0;
  for (const day of days) {
    if (day.future) break;
    runningStreak = day.workouts > 0 ? runningStreak + 1 : 0;
    longestStreak = Math.max(longestStreak, runningStreak);
  }

  return {
    weeks: Array.from({ length: 53 }, (_, index) => days.slice(index * 7, index * 7 + 7)),
    currentStreak,
    longestStreak,
    activeDays: activeKeys.size,
    totalWorkouts: days.reduce((sum, day) => sum + day.workouts, 0),
    totalSets: days.reduce((sum, day) => sum + day.sets, 0),
  };
}

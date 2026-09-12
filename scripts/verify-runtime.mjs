import nextEnv from "@next/env";
import postgres from "postgres";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const email = `runtime-check-${Date.now()}@example.com`;
const password = `Check-${crypto.randomUUID()}!`;
const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  const [videoCoverage] = await sql`select count(*)::int as total, count(video_url)::int as with_video from exercises where created_by_user_id is null`;
  assert(videoCoverage.total > 0 && videoCoverage.with_video === videoCoverage.total, "Every built-in exercise should have a form video");

  const publicPage = await fetch(`${baseUrl}/plans/starter`);
  assert(publicPage.ok, `Starter plan returned ${publicPage.status}`);
  assert((await publicPage.text()).includes("Beginner Vegan Muscle Gain"), "Starter plan seed was not rendered");
  const privatePhoto = await fetch(`${baseUrl}/api/transformation-photos/00000000-0000-4000-8000-000000000000`);
  assert(privatePhoto.status === 401, "Transformation photos must reject unauthenticated requests");
  const privatePhotoDelete = await fetch(`${baseUrl}/api/transformation-photos/00000000-0000-4000-8000-000000000000`, { method: "DELETE" });
  assert(privatePhotoDelete.status === 401, "Transformation photo deletion must reject unauthenticated requests");
  const [benchGuide, deadliftGuide] = await Promise.all([
    fetch(`${baseUrl}/exercises/barbell-bench-press`),
    fetch(`${baseUrl}/exercises/barbell-deadlift`),
  ]);
  assert(benchGuide.ok && deadliftGuide.ok, "Public Bench Press and Deadlift guides should render without authentication");
  const [benchGuideHtml, deadliftGuideHtml] = await Promise.all([benchGuide.text(), deadliftGuide.text()]);
  assert(benchGuideHtml.includes("Detailed technique notes") && benchGuideHtml.includes("Wrists fold far backward"), "Bench Press guide did not render its expanded technique notes");
  assert(deadliftGuideHtml.includes("Detailed technique notes") && deadliftGuideHtml.includes("The bar drifts away from the legs"), "Deadlift guide did not render its expanded technique notes");

  const signUp = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: baseUrl },
    body: JSON.stringify({ name: "Runtime Check", email, password }),
  });
  if (!signUp.ok) throw new Error(`Sign-up returned ${signUp.status}: ${await signUp.text()}`);
  const signUpBody = await signUp.json();
  const userId = signUpBody.user?.id;
  assert(userId, "Sign-up did not return a user id");
  const cookie = signUp.headers.get("set-cookie")?.split(";")[0];
  assert(cookie, "Sign-up did not return a session cookie");

  const dashboard = await fetch(`${baseUrl}/app`, { headers: { cookie } });
  assert(dashboard.ok, `Dashboard returned ${dashboard.status}`);
  assert((await dashboard.text()).includes("build your baseline"), "Protected dashboard did not render onboarding state");

  const [template] = await sql`select id from plan_templates order by is_featured desc limit 1`;
  const [exercise] = await sql`select id, name, slug, equipment from exercises order by name limit 1`;
  const [plan] = await sql`insert into plans (user_id, source_template_id, name, goal, is_current, days_per_week, duration_weeks) values (${userId}, ${template.id}, 'Runtime strength plan', 'get_stronger', true, 3, 8) returning id`;
  const [secondPlan] = await sql`insert into plans (user_id, source_template_id, name, goal, is_current, days_per_week, duration_weeks) values (${userId}, ${template.id}, 'Runtime fitness plan', 'general_fitness', false, 4, 8) returning id`;
  const [planCounts] = await sql`select count(*)::int as total, count(*) filter (where is_current)::int as current from plans where user_id = ${userId} and status = 'active'`;
  assert(planCounts.total === 2 && planCounts.current === 1, "A user should keep multiple active plans with exactly one current plan");
  await sql`insert into profiles (user_id, goal, experience, diet, days_per_week, onboarding_complete) values (${userId}, 'get_stronger', 'beginner', 'vegan', 3, true)`;
  const planWorkspace = await fetch(`${baseUrl}/app/plans`, { headers: { cookie } });
  assert(planWorkspace.ok, `Plan workspace returned ${planWorkspace.status}`);
  const planWorkspaceHtml = await planWorkspace.text();
  assert(planWorkspaceHtml.includes("Runtime strength plan") && planWorkspaceHtml.includes("Runtime fitness plan"), "Plan workspace did not render both saved plans");
  const templatePreview = await fetch(`${baseUrl}/app/plans/strength-foundations-3-day`, { headers: { cookie } });
  assert(templatePreview.ok && (await templatePreview.text()).includes("View video &amp; technique"), "Template exercises should link to their video and technique guides");
  const [workout] = await sql`insert into plan_workouts (plan_id, day_number, title, focus) values (${plan.id}, 1, 'Deleted history day', 'Runtime analytics verification') returning id`;
  const [remainingWorkout] = await sql`insert into plan_workouts (plan_id, day_number, title, focus) values (${plan.id}, 2, 'Remaining live day', 'Runtime deletion verification') returning id`;
  const [planExercise] = await sql`insert into plan_exercises (workout_id, exercise_id, sort_order, sets, rep_min, rep_max, rest_seconds, target_rir) values (${workout.id}, ${exercise.id}, 1, 1, 8, 12, 90, 2) returning id`;
  const [workoutSession] = await sql`insert into workout_sessions (user_id, plan_workout_id, started_at, completed_at, perceived_effort) values (${userId}, ${workout.id}, now() - interval '35 minutes', now(), 7) returning id`;
  await sql`insert into workout_session_exercises (session_id, plan_exercise_id, exercise_id, exercise_name, exercise_slug, equipment, sort_order, sets, rep_min, rep_max, rest_seconds, target_rir) values (${workoutSession.id}, ${planExercise.id}, ${exercise.id}, ${exercise.name}, ${exercise.slug}, ${exercise.equipment}, 1, 1, 8, 12, 90, 2)`;
  await sql`insert into set_logs (session_id, plan_exercise_id, set_number, reps, weight_kg, rir) values (${workoutSession.id}, ${planExercise.id}, 1, 10, 20, 2)`;
  await sql.begin(async (transaction) => {
    await transaction`update plan_workouts set is_active = false where id = ${workout.id}`;
    await transaction`update plan_workouts set day_number = 1 where id = ${remainingWorkout.id}`;
    await transaction`update plans set days_per_week = 1 where id = ${plan.id}`;
  });

  const livePlan = await fetch(`${baseUrl}/app/plan`, { headers: { cookie } });
  assert(livePlan.ok, `Live plan returned ${livePlan.status}`);
  const livePlanHtml = await livePlan.text();
  assert(livePlanHtml.includes("Remaining live day") && !livePlanHtml.includes("Deleted history day"), "Deleted day should leave the live schedule while remaining days stay visible");

  await sql.begin(async (transaction) => {
    await transaction`update plans set status = 'archived', is_current = false where id = ${plan.id}`;
    await transaction`update plans set is_current = true where id = ${secondPlan.id}`;
  });
  const archivedWorkspace = await fetch(`${baseUrl}/app/plans`, { headers: { cookie } });
  const archivedWorkspaceHtml = await archivedWorkspace.text();
  assert(archivedWorkspace.ok && archivedWorkspaceHtml.includes("Archived plans") && archivedWorkspaceHtml.includes("Runtime strength plan"), "Archived plans should remain visible and restorable");

  const analytics = await fetch(`${baseUrl}/app/progress`, { headers: { cookie } });
  assert(analytics.ok, `Analytics returned ${analytics.status}`);
  const analyticsHtml = await analytics.text();
  assert(analyticsHtml.includes("Analytics &amp; progress"), "Analytics page did not render");
  assert(analyticsHtml.includes(exercise.name), "Analytics did not include the logged exercise");
  assert(analyticsHtml.includes("Deleted history day"), "Deleting a day should preserve its completed workout history");
  const profilePage = await fetch(`${baseUrl}/app/settings`, { headers: { cookie } });
  const profileHtml = await profilePage.text();
  assert(profilePage.ok && profileHtml.includes("Training consistency") && profileHtml.includes("Achievements"), "Profile should render consistency and achievement summaries");
  const transformationPage = await fetch(`${baseUrl}/app/transformation`, { headers: { cookie } });
  const transformationHtml = await transformationPage.text();
  assert(transformationPage.ok && transformationHtml.includes("Transformation timelapse") && transformationHtml.includes("Private by default"), "Transformation journey should render for an authenticated user");

  const coach = await fetch(`${baseUrl}/api/coach`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie, origin: baseUrl },
    body: JSON.stringify({ message: "How should I progress my weights?" }),
  });
  if (!coach.ok) throw new Error(`Coach returned ${coach.status}: ${await coach.text()}`);
  const coachBody = await coach.json();
  assert(coachBody.message?.content?.includes("double progression"), "Coach response shape or content was unexpected");

  console.log("Runtime verification passed: exercise guides → multiple plans → day deletion → plan archiving → preserved analytics → profile consistency → private transformation journey → coach → Postgres.");
} finally {
  await sql`delete from "user" where email = ${email}`;
  await sql.end();
}

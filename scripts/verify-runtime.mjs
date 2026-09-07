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
  const [plan] = await sql`insert into plans (user_id, source_template_id, name, goal, days_per_week, duration_weeks) values (${userId}, ${template.id}, 'Runtime plan', 'get_stronger', 3, 8) returning id`;
  const [workout] = await sql`insert into plan_workouts (plan_id, day_number, title, focus) values (${plan.id}, 1, 'Runtime strength', 'Runtime analytics verification') returning id`;
  const [planExercise] = await sql`insert into plan_exercises (workout_id, exercise_id, sort_order, sets, rep_min, rep_max, rest_seconds, target_rir) values (${workout.id}, ${exercise.id}, 1, 1, 8, 12, 90, 2) returning id`;
  const [workoutSession] = await sql`insert into workout_sessions (user_id, plan_workout_id, started_at, completed_at, perceived_effort) values (${userId}, ${workout.id}, now() - interval '35 minutes', now(), 7) returning id`;
  await sql`insert into workout_session_exercises (session_id, plan_exercise_id, exercise_id, exercise_name, exercise_slug, equipment, sort_order, sets, rep_min, rep_max, rest_seconds, target_rir) values (${workoutSession.id}, ${planExercise.id}, ${exercise.id}, ${exercise.name}, ${exercise.slug}, ${exercise.equipment}, 1, 1, 8, 12, 90, 2)`;
  await sql`insert into set_logs (session_id, plan_exercise_id, set_number, reps, weight_kg, rir) values (${workoutSession.id}, ${planExercise.id}, 1, 10, 20, 2)`;

  const analytics = await fetch(`${baseUrl}/app/progress`, { headers: { cookie } });
  assert(analytics.ok, `Analytics returned ${analytics.status}`);
  const analyticsHtml = await analytics.text();
  assert(analyticsHtml.includes("Analytics &amp; progress"), "Analytics page did not render");
  assert(analyticsHtml.includes(exercise.name), "Analytics did not include the logged exercise");

  const coach = await fetch(`${baseUrl}/api/coach`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie, origin: baseUrl },
    body: JSON.stringify({ message: "How should I progress my weights?" }),
  });
  if (!coach.ok) throw new Error(`Coach returned ${coach.status}: ${await coach.text()}`);
  const coachBody = await coach.json();
  assert(coachBody.message?.content?.includes("double progression"), "Coach response shape or content was unexpected");

  console.log("Runtime verification passed: starter plan → sign-up → workout snapshot → analytics → coach → Postgres.");
} finally {
  await sql`delete from "user" where email = ${email}`;
  await sql.end();
}

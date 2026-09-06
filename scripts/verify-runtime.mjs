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
  const publicPage = await fetch(`${baseUrl}/plans/starter`);
  assert(publicPage.ok, `Starter plan returned ${publicPage.status}`);
  assert((await publicPage.text()).includes("Beginner Vegan Muscle Gain"), "Starter plan seed was not rendered");

  const signUp = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: baseUrl },
    body: JSON.stringify({ name: "Runtime Check", email, password }),
  });
  if (!signUp.ok) throw new Error(`Sign-up returned ${signUp.status}: ${await signUp.text()}`);
  const cookie = signUp.headers.get("set-cookie")?.split(";")[0];
  assert(cookie, "Sign-up did not return a session cookie");

  const dashboard = await fetch(`${baseUrl}/app`, { headers: { cookie } });
  assert(dashboard.ok, `Dashboard returned ${dashboard.status}`);
  assert((await dashboard.text()).includes("build your baseline"), "Protected dashboard did not render onboarding state");

  const coach = await fetch(`${baseUrl}/api/coach`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie, origin: baseUrl },
    body: JSON.stringify({ message: "How should I progress my weights?" }),
  });
  if (!coach.ok) throw new Error(`Coach returned ${coach.status}: ${await coach.text()}`);
  const coachBody = await coach.json();
  assert(coachBody.message?.content?.includes("double progression"), "Coach response shape or content was unexpected");

  console.log("Runtime verification passed: starter plan → sign-up → protected dashboard → coach → Postgres.");
} finally {
  await sql`delete from "user" where email = ${email}`;
  await sql.end();
}

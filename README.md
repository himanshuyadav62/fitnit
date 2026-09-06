# Forme

Forme is a private-by-default fitness planner and tracker built with Next.js 16, TypeScript, shadcn/ui, Better Auth, Drizzle, and PostgreSQL.

## Included flows

- Public product page and seeded vegan beginner plan preview
- Email/password accounts with database-backed sessions
- Adult-only, five-part onboarding and readiness screening
- Six evidence-informed built-in plans spanning 2–6 training days
- Schedule- and goal-aware plan recommendation during onboarding
- Workout sessions with set, rep, load, RIR, effort, and note logging
- Expandable exercise library with custom prescriptions
- Editable plans with additional training days and history-safe exercise removal
- Exercise instructions, technique cues, private notes, and safe YouTube/Vimeo embeds
- Immutable workout snapshots plus weekday, duration, volume, load and rep analytics
- Body-weight and waist progress tracking with charts
- Context-aware coach in safe deterministic mock mode
- Transparent calorie/protein starting estimates

## Local setup

Requirements: Node.js 20+ and pnpm 11+.

```bash
pnpm install
cp .env.example .env.local
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open <http://localhost:3000>.

The local workspace already has an ignored `.env.local`. Never commit it. The database credential originally supplied for development should be rotated before any production deployment.

## Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SSL PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Long random session-signing secret |
| `BETTER_AUTH_URL` | Auth origin, normally `http://localhost:3000` locally |
| `NEXT_PUBLIC_APP_URL` | App origin used by the runtime verifier |
| `AI_MODE` | `mock` in this implementation |
| `AI_GATEWAY_API_KEY` | Reserved for a future live provider integration |

Mock mode is deliberate: plan creation and coach replies remain predictable and testable without sending health context to a model provider. A live provider can be added behind the coach route after consent, retention, redaction, and model policy decisions are made.

The evidence and programming rationale for the built-in plans is recorded in [`docs/training-research.md`](docs/training-research.md).

## Commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm run build
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm verify:runtime # run while `pnpm start` is listening
```

`verify:runtime` walks the public plan → sign-up → protected dashboard → coach → PostgreSQL path, then removes its exact temporary test user.

## Production checklist

- Rotate the development database credential and use a least-privilege application role.
- Add email verification and password-reset delivery through a transactional email provider.
- Set unique production values for the auth secret and URLs.
- Add consent and retention controls before enabling a live AI provider.
- Add rate limiting, monitoring, backups, and a privacy policy.
- Have exercise/readiness content reviewed by qualified professionals for the intended jurisdictions.

Forme provides educational guidance, not diagnosis or medical treatment.
# fitnit

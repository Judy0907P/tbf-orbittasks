# OrbitTasks

A lightweight project management SaaS — and the case study for the Build Fellowship's "Ship Better Code, Faster: Optimize Developer Workflows with CI/CD and AI" course. Over 8 workshops, you'll measure this codebase, find the bottlenecks, and ship real improvements.

## Live demo

A hosted instance runs at [tbf.riaincondon.com](https://tbf.riaincondon.com).
Log in with `demo@orbittasks.local` / `Password123`.

## The codebase

```
.
├── apps/
│   ├── api/        # Express + TypeScript backend
│   └── web/        # React + Vite frontend
├── scripts/        # build / deploy / measurement helpers
├── docs/           # supplementary docs
└── package.json    # npm workspaces root
```

## Continuous integration

A slow GitHub Actions workflow ships at [`.github/workflows/ci.yml`](./.github/workflows/ci.yml). It runs on every push and PR. The baseline duration is ~13 minutes; the optimization arc in Workshops 3–5 brings it down to ~2 minutes.

## Prerequisites

- Node.js **≥ 20**

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example env file and load it into your shell. The API does not auto-load `.env`, so exporting the vars is required.

```bash
cp .env.example .env
set -a && source .env && set +a
```

| Variable       | Required | Purpose                                      |
|----------------|----------|----------------------------------------------|
| `PORT`         | no       | API port (default `3001`)                    |
| `NODE_ENV`     | no       | `development` locally                        |
| `JWT_SECRET`   | **yes**  | Signs auth tokens                            |
| `DATABASE_URL` | **yes**  | File-backed store, e.g. `file:.data/orbittasks.json` |

Without `DATABASE_URL`, the seed and API use an in-memory store that disappears when the process exits.

### 3. Seed the database

There is no migration step — the store is a JSON file. You **must** seed before the first run, or the app has no users/projects/tasks.

```bash
npm run seed --workspace=apps/api
```

This creates `apps/api/.data/orbittasks.json` with demo data, including:

- email: `demo@orbittasks.local`
- password: `Password123`

Re-run the seed anytime to reset local data.

### 4. Start the app

Run the API and web app in two terminals (env must still be loaded in the API terminal):

```bash
# Terminal 1 — API on :3001
npm run dev --workspace=apps/api

# Terminal 2 — web on :5173 (proxies /api → :3001)
npm run dev --workspace=apps/web
```

Open [http://localhost:5173](http://localhost:5173) and sign in with the demo credentials above.

## Running tests

```bash
npm test
```

## Deploying

```bash
npm run build
npm run deploy
```

`npm run deploy` runs a simulated upload of the build output (see `scripts/deploy.sh`).

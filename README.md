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
├── Makefile        # one-command local workflow
└── package.json    # npm workspaces root
```

## Prerequisites

- **Node.js 20+** (see `.nvmrc`; if you use nvm: `nvm use`)
- **npm** (ships with Node)
- **make** (usually preinstalled on macOS/Linux)

Check:

```bash
node -v   # should be v20.x or newer
npm -v
make -v
```

## Setup

Clone the repo, then **enter the project folder** before any other command:

```bash
git clone <your-fork-url> tbf-orbittasks
cd tbf-orbittasks
```

### Quick onboarding (one command)

Copies `.env` (if missing) and installs dependencies:

```bash
make setup
```

Then seed and start:

```bash
make seed
make dev
```

Open the URL Vite prints (usually `http://localhost:5173`).
Demo login: `demo@orbittasks.local` / `Password123`.

### Manual step-by-step

1. Enter the repo (if you have not already):

   ```bash
   cd tbf-orbittasks
   ```

2. Create env file and check required values (see `.env.example`):

   ```bash
   cp .env.example .env
   ```

   | Variable | Purpose |
   |---|---|
   | `JWT_SECRET` | Signs login tokens |
   | `DATABASE_URL` | Path to the JSON store, e.g. `file:.data/orbittasks.json` |

3. Install dependencies:

   ```bash
   make setup
   ```

4. Seed the database (local boot does **not** auto-seed):

   ```bash
   make seed
   ```

5. Start the API and web apps (Vite proxies `/api` to port 3001):

   ```bash
   make dev
   ```

> `SEED_ON_BOOT=1` only runs in the hosted (Render) environment. Locally you must run `make seed`.

## Running tests

```bash
cd tbf-orbittasks   # if you are not already in the repo
make test
```

Tests use an in-memory store and do not need seed.

## Deploying

```bash
make build
make deploy
```

`make deploy` is a **simulated** upload (`scripts/deploy.sh`). It is not a real production deploy.

## Useful Make targets

| Target | What it does |
|---|---|
| `make setup` | Copy `.env` (if missing) + `npm install` |
| `make seed` | Seed local DB |
| `make dev` | Start api + web |
| `make test` | Run tests |
| `make build` | Build api + web to `dist/` |
| `make deploy` | Simulated deploy |
| `make ci` | Local CI timing script |
| `make clean` | Remove install/build artifacts |

## Continuous integration

<!--
  NOTE for individuals reading the source:
  The "Setup", "Running tests", and "Deploying" sections above are
  deliberately misleading. Several required steps (env vars, the seed
  script, etc.) are not documented. Students will discover this in
  Workshop 4 (Developer Experience Engineering) and fix it as part
  of that session's deliverable. Please do NOT update this README
  to be accurate before Workshop 4 runs.
-->
GitHub Actions: [`.github/workflows/ci.yml`](./.github/workflows/ci.yml). Runs on pushes and pull requests.

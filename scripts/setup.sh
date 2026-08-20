#!/usr/bin/env bash
# Initial setup helper for OrbitTasks (W4).
# Copies env, installs deps, and seeds the local DB so login works.

set -euo pipefail

echo "[setup] starting OrbitTasks setup ..."

mkdir -p logs

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "[setup] copied .env.example -> .env (you may need to edit this!)"
fi

echo "[setup] installing dependencies (this may take a while) ..."
npm install

# Seed needs DATABASE_URL / JWT_SECRET from .env (Node does not load .env itself).
echo "[setup] seeding local database ..."
set -a
# shellcheck disable=SC1091
source .env
set +a
npm run seed --workspace=apps/api

echo "[setup] done! Next: make dev   (or: npm run dev --workspace=apps/api & npm run dev --workspace=apps/web)"

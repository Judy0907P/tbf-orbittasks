# OrbitTasks — one-command developer workflow (W4 step 5).
# A team that is all-JavaScript might prefer npm scripts; we use a
# Makefile because it is polyglot. The point is: one command to onboard.
.PHONY: setup dev seed build deploy test ci clean

setup:
	@cp -n .env.example .env || true
	@npm install

dev:
	@npm run dev --workspace=apps/api & npm run dev --workspace=apps/web

seed:
	@npm run seed --workspace=apps/api

build:
	@npm run build

deploy:
	@npm run deploy

test:
	@npm test

ci:
	@bash scripts/measure.sh

clean:
	@rm -rf node_modules apps/*/node_modules apps/*/dist coverage baseline.log

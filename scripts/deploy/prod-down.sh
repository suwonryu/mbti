#!/bin/sh
set -eu

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$PROJECT_ROOT"

exec docker compose -p mbti-prod -f docker-compose.prod.yml --env-file .env.prod down

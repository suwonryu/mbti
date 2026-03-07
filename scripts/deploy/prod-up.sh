#!/bin/sh
set -eu

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$PROJECT_ROOT"

if [ ! -f .env.prod ]; then
  echo "[deploy] .env.prod 파일이 없습니다. .env.prod.example을 복사해서 생성하세요."
  exit 1
fi

exec docker compose -p mbti-prod -f docker-compose.prod.yml --env-file .env.prod up -d --build

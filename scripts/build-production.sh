#!/bin/bash
set -e

echo "========================================"
echo "  Jatek — Production Build"
echo "========================================"

echo ""
echo "[1/5] Build API server (TypeScript → ESM)…"
pnpm --filter @workspace/api-server run build

echo ""
echo "[2/5] Build food-delivery web app (SPA → dist/public)…"
BASE_PATH=/ pnpm --filter @workspace/food-delivery run build

echo ""
echo "[3/5] Build backend-dashboard (SPA → dist/public)…"
BASE_PATH=/admin/ pnpm --filter @workspace/backend-dashboard run build

echo ""
echo "[4/5] Smoke-test bundled production server (boot + route checks)…"
bash "$(dirname "$0")/smoke-production.sh"

echo ""
echo "[5/5] Push DB schema to production database…"
NODE_ENV=production node artifacts/api-server/scripts/push-prod-schema.mjs

echo ""
echo "========================================"
echo "  Build production terminé avec succès!"
echo "========================================"
echo ""
echo "Démarrage : NODE_ENV=production PORT=8080 node artifacts/api-server/dist/index.mjs"

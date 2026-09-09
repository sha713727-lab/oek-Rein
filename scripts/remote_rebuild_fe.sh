#!/usr/bin/env bash
set -euo pipefail
cd /var/www/zermae/Frontend
runuser -u zermae -- node -e 'console.log(require.resolve("@tailwindcss/postcss"))'
rm -rf .next
runuser -u zermae -- env -u NODE_ENV NODE_OPTIONS=--max-old-space-size=768 NEXT_TELEMETRY_DISABLED=1 npm run build
systemctl restart zermae-api zermae-web
systemctl is-active zermae-api zermae-web nginx

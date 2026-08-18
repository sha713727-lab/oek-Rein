#!/usr/bin/env bash
set -euo pipefail

# Third-site production install for zermae.com on a shared Ubuntu VPS.
# Does not change default_server, other nginx vhosts, or other app users.

DOMAIN="zermae.com"
WWW_DOMAIN="www.zermae.com"
APP_USER="zermae"
APP_ROOT="/var/www/zermae"
NODE_VERSION="20.19.0"
WEB_PORT_DEFAULT=3010
API_PORT_DEFAULT=5010
TARBALL="${ZERMAE_TARBALL:-/tmp/zermae.tar.gz}"
VPS_IPV4="132.148.73.92"
CREDENTIALS_FILE="/root/zermae-credentials.txt"
NODE_BIN=""

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run this script as root."
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
export NEEDRESTART_MODE=l
export NEEDRESTART_SUSPEND=1

pick_free_port() {
  local port="$1"
  while ss -lnt | awk '{print $4}' | grep -Eq "[:.]${port}$"; do
    port=$((port + 1))
  done
  echo "${port}"
}

ensure_packages() {
  apt-get update -y
  apt-get install -y --no-install-recommends -o Dpkg::Options::="--force-confold" \
    ca-certificates curl tar nginx certbot python3-certbot-nginx \
    postgresql postgresql-contrib build-essential python3 openssl
}

ensure_swap() {
  local mem_kb swap_kb
  mem_kb="$(awk '/MemTotal:/ {print $2}' /proc/meminfo)"
  swap_kb="$(awk '/SwapTotal:/ {print $2}' /proc/meminfo)"
  if [[ "${mem_kb}" -le 2500000 && "${swap_kb}" -lt 1000000 ]]; then
    if [[ ! -f /swapfile ]]; then
      fallocate -l 2G /swapfile
      chmod 600 /swapfile
      mkswap /swapfile
      swapon /swapfile
      grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi
  fi
}

ensure_user() {
  if ! id -u "${APP_USER}" >/dev/null 2>&1; then
    useradd --system --create-home --home-dir "/home/${APP_USER}" --shell /usr/sbin/nologin "${APP_USER}"
  fi
}

as_app() {
  su -s /bin/bash "${APP_USER}" <<EOF
export HOME=/home/${APP_USER}
export NVM_DIR=/home/${APP_USER}/.nvm
[ -s "\$NVM_DIR/nvm.sh" ] && . "\$NVM_DIR/nvm.sh"
$1
EOF
}

ensure_node() {
  mkdir -p "/home/${APP_USER}"
  chown "${APP_USER}:${APP_USER}" "/home/${APP_USER}"
  su -s /bin/bash "${APP_USER}" <<'EOS'
export HOME=/home/zermae
export NVM_DIR=/home/zermae/.nvm
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
fi
. "$NVM_DIR/nvm.sh"
nvm install 20.19.0
nvm alias default 20.19.0
EOS
  NODE_BIN="$(su -s /bin/bash "${APP_USER}" <<'EOS'
export HOME=/home/zermae
export NVM_DIR=/home/zermae/.nvm
. "$NVM_DIR/nvm.sh"
dirname "$(nvm which current)"
EOS
)"
  NODE_BIN="$(echo "${NODE_BIN}" | tr -d '\r' | tail -n 1)"
  if [[ ! -x "${NODE_BIN}/node" ]]; then
    echo "Node ${NODE_VERSION} was not installed for ${APP_USER}."
    exit 1
  fi
}

ensure_postgres() {
  local pw="$1"
  systemctl enable --now postgresql
  sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${APP_USER}') THEN
    CREATE ROLE ${APP_USER} LOGIN PASSWORD '${pw}';
  ELSE
    ALTER ROLE ${APP_USER} LOGIN PASSWORD '${pw}';
  END IF;
END
\$\$;
SELECT 'CREATE DATABASE ${APP_USER} OWNER ${APP_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${APP_USER}')\gexec
GRANT ALL PRIVILEGES ON DATABASE ${APP_USER} TO ${APP_USER};
SQL
  sudo -u postgres psql -d "${APP_USER}" -v ON_ERROR_STOP=1 <<SQL
CREATE EXTENSION IF NOT EXISTS pgcrypto;
ALTER SCHEMA public OWNER TO ${APP_USER};
GRANT ALL ON SCHEMA public TO ${APP_USER};
SQL
}

unpack_app() {
  mkdir -p "${APP_ROOT}"
  local backend_env frontend_env
  backend_env="$(mktemp)"
  frontend_env="$(mktemp)"
  if [[ -f "${APP_ROOT}/Backend/.env" ]]; then
    cp "${APP_ROOT}/Backend/.env" "${backend_env}"
  fi
  if [[ -f "${APP_ROOT}/Frontend/.env" ]]; then
    cp "${APP_ROOT}/Frontend/.env" "${frontend_env}"
  fi
  tar -xzf "${TARBALL}" -C "${APP_ROOT}"
  mkdir -p "${APP_ROOT}/Frontend/public/uploads" "${APP_ROOT}/Backend" "${APP_ROOT}/Frontend"
  if [[ -s "${backend_env}" ]]; then
    cp "${backend_env}" "${APP_ROOT}/Backend/.env"
  fi
  if [[ -s "${frontend_env}" ]]; then
    cp "${frontend_env}" "${APP_ROOT}/Frontend/.env"
  fi
  rm -f "${backend_env}" "${frontend_env}"
  chown -R "${APP_USER}:${APP_USER}" "${APP_ROOT}"
  chmod 600 "${APP_ROOT}/Backend/.env" "${APP_ROOT}/Frontend/.env" 2>/dev/null || true
}

write_env() {
  local hmac="$1" session="$2" db_pass="$3" admin_pass="$4" admin_code="$5" api_port="$6"
  local db_url="postgresql://${APP_USER}:${db_pass}@127.0.0.1:5432/${APP_USER}"
  umask 077
  cat > "${APP_ROOT}/Backend/.env" <<EOF
NODE_ENV=production
APP_URL=https://${DOMAIN}
API_HOST=127.0.0.1
API_PORT=${api_port}
API_PREFIX=/api/v1
DATABASE_URL=${db_url}
DATABASE_MIGRATE_URL=${db_url}
PG_POOL_MAX=5
PG_IDLE_TIMEOUT_MS=10000
PG_CONNECTION_TIMEOUT_MS=10000
PG_STATEMENT_TIMEOUT_MS=15000
HMAC_SIGNING_SECRET=${hmac}
SESSION_SECRET=${session}
SESSION_TTL_SECONDS=604800
NONCE_TTL_SECONDS=600
HMAC_TIMESTAMP_WINDOW_SECONDS=300
RATE_LIMIT_CAPACITY=400
RATE_LIMIT_REFILL_PER_SECOND=2
CORS_ORIGIN=https://${DOMAIN},https://${WWW_DOMAIN}
SUPPORT_EMAIL=support@${DOMAIN}
EMAIL_FROM=Zermae <noreply@${DOMAIN}>
SMTP_HOST=
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=
SMTP_PASS=
UPLOAD_MAX_FILE_SIZE=10485760
UPLOAD_DIR=../Frontend/public/uploads
STORAGE_PROVIDER=local
SEED_ADMIN_EMAIL=admin@${DOMAIN}
SEED_ADMIN_PASSWORD=${admin_pass}
SEED_ADMIN_NAME=Zermae Admin
ADMIN_PASSCODE=${admin_code}
EOF
  cat > "${APP_ROOT}/Frontend/.env" <<EOF
NODE_ENV=production
APP_URL=https://${DOMAIN}
API_URL=http://127.0.0.1:${api_port}
API_PREFIX=/api/v1
HMAC_SIGNING_SECRET=${hmac}
SESSION_SECRET=${session}
SESSION_TTL_SECONDS=604800
EOF
  chown "${APP_USER}:${APP_USER}" "${APP_ROOT}/Backend/.env" "${APP_ROOT}/Frontend/.env"
  chmod 600 "${APP_ROOT}/Backend/.env" "${APP_ROOT}/Frontend/.env"
}

install_node_modules() {
  if [[ ! -d "${APP_ROOT}/Backend/node_modules" ]]; then
    as_app "cd '${APP_ROOT}/Backend' && npm ci --omit=dev"
  fi
  if [[ ! -d "${APP_ROOT}/Frontend/node_modules" ]]; then
    as_app "cd '${APP_ROOT}/Frontend' && npm ci"
  fi
}

migrate_and_seed() {
  as_app "cd '${APP_ROOT}/Backend' && npm run migrate && npm run seed"
}

build_frontend() {
  as_app "export NODE_OPTIONS=--max-old-space-size=768; export NEXT_TELEMETRY_DISABLED=1; cd '${APP_ROOT}/Frontend' && npm run build && npm prune --omit=dev"
}

install_services() {
  local web_port="$1"
  local unit_dir="${APP_ROOT}/deploy/systemd"
  sed -e "s|__NODE_BIN__|${NODE_BIN}|g" "${unit_dir}/zermae-api.service" > /etc/systemd/system/zermae-api.service
  sed -e "s|__NODE_BIN__|${NODE_BIN}|g" -e "s|__WEB_PORT__|${web_port}|g" "${unit_dir}/zermae-web.service" > /etc/systemd/system/zermae-web.service
  systemctl daemon-reload
  systemctl enable zermae-api zermae-web
  systemctl restart zermae-api
  sleep 2
  systemctl restart zermae-web
}

install_nginx() {
  local web_port="$1"
  mkdir -p /var/www/letsencrypt
  local dest=""
  if [[ -d /etc/nginx/sites-available ]]; then
    dest="/etc/nginx/sites-available/${DOMAIN}"
    sed "s/__WEB_PORT__/${web_port}/g" "${APP_ROOT}/deploy/nginx/zermae.com.conf" > "${dest}"
    ln -sfn "${dest}" "/etc/nginx/sites-enabled/${DOMAIN}"
  else
    dest="/etc/nginx/conf.d/${DOMAIN}.conf"
    sed "s/__WEB_PORT__/${web_port}/g" "${APP_ROOT}/deploy/nginx/zermae.com.conf" > "${dest}"
  fi
  nginx -t
  systemctl reload nginx
}

dns_points_here() {
  local resolved
  resolved="$(getent ahostsv4 "${DOMAIN}" | awk '{print $1}' | sort -u | tr '\n' ' ')"
  echo "${resolved}" | grep -q "${VPS_IPV4}"
}

install_certificate() {
  if ! dns_points_here; then
    echo "DNS for ${DOMAIN} is not pointing at ${VPS_IPV4} yet. Skipping TLS until it does."
    return 0
  fi
  certbot --nginx --non-interactive --agree-tos --redirect \
    -d "${DOMAIN}" -d "${WWW_DOMAIN}" \
    --register-unsafely-without-email || true
  if [[ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
    python3 - <<'PY'
from pathlib import Path
paths = list(Path("/etc/nginx").rglob("*zermae.com*"))
for path in paths:
    text = path.read_text()
    if "listen 443" in text and "server_name www.zermae.com" in text and "return 301 https://zermae.com" not in text:
        text = text.replace(
            "server_name www.zermae.com;",
            "server_name www.zermae.com;\n    return 301 https://zermae.com$request_uri;",
            1,
        )
        path.write_text(text)
PY
    nginx -t && systemctl reload nginx
  fi
}

write_credentials() {
  umask 077
  cat > "${CREDENTIALS_FILE}" <<EOF
Zermae production
URL: https://${DOMAIN}
Admin: admin@${DOMAIN}
Admin password: ${1}
Admin passcode: ${2}
Database role: ${APP_USER}
Database password: ${3}
Keep this file private, then delete it after you store the values elsewhere.
EOF
}

echo "== Zermae third-site provision =="
ensure_packages
ensure_swap
ensure_user
WEB_PORT="$(pick_free_port "${WEB_PORT_DEFAULT}")"
ensure_node
unpack_app

if [[ -f "${APP_ROOT}/Backend/.env" ]]; then
  echo "Reusing existing application secrets"
  API_PORT="$(sed -n 's/^API_PORT=//p' "${APP_ROOT}/Backend/.env" | tr -d '\r')"
  ADMIN_PASS="$(sed -n 's/^SEED_ADMIN_PASSWORD=//p' "${APP_ROOT}/Backend/.env" | tr -d '\r')"
  ADMIN_CODE="$(sed -n 's/^ADMIN_PASSCODE=//p' "${APP_ROOT}/Backend/.env" | tr -d '\r')"
  DB_PASS="$(sed -n 's|^DATABASE_URL=postgresql://zermae:\([^@]*\)@.*|\1|p' "${APP_ROOT}/Backend/.env" | tr -d '\r')"
  systemctl enable --now postgresql
  sudo -u postgres psql -d "${APP_USER}" -v ON_ERROR_STOP=1 -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
else
  API_PORT="$(pick_free_port "${API_PORT_DEFAULT}")"
  if [[ "${API_PORT}" == "${WEB_PORT}" ]]; then
    API_PORT="$(pick_free_port $((WEB_PORT + 1)))"
  fi
  HMAC="$(openssl rand -hex 48)"
  SESSION="$(openssl rand -hex 48)"
  DB_PASS="$(openssl rand -hex 18)"
  ADMIN_PASS="$(openssl rand -base64 18 | tr -d '=+/')Aa1"
  ADMIN_CODE="$(shuf -i 1000-9999 -n 1)"
  ensure_postgres "${DB_PASS}"
  write_env "${HMAC}" "${SESSION}" "${DB_PASS}" "${ADMIN_PASS}" "${ADMIN_CODE}" "${API_PORT}"
fi

install_node_modules
migrate_and_seed
build_frontend
install_services "${WEB_PORT}"
install_nginx "${WEB_PORT}"
install_certificate
write_credentials "${ADMIN_PASS}" "${ADMIN_CODE}" "${DB_PASS}"

systemctl --no-pager --full status zermae-api --lines=20 || true
systemctl --no-pager --full status zermae-web --lines=20 || true
echo "Provision complete. Credentials: ${CREDENTIALS_FILE}"
echo "Web localhost port: ${WEB_PORT}"
echo "API localhost port: ${API_PORT}"

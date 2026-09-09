"""Hot-patch auth UX + CMS WhatsApp phone onto the VPS; rebuild frontend; restart services."""

from __future__ import annotations

import os
import shlex
import sys
from pathlib import Path

import paramiko

sys.stdout.reconfigure(line_buffering=True)

VPS_HOST = os.environ.get("ZERMAE_VPS_HOST", "132.148.73.92")
REPO_ROOT = Path(__file__).resolve().parents[1]
APP_ROOT = "/var/www/zermae"

FILES = [
    "Backend/src/constants/site.ts",
    "Backend/src/constants/storefront.ts",
    "Backend/src/server/messaging/whatsapp.ts",
    "Backend/src/server/services/orders/order.service.ts",
    "Frontend/src/app/zermae.css",
    "Frontend/src/constants/site.ts",
    "Frontend/src/constants/storefront.ts",
    "Frontend/src/features/auth/password-field.tsx",
    "Frontend/src/features/auth/login-form.tsx",
    "Frontend/src/features/auth/register-form.tsx",
    "Frontend/src/features/auth/reset-password-form.tsx",
    "Frontend/src/features/admin/admin-login-form.tsx",
    "Frontend/src/features/admin/storefront-editor.tsx",
    "Frontend/src/features/admin/parse-storefront-form.ts",
    "Frontend/src/features/account/profile-forms.tsx",
    "Frontend/src/features/content/contact-details.tsx",
    "Frontend/src/features/navigation/site-footer.tsx",
    "Frontend/src/lib/order-whatsapp.ts",
    "Frontend/src/app/[locale]/(public)/contact/page.tsx",
    "Frontend/src/app/[locale]/(public)/order-confirmation/[orderId]/page.tsx",
    "Frontend/src/app/[locale]/(admin)/admin/orders/page.tsx",
    "Frontend/src/app/[locale]/(admin)/admin/orders/[orderId]/page.tsx",
]


def connect(username: str, password: str) -> paramiko.SSHClient:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(
        VPS_HOST,
        username=username,
        password=password,
        timeout=30,
        allow_agent=False,
        look_for_keys=False,
        banner_timeout=30,
        auth_timeout=30,
    )
    return client


def run(client: paramiko.SSHClient, command: str, password: str, timeout: int = 3600) -> None:
    remote = f"printf '%s\\n' {shlex.quote(password)} | sudo -S -p '' -- {command}"
    print(f">> {command[:160]}", flush=True)
    _stdin, stdout, stderr = client.exec_command(remote, timeout=timeout, get_pty=False)
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    if out:
        print(out, end="" if out.endswith("\n") else "\n", flush=True)
    cleaned = "\n".join(line for line in err.splitlines() if "password" not in line.lower())
    if cleaned.strip():
        print(cleaned, flush=True)
    code = stdout.channel.recv_exit_status()
    if code != 0:
        raise RuntimeError(f"Remote command failed ({code}): {command}\n{err}")


def main() -> None:
    username = (os.environ.get("ZERMAE_SSH_USER") or "greentech").strip()
    password = (os.environ.get("ZERMAE_SSH_PASS") or "").strip()
    if not password:
        raise SystemExit("Set ZERMAE_SSH_PASS")

    print(f"Connecting to {VPS_HOST} as {username}...", flush=True)
    client = connect(username, password)
    sftp = client.open_sftp()

    for rel in FILES:
        local = REPO_ROOT / rel
        if not local.is_file():
            raise FileNotFoundError(local)
        remote = f"{APP_ROOT}/{rel.replace(chr(92), '/')}"
        tmp_remote = f"/tmp/zermae-patch-{rel.replace('/', '__').replace('[', '_').replace(']', '_')}"
        print(f"Upload {rel}", flush=True)
        sftp.put(str(local), tmp_remote)
        run(
            client,
            "bash -lc "
            + shlex.quote(
                f"mkdir -p '{remote.rsplit('/', 1)[0]}' && "
                f"install -o zermae -g zermae -m 644 '{tmp_remote}' '{remote}' && "
                f"rm -f '{tmp_remote}'"
            ),
            password,
        )

    sftp.close()
    print("Building frontend...", flush=True)
    run(
        client,
        "bash -lc "
        + shlex.quote(
            "cd /var/www/zermae/Frontend && "
            "runuser -u zermae -- env NODE_ENV=development npm ci && "
            "rm -rf .next && "
            "runuser -u zermae -- env -u NODE_ENV NODE_OPTIONS=--max-old-space-size=768 "
            "NEXT_TELEMETRY_DISABLED=1 npm run build"
        ),
        password,
        timeout=2400,
    )
    print("Restarting services...", flush=True)
    run(client, "systemctl restart zermae-api zermae-web", password)
    run(client, "systemctl is-active zermae-api zermae-web nginx", password)
    client.close()
    print("Auth + WhatsApp CMS deploy finished.", flush=True)


if __name__ == "__main__":
    main()

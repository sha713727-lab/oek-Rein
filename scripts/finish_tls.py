"""Finish TLS repair: reload nginx with sudo, fix HTTPS 500, print admin credentials."""

from __future__ import annotations

import getpass
import os
import shlex

import paramiko

VPS_HOST = os.environ.get("ZERMAE_VPS_HOST", "132.148.73.92")


def run(client: paramiko.SSHClient, command: str, password: str) -> str:
    remote = f"sudo -S -p '' bash -lc {shlex.quote(command)}"
    print(f"\n>> {command}")
    stdin, stdout, stderr = client.exec_command(remote, timeout=180, get_pty=False)
    stdin.write(password + "\n")
    stdin.flush()
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    print(out, end="")
    if err:
        print(err, end="")
    code = stdout.channel.recv_exit_status()
    if code != 0:
        raise SystemExit(f"Remote command failed ({code})")
    return out


def main() -> None:
    username = (os.environ.get("ZERMAE_SSH_USER") or "greentech").strip()
    password = (
        os.environ.get("ZERMAE_SSH_PASS") or getpass.getpass(f"Linux password for {username}@{VPS_HOST}: ")
    ).strip()
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(
        VPS_HOST,
        username=username,
        password=password,
        timeout=30,
        allow_agent=False,
        look_for_keys=False,
    )
    run(client, "sed -i '/^Environment=HOSTNAME=/d' /etc/systemd/system/zermae-web.service", password)
    run(
        client,
        r"sed -i 's/proxy_set_header X-Forwarded-Proto \$scheme;/proxy_set_header X-Forwarded-Proto http;/' /etc/nginx/sites-enabled/zermae.com",
        password,
    )
    run(
        client,
        "grep -q X-Forwarded-Host /etc/nginx/sites-enabled/zermae.com || sed -i 's/proxy_set_header Host $host;/proxy_set_header Host $host;\\n        proxy_set_header X-Forwarded-Host $host;/' /etc/nginx/sites-enabled/zermae.com",
        password,
    )
    run(client, "systemctl daemon-reload && systemctl restart zermae-web", password)
    run(client, "nginx -t && systemctl reload nginx && systemctl is-active zermae-web nginx", password)
    print("\n--- Admin credentials ---")
    run(client, "cat /root/zermae-credentials.txt", password)
    client.close()
    print("\nOpen https://zermae.com")


if __name__ == "__main__":
    main()

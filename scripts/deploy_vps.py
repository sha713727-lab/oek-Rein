"""Deploy Zermae to the shared GoDaddy VPS as a third nginx site.

Prompts for the Linux user password in the terminal. Does not store it.
"""

from __future__ import annotations

import getpass
import os
import tarfile
import tempfile
from pathlib import Path

import paramiko

VPS_HOST = os.environ.get("ZERMAE_VPS_HOST", "132.148.73.92")
REPO_ROOT = Path(__file__).resolve().parents[1]
EXCLUDES = {
    "node_modules",
    ".next",
    ".git",
    "coverage",
    "logs",
    ".vscode",
    ".env",
    ".env.local",
    ".env.production",
}


def should_exclude(path: Path) -> bool:
    parts = set(path.parts)
    if parts & EXCLUDES:
        return True
    if path.name.endswith(".tar.gz") or path.name.endswith(".log"):
        return True
    return False


def make_archive(destination: Path) -> None:
    with tarfile.open(destination, "w:gz") as archive:
        for item in REPO_ROOT.rglob("*"):
            if not item.is_file() or should_exclude(item.relative_to(REPO_ROOT)):
                continue
            archive.add(item, arcname=str(item.relative_to(REPO_ROOT)).replace("\\", "/"))


def run(client: paramiko.SSHClient, command: str, password: str | None = None, as_root: bool = False, timeout: int = 7200) -> str:
    remote = f"sudo -S -p '' {command}" if as_root else command
    print(f"\n>> {command[:120]}")
    stdin, stdout, stderr = client.exec_command(remote, timeout=timeout, get_pty=False)
    if as_root and password:
        stdin.write(password + "\n")
        stdin.flush()
    chunks: list[str] = []
    while True:
        line = stdout.readline()
        if not line:
            break
        text = line if isinstance(line, str) else line.decode("utf-8", errors="replace")
        try:
            print(text, end="")
        except UnicodeEncodeError:
            print(text.encode("ascii", errors="replace").decode("ascii"), end="")
        chunks.append(text)
    err = stderr.read().decode("utf-8", errors="replace")
    if err:
        try:
            print(err, end="")
        except UnicodeEncodeError:
            print(err.encode("ascii", errors="replace").decode("ascii"), end="")
    code = stdout.channel.recv_exit_status()
    if code != 0:
        raise RuntimeError(f"Remote command failed ({code}): {command}")
    return "".join(chunks) + err


def connect(username: str, password: str) -> paramiko.SSHClient:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
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
    except paramiko.AuthenticationException:
        transport = paramiko.Transport((VPS_HOST, 22))
        transport.connect()
        try:
            transport.auth_interactive(
                username,
                lambda _title, _instructions, prompts: [password for _p, _e in prompts],
            )
            client._transport = transport
            return client
        except Exception:
            transport.close()
            raise


def main() -> None:
    username = (os.environ.get("ZERMAE_SSH_USER") or "greentech").strip()
    password = (
        os.environ.get("ZERMAE_SSH_PASS")
        or getpass.getpass(f"Linux password for {username}@{VPS_HOST}: ")
    ).strip()
    print(f"Connecting to {VPS_HOST} as {username}...")
    try:
        client = connect(username, password)
    except paramiko.AuthenticationException as error:
        raise SystemExit(
            "SSH rejected this username/password. Check the Linux user name and password, then retry."
        ) from error

    who = run(client, "whoami; id -u").strip().splitlines()
    needs_sudo = who[-1].strip() != "0"
    print(f"Logged in as {who[0].strip()} (sudo={'yes' if needs_sudo else 'no'})")

    archive_path = Path(tempfile.gettempdir()) / "zermae.tar.gz"
    print("Packing source...")
    if archive_path.exists():
        archive_path.unlink()
    make_archive(archive_path)
    print(f"Archive: {archive_path} ({archive_path.stat().st_size} bytes)")
    sftp = client.open_sftp()
    print("Uploading archive and provision script...")
    sftp.put(str(archive_path), "/tmp/zermae.tar.gz")
    sftp.put(str(REPO_ROOT / "deploy" / "provision.sh"), "/tmp/zermae-provision.sh")
    sftp.close()

    run(client, "sed -i 's/\\r$//' /tmp/zermae-provision.sh && chmod +x /tmp/zermae-provision.sh")
    print("Provisioning. This can take 10-20 minutes on 2GB RAM...")
    run(
        client,
        "ZERMAE_TARBALL=/tmp/zermae.tar.gz bash /tmp/zermae-provision.sh",
        password=password,
        as_root=needs_sudo,
    )
    print("\nService status:")
    run(client, "systemctl is-active zermae-api zermae-web nginx || true", password=password, as_root=needs_sudo)
    print("\nAdmin login (copy this, then delete /root/zermae-credentials.txt on the server):")
    run(
        client,
        "test -f /root/zermae-credentials.txt && cat /root/zermae-credentials.txt || echo 'credentials file missing'",
        password=password,
        as_root=needs_sudo,
    )
    client.close()
    print("\nDeploy finished. Open https://zermae.com after TLS is issued.")


if __name__ == "__main__":
    main()

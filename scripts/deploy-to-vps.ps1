#Requires -Version 5.1
$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$VpsHost = if ($env:ZERMAE_VPS_HOST) { $env:ZERMAE_VPS_HOST } else { "132.148.73.92" }
$SshUser = if ($env:ZERMAE_SSH_USER) { $env:ZERMAE_SSH_USER } else { "root" }
$KeyPath = Join-Path $env:USERPROFILE ".ssh\zermae_godaddy"
$Archive = Join-Path $env:TEMP "zermae.tar.gz"
$RemoteHost = "${SshUser}@${VpsHost}"

function Ensure-DeployKey {
  $sshDir = Join-Path $env:USERPROFILE ".ssh"
  if (-not (Test-Path $sshDir)) {
    New-Item -ItemType Directory -Path $sshDir | Out-Null
  }
  if (-not (Test-Path $KeyPath)) {
    cmd /c "ssh-keygen -t ed25519 -f `"$KeyPath`" -N `"`" -C zermae-deploy -q"
  }
  Get-Content "$KeyPath.pub"
}

function Test-Ssh {
  ssh -i $KeyPath -o BatchMode=yes -o ConnectTimeout=8 -o StrictHostKeyChecking=accept-new $RemoteHost "echo SSH_OK"
}

Write-Host "Preparing deploy key..."
$publicKey = Ensure-DeployKey
Write-Host ""
Write-Host "PUBLIC KEY (add this on the VPS if SSH fails):"
Write-Host $publicKey
Write-Host ""

try {
  $probe = Test-Ssh 2>$null
} catch {
  $probe = ""
}

$probeText = if ($null -eq $probe) { "" } else { "$probe" }
if ($probeText -notmatch "SSH_OK") {
  Write-Host "SSH is not ready yet. Add the public key above to the VPS, then re-run this script."
  Write-Host "GoDaddy: Hosting -> GreenTechAgency -> Server Actions / Settings -> SSH keys, user $SshUser"
  exit 2
}

Write-Host "Packing application source..."
if (Test-Path $Archive) {
  Remove-Item $Archive -Force
}

Push-Location $RepoRoot
try {
  tar -czf $Archive --exclude=node_modules --exclude=.next --exclude=.git --exclude=coverage --exclude=logs --exclude=.env --exclude=.env.local --exclude=.env.production --exclude=.vscode .
} finally {
  Pop-Location
}

Write-Host "Uploading to $RemoteHost..."
scp -i $KeyPath -o StrictHostKeyChecking=accept-new $Archive "${RemoteHost}:/tmp/zermae.tar.gz"
scp -i $KeyPath -o StrictHostKeyChecking=accept-new (Join-Path $RepoRoot "deploy\provision.sh") "${RemoteHost}:/tmp/zermae-provision.sh"

Write-Host "Running remote provision..."
ssh -i $KeyPath $RemoteHost "sed -i 's/\r$//' /tmp/zermae-provision.sh && chmod +x /tmp/zermae-provision.sh && ZERMAE_TARBALL=/tmp/zermae.tar.gz bash /tmp/zermae-provision.sh"

Write-Host "Deploy finished. Fetching credentials file name only..."
ssh -i $KeyPath $RemoteHost "systemctl is-active zermae-api zermae-web nginx; echo '---'; grep '^URL:' /root/zermae-credentials.txt; echo 'Admin user:'; grep '^Admin:' /root/zermae-credentials.txt"

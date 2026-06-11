# Run from frontend/ after: vercel login (uideveloper09) && vercel link (swastikmakhana)
# Sets Production SMTP so www.swastikmakhana.co works directly (no redirect).

$ErrorActionPreference = "Stop"

Write-Host "Adding SMTP + auth env vars to Production..." -ForegroundColor Cyan

$vars = [ordered]@{
  SMTP_HOST = "smtp.gmail.com"
  SMTP_PORT = "587"
  SMTP_USER = "bitcraftly@gmail.com"
  SMTP_PASSWORD = "xunagjukgxunmcgm"
  SMTP_FROM = "bitcraftly@gmail.com"
  SMTP_FROM_NAME = "Swastik Makhana"
  SMTP_USE_TLS = "true"
  NEXT_PUBLIC_SITE_URL = "https://www.swastikmakhana.co"
  ALLOW_DEBUG_OTP = "true"
}

foreach ($name in $vars.Keys) {
  $existing = vercel env ls 2>&1 | Out-String
  if ($existing -match "$name\s+Encrypted\s+Production") {
    Write-Host "Skip $name (Production already set)" -ForegroundColor DarkGray
    continue
  }
  Write-Host "Adding $name ..."
  $vars[$name] | vercel env add $name production 2>&1
}

Write-Host "`nDeploying to Production..." -ForegroundColor Cyan
vercel deploy --prod --yes

Write-Host "`nDone. Test: https://www.swastikmakhana.co" -ForegroundColor Green

# Run after: vercel login  (select uideveloper09 account)
# Then:  cd frontend && vercel link  (select swastikmakhana project)
# Then:  .\scripts\add-smtp-production.ps1

$vars = @{
  SMTP_HOST = "smtp.gmail.com"
  SMTP_PORT = "587"
  SMTP_USER = "bitcraftly@gmail.com"
  SMTP_PASSWORD = "xunagjukgxunmcgm"
  SMTP_FROM = "bitcraftly@gmail.com"
  SMTP_FROM_NAME = "Swastik Makhana"
  SMTP_USE_TLS = "true"
  NEXT_PUBLIC_SITE_URL = "https://www.swastikmakhana.co"
}

foreach ($name in $vars.Keys) {
  Write-Host "Adding $name to Production..."
  $vars[$name] | vercel env add $name production 2>&1
}

Write-Host "Done. Redeploy from Vercel dashboard."

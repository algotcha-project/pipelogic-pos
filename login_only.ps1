$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Write-Host "=== Railway Login ===" -ForegroundColor Cyan
Write-Host "A browser window should open. Complete the login there." -ForegroundColor Yellow
Write-Host ""
railway login
$railwayResult = railway whoami 2>&1
"RAILWAY_STATUS: $railwayResult" | Out-File "C:\Users\HDUser\ainur-pos-clone\login_status.txt"
Write-Host ""
Write-Host "=== Vercel Login ===" -ForegroundColor Cyan
Write-Host "A browser window should open. Complete the login there." -ForegroundColor Yellow
Write-Host ""
vercel login
$vercelResult = vercel whoami 2>&1
"VERCEL_STATUS: $vercelResult" | Out-File "C:\Users\HDUser\ainur-pos-clone\login_status.txt" -Append
Write-Host ""
Write-Host "Login complete! Check login_status.txt" -ForegroundColor Green
pause

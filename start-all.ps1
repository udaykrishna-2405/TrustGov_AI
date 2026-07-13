# TrustGov AI — Start All Servers
# Run this from the d:\Trustgov-ai directory:
#   powershell -ExecutionPolicy Bypass -File start-all.ps1

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TrustGov AI — Starting All Servers" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Main TrustGov App (port 3000)
Write-Host "[1/4] Starting TrustGov Main App on port 3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; npx tsx server.ts" -WindowStyle Normal

Start-Sleep -Seconds 2

# 2. Income Tax Portal (port 3001)
Write-Host "[2/4] Starting Income Tax Portal on port 3001..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PORT='3001'; `$env:BROWSER='none'; cd '$root\incometax_mock\frontend'; npx react-scripts start" -WindowStyle Normal

Start-Sleep -Seconds 2

# 3. Passport Seva Portal (port 3012)
Write-Host "[3/4] Starting Passport Seva Portal on port 3012..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PORT='3012'; `$env:BROWSER='none'; cd '$root\passport_mock\frontend'; npx react-scripts start" -WindowStyle Normal

Start-Sleep -Seconds 2

# 4. Parivahan Portal (port 3013)
Write-Host "[4/4] Starting Parivahan Portal on port 3013..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\parivahan-clone\frontend'; npx vite --port 3013 --host" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  All servers launching..." -ForegroundColor Cyan
Write-Host ""
Write-Host "  Main App    -> http://localhost:3000" -ForegroundColor White
Write-Host "  Income Tax  -> http://localhost:3001" -ForegroundColor White
Write-Host "  Passport    -> http://localhost:3012" -ForegroundColor White
Write-Host "  Parivahan   -> http://localhost:3013" -ForegroundColor White
Write-Host ""
Write-Host "  Login: User ID = TG-00001 | OTP = 123456" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

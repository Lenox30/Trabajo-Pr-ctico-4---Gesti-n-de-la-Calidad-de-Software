# Load Balancing Test Script
# Hace 100 pruebas y muestra resultados en porcentajes

$totalTests = 100
$v1Count = 0
$v2Count = 0

Write-Host "Iniciando test de Load Balancing..." -ForegroundColor Yellow
Write-Host "Realizando $totalTests pruebas..." -ForegroundColor Cyan

for ($i = 1; $i -le $totalTests; $i++) {
    if ($i % 10 -eq 0) {
        Write-Host "Progreso: $i/$totalTests" -ForegroundColor Gray
    }
    try {
        $response = Invoke-WebRequest -Uri "http://myapp.local" -UseBasicParsing -TimeoutSec 5
        if ($response.Content -match "VERSION 2.0") {
            $v2Count++
        } else {
            $v1Count++
        }
    } catch {
        Write-Host "Error en prueba $i" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 50
}

$v1Percentage = [math]::Round(($v1Count / $totalTests) * 100, 1)
$v2Percentage = [math]::Round(($v2Count / $totalTests) * 100, 1)

Write-Host ""
Write-Host "======================================" -ForegroundColor White
Write-Host "RESULTADOS DEL LOAD BALANCING TEST" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor White
Write-Host ""
Write-Host "VERSION 1.0: $v1Count/$totalTests requests ($v1Percentage%)" -ForegroundColor Blue
Write-Host "VERSION 2.0: $v2Count/$totalTests requests ($v2Percentage%)" -ForegroundColor Red
Write-Host ""
Write-Host "======================================" -ForegroundColor White

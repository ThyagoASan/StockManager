
@echo off
setlocal
title StockManager - Iniciador

cd /d "%~dp0"

echo ========================================
echo       INICIANDO STOCKMANAGER
echo ========================================
echo.

if not exist "backend\StockManager.Api\StockManager.Api.csproj" (
    echo ERROR: No se encontro el proyecto backend.
    pause
    exit /b 1
)

if not exist "frontend\package.json" (
    echo ERROR: No se encontro el frontend.
    pause
    exit /b 1
)

where dotnet >nul 2>&1
if errorlevel 1 (
    echo ERROR: No se encontro dotnet.
    pause
    exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
    echo ERROR: No se encontro npm.
    pause
    exit /b 1
)

echo Iniciando API ASP.NET Core...
start "StockManager API" /D "%~dp0backend\StockManager.Api" cmd /k "dotnet run --launch-profile https"

echo Iniciando React con Vite...
start "StockManager React" /D "%~dp0frontend" cmd /k "npm run dev -- --host 127.0.0.1 --port 5173 --strictPort"

echo.
echo Esperando a que React este disponible...

powershell -NoProfile -Command "$ok=$false; for($i=0;$i -lt 30;$i++){try{$r=Invoke-WebRequest 'http://127.0.0.1:5173/' -UseBasicParsing -TimeoutSec 2; if($r.StatusCode -eq 200){$ok=$true;break}}catch{};Start-Sleep -Seconds 1};if($ok){exit 0}else{exit 1}"

if errorlevel 1 (
    echo.
    echo React no respondio a tiempo.
    echo Revisa la ventana StockManager React.
    pause
    exit /b 1
)

echo.
echo React esta listo.
echo Abriendo StockManager...

start "" "http://127.0.0.1:5173/"

echo.
echo StockManager iniciado.
echo No cierres las ventanas API y React mientras lo uses.
pause

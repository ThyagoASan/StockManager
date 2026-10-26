
$ErrorActionPreference = "Stop"

# Carpeta principal de StockManager
$raiz = $PSScriptRoot

# Buscar servidores en los puertos utilizados
$conexiones = Get-NetTCPConnection `
    -LocalPort 5173,7228 `
    -State Listen `
    -ErrorAction SilentlyContinue

$procesos = @(
    $conexiones |
    Select-Object -ExpandProperty OwningProcess -Unique
)

foreach ($idProceso in $procesos) {

    $proceso = Get-CimInstance Win32_Process `
        -Filter "ProcessId = $idProceso" `
        -ErrorAction SilentlyContinue

    if (-not $proceso) {
        continue
    }

    $ruta = [string]$proceso.ExecutablePath
    $comando = [string]$proceso.CommandLine

    # Backend: comprobar nombre y ubicación
    $esBackend = (
        $proceso.Name -eq "StockManager.Api.exe" -and
        $ruta.StartsWith(
            (Join-Path $raiz "backend\StockManager.Api\"),
            [StringComparison]::OrdinalIgnoreCase
        )
    )

    # Frontend: comprobar Vite y ubicación del proyecto
    
$esFrontend = (
    $proceso.Name -eq "node.exe" -and
    $comando.IndexOf(
        (Join-Path $raiz "frontend\node_modules\"),
        [StringComparison]::OrdinalIgnoreCase
    ) -ge 0 -and
    $comando.IndexOf(
        "vite",
        [StringComparison]::OrdinalIgnoreCase
    ) -ge 0
)


    if ($esBackend -or $esFrontend) {
        Write-Host "Deteniendo $($proceso.Name) (PID $idProceso)..."

        Stop-Process -Id $idProceso -Force `
            -ErrorAction Stop
    }
    else {
        Write-Host "Se omite PID ${idProceso}: no pertenece a StockManager."
    }
}

Write-Host ""
Write-Host "Verificando puertos..."

Start-Sleep -Seconds 2

$restantes = Get-NetTCPConnection `
    -LocalPort 5173,7228 `
    -State Listen `
    -ErrorAction SilentlyContinue

if ($restantes) {
    Write-Host "Atencion: todavia hay servidores escuchando."
    $restantes |
        Select-Object LocalPort, OwningProcess |
        Format-Table
}
else {
    Write-Host "StockManager detenido. Puertos libres."
}

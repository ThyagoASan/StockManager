

$ErrorActionPreference = "Stop"

$raiz = $PSScriptRoot
$backend = Join-Path $raiz "backend\StockManager.Api"
$frontend = Join-Path $raiz "frontend"

$archivoPids = Join-Path $raiz ".stockmanager-pids"

# Comprobar archivos y herramientas
if (-not (Test-Path (Join-Path $backend "StockManager.Api.csproj"))) {
    throw "No se encontró el backend."
}

if (-not (Test-Path (Join-Path $frontend "package.json"))) {
    throw "No se encontró el frontend."
}

if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    throw "No se encontró .NET."
}

if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
    throw "No se encontró npm."
}

# Comprobar que los puertos no estén ocupados
$ocupados = @(
    Get-NetTCPConnection `
        -LocalPort 5173,7228 `
        -State Listen `
        -ErrorAction SilentlyContinue
)

if ($ocupados.Count -gt 0) {
    throw "Los puertos 5173 o 7228 ya están ocupados."
}

# Buscar procesos pertenecientes a StockManager
function Obtener-Servidores {
    $conexiones = @(
        Get-NetTCPConnection `
            -LocalPort 5173,7228 `
            -State Listen `
            -ErrorAction SilentlyContinue
    )

    foreach ($conexion in $conexiones) {
        $proceso = Get-CimInstance Win32_Process `
            -Filter "ProcessId = $($conexion.OwningProcess)" `
            -ErrorAction SilentlyContinue

        if (-not $proceso) {
            continue
        }

        $ruta = [string]$proceso.ExecutablePath
        $comando = [string]$proceso.CommandLine

        $esBackend = (
            $proceso.Name -eq "StockManager.Api.exe" -and
            $ruta.StartsWith(
                (Join-Path $backend ""),
                [StringComparison]::OrdinalIgnoreCase
            )
        )

        $esFrontend = (
            $proceso.Name -eq "node.exe" -and
            $comando.IndexOf(
                (Join-Path $frontend "node_modules\"),
                [StringComparison]::OrdinalIgnoreCase
            ) -ge 0 -and
            $comando.IndexOf(
                "vite",
                [StringComparison]::OrdinalIgnoreCase
            ) -ge 0
        )

        if ($esBackend -or $esFrontend) {
            $proceso
        }
    }
}

try {
    # Iniciar backend
    $api = Start-Process `
        -FilePath "dotnet.exe" `
        -ArgumentList "run --launch-profile https" `
        -WorkingDirectory $backend `
        -WindowStyle Hidden `
        -PassThru

    # Iniciar frontend
    $react = Start-Process `
        -FilePath "npm.cmd" `
        -ArgumentList "run dev -- --host 127.0.0.1 --port 5173 --strictPort" `
        -WorkingDirectory $frontend `
        -WindowStyle Hidden `
        -PassThru

    # Esperar a que ambos servidores estén disponibles
    $listo = $false

    for ($i = 0; $i -lt 60; $i++) {
        $servidores = @(Obtener-Servidores)

        $apiLista = @(
            $servidores |
            Where-Object { $_.Name -eq "StockManager.Api.exe" }
        ).Count -gt 0

        $reactListo = @(
            $servidores |
            Where-Object { $_.Name -eq "node.exe" }
        ).Count -gt 0

        if ($apiLista -and $reactListo) {
            $listo = $true
            break
        }

        Start-Sleep -Seconds 1
    }

    if (-not $listo) {
        throw "No se pudieron iniciar ambos servidores."
    }

    # Guardar los PID reales de los servidores
    @(Obtener-Servidores |
        Select-Object -ExpandProperty ProcessId -Unique
    ) | Set-Content $archivoPids

    # Abrir navegador
    Start-Process "http://127.0.0.1:5173/"
}
catch {
    # Detener servidores que hayan llegado a iniciarse
    $servidores = @(Obtener-Servidores)

    foreach ($servidor in $servidores) {
        Stop-Process -Id $servidor.ProcessId `
            -Force `
            -ErrorAction SilentlyContinue
    }

    Remove-Item $archivoPids `
        -ErrorAction SilentlyContinue

    throw
}
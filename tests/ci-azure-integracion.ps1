param(
    [string]$BaseUrl = 'http://127.0.0.1:3101/api'
)

$ErrorActionPreference = 'Stop'

function Comprobar-Salida([string]$Actividad) {
    if ($LASTEXITCODE -ne 0) {
        throw "$Actividad no termino correctamente. Codigo: $LASTEXITCODE"
    }
}

$raiz = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$identificador = if ($env:BUILD_BUILDID) { $env:BUILD_BUILDID } else { 'local' }
$nombreContenedor = "incidenthub-ci-azure-$identificador"
$claveTemporal = "AzureCI-$identificador-Temporal"
$puertoDB = 55433
$puertoAPI = 3101
$salida = Join-Path $raiz 'out-azure'
$archivoSalida = Join-Path $salida 'api-azure-stdout.log'
$archivoErrores = Join-Path $salida 'api-azure-stderr.log'
$procesoAPI = $null
$contenedorCreado = $false

New-Item -Path $salida -ItemType Directory -Force | Out-Null
Push-Location $raiz

try {
    Write-Host '=== PRUEBAS DE INTEGRACION EN AGENTE AZURE ==='

    docker info --format '{{.ServerVersion}}' | Out-Null
    Comprobar-Salida 'Docker Desktop'

    # La clave temporal se utiliza solo para este contenedor de pruebas.
    docker run --rm -d --name $nombreContenedor -e 'POSTGRES_USER=incidenthub' -e 'POSTGRES_DB=incidenthub' -e "POSTGRES_PASSWORD=$claveTemporal" -p "127.0.0.1:$($puertoDB):5432" postgres:17-alpine | Out-Null
    Comprobar-Salida 'Arranque de PostgreSQL'
    $contenedorCreado = $true

    # El contenedor oficial de PostgreSQL enciende primero un servidor
    # temporal para inicializar los datos y luego lo apaga. La comprobacion
    # por socket local puede devolver exito justo antes de ese apagado.
    # La instancia definitiva escucha por TCP; esperar a ESA instancia.
    $preparado = $false
    for ($intento = 1; $intento -le 45; $intento++) {
        docker exec $nombreContenedor pg_isready -h 127.0.0.1 -p 5432 -U incidenthub -d incidenthub 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $preparado = $true
            Write-Host 'PostgreSQL definitivo disponible por TCP.'
            break
        }
        Start-Sleep -Seconds 2
    }
    if (-not $preparado) {
        docker logs --tail 60 $nombreContenedor
        throw 'PostgreSQL no termino de iniciar ni acepto conexiones TCP.'
    }

    # Aplicar migraciones originales en orden.
    $migraciones = @(Get-ChildItem (Join-Path $raiz 'database') -Filter '00*.sql' | Sort-Object Name)
    if ($migraciones.Count -lt 5) {
        throw 'Faltan migraciones SQL del proyecto.'
    }
    foreach ($archivo in $migraciones) {
        Write-Host "Aplicando migracion $($archivo.Name)"
        Get-Content -Path $archivo.FullName -Raw -Encoding UTF8 | docker exec -i $nombreContenedor psql -X -v ON_ERROR_STOP=1 -U incidenthub -d incidenthub | Out-Null
        Comprobar-Salida "Migracion $($archivo.Name)"
    }

    # Datos aislados que cubren abiertos, resueltos, cerrados y criticos.
    $datosSQL = @'
INSERT INTO incidentes
(titulo, descripcion, categoria, prioridad, usuario_reporta, tecnico_asignado, estado)
VALUES
('CI Azure Software', 'Incidente para comprobar filtros y estadisticas', 'Software', 'MEDIA', 'Sistema CI', 'Tecnico de sistemas', 'EN_PROCESO'),
('CI Azure Redes', 'Incidente critico para comprobar pendientes', 'Redes', 'CRITICA', 'Sistema CI', NULL, 'NUEVO'),
('CI Azure Hardware', 'Incidente resuelto para comprobar indicadores', 'Hardware', 'BAJA', 'Sistema CI', NULL, 'RESUELTO'),
('CI Azure Cerrado', 'Incidente cerrado para comprobar indicadores', 'Hardware', 'ALTA', 'Sistema CI', 'Tecnico de redes', 'CERRADO');
'@
    $datosSQL | docker exec -i $nombreContenedor psql -X -v ON_ERROR_STOP=1 -U incidenthub -d incidenthub | Out-Null
    Comprobar-Salida 'Insertar datos de prueba'

    $env:DB_HOST = '127.0.0.1'
    $env:DB_PORT = "$puertoDB"
    $env:DB_NAME = 'incidenthub'
    $env:DB_USER = 'incidenthub'
    $env:DB_PASSWORD = $claveTemporal
    $env:PORT = "$puertoAPI"

    $servidor = Join-Path $raiz 'backend\dist\server.js'
    if (-not (Test-Path $servidor)) {
        throw 'No existe backend/dist/server.js. Compilar el backend primero.'
    }

    $node = (Get-Command node.exe -ErrorAction Stop).Source
    $procesoAPI = Start-Process -FilePath $node -ArgumentList ('"' + $servidor + '"') -WorkingDirectory $raiz -RedirectStandardOutput $archivoSalida -RedirectStandardError $archivoErrores -PassThru -WindowStyle Hidden

    $saludCorrecta = $false
    for ($intento = 1; $intento -le 30; $intento++) {
        try {
            $salud = Invoke-RestMethod -Uri "http://127.0.0.1:$puertoAPI/api/health" -TimeoutSec 3
            if ($salud.estado -eq 'ok') {
                $saludCorrecta = $true
                break
            }
        } catch {
            Start-Sleep -Seconds 2
        }
    }
    if (-not $saludCorrecta) {
        throw "La API no respondio correctamente. Revisar $archivoErrores"
    }

    Write-Host 'API disponible. Ejecutando pruebas AB21.'
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $raiz 'tests\ab21-pruebas-indicadores.ps1') -BaseUrl $BaseUrl
    Comprobar-Salida 'Pruebas automatizadas AB21'

    Write-Host 'INTEGRACION AZURE PIPELINES COMPLETADA CORRECTAMENTE'
} finally {
    if ($null -ne $procesoAPI) {
        Stop-Process -Id $procesoAPI.Id -Force -ErrorAction SilentlyContinue
    }
    if ($contenedorCreado) {
        try {
            docker rm -f $nombreContenedor 2>$null | Out-Null
        } catch {
            Write-Warning 'Revisar manualmente el contenedor temporal de CI.'
        }
    }
    Pop-Location
}


$ErrorActionPreference = "Stop"

$base = "http://127.0.0.1:3000"

function Solicitar {
    param(
        [string]$Metodo,
        [string]$Ruta,
        [object]$Datos = $null
    )

    $opciones = @{
        Uri = "$base$Ruta"
        Method = $Metodo
        UseBasicParsing = $true
    }

    if ($null -ne $Datos) {
        $opciones.ContentType = "application/json"
        $opciones.Body = ConvertTo-Json -InputObject $Datos -Depth 5
    }

    $respuesta = Invoke-WebRequest @opciones

    return [pscustomobject]@{
        Codigo = [int]$respuesta.StatusCode
        Datos = ($respuesta.Content | ConvertFrom-Json)
    }
}

function Verificar {
    param(
        [bool]$Cumple,
        [string]$Mensaje
    )

    if (-not $Cumple) {
        throw "ERROR: $Mensaje"
    }

    Write-Host "OK: $Mensaje" -ForegroundColor Green
}

function ErrorEsperado {
    param(
        [string]$Metodo,
        [string]$Ruta,
        [object]$Datos,
        [int]$Codigo
    )

    $codigoRecibido = 0

    try {
        $null = Solicitar -Metodo $Metodo -Ruta $Ruta -Datos $Datos
    }
    catch {
        if ($null -eq $_.Exception.Response) {
            throw
        }

        $codigoRecibido = [int]$_.Exception.Response.StatusCode
    }

    Verificar ($codigoRecibido -eq $Codigo) "HTTP $Codigo en $Ruta"
}

Write-Host "PRUEBAS AUTOMATIZADAS AB#16" -ForegroundColor Cyan

# 1. Verificar conexion
$salud = Solicitar -Metodo GET -Ruta "/api/health"
Verificar ($salud.Codigo -eq 200 -and $salud.Datos.estado -eq "ok") "API y PostgreSQL disponibles"

# 2. Consultar tecnicos
$catalogo = Solicitar -Metodo GET -Ruta "/api/tecnicos"
$tecnicos = @($catalogo.Datos.tecnicos)

Verificar ($tecnicos.Count -ge 2) "Catalogo de tecnicos disponible"

$tecnico1 = [int]$tecnicos[0].id
$tecnico2 = [int]$tecnicos[1].id

# 3. Crear incidente exclusivo para pruebas
$nuevo = @{
    titulo = "Prueba automatizada AB16"
    descripcion = "Incidente temporal para comprobar asignaciones y estados"
    categoria = "Software"
    prioridad = "MEDIA"
    usuario_reporta = "Pruebas DevOps"
}

$creado = Solicitar -Metodo POST -Ruta "/api/incidentes" -Datos $nuevo

Verificar ($creado.Codigo -eq 201) "Incidente de prueba creado"

$id = [int]$creado.Datos.incidente.id

Write-Host "Incidente de prueba: #$id"

# 4. Rechazar cambio de estado incorrecto
ErrorEsperado -Metodo PATCH -Ruta "/api/incidentes/$id/estado" -Datos @{
    estado = "CERRADO"
} -Codigo 409

# 5. Exigir tecnico antes de pasar a ASIGNADO
ErrorEsperado -Metodo PATCH -Ruta "/api/incidentes/$id/estado" -Datos @{
    estado = "ASIGNADO"
} -Codigo 409

# 6. Rechazar tecnico inexistente
ErrorEsperado -Metodo PATCH -Ruta "/api/incidentes/$id/asignacion" -Datos @{
    tecnico_id = 2147483647
} -Codigo 400

# 7. Asignar tecnico valido
$asignacion = Solicitar -Metodo PATCH -Ruta "/api/incidentes/$id/asignacion" -Datos @{
    tecnico_id = $tecnico1
}

Verificar ($asignacion.Codigo -eq 200) "Tecnico asignado"

# 8. Reasignar tecnico
$reasignacion = Solicitar -Metodo PATCH -Ruta "/api/incidentes/$id/asignacion" -Datos @{
    tecnico_id = $tecnico2
}

Verificar ($reasignacion.Codigo -eq 200) "Tecnico reasignado"

# 9. Cambiar estado correctamente
$asignado = Solicitar -Metodo PATCH -Ruta "/api/incidentes/$id/estado" -Datos @{
    estado = "ASIGNADO"
}

Verificar ($asignado.Codigo -eq 200) "Estado cambiado a ASIGNADO"

$proceso = Solicitar -Metodo PATCH -Ruta "/api/incidentes/$id/estado" -Datos @{
    estado = "EN_PROCESO"
}

Verificar ($proceso.Codigo -eq 200) "Estado cambiado a EN_PROCESO"

# 10. Rechazar salto de estado
ErrorEsperado -Metodo PATCH -Ruta "/api/incidentes/$id/estado" -Datos @{
    estado = "CERRADO"
} -Codigo 409

# 11. Comprobar persistencia
$consulta = Solicitar -Metodo GET -Ruta "/api/incidentes/$id"

Verificar ($consulta.Datos.incidente.estado -eq "EN_PROCESO") "Estado persistido en PostgreSQL"

Verificar ($consulta.Datos.incidente.tecnico_asignado -eq $tecnicos[1].nombre) "Tecnico reasignado persistido"

# 12. Verificar eventos automaticos
$historial = Solicitar -Metodo GET -Ruta "/api/incidentes/$id/comentarios"

$eventos = @(
    $historial.Datos.comentarios |
    Where-Object { $_.autor -eq "Sistema" }
)

Verificar ($eventos.Count -eq 4) "Cuatro eventos automaticos registrados"

Write-Host ""
Write-Host "TODAS LAS PRUEBAS AB#16 TERMINARON CORRECTAMENTE" -ForegroundColor Green
Write-Host "Incidente de prueba creado: #$id"

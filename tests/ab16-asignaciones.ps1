
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

Write-Host ""
Write-Host "PRUEBAS AB#13 - CICLO DE VIDA DE INCIDENTES" -ForegroundColor Cyan

# 1. Verificar conexion con la API
$salud = Solicitar -Metodo GET -Ruta "/api/health"

Verificar (
    $salud.Codigo -eq 200 -and
    $salud.Datos.estado -eq "ok"
) "API y PostgreSQL disponibles"

# 2. Consultar catalogo de tecnicos
$catalogo = Solicitar -Metodo GET -Ruta "/api/tecnicos"
$tecnicos = @($catalogo.Datos.tecnicos)

Verificar ($tecnicos.Count -ge 2) "Catalogo de tecnicos disponible"

$tecnico1 = [int]$tecnicos[0].id
$tecnico2 = [int]$tecnicos[1].id

# 3. Crear incidente nuevo
$nuevo = @{
    titulo = "Prueba automatizada AB13"
    descripcion = "Verificacion de asignacion automatica y auditoria"
    categoria = "Software"
    prioridad = "MEDIA"
    usuario_reporta = "Pruebas DevOps"
}

$creado = Solicitar -Metodo POST -Ruta "/api/incidentes" -Datos $nuevo

Verificar ($creado.Codigo -eq 201) "Incidente creado correctamente"

$id = [int]$creado.Datos.incidente.id

Write-Host "Incidente de prueba: #$id" -ForegroundColor Cyan

Verificar (
    $creado.Datos.incidente.estado -eq "NUEVO"
) "El incidente comienza en NUEVO"

# 4. Rechazar una transicion incorrecta
ErrorEsperado -Metodo PATCH -Ruta "/api/incidentes/$id/estado" -Datos @{
    estado = "CERRADO"
} -Codigo 409

# 5. No permitir ASIGNADO sin tecnico
ErrorEsperado -Metodo PATCH -Ruta "/api/incidentes/$id/estado" -Datos @{
    estado = "ASIGNADO"
} -Codigo 409

# 6. Rechazar tecnico inexistente
ErrorEsperado -Metodo PATCH -Ruta "/api/incidentes/$id/asignacion" -Datos @{
    tecnico_id = 2147483647
} -Codigo 400

# 7. Asignar tecnico y comprobar cambio automatico
$asignacion = Solicitar -Metodo PATCH -Ruta "/api/incidentes/$id/asignacion" -Datos @{
    tecnico_id = $tecnico1
}

Verificar (
    $asignacion.Codigo -eq 200
) "Tecnico asignado correctamente"

Verificar (
    $asignacion.Datos.incidente.estado -eq "ASIGNADO"
) "Cambio automatico NUEVO a ASIGNADO"

# 8. Comprobar que el estado se guardo
$consulta = Solicitar -Metodo GET -Ruta "/api/incidentes/$id"

Verificar (
    $consulta.Datos.incidente.estado -eq "ASIGNADO"
) "Estado ASIGNADO persistido en PostgreSQL"

# 9. Rechazar transicion repetida
ErrorEsperado -Metodo PATCH -Ruta "/api/incidentes/$id/estado" -Datos @{
    estado = "ASIGNADO"
} -Codigo 409

# 10. Reasignar tecnico sin alterar estado
$reasignacion = Solicitar -Metodo PATCH -Ruta "/api/incidentes/$id/asignacion" -Datos @{
    tecnico_id = $tecnico2
}

Verificar (
    $reasignacion.Codigo -eq 200
) "Tecnico reasignado correctamente"

Verificar (
    $reasignacion.Datos.incidente.estado -eq "ASIGNADO"
) "La reasignacion conserva el estado ASIGNADO"

# 11. Cambiar a EN_PROCESO
$proceso = Solicitar -Metodo PATCH -Ruta "/api/incidentes/$id/estado" -Datos @{
    estado = "EN_PROCESO"
}

Verificar (
    $proceso.Codigo -eq 200 -and
    $proceso.Datos.incidente.estado -eq "EN_PROCESO"
) "Estado cambiado a EN_PROCESO"

# 12. Rechazar salto directo a CERRADO
ErrorEsperado -Metodo PATCH -Ruta "/api/incidentes/$id/estado" -Datos @{
    estado = "CERRADO"
} -Codigo 409

# 13. Comprobar persistencia final
$consulta = Solicitar -Metodo GET -Ruta "/api/incidentes/$id"

Verificar (
    $consulta.Datos.incidente.estado -eq "EN_PROCESO"
) "Estado final persistido en PostgreSQL"

Verificar (
    $consulta.Datos.incidente.tecnico_asignado -eq $tecnicos[1].nombre
) "Tecnico reasignado persistido"

# 14. Consultar historial automatico
$historial = Solicitar -Metodo GET -Ruta "/api/incidentes/$id/comentarios"

$eventos = @(
    $historial.Datos.comentarios |
    Where-Object { $_.autor -eq "Sistema" }
)

Verificar (
    $eventos.Count -eq 4
) "Cuatro eventos automaticos registrados"

# 15. Verificar auditoria del cambio automatico
$cambioAutomatico = @(
    $eventos | Where-Object {
        $_.contenido -eq "Cambio de estado: NUEVO -> ASIGNADO"
    }
)

Verificar (
    $cambioAutomatico.Count -eq 1
) "Auditoria del cambio automatico registrada"

# 16. Verificar fechas de auditoria
$eventosSinFecha = @(
    $eventos | Where-Object {
        [string]::IsNullOrWhiteSpace($_.creado_en)
    }
)

Verificar (
    $eventosSinFecha.Count -eq 0
) "Todos los eventos incluyen fecha"

Write-Host ""
Write-Host "TODAS LAS PRUEBAS AB#13 TERMINARON CORRECTAMENTE" -ForegroundColor Green
Write-Host "Incidente de prueba creado: #$id"

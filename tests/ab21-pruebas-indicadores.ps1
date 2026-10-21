param(
    [string]$BaseUrl = 'http://127.0.0.1:3000/api'
)

$ErrorActionPreference = 'Stop'
$BaseUrl = $BaseUrl.TrimEnd('/')
$estadosAbiertos = @('NUEVO', 'ASIGNADO', 'EN_PROCESO')

function Afirmar([bool]$Condicion, [string]$Mensaje) {
    if (-not $Condicion) {
        throw "ERROR AB#21: $Mensaje"
    }
    Write-Host "OK: $Mensaje" -ForegroundColor Green
}

function Codificar([string]$Valor) {
    return [uri]::EscapeDataString($Valor)
}

function Consultar-Incidentes([string]$Consulta = '') {
    $url = "$BaseUrl/incidentes"
    if ($Consulta) { $url = "$url`?$Consulta" }
    $respuesta = Invoke-RestMethod -Method Get -Uri $url
    if ($null -eq $respuesta -or $null -eq $respuesta.incidentes) {
        throw 'La API no devolvio la propiedad incidentes.'
    }
    return $respuesta.incidentes
}

function Verificar-Filtro([string]$Nombre, [string]$Consulta, [object[]]$Esperados) {
    $recibidos = @(Consultar-Incidentes $Consulta)
    $idsEsperados = (@($Esperados | ForEach-Object { [int]$_.id } | Sort-Object) -join ',')
    $idsRecibidos = (@($recibidos | ForEach-Object { [int]$_.id } | Sort-Object) -join ',')
    Afirmar ($idsRecibidos -eq $idsEsperados) "$Nombre - IDs y cantidad coinciden"
}

Write-Host '=== PRUEBAS AUTOMATIZADAS AB#21 ===' -ForegroundColor Cyan
Write-Host "API: $BaseUrl"

$incidentes = @(Consultar-Incidentes)
$estadisticas = (Invoke-RestMethod -Method Get -Uri "$BaseUrl/incidentes/estadisticas").estadisticas
Afirmar ($null -ne $estadisticas) 'La API entrega estadisticas'
Afirmar ($incidentes.Count -gt 0) 'Hay registros para verificar filtros individuales y combinados'

$abiertos = @($incidentes | Where-Object { $estadosAbiertos -contains $_.estado }).Count
$resueltos = @($incidentes | Where-Object { $_.estado -eq 'RESUELTO' }).Count
$cerrados = @($incidentes | Where-Object { $_.estado -eq 'CERRADO' }).Count
$criticos = @($incidentes | Where-Object {
    $_.prioridad -eq 'CRITICA' -and $estadosAbiertos -contains $_.estado
}).Count

Afirmar ($estadisticas.total -eq $incidentes.Count) 'Total general verificable'
Afirmar ($estadisticas.abiertos -eq $abiertos) 'Total de abiertos verificable'
Afirmar ($estadisticas.resueltos -eq $resueltos) 'Total de resueltos verificable'
Afirmar ($estadisticas.cerrados -eq $cerrados) 'Total de cerrados verificable'
Afirmar ($estadisticas.finalizados -eq ($resueltos + $cerrados)) 'Total de finalizados verificable'
Afirmar ($estadisticas.criticos_activos -eq $criticos) 'Criticos activos verificables'
Afirmar (($abiertos + $resueltos + $cerrados) -eq $incidentes.Count) 'Estados cubren todos los incidentes'

$categorias = @($incidentes | Group-Object -Property categoria)
Afirmar (@($estadisticas.por_categoria).Count -eq $categorias.Count) 'Cantidad de categorias coherente'
foreach ($grupo in $categorias) {
    $dato = @($estadisticas.por_categoria | Where-Object { $_.categoria -eq $grupo.Name })
    $abiertosGrupo = @($grupo.Group | Where-Object { $estadosAbiertos -contains $_.estado }).Count
    Afirmar ($dato.Count -eq 1 -and $dato[0].total -eq $grupo.Count -and
        $dato[0].abiertos -eq $abiertosGrupo) "Categoria: $($grupo.Name)"
}

$gruposTecnicos = @($incidentes | Group-Object -Property {
    if ([string]::IsNullOrWhiteSpace($_.tecnico_asignado)) {
        'Sin asignar'
    } else {
        $_.tecnico_asignado.Trim()
    }
})
Afirmar (@($estadisticas.por_tecnico).Count -eq $gruposTecnicos.Count) 'Cantidad de grupos de tecnicos coherente'
foreach ($grupo in $gruposTecnicos) {
    $dato = @($estadisticas.por_tecnico | Where-Object { $_.tecnico -eq $grupo.Name })
    $abiertosGrupo = @($grupo.Group | Where-Object { $estadosAbiertos -contains $_.estado }).Count
    Afirmar ($dato.Count -eq 1 -and $dato[0].total -eq $grupo.Count -and
        $dato[0].abiertos -eq $abiertosGrupo) "Tecnico: $($grupo.Name)"
}

$ejemplo = @($incidentes | Where-Object {
    -not [string]::IsNullOrWhiteSpace($_.tecnico_asignado)
} | Select-Object -First 1)
Afirmar ($ejemplo.Count -eq 1) 'Existe un incidente asignado para probar combinaciones'
$registro = $ejemplo[0]

$estado = Codificar $registro.estado
$prioridad = Codificar $registro.prioridad
$categoria = Codificar $registro.categoria
$tecnico = Codificar $registro.tecnico_asignado

Verificar-Filtro 'Estado' "estado=$estado" @($incidentes | Where-Object { $_.estado -eq $registro.estado })
Verificar-Filtro 'Prioridad' "prioridad=$prioridad" @($incidentes | Where-Object { $_.prioridad -eq $registro.prioridad })
Verificar-Filtro 'Categoria' "categoria=$categoria" @($incidentes | Where-Object { $_.categoria -eq $registro.categoria })
Verificar-Filtro 'Tecnico' "tecnico=$tecnico" @($incidentes | Where-Object { $_.tecnico_asignado -eq $registro.tecnico_asignado })

$coincidentes = @($incidentes | Where-Object {
    $_.estado -eq $registro.estado -and
    $_.prioridad -eq $registro.prioridad -and
    $_.categoria -eq $registro.categoria -and
    $_.tecnico_asignado -eq $registro.tecnico_asignado
})
Verificar-Filtro 'Cuatro filtros combinados' "estado=$estado&prioridad=$prioridad&categoria=$categoria&tecnico=$tecnico" $coincidentes
Verificar-Filtro 'Sin resultados' 'categoria=AB21_CATEGORIA_INEXISTENTE' @()

$sinAsignar = @($incidentes | Where-Object { [string]::IsNullOrWhiteSpace($_.tecnico_asignado) })
Verificar-Filtro 'Sin asignar' 'tecnico=SIN_ASIGNAR' $sinAsignar

$codigo = 0
try {
    $null = Invoke-RestMethod -Method Get -Uri "$BaseUrl/incidentes?estado=INVENTADO" -ErrorAction Stop
} catch {
    if ($null -eq $_.Exception.Response) { throw }
    $codigo = [int]$_.Exception.Response.StatusCode
}
Afirmar ($codigo -eq 400) 'Estado invalido devuelve HTTP 400'

Write-Host 'TODAS LAS PRUEBAS AB#21 TERMINARON CORRECTAMENTE' -ForegroundColor Green

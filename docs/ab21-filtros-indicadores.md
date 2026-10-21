# AB#21 — Filtros e indicadores de incidentes

## Objetivo

Como coordinador de TI, consultar incidentes mediante filtros combinables y estadísticas verificables para identificar pendientes, casos críticos y carga de trabajo.

**Historia de usuario:** AB#21 — Azure Boards  
**Rama de desarrollo:** `feature/ab21-filtros-indicadores`  
**Rama de colaboración:** `test/ab21-pruebas-indicadores`  
**PR de pruebas:** [#8](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/pull/8)

## Funcionalidad implementada

La aplicación permite aplicar simultáneamente filtros por estado, prioridad, categoría y técnico. Los parámetros se envían a `GET /api/incidentes` y el backend ejecuta una consulta parametrizada en PostgreSQL. El buscador de texto de React se aplica a los incidentes devueltos por la API.

El panel consulta `GET /api/incidentes/estadisticas`. PostgreSQL calcula los totales, la distribución por categoría y la distribución por técnico. Las tarjetas y gráficos de React utilizan esos datos y no estimaciones calculadas sobre la lista filtrada.

### Definición de los estados

| Indicador | Condición |
| --- | --- |
| Abiertos | `NUEVO`, `ASIGNADO`, `EN_PROCESO` |
| Resueltos | `RESUELTO` |
| Cerrados | `CERRADO` |
| Finalizados | `RESUELTO` + `CERRADO` |
| Críticos activos | Prioridad `CRITICA` y estado abierto |

Se distingue un incidente **resuelto** de uno **cerrado**. Las tarjetas muestran total, abiertos, críticos activos y cerrados. La API también devuelve `resueltos` y `finalizados`.

### API REST

| Método | Endpoint | Resultado |
| --- | --- | --- |
| GET | `/api/incidentes` | Listar todos los incidentes |
| GET | `/api/incidentes?estado=EN_PROCESO&prioridad=MEDIA` | Combinar estado y prioridad |
| GET | `/api/incidentes?categoria=Software&tecnico=Tecnico%20de%20sistemas` | Combinar categoría y técnico |
| GET | `/api/incidentes?tecnico=SIN_ASIGNAR` | Consultar incidentes sin asignación |
| GET | `/api/incidentes/estadisticas` | Totales y distribuciones desde PostgreSQL |

La API devuelve HTTP 400 cuando recibe filtros inválidos. Si no hay coincidencias, devuelve `{"incidentes":[]}` y la interfaz muestra un estado vacío comprensible.

## Actualización de indicadores

React solicita estadísticas al abrir el dashboard y al pulsar **Actualizar**. También vuelve a consultar los indicadores después de registrar un incidente, asignar o reasignar un técnico, y modificar un estado. Se conserva la lógica existente de asignaciones, seguimiento y auditoría de AB#13.

## Comprobaciones realizadas

- Compilaciones del backend y frontend completadas correctamente durante el desarrollo.
- ESLint del frontend completado sin errores después de la corrección del efecto de React.
- Prueba manual de cuatro filtros simultáneos: estado `EN_PROCESO`, prioridad `MEDIA`, categoría `Software` y técnico `Tecnico de sistemas`; devolvió los incidentes #6 y #4 en los datos probados.
- Prueba manual de categoría inexistente: lista vacía.
- Prueba manual de estado `INVENTADO`: HTTP 400.
- Ejecución de `tests/ab21-pruebas-indicadores.ps1` con resultado **TODAS LAS PRUEBAS AB#21 TERMINARON CORRECTAMENTE**. El script coteja los indicadores y distribuciones con los registros consultados por la API, verifica los filtros individuales y combinados, los incidentes sin asignar y el manejo de parámetros inválidos.

Comando de pruebas, con PostgreSQL y backend en funcionamiento:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tests\ab21-pruebas-indicadores.ps1
```

**Datos observados durante la comprobación:** 6 incidentes, 3 abiertos, 2 resueltos, 1 cerrado, 0 críticos activos; categorías Software 4, Hardware 1 y Otros 1. Estos números son una muestra y pueden cambiar cuando se actualicen los registros.

**Alcance de la evidencia:** el script contrasta agregados usando el listado de la API y no sustituye una prueba de consultas SQL directas. La ejecución del script requiere una base de prueba con incidentes, incluyendo al menos uno asignado; no genera datos automáticamente.

## Trazabilidad y colaboración

- `4c187cd`: estadísticas desde PostgreSQL.
- `d9b75e6`: filtros combinados en la API.
- `0579b49`: cliente React de estadísticas.
- `d57bec1`: filtros y panel React con distribuciones.
- `3d1ff25`: pruebas automatizadas por la cuenta colaboradora `gesteb3`.
- [PR #8](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/pull/8): creado por `gesteb3`, revisado y aprobado por `JorgeDanielAchijLopez`, y fusionado en la rama AB#21.

Se utiliza una colaboración simulada con cuentas propias, permitida por el enunciado. El historial de GitHub permite identificar autores, revisiones y cambios.

### Incidencia registrada durante la integración

El archivo de pruebas se subió inicialmente a `main` por error en el commit `6dc816a`. Posteriormente, `gesteb3` lo incorporó correctamente en la rama de pruebas mediante el commit `3d1ff25` y el PR #8. Se conserva la trazabilidad de ambos eventos; no se reescribe el historial. La integración final de AB#21 reunirá funcionalidad y pruebas en `main`.

## Evidencias y pendientes de cierre

Las capturas del dashboard, filtros, respuesta de la API, resultado de pruebas, aprobación y fusión del PR #8 están respaldadas en la Biblioteca de evidencias de IT Incident Hub. Las evidencias que se incorporen al repositorio deben añadirse como archivos reales y no solo como enlaces a la Biblioteca.

Para cerrar AB#21 todavía se debe integrar la rama de desarrollo mediante un PR hacia `main`, validar nuevamente los cambios integrados y actualizar Azure Boards con los vínculos y el resultado de las comprobaciones.

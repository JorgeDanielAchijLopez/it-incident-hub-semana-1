# Historial de cambios — IT Incident Hub

Los cambios se documentan por funcionalidad y Pull Request.
La version `v1.0.0` fue publicada oficialmente en GitHub.

## [v1.0.0] - Primera version estable

- Commit: `f55a55f0b2354ee97a31be6846e6f711fdb041ff`.
- Azure Boards: AB#35.
- Pull Requests finales: #18, #19 y #20.
- Validaciones: compilacion, PostgreSQL y seguridad.
- Integridad: SHA-256.
- Aprobacion: preproduccion.
- Publicacion: GitHub Release `v1.0.0`.
- Produccion: sin despliegue real.

## Hitos funcionales anteriores (sin etiqueta publicada)

### Base funcional — propuesta de hito v0.1.0

- API REST, base de datos y registro/consulta de incidentes.
- Interfaz React, listado, detalle y formularios.
- Historial original en PR #2 y PR #3.

### Operación y trazabilidad — propuesta de hito v0.2.0

- Comentarios por incidente, asignaciones de técnicos y cambios de estado.
- Historial de eventos y responsable de operaciones (AB#13).
- PR #4 a #7.

### Consulta, CI y seguridad — propuesta de hito v0.3.0

- Filtros por estado, prioridad, categoría y técnico; estadísticas verificables (AB#21).
- GitHub Actions y Azure Pipelines con agente Windows autohospedado.
- Evidencia de fallo real de PostgreSQL, corrección y ejecución verde.
- Control de vulnerabilidades altas/críticas de producción.
- PR #8 a #12.

## Criterio para declarar v1.0.0

Se considerará liberada únicamente cuando exista una etiqueta Git comprobada, los paquetes estén alineados, el pipeline asociado esté en verde, se apruebe el lanzamiento, se conserve el artefacto y se publique la entrada correspondiente en GitHub Releases. Consultar `docs/estrategia-release.md`.

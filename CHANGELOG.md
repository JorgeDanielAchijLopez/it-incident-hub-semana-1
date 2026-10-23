# Historial de cambios — IT Incident Hub

Los cambios se describen por funcionalidad y por PR. **No se han creado etiquetas SemVer ni publicado un GitHub Release todavía**; la siguiente tabla es un registro de trabajo, no un listado de versiones oficialmente liberadas.

## Sin publicar (preparación para v1.0.0)

- Documentación de deuda técnica, arquitectura, uso del repositorio y estrategia de release.
- Preparación de controles manuales de aprobación y de revisión del backlog antes del lanzamiento.
- Se preparó la alineación de versiones de raíz, backend y frontend a `1.0.0` con lockfile consistente, mediante la rama de preparación AB#35. No se ha publicado un tag ni un GitHub Release.

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

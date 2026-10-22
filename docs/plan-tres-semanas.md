# Plan de tres semanas y organización de entregas — AB#26

## Propósito y alcance

Este documento completa la **Task AB#26**, hija de **User Story AB#24**: definir la arquitectura, las responsabilidades de módulos, la organización de carpetas, el plan de tres semanas, tres repositorios semanales y las evidencias verificables.

La aplicación funcional y los pipelines están **actualmente centralizados en el repositorio de Semana 1**. La distribución siguiente sirve para preparar las entregas solicitadas. **No se declara que existan los repositorios de Semanas 2 y 3 hasta crearlos y comprobar sus URL**. Tampoco se afirma que la aplicación ya esté desplegada en producción ni que exista un release `v1.0.0`.

## Arquitectura y decisiones

```text
React / Vite (frontend: 5173)
       |
       | HTTP JSON
       v
Express / TypeScript (backend: 3000)
       |
       | SQL parametrizado
       v
PostgreSQL 17 (Docker: 5433)
```

**Decisiones:**

1. Mantener la interfaz separada de las reglas de la API y la persistencia.
2. Usar validación de entradas y SQL parametrizado para no confiar en datos del navegador.
3. Conservar versiones de esquema y datos en migraciones SQL numeradas.
4. Ejecutar compilación, ESLint, integración contra PostgreSQL temporal y auditorías de seguridad antes de aceptar cambios.
5. Revisar las ramas mediante PR; para el trabajo individual, la cuenta `gesteb3` participa como **revisor simulado**, no como otro integrante real del proyecto.
6. No promocionar el mismo código a producción sin una aprobación explícita y un artefacto identificado.

La explicación detallada de componentes y endpoints está en [arquitectura](arquitectura.md); los comandos para preparar Windows están en el [README](../README.md).

## Estructura de carpetas

| Ruta | Función y responsabilidad |
| --- | --- |
| `frontend/` | Vistas, formularios, listados, indicadores y cliente HTTP en React/TypeScript |
| `backend/` | Endpoints Express, validación, asignaciones, estados, comentarios y estadísticas |
| `database/` | Docker Compose, configuración de ejemplo y migraciones de PostgreSQL |
| `tests/` | Pruebas de integración automatizadas en PowerShell |
| `.github/workflows/` | GitHub Actions: compilación, pruebas, auditoría y artefactos |
| `azure-pipelines.yml` | Azure Pipelines en el agente Windows autohospedado |
| `docs/` | Plan, arquitectura, bitácora, seguridad, deudas, evidencias y release |
| `scripts/` | Control reutilizable de auditorías de dependencias |

## Cronograma por sprint y semana

| Semana | Fechas planificadas | Objetivo | Entregables esperados | Evidencia |
| --- | --- | --- | --- | --- |
| **1 — Planificación y desarrollo** | **12–18 oct 2026** | Azure Boards jerárquico, estructura Git, modelo PostgreSQL, API de incidentes y React inicial | Epics/Features/Stories/Tasks enlazadas; arquitectura; README; PR de backend y frontend | Capturas del backlog 2/4/8/16, PR #1–#3, SQL, validación REST e interfaz |
| **2 — CI, calidad y seguridad** | **19–25 oct 2026** | Comentarios, asignaciones, historial, filtros, indicadores, integración CI y corrección de fallos | Pruebas AB#21, GitHub Actions, Azure Pipelines con agente propio, control de dependencias, registro de deudas | PR #4–#13 según alcance, GitHub Actions verdes, Azure #20261022.1 (fallo) y #20261022.2/#20261022.4 (corrección), artefactos y revisiones |
| **3 — Estabilización y release** | **26 oct–1 nov 2026** | Resolver pendientes de trazabilidad, versiones, entorno de aprobación y preparar entrega final | Tags SemVer comprobados, CHANGELOG, evidencia de aprobación de release, demostración, resumen final y tres repositorios entregables | Tags Git y SHA, GitHub Release cuando esté validado, aprobación en Azure, capturas de ejecución final y enlaces a artefactos |

**Nota de trazabilidad:** algunos cambios de la Semana 2 ya se implementaron en el repositorio `it-incident-hub-semana-1` antes de separar las entregas. El plan organiza el **alcance académico**, pero no altera las fechas reales de commits y PR. No se cambiarán fechas ni se fingirá que otro repositorio hizo trabajo que fue realizado en el principal.

## Organización propuesta de tres repositorios de entrega

| Entrega | Repositorio | Contenido | Estado verificable |
| --- | --- | --- | --- |
| Semana 1 | [`it-incident-hub-semana-1`](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1) | Código original, arquitectura, backend/frontend, base de datos, documentación y trazabilidad | **Existe y concentra el proyecto actualmente** |
| Semana 2 | `it-incident-hub-semana-2` | Estado reproducible de la entrega de CI y seguridad, documentos, pruebas, referencias a PR y artefactos | **Propuesto; creación y enlace pendientes de comprobación** |
| Semana 3 | `it-incident-hub-semana-3` | Versión estabilizada aprobada, CHANGELOG, release notes, checklist, evidencias y documento de entrega | **Propuesto; creación y enlace pendientes de comprobación** |

**Cómo separar entregas sin perder historia:** conservar `it-incident-hub-semana-1` como **fuente principal**; crear los repositorios semanales como entregas identificadas y referenciar los SHA y tags exactos del repositorio fuente, con instrucciones de ejecución y evidencia correspondiente. No modificar el historial, no eliminar commits ni asegurar resultados de otros repositorios antes de crearlos y validarlos.

## Responsabilidades y colaboración simulada

| Rol en la simulación | Responsable | Evidencia |
| --- | --- | --- |
| Product Owner y coordinación del backlog | Cuenta principal `JorgeDanielAchijLopez` | Azure Boards, criterios y comentarios |
| Desarrollo e integración | Cuenta principal `JorgeDanielAchijLopez` | Ramas funcionales, commits y pruebas |
| Revisión de código / QA | Cuenta `gesteb3` en PR seleccionados | Revisiones y aprobaciones visibles en GitHub |
| Release Manager / aprobación final | Responsable definido en Azure DevOps antes del release | Configuración de `Approvals and checks` y registro de aprobación, **pendiente** |

Los roles se **simulan** en un trabajo individual. Esto demuestra separación funcional de responsabilidades, no la existencia de un equipo real de cuatro personas.

## Evidencias que deben acompañar cada entrega

**Semana 1:** backlog y relaciones Parent/Child, plan de sprints, README, arquitectura, migraciones, capturas de React/API/PostgreSQL, PR #1–#3.

**Semana 2:** PR y revisiones de cambios de funcionalidades, pruebas AB#21, auditoría de seguridad y sus informes, ejecuciones exitosas de GitHub Actions, Azure Pipelines fallido y corregido, artefactos descargables.

**Semana 3:** captura final de Azure Boards coherente con el trabajo realmente realizado, deudas y su tratamiento, SHA/tag/versiones, controles de aprobación, comprobaciones verdes, notas de versión, demostración y PDF final.

Las capturas recibidas en esta conversación se archivan en la Biblioteca `/IT-Incident-Hub/docs/evidencias/`; la Biblioteca **no es un repositorio público ni sustituye el PDF de entrega**. Los informes se deben enlazar o incorporar explícitamente a la entrega final.

## Estado real y siguiente verificación

- **Cumplido:** arquitectura textual, README con requisitos de instalación, organización de módulos, planificación de tres semanas y descripción de tres repositorios con evidencias.
- **En curso:** actualización honesta de estados en Azure Boards; varias Tasks permanecen en `New` pese a trabajo previo y otras están realmente pendientes.
- **Pendiente:** crear/verificar los repositorios de entregas Semana 2 y Semana 3, decidir commits exactos de los tags SemVer, aprobación y publicación del release `v1.0.0`.

La **Task #26** se puede cerrar como *documentación del plan* una vez revisado y fusionado este documento; **eso no significa declarar finalizados los repositorios propuestos ni el release**.

# Registro de deuda técnica — IT Incident Hub

## Criterio de trabajo

El proyecto exige **identificar al menos cinco deudas técnicas reales y resolver al menos dos con evidencia rastreable**. Cada registro debe mostrar el problema comprobado, riesgo, decisión, responsable, trabajo correctivo y prueba; una propuesta sin ejecutar **no cuenta como resuelta**.

Los identificadores `DT-01`... son referencias del documento, **no IDs de Azure Boards**. Los Work Items formales correspondientes deberán crearse o enlazarse en Azure Boards con relaciones Parent/Child, responsable, prioridad, estimación y estado reales. No se inventan números AB#.

## Deudas identificadas

| ID | Problema verificado y evidencia | Riesgo/prioridad | Estado | Decisión y trazabilidad |
| --- | --- | --- | --- | --- |
| **DT-01** | El script de integración esperaba PostgreSQL mediante socket local y podía detectar el servidor temporal de inicialización; Azure Pipelines **#20261022.1** falló con `database system is shutting down`. | Alto | **RESUELTA** | Se espera el servidor definitivo por TCP con `pg_isready -h 127.0.0.1`. Commit `14bafed`, **PR #11**, Azure **#20261022.2** exitoso y posterior **#20261022.3** en `main`. |
| **DT-02** | Las auditorías de dependencias de GitHub y Azure se ejecutaban solo para generar informes: un hallazgo `high`/`critical` no detenía CI. Ver versión de `.github/workflows/ci.yml` y `azure-pipelines.yml` anterior al PR #12. | Alto | **RESUELTA** | Control bloqueante para dependencias de producción, fallos de auditoría tratados como error, informes publicados. **PR #12**, GitHub Actions **39721406316**, Azure **#20261022.4** y fusión a `main` mediante `2f591f4`. |
| **DT-03** | El `README.md` inicial solo contenía título y una descripción breve, sin instalación, requisitos, responsables ni verificación. | Medio | **EN CORRECCIÓN** | Ampliación de README en rama `feature/deuda-tecnica-y-release`; se considerará resuelta al aprobar y fusionar su PR y comprobar los pasos documentados. |
| **DT-04** | El backend tiene un comando `test` de plantilla que falla intencionalmente; el frontend no define comando de pruebas unitarias. Existen scripts de integración PowerShell, pero no sustituyen las pruebas unitarias de componentes/controladores. | Alto | **ABIERTA** | Crear pruebas unitarias de validación y componentes, incorporarlas en CI, registrar defectos corregidos y resultados. |
| **DT-05** | Las versiones declaradas no están alineadas: raíz y backend marcan `1.0.0`, frontend marca `0.0.0`; **no se encontró ningún GitHub Release publicado** al iniciar este bloque. | Alto | **ABIERTA** | Definir versión coherente, generar historial SemVer y tags válidos sobre commits comprobables. No asumir que el número en package.json equivale a release publicado. |
| **DT-06** | Azure Pipelines ejecuta CI pero no tiene definida una etapa de liberación a preproducción/producción con aprobador configurado. | Alto | **ABIERTA** | Configurar entornos, controles de aprobación, checklist y trazabilidad desde artefacto hasta release. No afirmar que se ha desplegado. |
| **DT-07** | La política incorporada en DT-02 registra vulnerabilidades de dependencias de desarrollo sin bloquearlas; faltan decisiones individualizadas de riesgos y fechas de revisión. | Medio | **ABIERTA** | Revisar los informes de auditoría y clasificar hallazgos con responsable, severidad, mitigación y fecha de revisión; aplicar actualizaciones con PR. |
| **DT-08** | El pipeline utiliza PostgreSQL 17 en Docker, pero no hay una tarea explícita de análisis de vulnerabilidades de imagen de contenedor en los YAML. | Medio | **ABIERTA** | Evaluar escaneo de imágenes, fijación de versiones y actualizaciones controladas; conservar reporte y decisión. |

## Dos correcciones efectivamente demostradas

### DT-01 — Condición de carrera de PostgreSQL

- **Detectar:** fallo real de Azure Pipelines `#20261022.1`.
- **Diagnosticar:** la inicialización de PostgreSQL inicia y detiene un servidor provisional.
- **Corregir:** commit `14bafed`, [PR #11](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/pull/11), revisado por `gesteb3`.
- **Comprobar:** Azure `#20261022.2` en verde y ejecución automática `#20261022.3` desde `main`; artefactos publicados.
- **Decisión:** resuelta y cerrada en código. Pendiente enlazar el registro de deuda con Work Item formal de Azure Boards si el tablero lo requiere.

### DT-02 — Auditoría sin bloqueo de seguridad

- **Detectar:** las primeras configuraciones de CI registraban auditorías sin bloquear riesgos altos de producción.
- **Corregir:** [PR #12](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/pull/12), aprobado por `gesteb3`.
- **Comprobar:** [GitHub Actions 39721406316](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/actions/runs/39721406316), Azure `#20261022.4`, [GitHub Actions después de fusionar 39722326536](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/actions/runs/39722326536).
- **Decisión:** corregido el control obligatorio para `high`/`critical` en producción. La clasificación de posibles hallazgos de desarrollo sigue como deuda DT-07.

## Priorización siguiente

1. **DT-03** — Terminar README con instrucciones comprobables (esta rama).
2. **DT-05** — Alinear versiones y registrar la secuencia de tags después de que el equipo valide qué commits representan cada entrega.
3. **DT-06** — Implementar aprobación y validación de lanzamiento; sin ella no se declara v1.0.0 publicado.
4. **DT-04/07/08** — Aumentar cobertura de pruebas y controles de seguridad según disponibilidad del sprint.

## Evidencias y reglas

- GitHub conserva commits, PR, revisiones y acciones. Azure DevOps conserva las ejecuciones `#20261022.1` a `#20261022.4`.
- Las capturas de ejecución y aprobación están archivadas en la Biblioteca de evidencias `/IT-Incident-Hub/docs/evidencias/`.
- **Las capturas no sustituyen el enlace verificable al commit, PR, Work Item o pipeline.**
- El docente exige como mínimo **2 Epics, 4 Features, 8 User Stories y 16 Tasks**, con responsables y estados. Esa comprobación del backlog debe hacerse en Azure Boards; **este registro no garantiza que ya existan 16 Tasks**.
- El enunciado exige tres repositorios semanales para entregas parciales. El repositorio actual se llama `it-incident-hub-semana-1`; la organización de los repositorios siguientes aún debe comprobarse.

# Registro de deuda técnica — IT Incident Hub

## Criterio de trabajo

El proyecto exige **identificar al menos cinco deudas técnicas reales y resolver al menos dos con evidencia rastreable**. Cada registro debe mostrar el problema comprobado, riesgo, decisión, responsable, trabajo correctivo y prueba; una propuesta sin ejecutar **no cuenta como resuelta**.

Los identificadores `DT-01`... son referencias del documento, **no IDs de Azure Boards**. Se relacionan correcciones existentes con Work Items **reales** de seguimiento: DT-01 con [AB#31](https://dev.azure.com/devopsOrganizativaUMG01/IT-Incident-Hub/_workitems/edit/31) y DT-02 con [AB#34](https://dev.azure.com/devopsOrganizativaUMG01/IT-Incident-Hub/_workitems/edit/34) y [AB#30](https://dev.azure.com/devopsOrganizativaUMG01/IT-Incident-Hub/_workitems/edit/30). Es una trazabilidad documental y no significa que cada DT tenga un Work Item independiente ni que los PR antiguos aparezcan retroactivamente en Development. No se inventan números AB#.

## Deudas identificadas

| ID | Problema verificado y evidencia | Riesgo/prioridad | Estado | Decisión y trazabilidad |
| --- | --- | --- | --- | --- |
| **DT-01** | El script de integración esperaba PostgreSQL mediante socket local y podía detectar el servidor temporal de inicialización; Azure Pipelines **#20261022.1** falló con `database system is shutting down`. | Alto | **RESUELTA** | Se espera el servidor definitivo por TCP con `pg_isready -h 127.0.0.1`. Commit `14bafed`, **PR #11**, Azure **#20261022.2** exitoso y posterior **#20261022.3** en `main`; seguimiento [AB#31](https://dev.azure.com/devopsOrganizativaUMG01/IT-Incident-Hub/_workitems/edit/31). |
| **DT-02** | Las auditorías de dependencias de GitHub y Azure se ejecutaban solo para generar informes: un hallazgo `high`/`critical` no detenía CI. Ver versión de `.github/workflows/ci.yml` y `azure-pipelines.yml` anterior al PR #12. | Alto | **RESUELTA** | Control bloqueante para dependencias de producción, fallos de auditoría tratados como error, informes publicados. **PR #12**, GitHub Actions **39721406316**, Azure **#20261022.4** y fusión a `main` mediante `2f591f4`; seguimiento [AB#34](https://dev.azure.com/devopsOrganizativaUMG01/IT-Incident-Hub/_workitems/edit/34). |
| **DT-03** | El `README.md` inicial solo contenía título y una descripción breve, sin instalación, requisitos, responsables ni verificación. | Medio | **EN CORRECCIÓN** | Ampliación de README en rama `feature/deuda-tecnica-y-release`; se considerará resuelta al aprobar y fusionar su PR y comprobar los pasos documentados. |
| **DT-04** | El backend tiene un comando `test` de plantilla que falla intencionalmente; el frontend no define comando de pruebas unitarias. Existen scripts de integración PowerShell, pero no sustituyen las pruebas unitarias de componentes/controladores. | Alto | **ABIERTA** | Crear pruebas unitarias de validación y componentes, incorporarlas en CI, registrar defectos corregidos y resultados. |
| **DT-05** | Al iniciar el trabajo había desalineación entre versiones de paquetes y todavía no existía un GitHub Release; posteriormente se publicó `v1.0.0`. | Alto | **EN VERIFICACIÓN** | Release `v1.0.0` publicado en `f55a55f`; falta comprobar las versiones efectivas de raíz, backend y frontend y decidir los tags históricos `v0.x`. |
| **DT-06** | Originalmente faltaba una aprobación formal del candidato de release; después se documentó una aprobación manual de preproducción y verificación SHA-256. | Alto | **PARCIALMENTE ATENDIDA** | Azure Pipelines `#20261023.2` y GitHub Release `v1.0.0` documentan el control de liberación. Sigue pendiente acreditar despliegue a QA o producción, aprobación productiva y rollback probado. |
| **DT-07** | La política incorporada en DT-02 registra vulnerabilidades de dependencias de desarrollo sin bloquearlas; faltan decisiones individualizadas de riesgos y fechas de revisión. | Medio | **ABIERTA** | Revisar los informes de auditoría y clasificar hallazgos con responsable, severidad, mitigación y fecha de revisión; aplicar actualizaciones con PR. |
| **DT-08** | El pipeline utiliza PostgreSQL 17 en Docker, pero no hay una tarea explícita de análisis de vulnerabilidades de imagen de contenedor en los YAML. | Medio | **ABIERTA** | Evaluar escaneo de imágenes, fijación de versiones y actualizaciones controladas; conservar reporte y decisión. |
| **DT-09** | La auditoría local en Windows emite la advertencia Node.js `DEP0190` porque `scripts/auditar-dependencias.cjs` usa `spawnSync` con `shell: true` y argumentos. | Medio (potencial, requiere análisis) | **ABIERTA** | Revisar invocación segura y compatible con Windows, validar en agente Windows y documentar PR. No es un hallazgo de `npm audit`. Véase [informe AB#34](ab34-informe-auditoria.md). |

## Dos correcciones efectivamente demostradas

### DT-01 — Condición de carrera de PostgreSQL

- **Detectar:** fallo real de Azure Pipelines `#20261022.1`.
- **Diagnosticar:** la inicialización de PostgreSQL inicia y detiene un servidor provisional.
- **Corregir:** commit `14bafed`, [PR #11](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/pull/11), revisado por `gesteb3`.
- **Comprobar:** Azure `#20261022.2` en verde y ejecución automática `#20261022.3` desde `main`; artefactos publicados.
- **Decisión:** resuelta y cerrada en código. Se documentó su relación con [AB#31 — Pipeline](https://dev.azure.com/devopsOrganizativaUMG01/IT-Incident-Hub/_workitems/edit/31) y con AB#34. Los vínculos históricos de PR anteriores a la GitHub App no se presumen automáticos.

### DT-02 — Auditoría sin bloqueo de seguridad

- **Detectar:** las primeras configuraciones de CI registraban auditorías sin bloquear riesgos altos de producción.
- **Corregir:** [PR #12](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/pull/12), aprobado por `gesteb3`.
- **Comprobar:** [GitHub Actions 39721406316](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/actions/runs/39721406316), Azure `#20261022.4`, [GitHub Actions después de fusionar 39722326536](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/actions/runs/39722326536).
- **Decisión:** corregido el control obligatorio para `high`/`critical` en producción, con seguimiento de seguridad en [AB#34](https://dev.azure.com/devopsOrganizativaUMG01/IT-Incident-Hub/_workitems/edit/34). La revisión continua de hallazgos futuros sigue como deuda DT-07.

## Priorización siguiente

1. **DT-03** — El README se amplió e integró al repositorio mediante PR #13; verificar manualmente los pasos de instalación antes de marcar esta deuda como resuelta.
2. **DT-05** — Release `v1.0.0` publicado; verificar la alineación real de los paquetes y los commits que representarían posibles tags históricos.
3. **DT-06** — Aprobación manual de preproducción documentada; para cerrar toda la deuda, faltaría acreditar el flujo de despliegue y recuperación, sin confundirlo con el release de GitHub.
4. **DT-04/07/08** — Aumentar cobertura de pruebas y controles de seguridad según disponibilidad del sprint.

## Evidencias y reglas

- GitHub conserva commits, PR, revisiones y acciones. Azure DevOps conserva las ejecuciones `#20261022.1` a `#20261022.4`.
- Las capturas de ejecución y aprobación están archivadas en la Biblioteca de evidencias `/IT-Incident-Hub/docs/evidencias/`.
- **Las capturas no sustituyen el enlace verificable al commit, PR, Work Item o pipeline.**
- El docente exige como mínimo **2 Epics, 4 Features, 8 User Stories y 16 Tasks**. La jerarquía completa quedó documentada en las capturas de Azure Boards; los detalles de responsables y estados deben contrastarse con el tablero.
- El enunciado exige tres repositorios semanales: [Semana 1](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1), [Semana 2](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-2) y [Semana 3](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-3). Su conexión a Azure Boards se documentó; revisar el contenido de cada entrega por separado.

## Auditoría local posterior y tratamiento

La ejecución registrada en octubre de 2026 obtuvo **cero vulnerabilidades npm** en los cinco ámbitos (backend/frontend de producción y desarrollo, más raíz de desarrollo). Por tanto no hubo hallazgos npm individuales que requerían asignación de severidad o excepción en esa ejecución. Se documentó por separado la advertencia de Node.js **DEP0190**, clasificada provisionalmente como DT-09. Informe y criterios: [AB#34 — Evidencia de auditoría](ab34-informe-auditoria.md). El resultado debe repetirse y revisarse antes de cada lanzamiento.

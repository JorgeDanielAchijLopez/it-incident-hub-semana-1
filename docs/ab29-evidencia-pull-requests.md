# Evidencia de Pull Requests, revisiones y validaciones — AB#29

**Proyecto:** IT Incident Hub (proyecto académico individual).  
**Work Item:** [Task AB#29](https://dev.azure.com/devopsOrganizativaUMG01/IT-Incident-Hub/_workitems/edit/29), hija de [User Story AB#27](https://dev.azure.com/devopsOrganizativaUMG01/IT-Incident-Hub/_workitems/edit/27).  
**Fuente verificable:** [Pull Requests del repositorio principal](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/pulls?q=is%3Apr+is%3Aclosed).

## Objetivo y criterios

La Task #29 pide **al menos seis PR reales**, descriptivos, con pruebas, revisión registrada y constancia del uso de cuentas propias. Los PR de la tabla fueron **fusionados a `main`**, tienen una revisión formal **APPROVED** verificable en GitHub y contienen descripción de su alcance. Cuando una validación es manual o documental, se distingue expresamente de un pipeline automatizado.

## Tabla de evidencias

| PR | Fecha de fusión (UTC) | Alcance / Work Item | Validación documentada | Revisión registrada |
| --- | --- | --- | --- | --- |
| [#1](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/pull/1) | 15 oct 2026 | Estructura Git y carpetas, AB#28 | Revisión de estructura inicial, documentación y organización de módulos | **gesteb3 — Approved** |
| [#2](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/pull/2) | 16 oct 2026 | PostgreSQL y API REST, AB#14 | Endpoints de incidentes, SQL, validaciones y pruebas descritas en PR | **gesteb3 — Approved** |
| [#3](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/pull/3) | 16 oct 2026 | React para incidentes, AB#15 | Formulario, listado, detalle e integración con la API descritos en PR | **gesteb3 — Approved** |
| [#4](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/pull/4) | 20 oct 2026 | Comentarios e historial, AB#19/AB#20 | Persistencia y consulta de comentarios, pruebas de validación | **gesteb3 — Approved** |
| [#7](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/pull/7) | 20 oct 2026 | Estados, asignación y auditoría, AB#13 | Pruebas de transiciones, responsables y eventos de auditoría | **gesteb3 — Approved** |
| [#8](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/pull/8) | 21 oct 2026 | Pruebas automatizadas de filtros, AB#21 | Script PowerShell: filtros simples/combinados, estadísticas, HTTP 400 | **JorgeDanielAchijLopez — Approved**, autora de cambios: cuenta `gesteb3` |
| [#9](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/pull/9) | 21 oct 2026 | Dashboard y métricas, AB#21 | Compilación, ESLint e integración verificados; pruebas AB#21 | **gesteb3 — Approved** |
| [#10](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/pull/10) | 21 oct 2026 | GitHub Actions CI | Jobs de compilación, calidad, PostgreSQL, pruebas y artefactos; [registro CI](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/actions) | **gesteb3 — Approved** |
| [#11](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/pull/11) | 22 oct 2026 | Azure Pipelines y agente Windows | Ejecución fallida real **#20261022.1**, corrección PostgreSQL y ejecución verde **#20261022.2** | **gesteb3 — Approved** |
| [#12](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/pull/12) | 22 oct 2026 | Seguridad de dependencias | Auditoría npm y bloqueo de severidad alta/crítica en CI | **gesteb3 — Approved** |
| [#14](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/pull/14) | 22 oct 2026 | Plan de tres semanas, AB#26 | Revisión de requisitos y [GitHub Actions exitoso](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/actions/runs/39861838612) | **gesteb3 — Approved** |
| [#15](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/pull/15) | 22 oct 2026 | Vínculo Azure Boards ↔ GitHub, AB#28 | GitHub Actions [exitoso](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/actions/runs/39866426344); PR y commit visibles en Development de Task #28 | **gesteb3 — Approved** |

Cada PR enlazado permite inspeccionar sus pestañas **Conversation**, **Commits**, **Files changed** y **Checks**. Las revisiones constan en **Conversation / Reviews** y se pueden verificar de forma independiente. Hay **12 PR documentados aquí**, más del mínimo de seis.

## Distribución temporal sin alterar historial

- **Semana 1 — 12 al 18 de octubre de 2026:** PR #1, #2 y #3.
- **Semana 2 — 19 al 25 de octubre de 2026:** PR #4, #7, #8, #9, #10, #11, #12, #14 y #15.
- **Semana 3 — 26 de octubre al 1 de noviembre de 2026:** todavía no inicia a fecha 22 de octubre; los PR del release se documentarán cuando se realicen. **No se atribuyen los PR existentes a semanas futuras.**

Se conservan los **15 PR fusionados** en GitHub; los tres no incluidos en la tabla mínima ampliada también quedan consultables en el listado general. **El PR #13 no se presenta como aprobado por otro revisor**, porque no tiene una revisión formal registrada.

## Responsabilidades y simulación

Es un **proyecto individual**. Las cuentas `JorgeDanielAchijLopez` y `gesteb3` se emplean para representar separación de funciones (autor de cambios y revisor) durante la simulación académica. La actividad se acredita mediante autores reales de commits y eventos de revisión de GitHub. No se presenta como un equipo de personas independientes.

Los acuerdos y la convención `AB#ID` están documentados en [Estrategia de ramas](branching.md) y el [plan de tres semanas](plan-tres-semanas.md).

## Evidencias de validación, revisión y capturas

1. **Descripción y cambios:** el enlace a cada PR es la referencia primaria, permanente y auditable, incluyendo las fechas y la revisión.
2. **Pruebas funcionales:** [`tests/ab21-pruebas-indicadores.ps1`](../tests/ab21-pruebas-indicadores.ps1) y [`tests/ci-azure-integracion.ps1`](../tests/ci-azure-integracion.ps1) muestran los casos reproducibles.
3. **CI:** [ejecuciones de GitHub Actions](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/actions); Azure Pipelines **#20261022.1 / #20261022.2** documentadas en [CI del agente Windows](ci-azure-agente-windows.md).
4. **Capturas:** se han conservado capturas de PR, revisiones, CI y Azure Boards en la biblioteca del proyecto `/IT-Incident-Hub/docs/evidencias/`. La biblioteca es privada e independiente de GitHub; al preparar la entrega PDF final deben **incorporarse** las capturas seleccionadas, no citarse como archivos públicos del repositorio.

## Conclusión

Los criterios **1–4** de la Task AB#29 están respaldados por PR fusionados y aprobados, descripciones de cambios, verificaciones documentadas y declaraciones de roles. Esta tabla queda integrada mediante una rama documental y revisión, sin añadir PR artificiales para alcanzar el mínimo. El futuro trabajo de release y de la Semana 3 sigue siendo independiente.

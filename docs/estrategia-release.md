# Estrategia de versiones, entornos y lanzamiento

## Estado del lanzamiento

**Este documento es una estrategia de release, no una afirmación de despliegue.** El sistema ya tiene integraciones verificadas en `main`, pero **todavía no se ha publicado un Release `v1.0.0` ni configurado formalmente un entorno de aprobación en Azure DevOps**.

## Semantic Versioning

Convención: `vMAJOR.MINOR.PATCH` (ej. `v1.0.0`).

- **MAJOR:** cambio incompatible de contrato o primer lanzamiento estable `1.0.0`.
- **MINOR:** nuevas funciones compatibles hacia atrás.
- **PATCH:** correcciones compatibles que no modifican el contrato.
- El tag Git, la sección de CHANGELOG, los `package.json` y el artefacto deben referirse a la misma versión. No se permite etiquetar un commit que no haya superado los controles previstos.

### Secuencia planificada de entregas

| Versión propuesta | Alcance y evidencia histórica | Estado |
| --- | --- | --- |
| `v0.1.0` | Registro/consulta de incidentes, API REST, React y PostgreSQL. PR #2 y #3. | **Por reconstruir/verificar tag** |
| `v0.2.0` | Comentarios, asignación, ciclo de vida y auditoría. PR #4, #5, #6, #7. | **Por reconstruir/verificar tag** |
| `v0.3.0` | Filtros, indicadores, pruebas y automatizaciones CI. PR #8, #9, #10, #11, #12. | **Por reconstruir/verificar tag** |
| `v1.0.0` | Versión estable tras completar backlog, pruebas, deudas críticas, aprobaciones, artefactos y demostración. | **Pendiente** |

Los hitos anteriores son una **propuesta de correspondencia funcional**: los tags no se crearán hasta elegir y validar el SHA exacto que representa cada estado. Crear etiquetas retroactivas sin revisar su contenido produciría evidencia engañosa.

**Corrección en preparación — AB#35 / DT-05:** esta rama sincroniza la versión de raíz, backend y frontend a `1.0.0`, incluyendo el lockfile de frontend. La corrección queda validada al fusionar el PR con controles verdes. El número `1.0.0` en los paquetes **no prueba** que exista un Release publicado.

## Entornos

| Entorno | Uso | Controles existentes | Controles pendientes |
| --- | --- | --- | --- |
| **Desarrollo local** | Trabajo diario con Vite, Express y PostgreSQL local en Docker | `npm run dev`, compilación, ESLint | Pruebas unitarias adicionales |
| **Validación CI** | Verificar los cambios sin alterar datos de desarrollo | GitHub Actions y Azure Pipelines, PostgreSQL temporal, pruebas AB#21 y auditoría | Control de cobertura y revisión de hallazgos no bloqueantes |
| **Preproducción / QA (propuesto)** | Validar el artefacto que sería promovido | Se reutilizarán los artefactos generados en CI | Definir entorno e identidad de despliegue, revisión manual y prueba de humo |
| **Producción / release (propuesto)** | Publicación controlada de `v1.0.0` | Ningún despliegue de producción demostrado | Aprobación, rollback, versionado, release notes y evidencia |

No se deben usar datos personales ni los datos reales de incidentes en un entorno público de pruebas.

## Controles de aprobación

1. **Código:** rama `feature/*`/`fix/*` vinculada a trabajo, PR con revisión de otra cuenta, checks verdes y fusión en `main`.
2. **Calidad:** backend, frontend, ESLint y pruebas de integración con PostgreSQL.
3. **Seguridad:** vulnerabilidades `high`/`critical` en dependencias de producción bloquean CI; informes publicados y hallazgos restantes documentados.
4. **Artefacto:** conservar el build y su origen (commit SHA, pipeline, versión, fecha). El artefacto aprobado debe ser **el mismo** que se promueve, evitando reconstruir otro binario.
5. **Preproducción:** configurar en Azure DevOps un Environment `preproduccion` y un control de **Approvals and checks** que requiera validación humana antes de promover el artefacto. **Todavía no está configurado.**
6. **Producción:** configurar en Azure DevOps un Environment `produccion` con aprobación separada, plan de respaldo y recuperación. **Todavía no existe un despliegue real que demostrar.**
7. **Release:** solo después de los puntos anteriores, publicar una versión de GitHub con tag `v1.0.0`, nota de cambios, artefacto y evidencias.

**Limitación del agente Windows:** el pool `Default` ejecuta código en un equipo personal. Los PR sin revisar no deben disparar tareas arbitrarias en ese agente. Los secretos de autenticación se almacenan como variables protegidas de Azure, nunca en YAML ni en capturas.

## Preparar un release candidato

Checklist antes de solicitar aprobación:

- [ ] Azure Boards demuestra 2 Epics, 4 Features, 8 Stories y **16 Tasks**, responsables/estimaciones/prioridades/estados.
- [ ] Al menos **6 PR reales** aprobados y enlazados a cambios verificables.
- [x] Al menos **5 deudas reales** documentadas; dos correcciones verificables por PR y pipelines (DT-01 y DT-02).
- [x] Evidencia de Azure Pipelines fallido, corrección y ejecución exitosa.
- [x] GitHub Actions y Azure Pipelines integrados, con agente autohospedado.
- [x] Auditar dependencias y bloquear altas/críticas en producción.
- [ ] Clasificar hallazgos que sigan abiertos, con justificación y responsable.
- [ ] Ejecutar pruebas funcionales finales y, de ser posible, unitarias.
- [x] Alinear `package.json` y lockfiles con la versión objetivo **en la rama de preparación AB#35**; verificar fusión a `main` y CI antes de marcarlo como entrega aprobada.
- [ ] Crear/verificar tags `v0.1.0`, `v0.2.0`, `v0.3.0` y finalmente `v1.0.0`.
- [ ] Configurar y demostrar al menos un control real de aprobación de release.
- [ ] Redactar CHANGELOG y notas de lanzamiento con SHA, artefactos y pruebas.
- [ ] Preparar tres repositorios/entregas semanales según el enunciado, conservando trazabilidad.
- [ ] Completar README, captura de demo final y vínculos a evidencias.

## Procedimiento manual controlado (cuando esté aprobado)

```powershell
git switch main
git pull --ff-only origin main
git status
npm run check
```

El responsable debe comparar el SHA local con la ejecución verde de CI, registrar el aprobador y solo entonces crear y publicar la etiqueta correspondiente. **No ejecutar todavía `git tag v1.0.0`: faltan los controles de release.**

## Recuperación y rollback

- **Antes de promover:** si cualquier check falla, no aprobar ni liberar.
- **Después de promover:** conservar el artefacto anterior y su SHA, respaldar PostgreSQL y probar la restauración en un entorno aislado; volver a la versión anterior mediante el proceso aprobado, sin borrar migraciones ni datos directamente.
- Los cambios de esquema deben considerar compatibilidad y respaldo. No usar `docker compose down -v` en el entorno con incidentes reales.
- Abrir una Task de corrección asociada al fallo y resolverla mediante rama `fix/*`, PR, revisión y CI.

## Evidencias y referencias

- GitHub: https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1
- Azure Boards: https://dev.azure.com/devopsOrganizativaUMG01/IT-Incident-Hub
- Seguridad: `docs/seguridad-dependencias.md`
- Deudas: `docs/deuda-tecnica.md`
- Agente Azure: `docs/ci-azure-agente-windows.md`
- Historial de PR y auditorías de CI verificable en GitHub; resultados Azure #20261022.1, #20261022.2, #20261022.3 y #20261022.4.

## Preparación operativa AB#35

El checklist de validación, relación entre SHA y etiquetas, condiciones de aprobación, artefacto/checksum y evidencia de release está en [AB#35 — Preparación y control](ab35-preparacion-release.md). El [guion de demostración](ab35-guion-demostracion.md) describe una demo local y evita confundir CI con despliegue real.

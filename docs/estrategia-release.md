# Estrategia de versiones, entornos y lanzamiento

## Estado del lanzamiento

**Estado verificado:** la etiqueta y el GitHub Release `v1.0.0` ya están publicados sobre el commit `f55a55f0b2354ee97a31be6846e6f711fdb041ff` (PR #20). La ejecución Azure Pipelines `#20261023.2` documenta validaciones del artefacto, verificación SHA-256 y aprobación manual de preproducción. **No se ha demostrado un despliegue a producción.**

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
| `v1.0.0` | Primera versión estable: PR #20, CI, aprobación de preproducción, artefactos y SHA-256. | **Publicada en GitHub Releases** |

Los hitos anteriores son una **propuesta de correspondencia funcional**: los tags históricos `v0.x` no se crearán hasta elegir y validar el SHA exacto que representa cada estado. Crear etiquetas retroactivas sin revisar su contenido produciría evidencia engañosa.

**Cierre AB#35 / seguimiento DT-05:** la versión `v1.0.0` está publicada en GitHub Releases y asociada al commit indicado arriba. La alineación de versiones de los paquetes debe seguir comprobándose en el código; la existencia de un tag, por sí sola, no acredita que todos los `package.json` coincidan.

## Entornos

| Entorno | Uso | Controles existentes | Controles pendientes |
| --- | --- | --- | --- |
| **Desarrollo local** | Trabajo diario con Vite, Express y PostgreSQL local en Docker | `npm run dev`, compilación, ESLint | Pruebas unitarias adicionales |
| **Validación CI** | Verificar los cambios sin alterar datos de desarrollo | GitHub Actions y Azure Pipelines, PostgreSQL temporal, pruebas AB#21 y auditoría | Control de cobertura y revisión de hallazgos no bloqueantes |
| **Preproducción / QA** | Aprobar y verificar el candidato de release | Aprobación manual y verificación SHA-256 documentadas en Azure `#20261023.2` | Despliegue a un entorno QA y prueba de humo no acreditados |
| **Producción** | Despliegue real del sistema, distinto de publicar un release en GitHub | Ningún despliegue de producción demostrado | Entorno, aprobación separada, respaldos, rollback y evidencia operativa |

No se deben usar datos personales ni los datos reales de incidentes en un entorno público de pruebas.

## Controles de aprobación

1. **Código:** rama `feature/*`/`fix/*` vinculada a trabajo, PR con revisión de otra cuenta, checks verdes y fusión en `main`.
2. **Calidad:** backend, frontend, ESLint y pruebas de integración con PostgreSQL.
3. **Seguridad:** vulnerabilidades `high`/`critical` en dependencias de producción bloquean CI; informes publicados y hallazgos restantes documentados.
4. **Artefacto:** conservar el build y su origen (commit SHA, pipeline, versión, fecha). El artefacto aprobado debe ser **el mismo** que se promueve, evitando reconstruir otro binario.
5. **Preproducción:** el control manual de aprobación de preproducción quedó documentado en Azure Pipelines `#20261023.2`, junto con la verificación SHA-256. Esta aprobación no acredita que se haya desplegado el artefacto a un servidor QA.
6. **Producción:** para un despliegue futuro, configurar un Environment `produccion` con aprobación separada, plan de respaldo y recuperación. **No existe evidencia de despliegue real a producción.**
7. **Release de GitHub:** la versión `v1.0.0` ya fue publicada con notas, paquete candidato, checksum SHA-256 y archivos de trazabilidad. Su publicación no implica despliegue a producción.

**Limitación del agente Windows:** el pool `Default` ejecuta código en un equipo personal. Los PR sin revisar no deben disparar tareas arbitrarias en ese agente. Los secretos de autenticación se almacenan como variables protegidas de Azure, nunca en YAML ni en capturas.

## Preparar un release candidato

Checklist antes de solicitar aprobación:

- [x] Azure Boards: estructura documentada de 2 Epics, 4 Features, 8 Stories y **16 Tasks**. Revisar capturas del backlog para detalles de asignación y estado.
- [x] Al menos **6 PR reales**: el historial del repositorio incluye PRs fusionados hasta el #20; las aprobaciones y enlaces específicos deben respaldarse con sus registros.
- [x] Al menos **5 deudas reales** documentadas; dos correcciones verificables por PR y pipelines (DT-01 y DT-02).
- [x] Evidencia de Azure Pipelines fallido, corrección y ejecución exitosa.
- [x] GitHub Actions y Azure Pipelines integrados, con agente autohospedado.
- [x] Auditar dependencias y bloquear altas/críticas en producción.
- [x] La auditoría npm documentada reportó cero vulnerabilidades en los cinco ámbitos analizados; la advertencia Node.js DEP0190 se registró como DT-09. Repetir la auditoría en futuras versiones.
- [ ] Ejecutar pruebas funcionales finales y, de ser posible, unitarias.
- [x] Alinear `package.json` y lockfiles con la versión objetivo **en la rama de preparación AB#35**; verificar fusión a `main` y CI antes de marcarlo como entrega aprobada.
- [x] Tag `v1.0.0` y GitHub Release verificados. **Pendiente:** decidir si los hitos `v0.1.0`, `v0.2.0` y `v0.3.0` necesitan etiquetas reales; no crearlas sin validar sus SHA históricos.
- [x] Aprobación manual de preproducción y verificación SHA-256 documentadas en Azure `#20261023.2`.
- [x] Notas de GitHub Release publicadas con SHA y artefactos; CHANGELOG en actualización documental para reflejar la publicación.
- [x] Tres repositorios semanales creados y documentados; verificar individualmente la evidencia de cada entrega.
- [ ] README y documentación final en actualización; **video y demostración final se realizarán al final**.

## Procedimiento de comprobación del release publicado

```powershell
git switch main
git pull --ff-only origin main
git status
npm run check
```

El release `v1.0.0` **ya existe**. Comparar su SHA con `f55a55f0b2354ee97a31be6846e6f711fdb041ff`, comprobar los artefactos y conservar el registro de aprobación. **No volver a crear ni mover la etiqueta publicada.**

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

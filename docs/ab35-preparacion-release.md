# AB#35 — Preparación y control del lanzamiento v1.0.0

**Work Item:** [AB#35](https://dev.azure.com/devopsOrganizativaUMG01/IT-Incident-Hub/_workitems/edit/35).  
**Historia:** [AB#33](https://dev.azure.com/devopsOrganizativaUMG01/IT-Incident-Hub/_workitems/edit/33).  
**Estado de este documento:** preparatorio; **no acredita** publicación, aprobación ni despliegue.

## 1. Versionado SemVer coherente

Se establece la convención `vMAJOR.MINOR.PATCH`, con el número sin `v` en `package.json`.

El [PR #18](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/pull/18) sincronizó **raíz, backend y frontend** con la versión `1.0.0`, incluyendo el lockfile, y quedó aprobado y fusionado a `main` como `aae8918`. Esto **no prueba un lanzamiento publicado**.

Las etiquetas previstas son `v0.1.0`, `v0.2.0`, `v0.3.0` y `v1.0.0`. Antes de emitir las etiquetas históricas hay que localizar SHA reales y comprobar que cada commit contiene las funcionalidades que se le atribuyen; registrar tabla `tag / SHA / fecha original / prueba`. Una etiqueta creada hoy sobre una revisión anterior se declara como **etiqueta retrospectiva**, sin alterar ni falsificar la fecha original del desarrollo. No crear tags basados solo en fechas o nombres de PR.

## 2. Ambientes y aprobaciones

| Entorno | Estado | Condición para continuar |
| --- | --- | --- |
| Desarrollo local | Disponible | Aplicación local y PostgreSQL con datos de prueba |
| Validación CI | Disponible | GitHub Actions: compilación, lint, PostgreSQL, pruebas, auditoría; Azure Pipelines: agente propio y artefacto |
| `preproduccion` (Azure Environment) | **Creado; check manual configurado; ejecución pendiente** | Ejecución que se detenga, aprobación humana registrada y verificación del mismo artefacto con SHA-256 |
| `produccion` (Azure Environment) | **Por definir; sin despliegue real** | Aprobación independiente, respaldo/rollback y destino de despliegue configurado |

Para aprobar realmente AB#35, configurar una comprobación **Approvals and checks** en Azure DevOps sobre el entorno pertinente, ejecutar una etapa que **referencie el Environment** y registrar la ejecución detenida/aprobada. La mera creación de un Environment o una captura del formulario **no demuestra** que un despliegue haya pasado la aprobación.

**Advertencia sobre el agente autohospedado:** las ramas/PR no revisados no deben ejecutar comandos en la computadora personal; las tareas de release deben ejecutarse únicamente desde revisiones aprobadas. No exponer PAT, secretos ni passwords en YAML, logs, capturas o ZIP.

## 3. Condiciones previas a v1.0.0

- [x] PR de versión [#18](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/pull/18), aprobado por `gesteb3` y fusionado a `main` (commit `aae8918`).
- [ ] Confirmar `main` limpio, compilación y pruebas de integración, control de npm audit en verde.
- [ ] Verificar el conteo de Azure Boards (2 epics, 4 features, 8 stories y 16 tasks; criterios completos).
- [ ] Tabla de etiquetas históricas con SHA y alcance validado.
- [ ] Comprobar que el artefacto de **la misma ejecución aprobada** es descargable; conservar archivo de checksum SHA-256, SHA de commit y número de ejecución.
- [ ] Configurar y **ejecutar** control de aprobación de preproducción y documentar quién aprobó, cuándo y sobre qué SHA.
- [ ] Confirmar estado de deudas de seguridad (DT-09 abierta; aceptar expresamente el riesgo o corregir antes de liberar).
- [ ] Publicar tag `v1.0.0` solo sobre el SHA verificado en `main`.
- [ ] Crear GitHub Release `v1.0.0` con notas, artefacto verificable y checksum; no confundir el `Source code.zip` que genera GitHub con un build aprobado.
- [ ] Captura de demostración y prueba de humo; documentar si **no hubo despliegue a producción**.
- [ ] Publicar entrega de Semana 3 como copia/versionado del SHA final, sin reescribir historial.

## 4. Comprobaciones locales previas, sin publicar aún

```powershell
git switch main
git pull --ff-only origin main
git status
git log -1 --format="%H %cI %s"
git tag --list "v*"
npm run check
node scripts/auditar-dependencias.cjs --self-test
node scripts/auditar-dependencias.cjs auditorias
```

Para probar integración con PostgreSQL, seguir [README](../README.md) y los scripts de CI. Guardar logs y enlaces en Azure Boards; redactar cualquier salida que contenga nombres, tokens o contraseñas antes de compartirla.

Los tags se deben publicar solamente **después** de elegir SHA y validar las pruebas. Un Release de GitHub no demuestra por sí solo que el proyecto esté desplegado en producción.

## 5. Artefacto y notas de entrega

Se utilizará el artefacto **`candidato-v1-0-0`** de `azure-release-validation.yml` después de ejecutar la aprobación de `preproduccion`. Contiene `it-incident-hub-v1.0.0-candidato.zip`, un archivo `.sha256`, `commit-sha.txt` y `trazabilidad.txt`. Descargar la ejecución verde **correspondiente al commit que se etiqueta**; comparar el checksum con `Get-FileHash -Algorithm SHA256`. También se conservan los artefactos existentes de GitHub Actions y Azure `evidencias-azure-ci` como historial anterior.

Las notas deben indicar: versión, fecha real de publicación, SHA del tag, enlace de CI, resumen funcional, migraciones PostgreSQL, instrucciones de ejecución, limitaciones/deudas pendientes, procedimiento de rollback y aprobación verificada. No afirmar que se han publicado ni aprobado antes de realizar esas operaciones.

**Guion de demo:** [docs/ab35-guion-demostracion.md](ab35-guion-demostracion.md).  
**Estrategia amplia:** [docs/estrategia-release.md](estrategia-release.md).  
**Registro de cambios:** [CHANGELOG.md](../CHANGELOG.md).

## 6. Pipeline manual para comprobar aprobación real — AB#35

El archivo [azure-release-validation.yml](../azure-release-validation.yml) define un pipeline **independiente, de ejecución manual** (`trigger: none`, `pr: none`) para no bloquear ni alterar el CI principal. Requiere el agente Windows autohospedado disponible y Docker Desktop en modo contenedores Linux.

**Pasos de configuración en Azure DevOps:**

1. En **Pipelines → New pipeline → GitHub**, seleccionar el repositorio `it-incident-hub-semana-1`.
2. Elegir **Existing Azure Pipelines YAML file**, rama **`main`**, ruta **`/azure-release-validation.yml`**. No usar la rama de este PR hasta que esté aprobado y fusionado.
3. Guardar el pipeline y ejecutar **Run pipeline** manualmente desde la rama `main`. El primer uso podría solicitar permiso de acceso al pool o al entorno `preproduccion`.
4. El stage **Validacion** reinstala dependencias, compila, ejecuta pruebas con PostgreSQL, audita dependencias y publica ZIP/checksum/SHA del commit como artefacto `candidato-v1-0-0`.
5. Al comenzar el stage **AprobacionPreproduccion**, el check del Environment `preproduccion` debe **detener la etapa y mostrar una solicitud de aprobación**. Guardar captura del estado pendiente.
6. Desde la cuenta configurada como aprobadora, revisar el commit y los controles, abrir **Review / Approve** y registrar captura de la aprobación. En un proyecto individual esto es **autorización simulada**, no aprobación independiente.
7. Una vez aprobado, el stage descarga el artefacto de **esa misma ejecución** y valida el SHA-256 y commit; conservar enlace al run exitoso, número, SHA y artefacto.

**Alcance:** este stage **no despliega a servidores ni ejecuta migraciones de producción**. Verifica un candidato en un entorno lógico vacío y registra la aprobación de liberación. No afirmar despliegue real a `preproduccion` o a producción por el solo hecho de que Azure lo llame *deployment job*.

## 7. Incidencia real en el candidato #20261023.1 — bloqueo de puerto Docker

El primer pipeline manual del release **#20261023.1** pudo instalar dependencias y compilar, pero falló en `Pruebas de integracion con PostgreSQL` con error Docker de Windows: `listen tcp4 127.0.0.1:55433: bind: An attempt was made to access a socket in a way forbidden by its access permissions` (código `125`). **No se alcanzó la aprobación de preproducción** y no hay artefacto de esa ejecución validado.

**Diagnóstico:** `tests/ci-azure-integracion.ps1` asignaba el puerto **55433** de forma fija. Windows puede reservar/excluir ese puerto; el error es de publicación del contenedor, no de la lógica de PostgreSQL o las pruebas AB#21.

**Corrección propuesta en este PR:** publicar PostgreSQL exclusivamente en `127.0.0.1` con **puerto efímero asignado por Docker** (`-p 127.0.0.1::5432`), leerlo con `docker port <contenedor> 5432/tcp` y transmitirlo a la API mediante `DB_PORT`. Mantener el puerto **5432** dentro del contenedor. No se modifica el pipeline CI existente ni se abre PostgreSQL a otras interfaces.

**Verificaciones aún pendientes:** fusionar tras la revisión habitual; iniciar **una nueva ejecución manual en `main`**, registrar que PostgreSQL inició con el puerto asignado, que las pruebas y el empaquetado pasaron, y luego capturar la solicitud real de aprobación en `preproduccion`. El fallo anterior se conserva como evidencia de resolución de incidente; **no declarar corregido en Azure hasta tener ejecución verde**.

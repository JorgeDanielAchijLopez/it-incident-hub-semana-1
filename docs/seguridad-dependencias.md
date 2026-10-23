# Control de seguridad y auditoría de dependencias

## Objetivo

Evitar que una versión con vulnerabilidades **altas o críticas en dependencias de producción** supere el control de seguridad en el pipeline. El mismo procedimiento se ejecuta en GitHub Actions (Ubuntu) y Azure Pipelines (agente Windows autohospedado).

## Política aplicada

- **Bloqueo de CI:** una o más vulnerabilidades `high` o `critical` detectadas mediante `npm audit --omit=dev --json` en `backend` o `frontend`.
- **Bloqueo por falta de verificación:** si npm no puede consultar el registro, devuelve un informe inválido o no genera los resultados esperados, la auditoría falla. No se interpreta un error de conexión como cero vulnerabilidades.
- **Registro informativo:** se auditan todas las dependencias (incluidas las de desarrollo) de `backend`, `frontend` y la raíz para que los hallazgos de las herramientas de compilación sean visibles. En esta etapa esos hallazgos **no bloquean** y deben evaluarse como deuda técnica.
- **Bajas y moderadas de producción:** se registran, pero no bloquean esta primera política; deben revisarse según el riesgo y actualizarse periódicamente.
- **Trazabilidad:** los archivos JSON y `resultado-seguridad.md` se publican como artefactos. Las excepciones futuras requieren justificación, responsable y fecha de revisión; no se debe modificar el script solo para ocultar avisos.
- **Control existente:** siguen vigentes la compilación, ESLint y las pruebas de API/PostgreSQL de AB#21. No se cambia el tratamiento de secretos de PostgreSQL.

## Archivos

| Archivo | Función |
| --- | --- |
| `scripts/auditar-dependencias.cjs` | Ejecuta y analiza cinco auditorías; aplica la política de bloqueo |
| `.github/workflows/ci.yml` | Ejecuta el analizador en GitHub Actions y publica los informes aun si falla |
| `azure-pipelines.yml` | Ejecuta la misma política en Windows y publica informes en `evidencias-azure-ci` |
| `docs/seguridad-dependencias.md` | Política, reproducibilidad y evidencias |

## Revisión local

Desde PowerShell, con Node.js y npm instalados y con conexión al registro de npm:

```powershell
node scripts/auditar-dependencias.cjs --self-test
node scripts/auditar-dependencias.cjs auditorias
```

El comando crea los informes `backend-produccion.json`, `frontend-produccion.json`, `backend-desarrollo.json`, `frontend-desarrollo.json`, `raiz-desarrollo.json` y `resultado-seguridad.md` dentro del directorio solicitado.

**Importante:** `npm audit` utiliza los archivos `package-lock.json` existentes. La auditoría depende de la base de vulnerabilidades publicada por npm en el momento de la ejecución; un resultado favorable no garantiza la ausencia absoluta de fallas de seguridad.

## Interpretación de una ejecución

1. Revisar los resultados de GitHub Actions, particularmente la tarea `Auditar dependencias y bloquear riesgos altos de produccion`.
2. Descargar el artefacto `compilacion-y-auditorias` y abrir `auditorias/resultado-seguridad.md`. No basta con ver una marca verde en las demás tareas.
3. Si falla por vulnerabilidad alta/crítica, identificar el paquete y la cadena de dependencias en el JSON y actualizar paquetes con cambios pequeños y trazables; después ejecutar nuevamente el pipeline.
4. Si falla la comunicación con npm, documentar la indisponibilidad y repetir la comprobación, **sin desactivar el control**.
5. Tras aprobar GitHub y fusionar el PR, comprobar la ejecución automática en Azure Pipelines y el artefacto `evidencias-azure-ci`.

## Estado y limitaciones

La configuración anterior ejecutaba `npm audit` solo para generar informes y no rechazaba hallazgos. Esta rama añade un control exigible.

**Verificación real en GitHub Actions:** la ejecución [39721406316](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/actions/runs/39721406316) terminó exitosamente en los trabajos de calidad y de integración. El paso de auditoría de dependencias se completó correctamente y se publicaron dos artefactos.

**Verificación real en Azure Pipelines:** la ejecución **#20261022.4** en el agente autohospedado `ITIncidentHub-Windows` y pool `Default` terminó correctamente en **2 min 8 s**. Todas las tareas se mostraron en verde, incluyendo **Auditar dependencias y aplicar política de seguridad**, integración con PostgreSQL/AB#21 y publicación de **1 artefacto**. La captura se guardó en la Biblioteca de evidencias: `/IT-Incident-Hub/docs/evidencias/azure-pipeline-20261022-4-seguridad-verde.png`.

**Alcance de la aprobación:** las auditorías de producción pasan el umbral `high/critical` en estas ejecuciones. Los hallazgos de desarrollo y de menor severidad requieren revisión periódica; esta comprobación no sustituye otras pruebas de seguridad.

**Estado actualizado:** el [PR #12](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/pull/12) está aprobado y fusionado en `main`. Se conservaron la ejecución de GitHub Actions `39722326536` después de la fusión y la validación de Azure Pipelines `#20261022.4`.

La auditoría de dependencias es una sola capa: quedan fuera de su alcance un análisis estático profundo, pruebas de penetración, análisis de contenedores, protección de rama y gestión formal de secretos. Los hallazgos de desarrollo quedan documentados para incorporarlos a la lista de deuda técnica.

## Auditoría posterior documentada en AB#34

El responsable ejecutó el script en PowerShell y compartió los resultados de los cinco ámbitos auditados: **0 vulnerabilidades** en todos los niveles `info`, `low`, `moderate`, `high` y `critical`. Resultado final: **APROBADO**. No existen hallazgos de npm para clasificar individualmente en esa ejecución; la decisión de seguridad es mantener la política de bloqueo, los reportes reproducibles y auditorías periódicas.

La ejecución también mostró **Node.js DEP0190** (uso de `spawnSync` con `shell: true` y argumentos en Windows). No forma parte del informe npm, no prueba explotación y se registró como [DT-09](deuda-tecnica.md) **abierta**, con riesgo potencial medio pendiente de análisis y corrección compatible con Windows.

Se revisaron los nombres de los archivos versionados: los ejemplos `backend/.env.example` y `database/.env.example` contienen marcadores de contraseña; `.gitignore` excluye archivos `.env` reales. Esta comprobación de nombres y ejemplos no reemplaza un escaneo integral de secretos del árbol, historial, artefactos y capturas.

Ver [AB#34 — Informe de auditoría y decisiones](ab34-informe-auditoria.md) para resultados, severidad, tratamiento y relación con PR y Work Items.

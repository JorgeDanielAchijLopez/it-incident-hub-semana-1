# AB#34 — Evidencia de deuda técnica, auditoría y manejo de secretos

**Work Item:** [Task AB#34](https://dev.azure.com/devopsOrganizativaUMG01/IT-Incident-Hub/_workitems/edit/34) — Analizar dependencias, proteger secretos y corregir deuda técnica verificable.  
**Parent:** [User Story AB#33](https://dev.azure.com/devopsOrganizativaUMG01/IT-Incident-Hub/_workitems/edit/33).  
**Evidencia primaria:** [docs/deuda-tecnica.md](deuda-tecnica.md), [docs/seguridad-dependencias.md](seguridad-dependencias.md), [scripts/auditar-dependencias.cjs](../scripts/auditar-dependencias.cjs).

## 1. Ejecución local de auditoría — octubre de 2026

Comandos ejecutados en Windows PowerShell desde `it-incident-hub-semana-1`:

```powershell
node scripts/auditar-dependencias.cjs auditorias
Get-Content .\auditorias\resultado-seguridad.md
```

La salida compartida por el ejecutor, contrastada con la política del script, fue:

| Ámbito auditado | Info | Baja | Moderada | Alta | Crítica | Tratamiento |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| backend-produccion | 0 | 0 | 0 | 0 | 0 | OK — sin hallazgos |
| frontend-produccion | 0 | 0 | 0 | 0 | 0 | OK — sin hallazgos |
| backend-desarrollo | 0 | 0 | 0 | 0 | 0 | OK — sin hallazgos |
| frontend-desarrollo | 0 | 0 | 0 | 0 | 0 | OK — sin hallazgos |
| raiz-desarrollo | 0 | 0 | 0 | 0 | 0 | OK — sin hallazgos |

**Resultado:** `control de seguridad APROBADO para dependencias de produccion`. No hubo vulnerabilidades de npm que exigieran una decisión individual de tratamiento en esta ejecución. La política bloquea `high` y `critical` de producción y falla si npm no puede entregar un informe válido. Revisar la información de `npm audit` en cada ejecución; **cero hallazgos en esta fecha no equivale a seguridad absoluta** ni certifica imágenes Docker o código propio.

Los resultados se generan localmente en `auditorias/` y son reproducibles con el comando anterior; los JSON completos pueden contener metadatos del entorno y no se publican aquí. Los pipelines publican sus propios artefactos de auditoría.

### Advertencia adicional del entorno (fuera de npm audit)

La terminal emitió `[DEP0190] DeprecationWarning`: pasar argumentos a un proceso hijo con `shell: true` puede originar inyección de comandos porque los argumentos se concatenan sin escape.

- **Ubicación técnica:** `scripts/auditar-dependencias.cjs` invoca `spawnSync` con `shell: process.platform === "win32"`; en Windows usa `npm.cmd`.
- **Clasificación:** riesgo potencial **medio, pendiente de análisis**. No es una vulnerabilidad de dependencia identificada por npm ni una explotación demostrada.
- **Mitigación observada:** los argumentos del proceso proceden de la lista de ámbitos definida en el propio script, no de un formulario web.
- **Tratamiento:** mantener abierta como **DT-09**; revisar una forma segura y compatible con Windows de ejecutar npm sin concatenación de argumentos, añadir prueba en el agente propio y documentar un PR correctivo antes de marcarla resuelta.
- **Responsable:** titular del proyecto IT Incident Hub; revisión en la siguiente iteración de seguridad.

## 2. Deudas reales y dos correcciones trazables

El registro [docs/deuda-tecnica.md](deuda-tecnica.md) describe al menos **8 deudas técnicas anteriores**, además de la advertencia **DT-09** señalada arriba. En particular, dos correcciones están demostradas:

| Deuda | Diagnóstico | Work Item de seguimiento | Cambio/PR y comprobación | Estado |
| --- | --- | --- | --- | --- |
| **DT-01** | El pipeline usó PostgreSQL durante su parada de inicialización y falló | [AB#31 — Pipeline](https://dev.azure.com/devopsOrganizativaUMG01/IT-Incident-Hub/_workitems/edit/31), corregida como parte de ese trabajo; [AB#34](https://dev.azure.com/devopsOrganizativaUMG01/IT-Incident-Hub/_workitems/edit/34), registro de deuda | [PR #11](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/pull/11), commit `14bafed`, fallo Azure `#20261022.1`, éxito `#20261022.2` | **Corregida** |
| **DT-02** | La auditoría de dependencias solo informaba y no bloqueaba `high`/`critical` | [AB#30 — CI/CD](https://dev.azure.com/devopsOrganizativaUMG01/IT-Incident-Hub/_workitems/edit/30) y [AB#34 — Seguridad](https://dev.azure.com/devopsOrganizativaUMG01/IT-Incident-Hub/_workitems/edit/34) | [PR #12](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1/pull/12), GitHub Actions `39721406316`, Azure `#20261022.4` | **Corregida** |

**Nota de trazabilidad:** AB#31, AB#30 y AB#34 son Work Items reales relacionados con esas correcciones; no se afirma que existan dos Work Items independientes creados con los títulos DT-01 y DT-02. Los PR #11 y #12 precedieron a la conexión de Azure Boards con GitHub App, por lo que su aparición automática y retroactiva en `Development` no está garantizada. Los vínculos verificables están documentados aquí.

## 3. Evidencia de protección de secretos

Se revisó la lista de **107 entradas** del árbol Git actual y se comprobaron los ejemplos de configuración:

- Los únicos nombres del árbol que coincidían con archivos tipo `.env` fueron `backend/.env.example` y `database/.env.example`; contienen marcadores de sustitución, no contraseñas reales.
- `.gitignore` excluye `.env` y `.env.*`, salvo `.env.example`.
- Los archivos de configuración de CI revisados no contienen el PAT del agente. Los ejemplos de `README.md` requieren contraseñas privadas locales y advierten no publicarlas.
- Las capturas archivadas que se usaron para el proyecto muestran el token oculto, no el valor de acceso.

**Límite de comprobación:** esta inspección de nombres y configuraciones **no equivale a escanear todos los blobs ni el historial Git**. No se puede certificar que nunca haya existido una credencial. Antes del release se debe ejecutar un escaneo de secretos sobre árbol e historial, revisar artefactos/capturas y revocar cualquier token accidentalmente expuesto.

## 4. Estado y acciones de seguimiento

- **Verificado:** cero vulnerabilidades npm en cinco ámbitos en la auditoría ejecutada; dos deudas corregidas con PR y CI; controles de alto/crítico funcionando.
- **Pendiente:** resolver DT-09; revisar el alcance de escaneo de secretos; reclasificar si aparecen nuevos hallazgos; comprobar la asociación con el Work Item AB#34 y obtener revisión formal de este documento.
- **No confundirse con el release:** completar AB#34 no equivale a aprobar o publicar `v1.0.0`; las versiones, aprobaciones y artefacto de lanzamiento corresponden a AB#35.

La evidencia de la ejecución fue proporcionada desde PowerShell por el responsable del proyecto y registrada aquí sin atribuir al repositorio los archivos locales ignorados por Git.

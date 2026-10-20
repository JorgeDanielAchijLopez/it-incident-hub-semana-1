# AB#13 — Ciclo de vida de incidentes y auditoría

**Proyecto:** IT Incident Hub  
**Historia de usuario:** AB#13 — Como coordinador de TI, quiero asignar técnicos y actualizar los estados de los incidentes para organizar su atención y verificar su resolución.  
**Rama:** `fix/ab13-ciclo-vida-auditoria`  
**Repositorio:** https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1

## Objetivo

Completar el ciclo de vida de los incidentes y registrar quién realiza las asignaciones y cambios de estado, con persistencia en PostgreSQL e historial visible en la interfaz React.

## Funcionalidades implementadas

- Asignación y reasignación de técnicos existentes y activos.
- Paso automático de `NUEVO` a `ASIGNADO` cuando se asigna el primer técnico.
- Transiciones controladas: `NUEVO` → `ASIGNADO` → `EN_PROCESO` → `RESUELTO` → `CERRADO`.
- Rechazo de cambios no permitidos mediante respuestas HTTP `409`.
- Validación de identificadores de incidentes y técnicos.
- Registro en PostgreSQL de cambios de técnico y estado mediante triggers de auditoría.
- Campo opcional `responsable` en las solicitudes de asignación y cambio de estado; si no se envía, se utiliza `Sistema`.
- Interfaz React para escribir el nombre del responsable y consultar el historial de seguimiento.

> **Alcance de identidad:** el nombre del responsable se declara en la solicitud; todavía no existe autenticación que compruebe su identidad.

## Archivos modificados y agregados

- `backend/src/controllers/asignaciones.controller.ts`
- `backend/src/controllers/estados.controller.ts`
- `backend/src/schemas/asignacion.schema.ts`
- `backend/src/schemas/estado.schema.ts`
- `database/005_auditoria_responsable.sql`
- `tests/ab16-asignaciones.ps1` (ampliadas las verificaciones para AB#13)
- `frontend/src/api/gestion.ts`
- `frontend/src/components/IncidentManagement.tsx`

## Endpoints utilizados

| Método | Ruta | Uso |
| --- | --- | --- |
| `GET` | `/api/tecnicos` | Consultar técnicos activos |
| `PATCH` | `/api/incidentes/:id/asignacion` | Asignar o reasignar técnico; admite `responsable` |
| `PATCH` | `/api/incidentes/:id/estado` | Cambiar a un estado permitido; admite `responsable` |
| `GET` | `/api/incidentes/:id/comentarios` | Consultar el historial y los comentarios |

**Ejemplo de solicitud de asignación:**

```json
{
  "tecnico_id": 1,
  "responsable": "Coordinador TI"
}
```

**Ejemplo de solicitud de cambio de estado:**

```json
{
  "estado": "RESUELTO",
  "responsable": "Coordinador TI"
}
```

Los valores son ilustrativos; la operación debe dirigirse a un incidente existente y cumplir las reglas de transición.

## Verificaciones realizadas

1. Se confirmó la compilación del backend con `npm --prefix backend run build`.
2. Se confirmó la compilación del frontend con `npm --prefix frontend run build` y la revisión ESLint con `npm --prefix frontend run lint`.
3. El script `tests/ab16-asignaciones.ps1`, ampliado para AB#13, reportó `TODAS LAS PRUEBAS AB#13 TERMINARON CORRECTAMENTE`. Comprobó, entre otros: estado inicial `NUEVO`, rechazo `HTTP 409` de transiciones inválidas, asignación válida y persistencia, estado automático `ASIGNADO`, cuatro eventos y fechas de auditoría.
4. Una prueba desde PowerShell creó un incidente, lo asignó y cambió el estado, enviando `responsable: "Coordinador TI"`. La respuesta de historial incluyó tres eventos con ese autor y el mensaje `AUDITORIA AB13 CORRECTA`.
5. En React se comprobó visualmente el registro de `Coordinador TI` como autor de una asignación y como autor del cambio `EN_PROCESO` → `RESUELTO`, con fecha y hora visibles.
6. Tras renombrar los mensajes de commit, `git diff --exit-code respaldo-ab13-original HEAD` no mostró diferencias en los archivos respecto al respaldo original. Se conservó la rama local `respaldo-ab13-original` como respaldo de seguridad.

## Evidencias disponibles

Las capturas se respaldaron en la Biblioteca de ChatGPT, carpeta `IT-Incident-Hub/docs/evidencias/`, junto con un índice y los paquetes ZIP de capturas de la conversación. El respaldo consolidado se llama `IT_Incident_Hub_RESPALDO_COMPLETO_EVIDENCIAS_2026-10-20.zip`.

Evidencias que deben vincularse al informe final:

- Captura del cambio `EN_PROCESO` → `RESUELTO` con autor `Coordinador TI` (20/10/2026, 11:41:54 a. m.).
- Captura de asignación con autor `Coordinador TI`.
- Captura de resultados de pruebas automatizadas AB#13.
- Captura de prueba API con `AUDITORIA AB13 CORRECTA`.
- Captura de historial de commits en español y árbol de trabajo limpio.

**Nota de organización:** guardar o adjuntar las capturas correspondientes al repositorio antes de vincular imágenes por rutas relativas en el README o en esta documentación; una ruta en la Biblioteca no equivale a una imagen subida a GitHub.

## Historial de commits de la rama

- `706cc3f` `fix(api): cambiar automaticamente el estado al asignar tecnico AB#13`
- `e0138bb` `feat(db): registrar responsable de los cambios AB#13`
- `23cedef` `test(api): restaurar pruebas completas de asignacion AB#13`
- `1946540` `feat(api): registrar responsable en asignaciones y cambios de estado AB#13`
- `b24172b` `feat(frontend): registrar responsable de cambios en incidentes AB#13`

## Pendientes de entrega

- Rama `fix/ab13-ciclo-vida-auditoria` publicada en GitHub el 20/10/2026.
- Documento integrado al repositorio en esta rama. Las imágenes originales continúan respaldadas en la Biblioteca de ChatGPT y su integración como archivos PNG en GitHub aún está pendiente.
- Abrir un Pull Request hacia `main`, solicitar revisión, atender observaciones y fusionarlo solo después de la aprobación.
- Actualizar la historia AB#13 en Azure Boards y registrar la URL del Pull Request.

## Conclusión

Las operaciones de asignación de técnicos y modificación de estado se integraron con una auditoría que identifica al responsable declarado, registra eventos y mantiene su historial visible en React. Las verificaciones disponibles muestran que las validaciones, los cambios automáticos y la persistencia funcionan en los escenarios probados.
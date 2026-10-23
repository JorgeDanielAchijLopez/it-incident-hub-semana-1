# AB#35 — Guion de demostración de IT Incident Hub

**Objetivo:** demostrar funcionalidades y trazabilidad del proyecto con datos ficticios, desde el navegador y desde las evidencias de CI, sin publicar contraseñas. Duración sugerida: **6 a 8 minutos**.

## Preparación, antes de grabar

1. Verificar que Docker Desktop utilice contenedores Linux y que PostgreSQL esté iniciado.
2. Instalar dependencias y configurar `database/.env` y `backend/.env` con datos locales privados como se indica en el [README](../README.md).
3. Iniciar el sistema con `npm run dev` desde la raíz, o iniciar backend y frontend por separado.
4. Confirmar `http://localhost:5173` y `http://127.0.0.1:3000/api/health`.
5. Preparar incidentes **ficticios** de distintas categorías, prioridades, estados y técnicos, sin datos personales reales; tener abiertas las pestañas de GitHub y Azure Pipelines.
6. No mostrar valores de `.env`, PAT, claves, consola con variables privadas ni archivos JSON de auditoría sin revisarlos.

## Guion sugerido

**0:00–0:50 — Presentación y arquitectura.**  
“IT Incident Hub es una aplicación para registrar y atender incidentes informáticos. Está construida con React y TypeScript en el frontend, una API Express/TypeScript y PostgreSQL. El trabajo se organizó con Azure Boards, GitHub y ramas revisadas por PR.”

**0:50–2:00 — Registro y consulta.**  
Abrir el formulario, explicar título, descripción, categoría y prioridad. Crear un incidente de prueba; mostrar la confirmación, identificador y estado inicial `NUEVO`. Entrar al listado y al detalle.

**2:00–3:10 — Seguimiento y auditoría.**  
Mostrar asignación de técnico y cambio de estado; explicar que los cambios registran responsable y fecha. Registrar un comentario de prueba y consultar el historial cronológico.

**3:10–4:15 — Filtros e indicadores.**  
Seleccionar diferentes filtros, combinarlos, consultar el estado vacío y comprobar las tarjetas de indicadores. Explicar que los totales vienen de consultas a PostgreSQL y que existen pruebas automatizadas AB#21.

**4:15–5:30 — CI/CD y seguridad.**  
En GitHub mostrar PR aprobado, comprobaciones de GitHub Actions y artefacto; en Azure Pipelines mostrar la ejecución que falló (`#20261022.1`), el diagnóstico y la ejecución corregida (`#20261022.2`). Mostrar el agente `ITIncidentHub-Windows` y auditoría `#20261022.4`.

**5:30–7:00 — Versionado y release.**  
Mostrar la jerarquía Azure Boards (Epic → Feature → Story → Task), un PR asociado mediante `AB#ID`, y el [CHANGELOG](../CHANGELOG.md). **Solo cuando se haya publicado** `v1.0.0`, enseñar su etiqueta, Release, SHA, artefacto/checksum y aprobación en el entorno de Azure. Antes de ese momento describirlos como **pendientes**, no como entregables realizados.

**Cierre.**  
“Se puede seguir cada requisito desde Azure Boards hasta el código, los PR, las pruebas y los artefactos. Las deudas técnicas restantes están documentadas y el lanzamiento está sujeto a controles de aprobación.”

## Evidencia a conservar

- Captura de la aplicación con al menos un incidente y vista de detalle.
- Capturas de filtros y panel de indicadores.
- PR revisado con comprobaciones exitosas.
- Ejecución Azure fallida y su recuperación verde, sin tokens.
- Jerarquía y estados de Azure Boards.
- Cuando exista: entorno de aprobación ejecutado, tag, GitHub Release, checksum y artefacto descargable.

El guion describe los puntos que deben verse, no garantiza automáticamente que la aplicación esté ejecutándose ni que el release ya se haya publicado.

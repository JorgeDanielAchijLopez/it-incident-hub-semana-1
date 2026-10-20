
# Asignación de técnicos y cambios de estado

## Información general

Proyecto: IT Incident Hub

Azure Boards: AB#16

Rama: feature/ab16-asignacion-estados-backend

Tecnologías: Node.js, Express, TypeScript, PostgreSQL y Docker.

## Objetivo

Permitir la asignación y reasignación de técnicos a los
incidentes registrados, así como controlar los cambios de
estado y mantener un historial de las operaciones realizadas.

## 1. Catálogo de técnicos

Se creó la tabla `tecnicos` en PostgreSQL.

Archivo:
`database/003_create_tecnicos.sql`

La tabla almacena:
- Identificador del técnico.
- Nombre.
- Especialidad.
- Estado activo o inactivo.
- Fecha de registro.

Se agregaron tres técnicos de ejemplo para realizar pruebas.

## 2. Asignación de técnicos

Se implementaron los siguientes endpoints:

GET /api/tecnicos

Permite consultar los técnicos activos.

PATCH /api/incidentes/:id/asignacion

Permite asignar o reasignar un técnico a un incidente.

La API valida que el técnico exista y esté activo.
También comprueba que el incidente exista.

## 3. Cambios de estado

Endpoint:

PATCH /api/incidentes/:id/estado

Se implementó el siguiente flujo:

NUEVO -> ASIGNADO -> EN_PROCESO -> RESUELTO -> CERRADO

El sistema rechaza transiciones no permitidas mediante
una respuesta HTTP 409.

Para pasar de NUEVO a ASIGNADO, el incidente debe tener
un técnico asignado.

## 4. Auditoría automática

Archivo:
`database/004_auditoria_incidentes.sql`

Se creó un trigger en PostgreSQL para registrar los cambios
de técnico y estado en la tabla de comentarios.

Los eventos se registran con el autor "Sistema".

Ejemplos:

- Tecnico reasignado: Tecnico de soporte -> Tecnico de redes
- Cambio de estado: ASIGNADO -> EN_PROCESO

Los eventos aparecen automáticamente en el historial
de comentarios del incidente en React.

## 5. Pruebas automatizadas

Archivo:
`tests/ab16-asignaciones.ps1`

Comando para ejecutar:

    .\tests\ab16-asignaciones.ps1

Las pruebas verifican:

1. Conexión con la API y PostgreSQL.
2. Consulta del catálogo de técnicos.
3. Registro de un incidente de prueba.
4. Rechazo de transiciones incorrectas.
5. Validación de técnico asignado.
6. Rechazo de técnicos inexistentes.
7. Asignación de un técnico válido.
8. Reasignación de técnicos.
9. Cambios de estado permitidos.
10. Persistencia de los cambios.
11. Generación de cuatro eventos de auditoría.

Resultado: todas las pruebas finalizaron correctamente.

Las pruebas crean incidentes reales en la base de datos
local para verificar la persistencia.

## 6. Verificación en React

Se comprobó que el panel de incidentes muestra
correctamente el estado EN_PROCESO.

También se verificó que el historial del incidente
muestra los comentarios existentes y los nuevos eventos
generados automáticamente por PostgreSQL.

## 7. Commits realizados

- 7806ba0: Catálogo de técnicos.
- 80c4bf8: API de asignación.
- c2ca6ba: Validación de transiciones.
- a81ffa4: Auditoría automática.
- 6aee731: Pruebas automatizadas.

## 8. Evidencias recopiladas

- Catálogo de técnicos en PostgreSQL.
- Asignación de técnico a un incidente.
- Cambio de estado válido.
- Eventos automáticos en PostgreSQL.
- Historial de auditoría en React.
- Ejecución exitosa de pruebas automatizadas.
- Historial de commits y estado limpio de Git.

Las capturas se recopilaron para incorporarlas
a la documentación final del proyecto.

## 9. Conclusión

La implementación permite gestionar técnicos y estados
de incidentes de forma controlada.

Las operaciones quedan registradas en PostgreSQL y
pueden consultarse desde la aplicación React.

La funcionalidad fue validada mediante pruebas manuales
y automatizadas antes de solicitar su integración a main.


# AB#17 - Controles React de asignación y cambio de estado

## Información general

Proyecto: IT Incident Hub  
Azure Boards: AB#17  
Rama: feature/ab17-controles-react  
Tecnologías: React, TypeScript, Express, PostgreSQL y Docker.

## Objetivo

Agregar controles al detalle de los incidentes para
asignar técnicos, actualizar estados y consultar los
eventos de seguimiento.

La interfaz debe actualizarse después de guardar
sin necesidad de recargar toda la aplicación.

## Funcionalidades implementadas

### 1. Consulta de técnicos

Se agregó un selector que consulta los técnicos
disponibles desde la API REST.

También se muestra el técnico actualmente asignado.

### 2. Asignación y reasignación

El usuario puede seleccionar un técnico y guardar
la asignación mediante una petición PATCH.

Después de guardar, la interfaz muestra un mensaje
de confirmación y el técnico actualizado.

### 3. Cambio de estado

Se muestra el estado actual del incidente y
las transiciones disponibles.

Las reglas de transición se validan en el backend.

### 4. Historial de seguimiento

Los cambios de técnico y de estado generan eventos
automáticos mediante la auditoría de PostgreSQL.

React actualiza el historial al modificarse el incidente.

### 5. Manejo de errores

Se implementaron mensajes para informar errores
de conexión y respuestas incorrectas de la API.

Los botones se deshabilitan durante el procesamiento
para evitar operaciones simultáneas desde el formulario.

## Archivos principales

- frontend/src/api/gestion.ts
- frontend/src/components/IncidentManagement.tsx
- frontend/src/components/IncidentDetail.tsx
- frontend/src/App.tsx
- frontend/src/App.css

## Endpoints utilizados

GET /api/tecnicos

PATCH /api/incidentes/:id/asignacion

PATCH /api/incidentes/:id/estado

GET /api/incidentes/:id/comentarios

## Pruebas funcionales realizadas

### Prueba 1 - Asignación de técnico

Resultado: Correcto.

Se seleccionó un técnico y se guardó la asignación.
La interfaz mostró el nombre actualizado y un
mensaje de confirmación.

### Prueba 2 - Cambio de estado

Resultado: Correcto.

Se comprobó la actualización visual del estado
en el detalle, la tabla y los indicadores.

### Prueba 3 - Manejo de errores

Resultado: Correcto.

Se simuló una pérdida de conexión utilizando
Chrome DevTools en modo Offline.

Al intentar guardar una asignación, la aplicación
mostró un mensaje comprensible en español.

La asignación anterior se mantuvo visible.

### Prueba 4 - Historial automático

Resultado: Correcto.

Se realizó una reasignación de Técnico de sistemas
a Técnico de redes.

El historial mostró un nuevo evento de Sistema
sin necesidad de cerrar el panel del incidente.

## Criterios de aceptación AB#17

1. Visualización de técnico y estado: Cumplido.
2. Actualización visual después de guardar: Cumplido.
3. Mensajes comprensibles de errores: Cumplido
   para las operaciones de gestión.
4. Demostración con capturas: Cumplido.

## Evidencias

Se capturaron pantallas de:

- Controles de asignación y cambio de estado.
- Confirmación de asignación exitosa.
- Estado actualizado e indicadores.
- Error de conexión en Chrome DevTools.
- Historial de auditoría después de reasignar.
- Commits y estado limpio de Git.

Las capturas se conservaron en la carpeta de
evidencias del proyecto IT Incident Hub.

## Ejecución local

Desde la raíz del repositorio:

npm run dev

La aplicación utiliza PostgreSQL mediante Docker,
el backend Express y el frontend React.

Frontend: http://127.0.0.1:5173

Backend: http://127.0.0.1:3000

## Validaciones técnicas

Comandos utilizados:

npm --prefix frontend run build

npm --prefix frontend run lint

npm --prefix backend run build

## Observaciones

Las operaciones de asignación y estado dependen
de la conexión con la API REST.

El mensaje de error al consultar un detalle sin
conexión puede mejorarse posteriormente para
mantener toda la interfaz en español.

## Conclusión

La funcionalidad AB#17 permite gestionar técnicos
y estados desde React, utilizando la API existente
y manteniendo el historial de cambios.

El desarrollo se dividió en commits independientes
para facilitar la revisión y la trazabilidad.


# Bitácora de desarrollo - IT Incident Hub

## 1. Información del proyecto

**Proyecto:** IT Incident Hub  
**Repositorio:** https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1  
**Gestión:** Azure DevOps - Azure Boards  
**Tecnologías:** React, TypeScript, Node.js, Express, PostgreSQL y Docker.

IT Incident Hub es una aplicación para registrar y consultar incidentes de soporte técnico.

El proyecto se desarrolla por funcionalidades, utilizando ramas de Git, commits independientes, Pull Requests y revisiones de código.

## 2. Trabajo realizado anteriormente

### Estructura inicial del repositorio

Se prepararon las carpetas principales:

- backend
- frontend
- database
- tests
- devops
- docs
- .github/workflows

También se documentó la estrategia de trabajo con Git.

Pull Request relacionado: #1.

### Backend y base de datos

Se implementó una API REST con Express y TypeScript.

PostgreSQL se configuró mediante Docker para almacenar los incidentes.

Funcionalidades comprobadas:

- Registrar incidentes.
- Listar incidentes.
- Consultar un incidente por ID.
- Validar información de entrada.
- Conservar registros en PostgreSQL.

Pull Request relacionado: #2.

### Frontend React

Se desarrolló el panel de incidentes utilizando React y TypeScript.

El frontend permite:

- Visualizar el listado de incidentes.
- Registrar incidentes nuevos.
- Consultar los detalles de cada reporte.
- Buscar y filtrar incidentes.
- Mostrar indicadores generales.

Pull Request relacionado: #3.

## 3. Implementación de comentarios

**Work Items:** AB#19 y AB#20  
**Rama:** feature/ab19-comentarios-backend  
**Pull Request:** #4, pendiente de publicación.

### Base de datos

Se creó la migración:

`database/002_create_comentarios.sql`

La tabla comentarios contiene:

- id
- incidente_id
- autor
- contenido
- creado_en

Cada comentario está relacionado con un incidente mediante una clave foránea.

La tabla incluye validaciones y un índice para facilitar las consultas del historial.

### Backend

Se agregaron los archivos:

- backend/src/controllers/comentarios.controller.ts
- backend/src/schemas/comentario.schema.ts

También se actualizaron las rutas de incidentes.

Endpoints implementados:

**GET /api/incidentes/:id/comentarios**

Consulta los comentarios de un incidente.

**POST /api/incidentes/:id/comentarios**

Permite registrar un comentario nuevo.

Los datos se validan antes de guardarse en PostgreSQL.

### Frontend

Se agregaron los siguientes archivos:

- frontend/src/api/comentarios.ts
- frontend/src/components/IncidentComments.tsx

Se modificaron:

- frontend/src/components/IncidentDetail.tsx
- frontend/src/App.css

El usuario puede consultar el historial y publicar comentarios desde el panel de detalles.

## 4. Pruebas realizadas

### Prueba 1. Conexión a PostgreSQL

Se verificó el funcionamiento del contenedor incident-hub-postgres.

Resultado: conexión correcta.

### Prueba 2. Registro de comentarios

Se registró un comentario de prueba en el incidente #2.

Resultado: comentario creado y almacenado en PostgreSQL.

### Prueba 3. Consulta del historial

Se consultó el endpoint:

GET /api/incidentes/2/comentarios

Resultado: se recuperó correctamente el historial.

### Prueba 4. Validación de datos

Se enviaron valores inválidos en el autor y contenido.

Resultado: HTTP 400.

### Prueba 5. Incidente inexistente

Se consultaron comentarios de un incidente inexistente.

Resultado: HTTP 404.

### Prueba 6. Persistencia de datos

Se consultaron directamente los registros de PostgreSQL.

Posteriormente, se registró otro comentario desde React.

Se actualizó el navegador y se verificó que ambos comentarios permanecían disponibles.

Resultado: prueba satisfactoria.

### Prueba 7. Compilación y calidad

Se utilizaron los comandos:

- npm --prefix backend run build
- npm --prefix frontend run build
- npm --prefix frontend run lint

Las verificaciones realizadas durante el desarrollo finalizaron correctamente.

## 5. Problemas encontrados y soluciones

### Conflicto de puertos PostgreSQL

El puerto 5432 ya estaba ocupado por otra instancia de PostgreSQL.

Solución:

Se configuró IT Incident Hub para utilizar el puerto local 5433.

### Puerto 5173 ocupado

Al ejecutar el inicio unificado, otra instancia de Vite ya estaba utilizando el puerto 5173.

Solución:

Se identificó el proceso anterior y se liberó el puerto.

### Error HTTP 502

Durante las pruebas, React no pudo comunicarse con el backend.

Se comprobó el estado de PostgreSQL y posteriormente se reinició Express.

Resultado:

La conexión con la API se recuperó y los incidentes volvieron a mostrarse.

## 6. Inicio unificado del proyecto

Se incorporó un package.json en la raíz del repositorio.

También se instaló concurrently como dependencia de desarrollo.

Ahora se puede iniciar el proyecto mediante:

npm run dev

El comando realiza las siguientes acciones:

1. Inicia PostgreSQL mediante Docker Compose.
2. Espera que el contenedor esté disponible.
3. Inicia el backend Express.
4. Inicia el frontend React con Vite.

Servicios:

- PostgreSQL: puerto local 5433.
- Express: puerto 3000.
- React: puerto 5173.

Este cambio simplifica el trabajo local y reduce los pasos necesarios para ejecutar el sistema.

## 7. Historial de commits

| Commit | Descripción |
|---|---|
| 6c546df | Backend de comentarios y base de datos |
| b21a735 | Cliente API de comentarios en React |
| a963648 | Componente React de comentarios |
| 8fd368b | Integración con el panel de detalles |
| 3cea0a4 | Estilos visuales del historial |
| a45c30f | Inicio unificado de los servicios |

Los commits se realizaron de forma independiente para mantener la trazabilidad de los cambios.

## 8. Evidencias del proyecto

Durante el desarrollo se recopilaron capturas de:

- Estructura del proyecto en VS Code.
- Creación de ramas y commits.
- Configuración y ejecución de PostgreSQL.
- Pruebas de los endpoints REST.
- Validaciones HTTP 400 y 404.
- Historial de comentarios en React.
- Publicación de comentarios.
- Persistencia después de actualizar la página.
- Arranque unificado de React, Express y PostgreSQL.
- Errores encontrados y sus respectivas soluciones.

Las capturas se conservarán como evidencia para la documentación final del proyecto.

## 9. Estado actual

Funcionalidades completadas:

- Registro de incidentes.
- Consulta de incidentes.
- Panel React.
- Almacenamiento PostgreSQL.
- Comentarios por incidente.
- Historial de seguimiento.
- Validaciones de entrada.
- Inicio unificado de servicios.

Pendiente:

- Publicar y revisar el Pull Request #4.
- Continuar con las funcionalidades de las siguientes etapas.
- Implementar pruebas automatizadas y CI/CD.
- Completar la documentación y evidencias de entrega.

## 10. Conclusión

Esta etapa permitió integrar una nueva funcionalidad en una aplicación existente.

Se trabajó en la base de datos, el backend y el frontend, conservando un historial de commits separados.

Las pruebas permitieron comprobar la integración y recuperar el funcionamiento del sistema cuando surgieron problemas de conexión.

El desarrollo continuará siguiendo la metodología de trabajo definida en el repositorio.

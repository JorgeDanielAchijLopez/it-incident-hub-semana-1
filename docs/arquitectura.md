# Arquitectura y operación — IT Incident Hub

## Vista general

El sistema funciona en tres capas:

```text
Navegador
  └── React + TypeScript + Vite (localhost:5173)
        │ HTTP / JSON
        ▼
  Express + TypeScript (127.0.0.1:3000)
        │ pg / SQL parametrizado
        ▼
  PostgreSQL 17 (Docker, 127.0.0.1:5433)
        └── incidentes, comentarios, tecnicos, triggers de auditoría
```

En desarrollo, `npm run dev` levanta PostgreSQL mediante Docker Compose y arranca frontend y API en paralelo.

## Componentes

| Parte | Archivo/carpeta | Responsabilidad |
| --- | --- | --- |
| UI | `frontend/src/App.tsx` y `frontend/src/components/` | Panel, formularios, detalles, comentarios, controles y distribuciones |
| Cliente HTTP | `frontend/src/api/` | Consultas REST; separación de la presentación |
| API | `backend/src/app.ts`, `backend/src/server.ts` | Express, CORS para Vite local, parseo de JSON y control de errores |
| Rutas | `backend/src/routes/incidentes.routes.ts` | Registro, consulta, filtros, estadísticas, comentarios, asignación y estados |
| Controladores | `backend/src/controllers/` | Validación y operaciones en PostgreSQL |
| Esquemas | `backend/src/schemas/` | Validación de datos recibidos |
| Conexión SQL | `backend/src/config/database.ts` | Pool `pg` usando variables de entorno |
| Persistencia | `database/001*.sql` ... `database/005*.sql` | Tablas, índices, técnicos, auditoría de cambios y responsable |

## API y datos

| Método | Recurso | Uso |
| --- | --- | --- |
| `GET` | `/api/health` | Comprueba la conexión con PostgreSQL |
| `GET` | `/api/tecnicos` | Consulta catálogo de técnicos |
| `POST` | `/api/incidentes` | Registra incidente |
| `GET` | `/api/incidentes` | Lista incidentes; filtros por estado, prioridad, categoría y técnico |
| `GET` | `/api/incidentes/estadisticas` | Totales y distribuciones calculados desde PostgreSQL |
| `GET` | `/api/incidentes/:id` | Detalle de incidente |
| `GET/POST` | `/api/incidentes/:id/comentarios` | Historial y comentarios |
| `PATCH` | `/api/incidentes/:id/asignacion` | Asigna o reasigna técnico |
| `PATCH` | `/api/incidentes/:id/estado` | Actualiza estado |

**Estados admitidos:** `NUEVO`, `ASIGNADO`, `EN_PROCESO`, `RESUELTO`, `CERRADO`. El conjunto de estados abiertos usado por el dashboard y las pruebas AB#21 es `NUEVO`, `ASIGNADO`, `EN_PROCESO`. `RESUELTO` y `CERRADO` se contabilizan por separado y pueden agruparse como finalizados.

### Auditoría

Las migraciones `004` y `005` definen el trigger para registrar cambios de técnico y estado como entradas en `comentarios`, incluyendo el responsable de la transacción cuando se indica. Se utiliza `current_setting('app.responsable', TRUE)` para leer el responsable definido en la transacción, con respaldo `Sistema` cuando no está presente.

**Advertencia:** la bitácora de comentarios es evidencia de cambios funcionales; no equivale a autenticación robusta ni a una identidad verificada. La autenticación/autorización por usuario no está documentada como control del sistema actual.

## Integración continua y evidencias

- **GitHub Actions:** compila backend/frontend, ejecuta lint, audita dependencias y valida AB#21 con PostgreSQL 17 temporal.
- **Azure Pipelines:** usa el pool `Default` con un agente Windows autohospedado y Docker Desktop, en una base temporal separada de la base local.
- **Seguridad:** bloquea las vulnerabilidades altas o críticas de producción detectadas mediante npm audit.
- **Registro verificable:** PR revisados, commits, comprobaciones y artefactos de los pipelines.

El repositorio actual aún no tiene una entrega automatizada demostrada en preproducción o producción; esa parte está definida como trabajo futuro en `docs/estrategia-release.md`.

## Desarrollo, seguridad y límites

- La API escucha en `127.0.0.1`; no se debe publicar directamente hacia internet sin controles adicionales.
- CORS está configurado para los orígenes locales de Vite (puerto 5173).
- PostgreSQL se expone solo en la interfaz local, puerto 5433.
- Contraseñas en `database/.env` y `backend/.env` no se suben a Git.
- El script de CI crea contenedores y credenciales de prueba efímeros y no debe apuntarse a la base de datos de desarrollo.
- La protección de secretos reales, aprobación de release, controles de identidad y pruebas unitarias son tareas pendientes descritas en `docs/deuda-tecnica.md`.

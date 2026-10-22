# IT Incident Hub

Sistema web para registrar, consultar y gestionar incidentes de soporte técnico. Proyecto integrador DevOps (UMG): el objetivo es demostrar un flujo trazable desde Azure Boards y GitHub hasta pruebas automáticas, controles de seguridad, artefactos y lanzamiento controlado.

**Estado:** aplicación funcional y CI configurada; el release `v1.0.0` todavía requiere los controles de aprobación y versionado descritos en la [estrategia de lanzamiento](docs/estrategia-release.md).

## Tecnologías y estructura

| Carpeta | Uso |
| --- | --- |
| `frontend/` | Interfaz React + TypeScript + Vite |
| `backend/` | API REST Express + TypeScript |
| `database/` | PostgreSQL 17, Docker Compose y migraciones |
| `tests/` | Pruebas automatizadas de incidentes y estadísticas en PowerShell |
| `.github/workflows/` | GitHub Actions para CI, lint, pruebas y seguridad |
| `azure-pipelines.yml` | Azure Pipelines con agente Windows autohospedado |
| `docs/` | Arquitectura operativa, ramas, evidencias, seguridad, deudas y release |

## Funcionalidades

- Registrar y consultar incidentes, con categoría, prioridad, reportante, fecha y estado.
- Asignar o reasignar técnicos, actualizar estados y conservar auditoría de responsables.
- Consultar comentarios e historial de seguimiento.
- Filtrar por estado, prioridad, categoría y técnico (individualmente o combinados).
- Visualizar indicadores calculados en PostgreSQL y distribuciones por categoría/técnico.
- Consultar la API REST y comprobar `GET /api/health`.

Estados de incidentes: `NUEVO`, `ASIGNADO`, `EN_PROCESO`, `RESUELTO`, `CERRADO`.

## Requisitos para ejecutar en Windows

- Git, Node.js y npm. El proyecto se ha comprobado con **Node.js 24**.
- Docker Desktop abierto en modo contenedores Linux.
- PowerShell y puertos locales disponibles: `5433` (PostgreSQL), `3000` (API), `5173` (React).
- Conexión a npm para instalar dependencias por primera vez.

### 1. Obtener código y dependencias

```powershell
git clone https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1.git
cd it-incident-hub-semana-1
npm ci
npm ci --prefix backend
npm ci --prefix frontend
```

### 2. Configurar las contraseñas locales

Copiar el ejemplo de variables de Docker:

```powershell
Copy-Item database/.env.example database/.env
notepad database/.env
```

Cambiar `REEMPLAZAR_CON_CONTRASENA_LOCAL` por una contraseña privada elegida para la base local.

Crear el archivo **`backend/.env`** con estos nombres de variables (usar **la misma** contraseña de `database/.env`, sin publicarla):

```dotenv
DB_HOST=127.0.0.1
DB_PORT=5433
DB_NAME=incidenthub
DB_USER=incidenthub
DB_PASSWORD=REEMPLAZAR_CON_LA_MISMA_CONTRASENA_LOCAL
PORT=3000
```

**Nunca subir archivos `.env`, tokens o credenciales al repositorio.**

### 3. Crear la base de datos y aplicar migraciones una sola vez

```powershell
docker compose --env-file database/.env -f database/compose.yaml up -d --wait
```

En una instalación nueva, aplicar las migraciones SQL **en orden**. No repetirlas a ciegas en una base con datos existentes.

```powershell
Get-ChildItem database -Filter "00*.sql" | Sort-Object Name | ForEach-Object {
    Write-Host "Aplicando $($_.Name)"
    Get-Content $_.FullName -Raw |
        docker exec -i incident-hub-postgres psql -X -v ON_ERROR_STOP=1 -U incidenthub -d incidenthub
    if ($LASTEXITCODE -ne 0) {
        throw "Fallo la migracion $($_.Name)"
    }
}
```

### 4. Iniciar IT Incident Hub

```powershell
npm run dev
```

- **Aplicación React:** http://localhost:5173
- **API:** http://127.0.0.1:3000/api
- **Verificación de salud:** http://127.0.0.1:3000/api/health

El comando `npm run dev` inicia PostgreSQL si es necesario y abre backend y frontend en modo desarrollo. Para cerrar ambos procesos usar `Ctrl+C`. La información de PostgreSQL persiste en su volumen Docker.

## Compilación y pruebas

```powershell
npm run check
```

Este comando compila el backend, construye React y ejecuta ESLint.

Con backend y PostgreSQL ya iniciados:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tests\ab21-pruebas-indicadores.ps1
```

Para auditar dependencias (se generan informes locales ignorados por Git):

```powershell
node scripts/auditar-dependencias.cjs --self-test
node scripts/auditar-dependencias.cjs auditorias
```

La auditoría **bloquea** hallazgos `high`/`critical` en dependencias de producción y falla si npm no puede verificar los paquetes. Otros hallazgos se documentan.

### Integración continua

- **GitHub Actions:** se ejecuta en PR hacia `main` y pushes a `main`; prueba backend/frontend, seguridad, PostgreSQL y AB#21, y publica artefactos.
- **Azure Pipelines:** usa un agente **Windows autohospedado** del pool `Default` para checkout, dependencias, build, pruebas, auditoría y artefactos. No ejecuta automáticamente PR sin revisar en el agente personal.
- **Evidencia de falla/corrección:** Azure `#20261022.1` (fallo inicial PostgreSQL), `#20261022.2` (corrección validada), `#20261022.3` (push a main), `#20261022.4` (seguridad validada).

Consulta las guías [GitHub Actions](docs/ci-github-actions.md) y [Azure Pipelines](docs/ci-azure-agente-windows.md).

## Gestión, participantes y revisiones

- **Proyecto Azure DevOps:** https://dev.azure.com/devopsOrganizativaUMG01/IT-Incident-Hub
- **Repositorio principal:** https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1
- **Responsable principal del trabajo individual:** Jorge Daniel Achij López (`JorgeDanielAchijLopez`).
- **Cuenta de revisión de colaboración simulada:** `gesteb3`; las intervenciones y aprobaciones quedan registradas en GitHub. Las cuentas adicionales utilizadas para simular roles no representan integrantes independientes del equipo.

El flujo es **Work Item → rama → commits → PR → revisión → main → pipeline → artefacto**. Consultar [estrategia de ramas](docs/branching.md). Se han implementado y documentado historias de gestión, auditoría y estadísticas (por ejemplo AB#13 y AB#21). La cobertura completa del backlog debe comprobarse en Azure Boards.

## Documentación para entrega

- [Registro de deuda técnica](docs/deuda-tecnica.md): ocho hallazgos y dos correcciones verificables (PR #11 y PR #12).
- [Control de seguridad](docs/seguridad-dependencias.md): reglas y reportes.
- [Estrategia de lanzamiento y SemVer](docs/estrategia-release.md): secuencia propuesta hasta `v1.0.0`, entornos, aprobación y pendientes.
- [Bitácora de desarrollo](docs/bitacora-desarrollo.md) y guías de funcionalidades en `docs/`.

**Pendiente antes de declarar entrega final:** verificar 16 Tasks y demás mínimos en Azure Boards, completar la secuencia de tags, controles de aprobación de release y la estrategia de tres repositorios semanales requerida por el enunciado. No confundir los `package.json` actuales con un Release publicado.

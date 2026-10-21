# Primera automatizacion CI — GitHub Actions

## Objetivo

Automatizar compilaciones, comprobaciones de calidad y pruebas de integracion de IT Incident Hub cada vez que se abre un Pull Request hacia `main` o se publica codigo en `main`. El workflow tambien puede ejecutarse manualmente desde GitHub Actions.

**Workflow:** `.github/workflows/ci.yml`  
**Node.js:** version 24  
**Base de datos de CI:** PostgreSQL 17 en un contenedor temporal, independiente de los datos locales.

## Trabajos

### Compilacion, calidad y artefactos

1. Obtener codigo e instalar dependencias bloqueadas con `npm ci`.
2. Ejecutar `npm run check`, que compila backend y frontend y ejecuta ESLint.
3. Generar informes de auditoria de dependencias de produccion con `npm audit --json`.
4. Empaquetar `backend/dist` y `frontend/dist`.
5. Guardar como artefacto el paquete de compilacion y los dos informes.

**Importante:** durante esta primera etapa las auditorias registran vulnerabilidades pero no bloquean la compilacion. Los hallazgos se deben clasificar y corregir para implementar un control de seguridad exigible.

### API, PostgreSQL y pruebas AB#21

1. Iniciar un contenedor temporal PostgreSQL.
2. Aplicar en orden las migraciones `database/001` a `database/005`.
3. Insertar cuatro incidentes de prueba en una base aislada.
4. Iniciar la API Express y consultar `/api/health`.
5. Ejecutar `tests/ab21-pruebas-indicadores.ps1`, incluyendo filtros combinados, resultados vacios, totales, distribuciones y validacion HTTP 400.
6. Publicar el registro de la API como artefacto, incluso si las pruebas fallan.

El identificador de ejecucion de GitHub se usa como clave **exclusivamente para la base efimera de pruebas**, de modo que no se incluye una contraseña real del proyecto en el repositorio. Los secretos reales nunca deben quedar en el codigo ni en el workflow.

## Ejecucion y evidencias

En GitHub, abrir **Actions → CI - IT Incident Hub** y elegir una ejecucion. La evidencia debe incluir los dos trabajos y su resultado, el log de pruebas y la seccion **Artifacts**. Los pasos deben considerarse validados solo cuando GitHub confirme que la ejecucion termino satisfactoriamente.

## Requisitos DevOps aun pendientes

Este workflow **no equivale** a Azure Pipelines ni a un agente autohospedado. La entrega del proyecto exige ademas:

- Configurar y comprobar un pipeline de **Azure Pipelines** con su **agente autohospedado**.
- Registrar una ejecucion que falle y otra que pase, con causa y solucion verificables.
- Clasificar vulnerabilidades y hacer cumplir las politicas de seguridad.
- Documentar deudas tecnicas, versionado y lanzamiento.

No se debe afirmar que esos requisitos estan completados por el mero hecho de crear este archivo.

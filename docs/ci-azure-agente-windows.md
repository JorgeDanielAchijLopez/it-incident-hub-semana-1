# Azure Pipelines — agente autohospedado Windows

## Objetivo

Ejecutar el segundo sistema de integración continua del proyecto, **Azure Pipelines**, con un agente autohospedado en Windows. Se reutiliza el proyecto GitHub como fuente y se emplea una base de pruebas aislada de los incidentes personales o del entorno de desarrollo.

**Rama:** feature/ci-azure-agente-propio  
**Archivo:** azure-pipelines.yml  
**Pool:** Default  
**Agente:** Windows_NT (autohospedado)  
**Herramientas:** Node.js 24, npm, Git, Docker Desktop en modo contenedores Linux y Windows PowerShell.

## Instalar el agente de Azure en Windows

1. Abrir [Azure DevOps](https://dev.azure.com/devopsOrganizativaUMG01) con la cuenta principal y entrar en **Organization settings → Agent pools**.
2. Abrir el pool **Default → Agents → New agent** y descargar el paquete **Windows x64** recomendado por Azure.
3. Descomprimirlo en una carpeta específica, por ejemplo **C:\agents**, sin ponerlo dentro del repositorio.
4. Obtener un token de acceso personal desde **User settings → Personal access tokens**. Usar un token de corta duración con el alcance mínimo **Agent Pools (Read & manage)**. No subirlo a GitHub, no copiarlo a documentos y no tomar capturas cuando el valor del token sea visible.
5. Ejecutar PowerShell como administrador, entrar en la carpeta del agente y lanzar **.\config.cmd**. Cuando solicite servidor, introducir **https://dev.azure.com/devopsOrganizativaUMG01**. Elegir el pool **Default** y un nombre reconocible para el agente.
6. Para esta primera prueba con Docker Desktop usar ejecución interactiva con **.\run.cmd**, en una sesión de usuario donde Docker Desktop ya esté abierto. No cerrar esa consola mientras corra el pipeline.
7. Revisar en Azure DevOps que el agente aparezca como **Online**.

**Nota:** Docker Desktop puede no estar disponible para un agente instalado como servicio bajo otra cuenta de Windows. Para comenzar, usar el agente interactivo y verificar el acceso a Docker con el mismo usuario.

## Crear la canalización

1. En el proyecto **IT-Incident-Hub** abrir **Pipelines → New pipeline**.
2. Seleccionar **GitHub** y autorizar únicamente el repositorio **JorgeDanielAchijLopez/it-incident-hub-semana-1** (se recomienda la aplicación oficial **Azure Pipelines**).
3. Seleccionar **Existing Azure Pipelines YAML file** y el archivo **azure-pipelines.yml** de la rama de trabajo. Para integrarlo permanentemente, fusionar después el PR a main.
4. Confirmar que **pool: Default** y que el agente autohospedado esté Online.
5. Ejecutar el pipeline y comprobar cada tarea y el artefacto **evidencias-azure-ci**.

## Qué valida el pipeline

- Herramientas de Node, npm y Docker disponibles.
- Instalación determinista con los lockfiles del backend y frontend.
- Compilación de TypeScript, Vite y ESLint mediante npm run check.
- PostgreSQL **temporal** en Docker con puerto **55433**, distinto al puerto local 5433 del proyecto, para evitar interferencias.
- Las cinco migraciones SQL y cuatro incidentes de prueba.
- API REST escuchando **solo en 127.0.0.1:3101** durante las pruebas.
- Ejecución de las comprobaciones de AB#21 con PowerShell.
- Generación de auditorías npm y publicación de los registros y artefactos.

**El contenedor temporal y el proceso API se eliminan al concluir la prueba, incluso si ocurre un error.** Se usa una contraseña temporal de CI separada de las credenciales reales del proyecto.

## Evidencia obligatoria

Guardar el detalle del agente como Online, los resultados del pipeline, los logs de compilación, la ejecución de pruebas, los artefactos publicados y el histórico de commits y revisiones.

El enunciado también solicita evidencia de un pipeline **fallido y luego corregido**. Se debe documentar la causa de un fallo real, realizar la corrección mediante una rama y PR, y mostrar una ejecución exitosa posterior. No es suficiente inventar un fallo o registrar capturas de una prueba local como si fuera Azure Pipelines.


## Primera ejecución real: fallo identificado y corrección

**Ejecución:** Azure Pipelines `#20261022.1` (agente autohospedado `ITIncidentHub-Windows`).

**Resultado observado:** las tareas de descarga del repositorio, comprobación de herramientas, instalación de dependencias, compilación y ESLint finalizaron correctamente. La integración falló al aplicar `database/001_create_incidentes.sql`.

**Mensaje de error:** `FATAL: the database system is shutting down` y `Migracion 001_create_incidentes.sql no termino correctamente. Codigo: 2`.

**Causa identificada:** el script inicial utilizaba `pg_isready` por socket local dentro del contenedor. PostgreSQL 17 inicia un servidor temporal de inicialización y luego lo apaga para lanzar el servidor definitivo. La comprobación por socket podía considerar listo al servidor temporal y el pipeline intentaba migrar durante el apagado.

**Corrección:** en `tests/ci-azure-integracion.ps1` se reemplazó la comprobación por `pg_isready -h 127.0.0.1 -p 5432`, que verifica el servidor definitivo mediante TCP, y se amplió el tiempo de espera a 90 segundos. También se muestran los logs del contenedor cuando no llega a estar listo.

**Commit de corrección:** `14bafed` — `fix(ci): esperar PostgreSQL definitivo antes de migraciones`.

**Verificación de la corrección (confirmada):** en la ejecución **`#20261022.2`**, usando la rama `feature/ci-azure-agente-propio` y el agente `ITIncidentHub-Windows` del pool `Default`, Azure Pipelines mostró el trabajo completo en verde. Pasaron checkout, comprobación de herramientas, instalación de dependencias, compilación y ESLint, pruebas de API y PostgreSQL con filtros AB#21, auditoría de dependencias, preparación y publicación de artefactos. Duración total **2 min 18 s**; Azure indicó **1 artefacto producido**. Esta ejecución posterior verifica que la corrección solucionó el fallo observado.

**Evidencias:** captura de la ejecución fallida `#20261022.1` y captura de la ejecución exitosa `#20261022.2` archivadas en la Biblioteca `/IT-Incident-Hub/docs/evidencias/`. Los registros originales permanecen en Azure Pipelines; al entregar el proyecto se deben adjuntar o enlazar las evidencias requeridas desde el informe final.

## Consideraciones pendientes

- Azure Pipelines ya cuenta con ejecuciones reales verificadas: fallo `#20261022.1` y ejecución exitosa `#20261022.2`, ambas con agente autohospedado.
- La auditoría actual es **informativa**; las alertas de seguridad deben analizarse y aplicar un control de severidad obligatorio.
- Los informes de CI no sustituyen el versionado, los releases ni las deudas técnicas exigidas por el proyecto.
- El pipeline es adecuado para un equipo académico/local. En un escenario de producción se emplearían identidades de servicio, restricciones de acceso, gestión formal de secretos y agentes dedicados.

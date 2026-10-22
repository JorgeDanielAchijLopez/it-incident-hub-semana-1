# Estrategia de ramas Git

## Proyecto
IT Incident Hub - Proyecto Integrador DevOps

## Objetivo
Establecer un flujo de desarrollo controlado que permita
mantener la trazabilidad entre Azure Boards, GitHub,
commits y Pull Requests.

## Rama principal

main:
Contiene únicamente cambios integrados y validados.
No se utilizará para el desarrollo directo.

## Ramas de trabajo

feature/*:
Desarrollo de nuevas funcionalidades.

fix/*:
Corrección de errores detectados.

refactor/*:
Mejoras internas sin cambiar el comportamiento funcional.

## Nomenclatura

Cada rama incluirá el identificador del Work Item.

Ejemplo:
feature/ab28-estructura-inicial

## Flujo de trabajo

1. Seleccionar una Task de Azure Boards.
2. Crear una rama desde main actualizada.
3. Desarrollar los cambios correspondientes.
4. Ejecutar las verificaciones necesarias.
5. Crear commits descriptivos con AB#ID.
6. Publicar la rama en GitHub.
7. Abrir un Pull Request hacia main.
8. Documentar las pruebas y solicitar revisión.
9. Resolver observaciones y conflictos.
10. Integrar los cambios validados.

## Convención de commits

feat: Nuevas funcionalidades.
fix: Corrección de errores.
docs: Cambios de documentación.
test: Pruebas.
refactor: Refactorización.
chore: Configuración y mantenimiento.

Ejemplo:
chore: preparar estructura inicial del repositorio AB#28

## Política de integración

- Mantener main estable.
- No almacenar contraseñas, tokens ni secretos.
- Exigir una descripción clara en cada Pull Request.
- Comprobar las pruebas antes de integrar cambios.
- Documentar los errores y las soluciones.
- Mantener evidencias verificables de cada entrega.

## Proyecto individual

El trabajo es realizado individualmente.
Las cuentas adicionales que se utilicen para revisiones
se identificarán como pertenecientes al mismo estudiante.

## Entregas

El proyecto contempla tres repositorios semanales. Su existencia se comprobó el 22 de octubre de 2026:

- [Semana 1 — repositorio principal](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-1): fuente de desarrollo e historial.
- [Semana 2 — entrega publicada](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-2): rama `main` publicada como copia del avance de Semana 1, conservando el historial hasta `3338443`.
- [Semana 3 — entrega reservada](https://github.com/JorgeDanielAchijLopez/it-incident-hub-semana-3): repositorio creado, todavía sin entrega de código final.

El repositorio de Semana 1 conserva su remote `origin`. Los remotes `semana2` y `semana3` fueron agregados en el entorno de trabajo local para transferir entregas sin reescribir commits.

## Conexión con Azure Boards — AB#28

El **22 de octubre de 2026** se configuró en el proyecto `IT-Incident-Hub` la integración **Azure Boards ↔ GitHub App**, bajo la cuenta `JorgeDanielAchijLopez`. En **Project Settings → GitHub connections** se confirmó una conexión verde que incluye los **tres repositorios de IT Incident Hub**.

Para enlazar nuevos commits y Pull Requests con elementos de trabajo, incluir el texto exacto `AB#ID` (por ejemplo, `AB#28`) en mensajes de commit y/o descripciones de PR. Los cambios y asociaciones deben verificarse desde el campo **Development** del Work Item, porque la conexión no garantiza la asociación retroactiva de todas las referencias existentes.

**Evidencia:** capturas en la biblioteca del proyecto, dentro de `/IT-Incident-Hub/docs/evidencias/`, y PR asociado a AB#28 para comprobar la trazabilidad. La biblioteca es un archivo de evidencias, no un cuarto repositorio Git.

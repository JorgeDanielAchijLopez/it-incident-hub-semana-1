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
chore: initialize repository structure AB#28

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

El proyecto contempla tres repositorios semanales.
Se preservará la trazabilidad e historial de cambios
entre las entregas.git status
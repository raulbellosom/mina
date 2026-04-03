---
description: "Ejecutar pruebas QA de MinaFlow. Prueba tasks completas buscando bugs en frontend, Appwrite, Functions, permisos y reglas de negocio. Genera informe consolidado."
agent: "qa"
argument-hint: "task 06, tasks 12-17, o todos"
---

Ejecuta pruebas QA completas siguiendo el skill `qa-tester`.

## Instrucciones

1. Lee el skill de QA en [SKILL.md](../skills/qa-tester/SKILL.md) y sigue el procedimiento completo
2. Lee el documento maestro de requerimientos en [documento maestro](../../docs/core/00_documento_maestro_requerimientos.md)
3. Lee los task documents relevantes en `docs/tasks/`
4. Usa la plantilla de informe en [test-report-template.md](../skills/qa-tester/assets/test-report-template.md)
5. Consulta la referencia de colecciones por task en [task-requirements-map.md](../skills/qa-tester/references/task-requirements-map.md)
6. Consulta los comandos MCP en [appwrite-mcp-commands.md](../skills/qa-tester/references/appwrite-mcp-commands.md)

## Qué Probar

Según el argumento recibido:

- **`task XX`** → probar solo esa task específica
- **`tasks XX-YY`** → probar el rango de tasks indicado
- **`todos`** → probar las 23 tasks secuencialmente

Para cada task, ejecutar las 7 fases del skill:
1. Preparación (leer task doc + criterios de aceptación)
2. Verificación de Schema Appwrite (colecciones, atributos, índices, permisos via MCP)
3. Verificación de Código Frontend (hooks, páginas, responsive, i18n, permisos)
4. Verificación de Functions (si aplica)
5. Pruebas Funcionales con Datos (crear datos de prueba via MCP, probar flujos)
6. Pruebas de Permisos con Usuarios Reales (crear usuarios Auth si necesario)
7. Generación de Informe

## Output Esperado

- Archivo `docs/qa/test_report_full.md` con el informe consolidado
- Resumen en chat: total bugs por severidad, tasks problemáticas, recomendación

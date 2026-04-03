---
name: qa-tester
description: "Ejecutar pruebas QA completas de MinaFlow task por task. Use when: necesitas probar funcionalidad, buscar bugs, validar requerimientos, verificar configuración Appwrite, probar flujos de usuario, generar informes de errores. Cubre frontend, backend, Functions, permisos, colecciones y reglas de negocio."
argument-hint: "Número(s) de task a probar, ej: 'task 06' o 'tasks 06-10' o 'todos'"
---

# QA Tester — Pruebas Funcionales de MinaFlow

## Cuándo Usar

- Probar una o varias tasks completadas buscando bugs
- Validar requerimientos contra implementación real
- Verificar configuración de Appwrite (colecciones, permisos, índices, Functions)
- Probar flujos de usuario completos (venta, báscula, validación de salida)
- Generar un informe detallado de errores encontrados
- Validar reglas de negocio y restricciones del sistema

## Herramientas Disponibles

El tester tiene acceso completo para:
- **Leer/ejecutar código frontend** — verificar componentes, hooks, rutas, lógica UI
- **Appwrite MCP** (`appwrite-api`) — CRUD directo sobre colecciones, verificar permisos reales, listar documentos, crear/eliminar datos de prueba
- **Appwrite Docs MCP** (`appwrite-docs`) — consultar documentación oficial para validar uso correcto del SDK
- **Terminal** — ejecutar build, lint, verificar errores de compilación, Appwrite CLI
- **Navegador** — abrir la app y verificar funcionamiento visual (si disponible)
- **Leer archivos** — inspeccionar código fuente, configuración, schemas

## Procedimiento General

### Fase 0: Preparación

1. **Leer el task document** correspondiente en `docs/tasks/task_XX_*.md`
2. **Leer el documento maestro** en `docs/core/00_documento_maestro_requerimientos.md` para contexto de reglas de negocio
3. **Identificar los criterios de aceptación** del task (sección "Logro esperado" y "Preguntas que debe cerrar")
4. **Crear el archivo de informe** usando la plantilla en [./assets/test-report-template.md](./assets/test-report-template.md)

### Fase 1: Verificación de Schema Appwrite

Para cada colección involucrada en el task:

1. **Verificar existencia** de la colección en `appwrite.json`
2. **Verificar atributos** — ¿están todos los campos requeridos por el task? ¿tipos correctos? ¿required correcto?
3. **Verificar índices** — ¿los queries frecuentes tienen índice? ¿los ordenamientos están soportados?
4. **Verificar permisos** — ¿la colección tiene los permisos correctos según su tipo (catálogo/operativa/auditoría)?
5. **Validar con MCP** — usar `appwrite-api` para listar la colección y sus atributos reales en el servidor

Usar `appwrite-api` tool `databases_list_attributes` y `databases_list_indexes` para verificar contra el servidor real.

**Checklist de permisos por tipo:**

| Tipo | read | create | update | delete |
|------|------|--------|--------|--------|
| Catálogo | user,admin,owner | admin,owner | admin,owner | owner |
| Operativa | user,admin,owner | user,admin,owner | admin,owner | owner |
| Auditoría | admin,owner | user,admin,owner | — | — |

### Fase 2: Verificación de Código Frontend

Para cada módulo/feature involucrado:

1. **Verificar estructura de archivos**:
   - `features/<modulo>/hooks/use<Entidad>.jsx` existe
   - `features/<modulo>/pages/<Entidad>.jsx` existe
   - Componentes internos si aplica

2. **Verificar el hook de datos**:
   - Importa `databases`, `DATABASE_ID` correctamente
   - Maneja estados: `loading`, `items/data`, `error`
   - Funciones CRUD: `create`, `update`, `toggleActive`/`deactivate`
   - Usa `Query.orderDesc('$createdAt')` para listados
   - No elimina físicamente (usa `active: false`)

3. **Verificar la página/vista**:
   - Tiene breadcrumb en header
   - Muestra loading spinner mientras carga
   - Muestra empty state cuando no hay datos
   - Tabla con hover effects y badges de estado
   - Botón "Nuevo X" visible para usuarios con permiso
   - Acciones: Editar, Desactivar/Activar
   - Modal Radix Dialog para crear/editar
   - Textos en español

4. **Verificar responsividad**:
   - Clases responsive presentes: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
   - Tablas con `overflow-x-auto` o conversión a cards en mobile
   - Headers con `flex flex-col sm:flex-row`
   - Padding adaptativo: `p-4 sm:p-6 lg:p-8`

5. **Verificar integración con permisos**:
   - Usa `usePermissions` para evaluar acceso
   - Oculta/deshabilita acciones sin permiso
   - Ruta protegida con `ProtectedRoute`

6. **Verificar auditoría**:
   - Acciones sensibles registran en `audit_logs`
   - Formato correcto: `action`, `collectionId`, `documentId`, `userId`, `details`

### Fase 3: Verificación de Functions (si aplica)

1. **Leer el código** de la función en `functions/<nombre>/src/index.js`
2. **Verificar scopes** en `appwrite.json` — ¿tiene los permisos necesarios?
3. **Verificar variables de entorno** configuradas
4. **Verificar lógica de negocio** — ¿implementa las reglas del task?
5. **Verificar manejo de errores** — ¿responde con códigos HTTP apropiados?
6. **Verificar seguridad** — ¿valida que el ejecutor tenga los labels/permisos correctos?

### Fase 4: Pruebas Funcionales con Datos

Usar MCP `appwrite-api` para ejecutar pruebas reales:

1. **Crear datos de prueba** — documentos en las colecciones relevantes
2. **Verificar relaciones** — ¿los IDs de referencia son válidos?
3. **Probar flujo completo** — crear → listar → actualizar → desactivar
4. **Probar casos borde**:
   - Crear con datos faltantes (campos required)
   - Crear con datos duplicados (si hay restricción)
   - Actualizar documento inexistente
   - Desactivar documento ya inactivo
   - Permisos: intentar operación sin label correcto
5. **Limpiar datos de prueba** al finalizar

### Fase 5: Verificación de Build

1. Ejecutar `cd frontend && npm run build` para verificar que no hay errores de compilación
2. Ejecutar lint si está configurado: `cd frontend && npx eslint src/`
3. Verificar que no hay imports rotos o dependencias faltantes

### Fase 6: Pruebas de Permisos con Usuarios Reales

Cuando se necesite validar permisos reales (no solo inspección de código):

1. **Crear usuarios de prueba** en Appwrite Auth con labels específicos (user, admin)
2. **Probar operaciones** con cada nivel de permiso
3. **Verificar** que label:user NO puede crear/actualizar catálogos
4. **Verificar** que label:admin NO puede eliminar
5. **Verificar** que Functions validan labels del ejecutor
6. **Dejar los datos de prueba** para revisión manual (NO limpiar automáticamente)

### Fase 7: Generación de Informe

Crear un informe **consolidado** en `docs/qa/test_report_full.md` usando la plantilla en [./assets/test-report-template.md](./assets/test-report-template.md).
El archivo contiene una sección por cada task probado, manteniendo todo en un solo documento.

Clasificar cada hallazgo como:

| Severidad | Descripción |
|-----------|-------------|
| **CRÍTICO** | Bloquea funcionalidad principal, pérdida de datos, falla de seguridad |
| **ALTO** | Funcionalidad importante no trabaja correctamente |
| **MEDIO** | Funcionalidad menor afectada, workaround existe |
| **BAJO** | Cosmético, UX menor, mejora sugerida |
| **INFO** | Observación, no es bug pero vale la pena notar |

## Checklist por Tipo de Task

### Tasks de Catálogo (06-11): Categorías, Materiales, Clientes, Choferes, Camiones, Plantas

```
□ Colección existe en appwrite.json con atributos correctos
□ Permisos de catálogo configurados
□ Índices para queries frecuentes
□ Hook use<Entidad> con CRUD completo
□ Página con tabla, filtros, empty state, loading
□ Modal crear/editar con validación
□ Eliminación lógica (active: true/false)
□ Badge activo/inactivo
□ Breadcrumb en header
□ Responsive (mobile/tablet/desktop)
□ Permisos frontend evaluados
□ Auditoría de acciones sensibles
□ Textos en español
□ Dark/light theme funciona
```

### Tasks Operativas (12-17): Vouchers, Tickets, Impresión, Mostrador, Báscula, Validación

```
□ Todo lo de catálogos +
□ Estados operativos implementados (draft → issued → printed → etc.)
□ Transiciones de estado válidas
□ QR generado correctamente (tasks 13-17)
□ Relaciones entre entidades correctas (voucher → ticket → weight_log)
□ Flujo de usuario completo funciona de principio a fin
□ Validaciones de negocio implementadas
□ No permite operaciones sobre documentos cancelados/bloqueados
□ Impresión/reimpresión controlada (task 14)
□ Registro en print_logs
□ Registro en scan_logs (task 17)
□ Auditoría completa
```

### Tasks de Infraestructura (01-05, 18-23): Auth, Roles, Auditoría, Reportes, Offline

```
□ Funcionalidad específica del task implementada
□ Integración con módulos dependientes funciona
□ Configuración de Appwrite correcta
□ Functions desplegadas y funcionales
□ Seguridad y permisos verificados
□ Offline funciona (tasks 21-22)
□ Exportación funciona (task 20)
```

## Colecciones por Task

Referencia rápida de qué colecciones verificar por task:

| Task | Colecciones |
|------|-------------|
| 01 | users_profile, roles, permissions_catalog, role_permissions |
| 02 | system_config |
| 03 | users_profile |
| 04 | users_profile (+ Appwrite Auth) |
| 05 | roles, permissions_catalog, role_permissions |
| 06 | material_categories |
| 07 | materials, material_categories |
| 08 | clients |
| 09 | drivers |
| 10 | trucks |
| 11 | plants |
| 12 | vouchers, clients, drivers, trucks, materials, plants |
| 13 | tickets, vouchers, print_logs, audit_logs |
| 14 | print_logs, tickets, audit_logs |
| 15 | counter_sales, tickets, clients, drivers, trucks, materials, plants |
| 16 | weight_logs, tickets, vouchers |
| 17 | scan_logs, tickets, audit_logs |
| 18 | audit_logs |
| 19 | (todas — reportes cruzan colecciones) |
| 20 | (todas — exportación) |
| 21-22 | (todas — offline/sync) |
| 23 | system_config, (todas) |

## Validaciones con Appwrite MCP

### Verificar colección existe y tiene atributos correctos
```
→ databases_get_collection(databaseId: "mina_db", collectionId: "<id>")
→ databases_list_attributes(databaseId: "mina_db", collectionId: "<id>")
→ databases_list_indexes(databaseId: "mina_db", collectionId: "<id>")
```

### Crear documento de prueba
```
→ databases_create_document(databaseId: "mina_db", collectionId: "<id>", documentId: "unique()", data: {...})
```

### Listar documentos para verificar
```
→ databases_list_documents(databaseId: "mina_db", collectionId: "<id>", queries: [...])
```

### Limpiar datos de prueba
```
→ databases_delete_document(databaseId: "mina_db", collectionId: "<id>", documentId: "<test-doc-id>")
```

## Reglas de Negocio a Verificar (Transversales)

Estas reglas del documento maestro deben verificarse en las tasks donde aplican:

1. **Nunca eliminación física** de entidades maestras — siempre `active: false`
2. **Cantidad comercial separada** del peso real del camión
3. **QR único por ticket** — no puede repetirse
4. **Control de reimpresión** — requiere auditoría y motivo
5. **Ticket no reutilizable** — validación de salida impide reuso
6. **Permisos en dos capas** — frontend + backend (Functions)
7. **Un chofer puede operar múltiples camiones** — relación no rígida
8. **Relaciones cliente-chofer-camión no son rígidas**
9. **Pagos son solo referencia** — no se procesan
10. **Textos UI en español**
11. **Dark/light theme** funcional
12. **Responsive obligatorio** — mobile, tablet, desktop

## Notas Importantes

- **No modificar código de producción** durante las pruebas — solo leer e inspeccionar
- **Documentar EXACTAMENTE** dónde está el bug: archivo, línea, función
- **Incluir pasos para reproducir** cada bug encontrado
- **Los datos de prueba creados via MCP se dejan** para revisión manual del usuario (NO eliminar automáticamente)
- **Se pueden crear usuarios de prueba** en Appwrite Auth para validar permisos reales
- **Si el build falla**, reportar como CRÍTICO con el error exacto
- **Verificar contra el task document**, no contra suposiciones

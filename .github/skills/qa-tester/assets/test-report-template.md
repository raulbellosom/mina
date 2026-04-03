# Informe Consolidado de Pruebas QA — MinaFlow

**Fecha:** YYYY-MM-DD
**Tester:** Copilot QA Agent
**Estado general:** ✅ PASS | ⚠️ PASS CON OBSERVACIONES | ❌ FAIL

---

## Resumen Ejecutivo Global

| Métrica                  | Valor  |
| ------------------------ | ------ |
| Tasks probados           | 0 / 23 |
| Total pruebas ejecutadas | 0      |
| Pasaron                  | 0      |
| Fallaron                 | 0      |
| Bloqueadas               | 0      |
| Bugs CRÍTICOS            | 0      |
| Bugs ALTOS               | 0      |
| Bugs MEDIOS              | 0      |
| Bugs BAJOS               | 0      |
| Observaciones INFO       | 0      |

## Resumen por Task

| Task | Nombre                      | Estado   | Bugs | Observaciones |
| ---- | --------------------------- | -------- | ---- | ------------- |
| 01   | Identidad, roles y permisos | ✅/⚠️/❌ | 0    |               |
| ...  | ...                         | ...      | ...  |               |

---

<!-- Repetir las secciones siguientes para CADA task probado -->

# Task XX: [Nombre del Task]

---

## 1. Verificación de Schema Appwrite

### Colección: `<collection_id>`

| Verificación                      | Estado | Detalle |
| --------------------------------- | ------ | ------- |
| Colección existe en appwrite.json | ✅/❌  |         |
| Colección existe en servidor      | ✅/❌  |         |
| Atributos completos               | ✅/❌  |         |
| Tipos de datos correctos          | ✅/❌  |         |
| Campos required correctos         | ✅/❌  |         |
| Índices configurados              | ✅/❌  |         |
| Permisos correctos                | ✅/❌  |         |

**Atributos verificados:**

| Campo  | Esperado         | Real | Estado |
| ------ | ---------------- | ---- | ------ |
| campo1 | string, required |      | ✅/❌  |

---

## 2. Verificación de Código Frontend

### Hook: `use<Entidad>.jsx`

| Verificación                   | Estado | Detalle |
| ------------------------------ | ------ | ------- |
| Archivo existe                 | ✅/❌  |         |
| Import appwrite correcto       | ✅/❌  |         |
| Estado loading/items           | ✅/❌  |         |
| Función fetchItems             | ✅/❌  |         |
| Función create                 | ✅/❌  |         |
| Función update                 | ✅/❌  |         |
| Función toggleActive           | ✅/❌  |         |
| Eliminación lógica (no física) | ✅/❌  |         |
| Manejo de errores              | ✅/❌  |         |

### Página: `<Entidad>.jsx`

| Verificación               | Estado | Detalle |
| -------------------------- | ------ | ------- |
| Breadcrumb presente        | ✅/❌  |         |
| Loading spinner            | ✅/❌  |         |
| Empty state                | ✅/❌  |         |
| Tabla con datos            | ✅/❌  |         |
| Badge activo/inactivo      | ✅/❌  |         |
| Botón nuevo                | ✅/❌  |         |
| Modal crear (Radix Dialog) | ✅/❌  |         |
| Modal editar               | ✅/❌  |         |
| Validación de formulario   | ✅/❌  |         |
| Textos en español          | ✅/❌  |         |
| Responsive mobile          | ✅/❌  |         |
| Responsive tablet          | ✅/❌  |         |
| Dark/light theme           | ✅/❌  |         |
| Permisos evaluados         | ✅/❌  |         |
| Auditoría registrada       | ✅/❌  |         |

---

## 3. Verificación de Functions (si aplica)

| Verificación           | Estado | Detalle |
| ---------------------- | ------ | ------- |
| Función existe         | ✅/❌  |         |
| Scopes correctos       | ✅/❌  |         |
| Variables de entorno   | ✅/❌  |         |
| Lógica de negocio      | ✅/❌  |         |
| Manejo de errores      | ✅/❌  |         |
| Validación de permisos | ✅/❌  |         |

---

## 4. Pruebas Funcionales

### 4.1 Flujo principal

| #   | Paso | Resultado esperado | Resultado real | Estado |
| --- | ---- | ------------------ | -------------- | ------ |
| 1   |      |                    |                | ✅/❌  |

### 4.2 Casos borde

| #   | Caso | Resultado esperado | Resultado real | Estado |
| --- | ---- | ------------------ | -------------- | ------ |
| 1   |      |                    |                | ✅/❌  |

---

## 5. Verificación de Build

| Verificación            | Estado | Detalle |
| ----------------------- | ------ | ------- |
| `npm run build` exitoso | ✅/❌  |         |
| Sin warnings críticos   | ✅/❌  |         |
| Sin imports rotos       | ✅/❌  |         |

---

## 6. Bugs Encontrados

### BUG-XX-001: [Título descriptivo]

| Campo                     | Valor                         |
| ------------------------- | ----------------------------- |
| **Severidad**             | CRÍTICO / ALTO / MEDIO / BAJO |
| **Archivo**               | `ruta/al/archivo.jsx`         |
| **Línea**                 | XX                            |
| **Función/Componente**    | nombre                        |
| **Descripción**           | Qué pasa vs qué debería pasar |
| **Pasos para reproducir** | 1. ... 2. ... 3. ...          |
| **Impacto**               | Qué funcionalidad afecta      |

---

## 7. Observaciones

-

---

## 8. Datos de Prueba Creados/Limpiados

| Colección | Document ID | Acción | Limpiado |
| --------- | ----------- | ------ | -------- |
|           |             | creado | ✅/❌    |

---

## 9. Conclusión

[Resumen de hallazgos principales y recomendación de si el task se considera aceptado o requiere correcciones]

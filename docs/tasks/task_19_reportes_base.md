# Task 19 — Reportes base

## 1. Nombre del task

**Task 19 — Implementar el módulo de reportes operativos y comerciales base**

---

## 2. Objetivo

Construir el módulo de reportes que permita a administradores, supervisores y personal autorizado consultar y analizar la operación del sistema de forma filtrable y visual: operaciones por periodo, por cliente, por material, por chofer, por camión, por planta, por tipo de venta y métricas agregadas relevantes.

Este task implementa los reportes fundamentales que permiten supervisión y toma de decisiones operativas.

---

## 3. Alcance

Incluye:

- reporte de operaciones/tickets por rango de fechas
- reporte por cliente (volumen, frecuencia, materiales)
- reporte por material (cantidad comercial vs peso neto)
- reporte por chofer (operaciones, materiales, camiones usados)
- reporte por camión (operaciones, choferes, materiales)
- reporte por planta/origen (volumen despachado)
- reporte por tipo de venta (voucher vs mostrador)
- métricas agregadas: total de operaciones, cantidad comercial total, peso neto total
- filtros por rango de fechas en todos los reportes
- exportación básica a CSV si el permiso lo permite

No incluye todavía:

- exportación avanzada con formatos múltiples (Task 20)
- reportes de auditoría (Task 18)
- gráficas o dashboards avanzados
- reportes fiscales o contables

---

## 4. Problema que resuelve

Sin módulo de reportes:

- no hay visibilidad agregada de la operación
- no se puede detectar tendencias, clientes frecuentes o inconsistencias
- no hay base para supervisión y toma de decisiones
- los datos capturados quedan sin valor analítico

---

## 5. Logro esperado

Al terminar este task debe existir un módulo donde un usuario autorizado pueda:

1. seleccionar un tipo de reporte
2. aplicar filtros de fecha y entidad
3. ver los resultados en tabla clara con totales
4. exportar el reporte si tiene permiso

---

## 6. Tipos de reporte a implementar

### 6.1 Reporte de operaciones
- listado de tickets en el periodo seleccionado
- columnas: folio, fecha, cliente, chofer, camión, material, planta, cantidad comercial, unidad, peso neto, estado, tipo de venta
- totales al pie: operaciones completadas, canceladas, rechazadas, cantidad comercial total, peso neto total

### 6.2 Reporte por cliente
- agrupación por cliente en el periodo
- columnas: cliente, operaciones totales, cantidad comercial total, peso neto total, materiales más frecuentes
- ordenable por operaciones o volumen

### 6.3 Reporte por material
- agrupación por material
- columnas: material, categoría, operaciones, cantidad comercial total, peso neto total, clientes
- ordenable por operaciones o volumen

### 6.4 Reporte por chofer
- agrupación por chofer
- columnas: chofer, empresa (si aplica), camiones usados, operaciones, cantidad total

### 6.5 Reporte por camión
- agrupación por placas/camión
- columnas: camión, placas, choferes, operaciones, materiales, cantidad total

### 6.6 Reporte por planta/origen
- agrupación por planta
- columnas: planta, operaciones, cantidad total, materiales despachados

### 6.7 Reporte por tipo de venta
- comparativo voucher vs mostrador en el periodo
- totales y porcentajes

---

## 7. Filtros disponibles

| Filtro | Aplica a |
|--------|----------|
| Rango de fechas (desde - hasta) | Todos los reportes |
| Cliente | Reporte de operaciones |
| Material | Reporte de operaciones |
| Estado | Reporte de operaciones |
| Planta | Reporte de operaciones y por planta |
| Tipo de venta | Reporte de operaciones y por tipo |

---

## 8. Seguridad del módulo

| Permiso | Acción |
|---------|--------|
| `reports.view` | Ver reportes |
| `reports.export` | Exportar resultados |

---

## 9. Entidades involucradas

Todas las colecciones del sistema son fuente de datos para los reportes:
- `tickets` — base de casi todos los reportes
- `vouchers` — origen de tickets tipo voucher
- `clients`, `drivers`, `trucks`, `materials`, `plants` — dimensiones de análisis
- `weight_logs` — datos de peso real

---

## 10. Criterios de aceptación

1. existe módulo de reportes accesible solo para usuarios autorizados
2. existe selector de tipo de reporte
3. todos los tipos de reporte listados funcionan con datos reales
4. los filtros funcionan correctamente en todos los reportes
5. se muestran totales al pie de tabla
6. existe exportación a CSV para usuarios con permiso reports.export
7. la UI es clara, rápida y usable
8. responsive para tablet y desktop

---

## 11. Dependencias previas

- Tasks 01-17: todos los módulos que generan datos
- Especialmente tickets, weight_logs, scan_logs

---

## 12. Dependencias posteriores

- Task 20: exportación controlada (puede extender la exportación básica de este task)

---

## 13. Entregables esperados

1. hook `useReportes.jsx`
2. página `Reportes.jsx` funcional (reemplaza placeholder)
3. componentes de tabla por tipo de reporte
4. filtros compartidos
5. exportación básica a CSV
6. totales por reporte

---

## 14. Restricciones

- no usar TypeScript
- no implementar gráficas avanzadas en esta fase
- no reportes fiscales ni contables
- la exportación avanzada es Task 20

---

## 15. Prompt sugerido para Claude Code

```text
Necesito que ejecutes exclusivamente el Task 19 de este proyecto.

CONTEXTO
Sistema operativo para mina de materiales con Appwrite 1.8.1, React + Vite + JS + TailwindCSS 4.1 + Radix UI.

Ya existen todos los módulos operativos: vouchers, tickets, báscula, mostrador, validación de salida.

OBJETIVO
Implementar el módulo de reportes: operaciones por periodo, por cliente, por material, por chofer, por camión, por planta y por tipo de venta. Con filtros de fecha y entidad, totales al pie y exportación básica a CSV.

LO QUE QUIERO QUE HAGAS
1. Implementar los 7 tipos de reporte descritos en el task.
2. Implementar filtros por rango de fechas y entidades.
3. Mostrar totales al pie de tabla en cada reporte.
4. Implementar exportación a CSV controlada por permiso reports.export.
5. Proteger el módulo con permisos reports.view y reports.export.
6. Reemplazar el placeholder de Reportes.jsx con la implementación completa.

REGLAS
- No TypeScript.
- No gráficas avanzadas en esta fase.
- No reportes fiscales.
- Responsive para tablet y desktop.

No sigas al siguiente task. Quédate solo en Task 19.
```

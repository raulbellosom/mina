# Task 20 — Exportación controlada

## 1. Nombre del task

**Task 20 — Implementar exportación controlada de datos**

---

## 2. Objetivo

Construir una capa de exportación centralizada y controlada por permisos que permita a usuarios autorizados exportar datos del sistema en formatos CSV y opcionalmente PDF, para reportes operativos, auditoría y registros históricos.

Este task extiende la exportación básica de CSV implementada en los tasks anteriores con una solución más robusta, con control de acceso, límites de exportación y registro de exportaciones realizadas.

---

## 3. Alcance

Incluye:

- exportación de reportes a CSV (tickets, operaciones, auditoría)
- exportación de tickets individuales a PDF (para archivo físico o digital)
- control de permisos por tipo de exportación
- registro de cada exportación realizada en `audit_logs`
- límites configurables de filas por exportación
- UI de exportación consistente y reutilizable

No incluye todavía:

- exportación a Excel (.xlsx) en esta fase
- integración con sistemas de nómina o ERP
- reportes fiscales o CFDI
- firmas digitales en PDF

---

## 4. Problema que resuelve

Sin exportación controlada:

- los datos del sistema están atrapados en la interfaz web
- no hay forma de llevar la información a análisis externos o archivos físicos
- cualquier usuario podría exportar datos sensibles
- no hay registro de quién exportó qué información

---

## 5. Logro esperado

Al terminar este task debe existir una capa de exportación donde:

1. los usuarios autorizados pueden exportar datos a CSV desde reportes y auditoría
2. los administradores pueden exportar tickets individuales a PDF
3. cada exportación queda registrada en `audit_logs`
4. los permisos controlan quién puede exportar qué
5. la UI de exportación es consistente en toda la aplicación

---

## 6. Tipos de exportación

### 6.1 CSV — Listado de operaciones/tickets
- Exportable desde el módulo de reportes
- Columnas: todos los campos del tipo de reporte activo
- Respeta los filtros activos en el momento de exportar
- Límite: máximo 1000 filas por exportación

### 6.2 CSV — Auditoría
- Exportable desde el módulo de auditoría
- Columnas: fecha, acción, colección, docId, userId, details
- Respeta los filtros activos
- Solo para admin/owner con permiso `audit.export`

### 6.3 PDF — Ticket individual
- Genera un PDF del ticket con toda su información y el QR
- Útil para compartir digitalmente o archivar
- Requiere permiso `tickets.print` o equivalente

---

## 7. Seguridad

| Permiso | Exportación permitida |
|---------|-----------------------|
| `reports.export` | CSV de reportes operativos |
| `audit.export` | CSV de auditoría |
| `tickets.print` | PDF de ticket individual |

Toda exportación se registra en `audit_logs` con la acción `export.*`.

---

## 8. Consideración técnica

La generación de CSV puede hacerse completamente en el frontend (sin Function) usando arrays de datos ya cargados y creando un blob descargable.

La generación de PDF de tickets puede usar una librería como `@react-pdf/renderer` o simplemente `window.print()` con estilos de impresión específicos.

---

## 9. Criterios de aceptación

1. la exportación CSV funciona correctamente desde reportes y auditoría
2. la exportación PDF de ticket individual funciona
3. los permisos controlan correctamente quién puede exportar qué
4. cada exportación genera un registro en `audit_logs`
5. la UI de exportación es consistente y clara

---

## 10. Dependencias previas

- Task 18: auditoría (fuente de datos para exportación de auditoría)
- Task 19: reportes (fuente de datos para exportación de reportes)

---

## 11. Entregables esperados

1. utilidad `exportToCsv.js` reutilizable
2. componente `ExportButton` reutilizable con control de permisos
3. exportación PDF de ticket individual
4. registro de exportaciones en audit_logs

---

## 12. Restricciones

- no usar TypeScript
- no implementar exportación a Excel en esta fase
- no reportes fiscales

---

## 13. Prompt sugerido para Claude Code

```text
Necesito que ejecutes exclusivamente el Task 20 de este proyecto.

CONTEXTO
Sistema operativo para mina de materiales con Appwrite 1.8.1, React + Vite + JS + TailwindCSS 4.1 + Radix UI.

Ya existen reportes y auditoría con exportación básica a CSV. Este task centraliza y formaliza esa capa.

OBJETIVO
Implementar exportación controlada: utilidad CSV reutilizable, componente ExportButton con control de permisos, exportación PDF de ticket individual y registro de exportaciones en audit_logs.

No sigas al siguiente task. Quédate solo en Task 20.
```

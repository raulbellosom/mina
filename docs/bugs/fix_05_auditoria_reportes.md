# Fix 05 — Auditoría y Reportes: Queries incorrectos, paginación y truncamiento

## Origen

- **QA Report:** [test_report_full.md](../qa/test_report_full.md)
- **Bugs:** BUG-18-001, BUG-19-001, BUG-20-001
- **Tasks afectados:** 18 (Auditoría y bitácoras), 19 (Reportes base), 20 (Exportación controlada)
- **Severidad global:** 🟠 ALTO
- **Estado:** ✅ Resuelto

---

## Objetivo

Corregir las consultas de datos en los módulos de auditoría, reportes y exportación para que muestren datos correctos y completos.

---

## Problemas específicos

### BUG-18-001: Query.equal usa campo incorrecto para filtrar auditoría

- **Archivo:** `frontend/src/features/auditoria/hooks/useAuditoria.jsx`
- **Descripción:** El filtro de búsqueda/filtrado en auditoría usa `Query.equal("userId", ...)` pero el campo real en la colección `audit_logs` puede ser otro (ej: `performedBy`, `actorId`). Esto causa que el filtro no devuelva resultados o devuelva resultados incorrectos.
- **Impacto:** ALTO — Los administradores no pueden filtrar la bitácora por usuario que realizó la acción
- **Fix:**
  1. Verificar el nombre exacto del campo en `appwrite.json` → colección `audit_logs`
  2. Actualizar el Query.equal para usar el campo correcto
  3. Verificar que el campo tiene un índice para que la query sea eficiente

### BUG-19-001: fetchAllTickets sin límite de paginación

- **Archivo:** `frontend/src/features/reportes/hooks/useReportes.jsx`
- **Descripción:** La función que obtiene tickets para reportes usa `Query.limit(100)` o similar, pero no implementa paginación. Si hay más de 100 tickets, el reporte muestra datos incompletos sin avisar al usuario.
- **Impacto:** ALTO — Reportes muestran datos parciales — decisiones de negocio basadas en información incompleta
- **Fix:** Implementar paginación completa con cursor:
  ```js
  const fetchAllTickets = async (filters) => {
    let all = [];
    let lastId = null;
    while (true) {
      const queries = [...filters, Query.limit(100)];
      if (lastId) queries.push(Query.cursorAfter(lastId));
      const res = await databases.listDocuments(
        DATABASE_ID,
        "tickets",
        queries,
      );
      all = [...all, ...res.documents];
      if (res.documents.length < 100) break;
      lastId = res.documents[res.documents.length - 1].$id;
    }
    return all;
  };
  ```
- **Nota:** Considerar un límite máximo absoluto (ej. 10,000) para evitar carga excesiva en reportes muy grandes

### BUG-20-001: Exportación CSV trunca sin avisar

- **Archivo:** `frontend/src/features/reportes/hooks/useReportes.jsx` o `frontend/src/shared/lib/exportToCsv.js`
- **Descripción:** Si los datos del reporte están truncados (por el bug anterior), la exportación CSV genera un archivo incompleto. No hay indicación de que faltan registros.
- **Impacto:** MEDIO — El usuario exporta CSV creyendo que tiene todos los datos
- **Fix:**
  1. Resolver primero BUG-19-001 (paginación completa)
  2. Agregar al CSV una fila final con metadata: "Total registros: X"
  3. Si se alcanza el límite máximo, incluir nota: "Exportación limitada a N registros. Ajuste los filtros para obtener datos más específicos."

---

## Acciones requeridas

1. Verificar campo correcto de auditoría en `appwrite.json` colección `audit_logs`
2. Corregir `Query.equal` en `useAuditoria.jsx` con el campo correcto
3. Implementar paginación completa con cursor en `useReportes.jsx`
4. Agregar límite máximo absoluto para reportes (10,000 sugerido)
5. Agregar metadata de conteo al final del CSV exportado
6. Agregar indicador visual en UI cuando los datos están truncados

---

## Archivos involucrados

| Archivo                                                  | Acción                                     |
| -------------------------------------------------------- | ------------------------------------------ |
| `frontend/src/features/auditoria/hooks/useAuditoria.jsx` | MODIFICAR — corregir campo Query.equal     |
| `frontend/src/features/reportes/hooks/useReportes.jsx`   | MODIFICAR — paginación completa            |
| `frontend/src/shared/lib/exportToCsv.js` (si existe)     | MODIFICAR — metadata de conteo             |
| `appwrite.json`                                          | VERIFICAR — campos e índices de audit_logs |

---

## Criterios de aceptación

- [x] Filtro de auditoría por usuario devuelve resultados correctos
- [x] Reporte con >100 tickets muestra todos (hasta el límite máximo)
- [x] CSV exportado incluye todos los registros del reporte
- [x] Si se alcanza límite máximo, se muestra aviso en UI y en CSV
- [x] Las queries de auditoría usan campos indexados

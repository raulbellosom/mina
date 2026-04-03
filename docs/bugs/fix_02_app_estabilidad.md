# Fix 02 — Estabilidad de la Aplicación: ErrorBoundary, 404, PWA, Cache

## Origen

- **QA Report:** [test_report_full.md](../qa/test_report_full.md)
- **Bugs:** BUG-23-001, BUG-23-002, BUG-23-004, BUG-23-005
- **Tasks afectados:** 23 (Pulido final y despliegue)
- **Severidad global:** 🔴 CRÍTICO — Afecta estabilidad en producción
- **Estado:** ✅ Resuelto

---

## Objetivo

Implementar las capas de protección mínimas para producción: manejo global de errores, página 404, limpieza de cache PWA al cerrar sesión, e iconos PWA correctos.

---

## Problemas específicos

### BUG-23-001: No hay ErrorBoundary global

- **Archivo afectado:** `frontend/src/App.jsx`
- **Descripción:** La aplicación no tiene un React Error Boundary. Si un componente lanza un error en render, toda la app se rompe y queda en pantalla blanca.
- **Impacto:** CRÍTICO — En producción, cualquier excepción no capturada deja la app inutilizable sin feedback al usuario.
- **Fix:** Crear `frontend/src/shared/components/ErrorBoundary.jsx` (class component, obligatorio para componentDidCatch) y envolver la raíz de `<App />` con él. Debe mostrar mensaje amigable en español ("Algo salió mal") con botón "Recargar página".

### BUG-23-002: No existe página 404

- **Archivo afectado:** `frontend/src/App.jsx` (rutas)
- **Descripción:** La ruta catch-all `*` no está definida en las rutas. Cualquier URL inexistente muestra una página en blanco.
- **Impacto:** CRÍTICO — Mala experiencia de usuario; sin navegación de retorno.
- **Fix:** Crear `frontend/src/shared/components/NotFound.jsx` con mensaje "Página no encontrada" y enlace a `/dashboard`. Agregar `<Route path="*" element={<NotFound />} />` al final de las rutas.

### BUG-23-004: Cache del Service Worker no se limpia al cerrar sesión

- **Archivo afectado:** `frontend/src/features/auth/hooks/useAuth.jsx` (función logout)
- **Descripción:** Al hacer logout, el Service Worker retiene datos en caché. Si otro usuario inicia sesión en el mismo dispositivo, podría ver datos cacheados del usuario anterior.
- **Impacto:** ALTO — Fuga de información entre sesiones/usuarios en dispositivos compartidos (quioscos de operación).
- **Fix:** En la función `logout` de `useAuth.jsx`, antes de redirigir:
  1. Limpiar caches del SW: `caches.keys().then(keys => keys.forEach(k => caches.delete(k)))`
  2. Limpiar IndexedDB del módulo offline: `offlineStorage.clearAll()`
  3. Opcionalmente desregistrar el SW: `navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()))`

### BUG-23-005: Iconos PWA solo en formato SVG

- **Archivo afectado:** `frontend/vite.config.js` (configuración pwa)
- **Descripción:** El manifest solo declara iconos SVG. Muchos dispositivos (especialmente Android < 13 y iOS) requieren PNG en múltiples tamaños.
- **Impacto:** MEDIO — La app no se instala correctamente como PWA en algunos dispositivos; sin ícono en home screen.
- **Fix:**
  1. Generar PNGs 192×192 y 512×512 desde el SVG existente
  2. Colocar en `frontend/public/`
  3. Agregar al array `icons` en la config PWA de vite.config.js
  4. Mantener el SVG como `purpose: "any"` y agregar PNGs como `purpose: "maskable"`

---

## Acciones requeridas

1. Crear `frontend/src/shared/components/ErrorBoundary.jsx` — class component con UI de error
2. Crear `frontend/src/shared/components/NotFound.jsx` — página 404 con link a dashboard
3. Modificar `frontend/src/App.jsx` — envolver con ErrorBoundary, agregar ruta catch-all `*`
4. Modificar `frontend/src/features/auth/hooks/useAuth.jsx` — limpiar caches en logout
5. Generar iconos PNG 192×192 y 512×512
6. Modificar `frontend/vite.config.js` — agregar iconos PNG al manifest

---

## Archivos involucrados

| Archivo                                            | Acción                                       |
| -------------------------------------------------- | -------------------------------------------- |
| `frontend/src/shared/components/ErrorBoundary.jsx` | CREAR — class component                      |
| `frontend/src/shared/components/NotFound.jsx`      | CREAR — página 404                           |
| `frontend/src/App.jsx`                             | MODIFICAR — agregar ErrorBoundary + ruta 404 |
| `frontend/src/features/auth/hooks/useAuth.jsx`     | MODIFICAR — limpiar cache en logout          |
| `frontend/vite.config.js`                          | MODIFICAR — agregar iconos PNG               |
| `frontend/public/icon-192.png`                     | CREAR — ícono PWA                            |
| `frontend/public/icon-512.png`                     | CREAR — ícono PWA                            |

---

## Criterios de aceptación

- [x] Error en un componente hijo NO rompe toda la app — muestra pantalla de error amigable
- [x] URL inexistente (ej. `/xyz`) muestra página 404 con botón de vuelta al dashboard
- [x] Al hacer logout, caches del Service Worker quedan vacíos
- [x] Al hacer logout, IndexedDB queda limpio
- [x] Manifest de la PWA incluye iconos PNG 192×192 y 512×512
- [x] La app se puede instalar como PWA en Android y iOS con ícono correcto

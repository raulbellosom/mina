# Fix 07 — Mostrador UX: Reemplazar alert() por estado React

## Origen

- **QA Report:** [test_report_full.md](../qa/test_report_full.md)
- **Bugs:** BUG-15-001
- **Tasks afectados:** 15 (Flujo de venta en mostrador)
- **Severidad global:** 🟡 MEDIO
- **Estado:** ✅ Resuelto

---

## Objetivo

Reemplazar los `alert()` nativos del navegador por notificaciones integradas en la UI usando estado React, consistentes con el look & feel del resto de la aplicación.

---

## Problemas específicos

### BUG-15-001: Uso de alert() nativo para feedback

- **Archivo:** `frontend/src/features/mostrador/pages/Mostrador.jsx` (y posiblemente componentes hijos)
- **Descripción:** El flujo de venta en mostrador usa `alert()` del navegador para notificar éxito/error al usuario. Esto:
  1. Bloquea el hilo de JS hasta que el usuario cierra el diálogo
  2. No es estilizable (rompe el diseño de la app)
  3. En PWA, puede tener comportamiento inconsistente
  4. No es accesible (no aparece en lectores de pantalla como notificación)
- **Impacto:** MEDIO — Mala experiencia de usuario, inconsistencia visual
- **Fix:** Implementar uno de estos enfoques (de menor a mayor esfuerzo):

  **Opción A: Estado local simple**

  ```jsx
  const [toast, setToast] = useState(null);

  // En lugar de alert("Venta creada"):
  setToast({ type: "success", message: "Venta creada exitosamente" });
  setTimeout(() => setToast(null), 4000);
  ```

  Renderizar un banner en la parte superior de la página.

  **Opción B: Componente Toast reutilizable**
  Crear `frontend/src/shared/components/Toast.jsx` con animación (framer-motion) que se pueda usar desde cualquier módulo.

  **Opción C: Radix UI Toast**
  Usar `@radix-ui/react-toast` para un componente accesible y consistente.

- **Recomendación:** Opción B o C, ya que el patrón se necesitará en múltiples módulos

---

## Acciones requeridas

1. Crear componente Toast reutilizable (o implementar Radix Toast)
2. Reemplazar todos los `alert()` en Mostrador por el nuevo componente
3. Verificar que no hay `alert()` en otros módulos (buscar con grep `alert(` en `frontend/src/`)
4. Si se encuentran más `alert()`, reemplazar también

---

## Archivos involucrados

| Archivo                                               | Acción                                  |
| ----------------------------------------------------- | --------------------------------------- |
| `frontend/src/shared/components/Toast.jsx`            | CREAR — componente toast reutilizable   |
| `frontend/src/features/mostrador/pages/Mostrador.jsx` | MODIFICAR — reemplazar alert()          |
| Otros archivos con `alert()`                          | MODIFICAR — reemplazar si se encuentran |

---

## Criterios de aceptación

- [x] Ningún `alert()` nativo en todo el código frontend
- [x] Notificaciones de éxito/error aparecen como banners/toasts estilizados
- [x] Toasts se auto-cierran después de 4 segundos
- [x] Toasts tienen colores diferenciados: verde=éxito, rojo=error, amarillo=advertencia
- [x] Toasts son accesibles (role="alert" o equivalente)

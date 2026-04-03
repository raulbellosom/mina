# Fix 03 — Báscula y Validación de Salida: Estados y limpieza de cámara

## Origen

- **QA Report:** [test_report_full.md](../qa/test_report_full.md)
- **Bugs:** BUG-16-003, BUG-17-001
- **Tasks afectados:** 16 (Báscula), 17 (Validación de salida QR)
- **Severidad global:** 🟠 ALTO
- **Estado:** ✅ Resuelto

---

## Objetivo

Corregir el flujo de báscula y validación de salida para que los estados operativos de tickets se manejen correctamente y los recursos de cámara se liberen apropiadamente.

---

## Problemas específicos

### BUG-16-003: ENTRY_ALLOWED_STATES no incluye "generated"

- **Archivo:** `frontend/src/features/bascula/hooks/useBascula.jsx`
- **Descripción:** La constante `ENTRY_ALLOWED_STATES` define qué estados de ticket permiten registrar peso de entrada. Actualmente no incluye `"generated"`, que es el estado inicial de un ticket recién creado desde mostrador.
- **Flujo roto:**
  1. Mostrador crea ticket → status = `"generated"`
  2. Operador de báscula intenta pesar → rechazado porque `"generated"` no está en ENTRY_ALLOWED_STATES
  3. Ticket queda bloqueado sin poder avanzar
- **Impacto:** ALTO — Ningún ticket nuevo puede pasar por báscula
- **Fix:** Agregar `"generated"` al array `ENTRY_ALLOWED_STATES`:
  ```js
  // Antes:
  const ENTRY_ALLOWED_STATES = ["issued", "printed"];
  // Después:
  const ENTRY_ALLOWED_STATES = ["generated", "issued", "printed"];
  ```
- **Verificar:** Revisar también que el documento maestro confirma que `"generated"` es un estado válido para entrada a báscula

### BUG-17-001: Stream de cámara no se detiene al desmontar componente

- **Archivo:** `frontend/src/features/validacion/pages/Validacion.jsx` (o componente de escaneo QR)
- **Descripción:** Cuando el componente de validación de salida usa la cámara del dispositivo para escanear QR, el stream de video (`getUserMedia`) sigue activo después de que el usuario navega a otra página.
- **Síntomas:**
  - LED de cámara queda encendido
  - Otros componentes no pueden acceder a la cámara
  - Consumo de recursos innecesario
  - En dispositivos móviles, drenaje de batería
- **Impacto:** ALTO — Afecta dispositivos de guardia que usan cámara constantemente
- **Fix:** Agregar cleanup en el `useEffect` que inicializa la cámara:
  ```js
  useEffect(() => {
    let stream;
    const startCamera = async () => {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      // ... asignar a video element
    };
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);
  ```
- **Verificar:** Confirmar que el componente también maneja el caso donde el usuario deniega permisos de cámara

---

## Acciones requeridas

1. Agregar `"generated"` a `ENTRY_ALLOWED_STATES` en `useBascula.jsx`
2. Agregar cleanup del stream de cámara en el componente de validación
3. Agregar manejo de error cuando el usuario deniega permisos de cámara
4. Probar flujo completo: Mostrador → Báscula → Validación

---

## Archivos involucrados

| Archivo                                                 | Acción                                                 |
| ------------------------------------------------------- | ------------------------------------------------------ |
| `frontend/src/features/bascula/hooks/useBascula.jsx`    | MODIFICAR — agregar "generated" a ENTRY_ALLOWED_STATES |
| `frontend/src/features/validacion/pages/Validacion.jsx` | MODIFICAR — cleanup de cámara en useEffect             |

---

## Criterios de aceptación

- [x] Un ticket con status `"generated"` puede registrar peso de entrada en báscula
- [x] Al salir de la página de validación, la cámara se apaga (LED off)
- [x] Si el usuario deniega permisos de cámara, se muestra mensaje claro (no error silencioso)
- [x] Flujo completo Mostrador→Báscula→Validación funciona sin bloqueos de estado

# Fix 08 — Auth, Config y Validación de Entorno

## Origen

- **QA Report:** [test_report_full.md](../qa/test_report_full.md)
- **Bugs:** BUG-02-001, BUG-03-001, BUG-23-003
- **Tasks afectados:** 02 (Base técnica), 03 (Auth bootstrap), 23 (Pulido final)
- **Severidad global:** 🟠 ALTO / 🟡 MEDIO
- **Estado:** ✅ Resuelto

---

## Objetivo

Reforzar la capa base de la aplicación: validar variables de entorno al arrancar, persistir el fallback de perfil, y reemplazar la página placeholder de Configuración.

---

## Problemas específicos

### BUG-02-001: env.js no valida variables de entorno

- **Archivo:** `frontend/src/shared/config/env.js`
- **Descripción:** El archivo `env.js` exporta las variables de entorno de Vite sin validar que existan. Si `VITE_APPWRITE_ENDPOINT`, `VITE_APPWRITE_PROJECT_ID` o `VITE_APPWRITE_DATABASE_ID` no están definidas, la app arranca pero falla silenciosamente en la primera llamada a Appwrite, mostrando errores crípticos.
- **Impacto:** ALTO — En un nuevo entorno o si se pierde `.env.local`, la app se rompe sin indicar la causa real
- **Fix:** Agregar validación al arranque:
  ```js
  const required = [
    "VITE_APPWRITE_ENDPOINT",
    "VITE_APPWRITE_PROJECT_ID",
    "VITE_APPWRITE_DATABASE_ID",
  ];
  for (const key of required) {
    if (!import.meta.env[key]) {
      throw new Error(
        `Variable de entorno ${key} no definida. Verifica .env.local`,
      );
    }
  }
  ```
  Esto hará que Vite muestre el error en consola inmediatamente al arrancar.

### BUG-03-001: Fallback de perfil no se persiste

- **Archivo:** `frontend/src/features/auth/hooks/useAuth.jsx`
- **Descripción:** Cuando un usuario se autentica pero no tiene documento en `users_profile` (usuario nuevo), el hook crea un perfil fallback en memoria (objeto con defaults). Sin embargo, este fallback no se guarda en Appwrite, por lo que:
  1. Cada recarga repite la lógica de fallback
  2. El usuario no aparece en el listado de `users_profile`
  3. Si hay campos computed basados en el perfil, son inconsistentes
- **Impacto:** MEDIO — Usuarios nuevos tienen experiencia degradada; datos inconsistentes
- **Fix:** Cuando se detecta que no hay perfil, crear el documento en `users_profile`:
  ```js
  // Si no existe perfil, crear uno con defaults
  const newProfile = {
    userId: user.$id,
    name: user.name || "",
    email: user.email,
    phone: "",
    role: "pending",
    active: true,
    createdBy: user.$id,
  };
  await databases.createDocument(
    DATABASE_ID,
    "users_profile",
    user.$id,
    newProfile,
  );
  ```
- **Nota:** Verificar que los permisos de `users_profile` permiten que un usuario con label `pending` cree su propio documento, o manejar esto en una Appwrite Function.

### BUG-23-003: Página Configuración es placeholder

- **Archivo:** `frontend/src/features/configuracion/pages/Configuracion.jsx`
- **Descripción:** La página de Configuración del sistema está implementada como placeholder (texto "Configuración — Próximamente" o similar). No permite configurar ningún parámetro.
- **Impacto:** MEDIO — Los administradores no pueden ajustar parámetros del sistema sin modificar código
- **Fix:** Implementar al menos la configuración básica:
  1. **Nombre de la empresa/mina** — se muestra en tickets impresos
  2. **Dirección** — en tickets y reportes
  3. **Unidades de peso por defecto** (kg/ton)
  4. **Formato de ticket** (prefijo de numeración)
  5. **Parámetros de QR** (si aplica)
- **Colección:** Usar `system_config` con ID `singleton` (un solo documento)
- **Verificar:** Si la colección `system_config` ya existe en appwrite.json con los campos necesarios

---

## Acciones requeridas

1. Agregar validación de variables de entorno en `env.js` con error descriptivo
2. Modificar `useAuth.jsx` para crear documento `users_profile` cuando no existe
3. Verificar permisos de `users_profile` para creación por usuarios pending
4. Implementar página Configuración real con formulario y persistencia en `system_config`
5. Verificar colección `system_config` en appwrite.json

---

## Archivos involucrados

| Archivo                                                       | Acción                                  |
| ------------------------------------------------------------- | --------------------------------------- |
| `frontend/src/shared/config/env.js`                           | MODIFICAR — validación de variables     |
| `frontend/src/features/auth/hooks/useAuth.jsx`                | MODIFICAR — persistir perfil fallback   |
| `frontend/src/features/configuracion/pages/Configuracion.jsx` | MODIFICAR — implementar formulario real |
| `appwrite.json`                                               | VERIFICAR — colección system_config     |

---

## Criterios de aceptación

- [x] Si falta una variable de entorno, la app muestra error claro al arrancar (no falla en API call)
- [x] Usuario nuevo sin `users_profile` → se crea documento automáticamente
- [x] Al recargar, el usuario nuevo ya tiene su documento de perfil cargado (no fallback)
- [x] Página Configuración permite editar nombre de empresa, dirección, unidades de peso
- [x] Cambios en Configuración se guardan en colección `system_config`
- [x] Solo admin/owner pueden acceder a Configuración

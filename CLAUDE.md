# MinaFlow — Instrucciones para Claude Code

Sistema de control operativo, comercial y de trazabilidad para venta y salida de materiales de mina.

---

## Contexto del Proyecto

- **Documento maestro**: `docs/core/00_documento_maestro_requerimientos.md` — fuente de verdad para requisitos, flujos, entidades y reglas de negocio
- **Backlog de tareas**: `docs/tasks/` — cada task es una unidad de trabajo con criterios de aceptación

---

## Stack Tecnológico

### Backend

- **Appwrite self-hosted 1.8.1** — endpoint: `https://appwrite.racoondevs.com`
- Servicios: Auth, Databases, Storage, Functions, Sites
- Database: `mina_db`
- SDK: `appwrite` v16 (JS client)
- Config schema en: `appwrite.json` (raíz del proyecto)

### Frontend

- **React 18** + **Vite** + **JavaScript** — NO TypeScript bajo ninguna circunstancia
- **TailwindCSS 4.1** con `@tailwindcss/vite`
- **Radix UI** para componentes accesibles (Dialog, Select, Tabs, etc.)
- **lucide-react** para iconos
- **framer-motion** para animaciones de entrada/salida
- **clsx** + **tailwind-merge** para composición de clases
- **vite-plugin-pwa** (configurar progresivamente)
- **react-router-dom v7** para enrutamiento

---

## Estado de Tasks

| #   | Task                                     | Estado   |
| --- | ---------------------------------------- | -------- |
| 01  | Arquitectura identidad, roles y permisos | Completo |
| 02  | Base técnica frontend + Appwrite config  | Completo |
| 03  | Auth bootstrap + carga de users_profile  | Completo |
| 04  | Módulo usuarios internos                 | Completo |
| 05  | Módulo de roles y permisos               | Completo |
| 06  | CRUD categorías de materiales            | Completo |
| 07  | CRUD materiales con imagen de referencia | Completo |
| 08  | CRUD de clientes                         | Completo |
| 09  | CRUD de choferes                         | Completo |
| 10  | CRUD de camiones                         | Completo |
| 11  | CRUD de plantas / orígenes               | Completo |
| 12  | Vouchers / referencias prepago           | Completo |
| 13  | Tickets operativos con QR                | Completo |
| 14  | Impresión y reimpresión controlada       | Completo |
| 15  | Flujo de venta en mostrador              | Completo |
| 16  | Flujo de báscula                         | Completo |
| 17  | Validación de salida por QR              | Completo |
| 18  | Auditoría y bitácoras (módulo UI)        | Completo |
| 19  | Reportes base                            | Completo |
| 20  | Exportación controlada                   | Completo |
| 21  | Persistencia offline                     | Completo |
| 22  | Sincronización al reconectar             | Completo |
| 23  | Pulido final y despliegue                | Completo |

**Regla**: Completar siempre el task actual antes de avanzar al siguiente. Actualizar este archivo cuando un task cambie de estado.

---

## Estructura de Archivos

```
/                          ← raíz del proyecto
├── appwrite.json          ← schema completo de Appwrite (actualizar con cada task)
├── .env.local             ← variables de entorno (no commitear)
├── docs/
│   ├── core/              ← documento maestro de requerimientos
│   └── tasks/             ← task documents por fase
└── frontend/
    └── src/
        ├── features/      ← un folder por módulo de negocio
        │   └── <modulo>/
        │       ├── hooks/       ← use<Entidad>.jsx
        │       ├── pages/       ← vistas del módulo
        │       └── components/  ← componentes internos (si aplica)
        ├── shared/
        │   ├── components/  ← componentes reutilizables (PasswordInput, ProtectedRoute)
        │   ├── config/      ← env.js
        │   └── lib/         ← appwrite.js (cliente SDK)
        └── layouts/         ← MainLayout.jsx
```

---

## Convenciones de Código

| Elemento             | Convención                      | Ejemplo                                 |
| -------------------- | ------------------------------- | --------------------------------------- |
| Componentes React    | PascalCase                      | `Materiales.jsx`, `MainLayout.jsx`      |
| Hooks                | camelCase con `use`             | `useAuth.jsx`, `useMateriales.jsx`      |
| Estado React         | camelCase                       | `loading`, `items`, `selectedId`        |
| Constantes           | UPPER_SNAKE_CASE                | `DATABASE_ID`                           |
| Colecciones Appwrite | snake_case                      | `users_profile`, `material_categories`  |
| Atributos Appwrite   | camelCase                       | `userId`, `categoryId`, `createdBy`     |
| IDs de documentos    | `ID.unique()` salvo excepciones | `system_config` usa `singleton`         |
| Texto UI             | Español                         | "Nuevo Material", "Guardar", "Cancelar" |

---

## Patrones Frontend Obligatorios

### 1. Import del cliente Appwrite

```js
import { databases, DATABASE_ID } from "../../shared/lib/appwrite";
import { Query, ID } from "appwrite";
```

### 2. Carga de datos (patrón estándar)

```js
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    setLoading(true);
    const res = await databases.listDocuments(DATABASE_ID, "collection_id", [
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ]);
    setItems(res.documents);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};
```

### 3. Estructura visual de páginas de catálogo

```
1. Header: breadcrumb + título + botón "Nuevo X"
2. Tabla: columnas + badge activo/inactivo + acciones (Editar / Desactivar)
3. Estados: loading spinner | empty state | error state
4. Modal Radix Dialog: formulario crear/editar
```

### 4. Eliminación lógica — NUNCA borrar físicamente

```js
// Siempre usar active: false
await databases.updateDocument(DATABASE_ID, "collection", id, {
  active: false,
});
// El botón dice "Desactivar" o "Activar", nunca "Eliminar"
```

### 5. Hook de módulo (patrón use<Entidad>)

Extraer toda la lógica de datos a `features/<modulo>/hooks/use<Entidad>.jsx`:

```js
export function useMateriales() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    /* ... */
  };
  const create = async (data) => {
    /* ... */
  };
  const update = async (id, data) => {
    /* ... */
  };
  const toggleActive = async (id, active) => {
    /* ... */
  };

  useEffect(() => {
    fetchItems();
  }, []);
  return { items, loading, fetchItems, create, update, toggleActive };
}
```

---

## Diseño Responsivo (Obligatorio)

Toda pantalla debe funcionar en tres breakpoints:

| Breakpoint     | Uso             | Contexto                          |
| -------------- | --------------- | --------------------------------- |
| `sm` (640px+)  | Móvil landscape | Guardias y validación en handheld |
| `md` (768px+)  | Tablet          | Operadores de mostrador           |
| `lg` (1024px+) | Desktop         | Capturistas y administradores     |

### Reglas de Responsividad

1. **Tablas en mobile** → convertir a tarjetas stacked o usar scroll horizontal con `overflow-x-auto`
2. **Grid de catálogos** → `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
3. **Sidebar** → ocultar en mobile (`hidden lg:flex`), agregar hamburger menu (pendiente)
4. **Formularios** → `grid-cols-1 md:grid-cols-2` para campos en pares
5. **Botones de acción** → agrupar en `flex flex-wrap gap-2`
6. **Headers con acciones** → `flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`
7. **Modales** → max-w ajustado a pantalla: `max-w-lg w-full mx-4`
8. **Padding** → `p-4 sm:p-6 lg:p-8` (más espacio en desktop)

### Breakpoints en el Layout

El `MainLayout.jsx` debe:

- Desktop (`lg+`): sidebar fijo visible + contenido
- Mobile/Tablet: sidebar oculto + hamburger en header top bar

---

## Patrones Appwrite

### Schema appwrite.json — Tipos de Entidad

| Tipo               | Campos base obligatorios                                          |
| ------------------ | ----------------------------------------------------------------- |
| Maestra (catálogo) | `active` (bool, true), `createdBy` (string, required)             |
| Operativa          | `status` (string), `createdBy` (required), `updatedBy` (optional) |
| Auditoría          | `action`, `userId`, `details` (string 2048)                       |
| Configuración      | campos específicos                                                |

### Permisos por tipo de colección

**Catálogos** (solo admin/owner modifican):

```json
[
  "read(\"label:user\")",
  "read(\"label:admin\")",
  "read(\"label:owner\")",
  "create(\"label:admin\")",
  "create(\"label:owner\")",
  "update(\"label:admin\")",
  "update(\"label:owner\")",
  "delete(\"label:owner\")"
]
```

**Operativas** (users pueden crear):

```json
[
  "read(\"label:user\")",
  "read(\"label:admin\")",
  "read(\"label:owner\")",
  "create(\"label:user\")",
  "create(\"label:admin\")",
  "create(\"label:owner\")",
  "update(\"label:admin\")",
  "update(\"label:owner\")",
  "delete(\"label:owner\")"
]
```

**Auditoría** (todos crean, solo admin/owner leen):

```json
[
  "read(\"label:admin\")",
  "read(\"label:owner\")",
  "create(\"label:user\")",
  "create(\"label:admin\")",
  "create(\"label:owner\")"
]
```

### Modelo de Seguridad

```
Appwrite Auth        → identidad principal (email, password, labels)
users_profile        → extensión operativa (nombre, teléfono, empleado, rol)
labels (Auth)        → segmentación: owner > admin > user > pending
roles (colección)    → roles funcionales: admin, supervisor, capturista_bascula, etc.
permissions_catalog  → acciones por módulo: users.view, tickets.print, exit.validate
role_permissions     → relación N:M entre roles y permisos
```

**Enforcement en dos capas**:

1. Frontend: ocultar/deshabilitar UI según permisos del usuario
2. Backend: Appwrite Functions para acciones críticas (reimprimir, cancelar, validar salida)

---

## UI/UX

- **Light y dark theme** obligatorio — toggle en sidebar, clase `dark` en `<html>`
- **Sidebar** `w-64` con grupos de navegación por área funcional
- **Tablas**: hover effects, badges `bg-green-100/bg-red-100` para activo/inactivo
- **Loading**: `<Loader2 className="animate-spin" />` centrado
- **Empty state**: ícono + mensaje descriptivo, sin datos fríos
- **Breadcrumbs** en header de toda subpágina
- **Animaciones**: `animate-in fade-in duration-500` en entrada de páginas
- **Modales Radix Dialog**: overlay oscuro, focus trap, accesibles

---

## Seguridad

- Auth → Appwrite Auth (email/password únicamente)
- Perfil extendido en `users_profile` con ID = `$id` del Auth user
- `useAuth` en `features/auth/hooks/useAuth.jsx` expone: `user`, `profile`, `loading`
- `ProtectedRoute` en `shared/components/ProtectedRoute.jsx`
- Toda acción sensible (reimprimir, cancelar, validar salida) → registrar en `audit_logs`
- Permisos evaluados en `usePermissions` hook (ver Task 01)

---

## Variables de Entorno

Definidas en `.env.local` en la raíz, mapeadas en `vite.config.js`:

| Variable raíz          | Variable Vite               |
| ---------------------- | --------------------------- |
| `APPWRITE_ENDPOINT`    | `VITE_APPWRITE_ENDPOINT`    |
| `APPWRITE_PROJECT_ID`  | `VITE_APPWRITE_PROJECT_ID`  |
| `APPWRITE_DATABASE_ID` | `VITE_APPWRITE_DATABASE_ID` |

---

## Comandos Comunes

```bash
# Frontend
cd frontend && npm run dev       # Desarrollo
cd frontend && npm run build     # Build producción

# Appwrite schema
node migrate-schema.mjs          # Desplegar schema a Appwrite
node assign-owner.mjs            # Asignar label owner al primer admin
node update-permissions.mjs      # Actualizar permisos de colecciones
```

---

## Estados Operativos del Sistema

Para entidades operativas (vouchers, tickets, dispatches):

```
draft → issued → printed → loading → loaded → pending_exit_validation → completed
                                                     ↓
                                            cancelled | rejected | blocked
```

Estados de sincronización: `sync_pending`, `sync_error`

---

## Notas de Implementación

- Nunca usar TypeScript
- Nunca eliminar físicamente entidades maestras
- Siempre manejar los 3 estados de UI: loading, vacío, con datos
- Siempre breadcrumb en páginas de detalle/sub-módulo
- Todo texto visible al usuario debe estar en español
- Responsive es obligatorio — revisar siempre en mobile antes de dar por terminado
- appwrite.json debe mantenerse actualizado con cada nueva colección o cambio de schema

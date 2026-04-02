# MinaFlow — Instrucciones del Proyecto

## Descripción

Sistema de control operativo, comercial y de trazabilidad para venta y salida de materiales de mina.
Documento maestro de requerimientos: `docs/core/00_documento_maestro_requerimientos.md`
Backlog de tareas: `docs/tasks/`

## Stack Tecnológico

### Backend

- **Appwrite self-hosted 1.8.1** — endpoint: `https://appwrite.racoondevs.com`
- Servicios usados: Auth, Databases, Storage, Functions, Sites
- Database: `mina_db`
- SDK: `appwrite` v16 (JS client)

### Frontend

- **React 18** + **Vite** + **JavaScript** (NO TypeScript)
- **TailwindCSS 4.1** con `@tailwindcss/vite`
- **Radix UI** para componentes accesibles
- **lucide-react** para iconos
- **framer-motion** para animaciones
- **clsx** + **tailwind-merge** para manejo de clases
- PWA con `vite-plugin-pwa` (pendiente de activar)

## Convenciones de Código

### Nombres

| Tipo                 | Convención                  | Ejemplo                                |
| -------------------- | --------------------------- | -------------------------------------- |
| Componentes React    | PascalCase                  | `Materiales.jsx`, `MainLayout.jsx`     |
| Hooks                | camelCase con prefijo `use` | `useAuth.jsx`                          |
| Estado React         | camelCase                   | `user`, `profile`, `loading`           |
| Constantes           | UPPER_SNAKE_CASE            | `DATABASE_ID`                          |
| Colecciones Appwrite | snake_case                  | `users_profile`, `material_categories` |
| Campos de documentos | camelCase                   | `userId`, `categoryId`                 |
| Páginas en español   | PascalCase español          | `Materiales.jsx`, `Choferes.jsx`       |

### Estructura de Archivos

```
frontend/src/
├── features/<modulo>/
│   ├── hooks/       → Hooks del módulo
│   ├── pages/       → Páginas/vistas
│   └── components/  → Componentes internos del módulo
├── shared/
│   ├── components/  → Componentes reutilizables
│   ├── config/      → Configuración (env.js)
│   └── lib/         → Appwrite client y utilidades
├── layouts/         → Layouts (MainLayout)
└── hooks/           → Hooks globales (useAuth)
```

### Patrones Obligatorios

1. **Appwrite Client** — Usar siempre desde `shared/lib/appwrite.js`:

   ```js
   import { databases, DATABASE_ID } from "../../shared/lib/appwrite";
   ```

2. **Carga de datos** — Patrón estándar con useState + useEffect:

   ```js
   const [data, setData] = useState([]);
   const [loading, setLoading] = useState(true);
   useEffect(() => {
     (async () => {
       try {
         const res = await databases.listDocuments(
           DATABASE_ID,
           "collection_name",
         );
         setData(res.documents);
       } catch (err) {
         console.error(err);
       } finally {
         setLoading(false);
       }
     })();
   }, []);
   ```

3. **Eliminación lógica** — Nunca eliminar físicamente entidades maestras. Usar campo `active: true/false` o `enabled: true/false`.

4. **Permisos Appwrite** — Patrón estándar por colección:

   ```
   read:    label:user, label:admin, label:owner
   create:  label:admin, label:owner
   update:  label:admin, label:owner
   delete:  label:owner
   ```

5. **Roles** — Derivados de labels de Appwrite Auth: `owner > admin > user > pending`

## UI/UX

- Light y dark theme (toggle en sidebar, clase `dark` en `<html>`)
- Sidebar fijo (w-64) + contenido principal con scroll
- Tablas responsive con hover effects
- Badges de estado: verde=activo, rojo=inactivo
- Loading spinner + empty states en toda vista de datos
- Labels y textos de UI en **español**
- Breadcrumbs en headers de páginas

## Seguridad

- Autenticación vía Appwrite Auth (email/password)
- Perfil extendido en colección `users_profile`
- Permisos en dos capas: frontend (ocultar/deshabilitar) + backend (Functions)
- Acciones sensibles deben registrarse en `audit_logs`
- Reimpresión = acción auditada con motivo

## Reglas de Negocio Clave

- Venta generalmente por camión lleno, pero conservar cantidad comercial declarada
- Cada ticket debe tener QR único
- Validación de salida impide reuso de tickets
- Un chofer puede operar múltiples camiones
- Relaciones cliente-chofer-camión no son rígidas
- Soporte offline para operaciones críticas con cola de sincronización

## Variables de Entorno

Configuradas en `.env` en raíz del proyecto, mapeadas por Vite:

- `APPWRITE_ENDPOINT` → `import.meta.env.VITE_APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT_ID` → `import.meta.env.VITE_APPWRITE_PROJECT_ID`
- `APPWRITE_DATABASE_ID` → `import.meta.env.VITE_APPWRITE_DATABASE_ID`

## Comandos

```bash
cd frontend && npm install    # Instalar dependencias
cd frontend && npm run dev    # Desarrollo local
cd frontend && npm run build  # Build producción
```

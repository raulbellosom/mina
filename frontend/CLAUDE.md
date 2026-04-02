# MinaFlow Frontend — Contexto para Claude Code

Instrucciones específicas del directorio `frontend/`. Ver también `../CLAUDE.md` para contexto global del proyecto.

---

## Stack

- React 18 + Vite + JavaScript (NO TypeScript)
- TailwindCSS 4.1 (sin config file — directives en `src/index.css`)
- Radix UI, lucide-react, framer-motion, clsx, tailwind-merge
- react-router-dom v7

---

## Imports Clave

```js
// Appwrite
import { databases, storage, DATABASE_ID } from '../../shared/lib/appwrite';
import { Query, ID, Permission, Role } from 'appwrite';

// Auth (hook global)
import { useAuth } from '../../features/auth/hooks/useAuth';

// Iconos
import { NombreIcono } from 'lucide-react';

// Radix Dialog (para modales)
import * as Dialog from '@radix-ui/react-dialog';
```

---

## Estructura de un Módulo Feature Completo

```
features/<modulo>/
├── hooks/
│   └── use<Entidad>.jsx     ← lógica de datos
├── pages/
│   └── <Entidad>.jsx        ← vista principal
└── components/
    └── <Entidad>Form.jsx    ← formulario en modal (si aplica)
```

---

## Template: Hook de Módulo

```jsx
// features/<modulo>/hooks/use<Entidad>.jsx
import { useState, useEffect } from 'react';
import { databases, DATABASE_ID } from '../../../shared/lib/appwrite';
import { Query, ID } from 'appwrite';

export function use<Entidad>() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await databases.listDocuments(DATABASE_ID, '<collection_id>', [
                Query.orderDesc('$createdAt'),
                Query.limit(100)
            ]);
            setItems(res.documents);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const create = async (data) => {
        await databases.createDocument(DATABASE_ID, '<collection_id>', ID.unique(), {
            ...data,
            active: true,
            createdBy: data.createdBy // pasar el userId del usuario actual
        });
        await fetchItems();
    };

    const update = async (id, data) => {
        await databases.updateDocument(DATABASE_ID, '<collection_id>', id, data);
        await fetchItems();
    };

    const toggleActive = async (id, active) => {
        await databases.updateDocument(DATABASE_ID, '<collection_id>', id, { active: !active });
        await fetchItems();
    };

    useEffect(() => { fetchItems(); }, []);

    return { items, loading, fetchItems, create, update, toggleActive };
}
```

---

## Template: Página de Catálogo

```jsx
// features/<modulo>/pages/<Entidad>.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icono, Plus, Loader2, Pencil, ToggleLeft } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { use<Entidad> } from '../hooks/use<Entidad>';
import { useAuth } from '../../../features/auth/hooks/useAuth';

export default function <Entidad>() {
    const { items, loading, create, update, toggleActive } = use<Entidad>();
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editing) {
            await update(editing.$id, form);
        } else {
            await create({ ...form, createdBy: user.$id });
        }
        setOpen(false);
        setEditing(null);
        setForm({ name: '' });
    };

    const openEdit = (item) => {
        setEditing(item);
        setForm({ name: item.name });
        setOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <header>
                    <div className="flex items-center space-x-2 text-sm text-slate-500 mb-1">
                        <Link to="/catalogos" className="hover:text-blue-600">Catálogos</Link>
                        <span>/</span>
                        <span className="text-slate-900 dark:text-slate-100"><Entidad></span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white"><Entidad></h1>
                </header>
                <Dialog.Root open={open} onOpenChange={setOpen}>
                    <Dialog.Trigger asChild>
                        <button onClick={() => { setEditing(null); setForm({ name: '' }); }}
                            className="inline-flex items-center gap-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 text-sm font-medium transition-colors shrink-0">
                            <Plus size={16} /> Nuevo
                        </button>
                    </Dialog.Trigger>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
                        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4 bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6">
                            <Dialog.Title className="text-lg font-bold mb-4">
                                {editing ? 'Editar' : 'Nuevo'}
                            </Dialog.Title>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Nombre</label>
                                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                                        className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Dialog.Close asChild>
                                        <button type="button" className="px-4 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                                            Cancelar
                                        </button>
                                    </Dialog.Close>
                                    <button type="submit" className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">
                                        Guardar
                                    </button>
                                </div>
                            </form>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            </div>

            {/* Tabla */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-4 sm:px-6 py-3 font-semibold">Nombre</th>
                                <th className="px-4 sm:px-6 py-3 font-semibold">Estado</th>
                                <th className="px-4 sm:px-6 py-3 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan="3" className="px-6 py-10 text-center text-slate-500">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />Cargando...
                                </td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan="3" className="px-6 py-10 text-center text-slate-500">
                                    <Icono className="mx-auto h-8 w-8 opacity-30 mb-2" />Sin registros
                                </td></tr>
                            ) : items.map(item => (
                                <tr key={item.$id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 sm:px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{item.name}</td>
                                    <td className="px-4 sm:px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            {item.active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium">
                                                Editar
                                            </button>
                                            <button onClick={() => toggleActive(item.$id, item.active)} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 text-sm font-medium">
                                                {item.active ? 'Desactivar' : 'Activar'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
```

---

## Reglas de Responsividad

1. Tablas → siempre dentro de `<div className="overflow-x-auto">`
2. Headers con botones → `flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`
3. Grids → `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
4. Formularios de dos columnas → `grid grid-cols-1 md:grid-cols-2 gap-4`
5. Padding de páginas → el layout ya lo provee con `p-4 sm:p-6 lg:p-8`
6. Modales → `max-w-lg w-full mx-4` para que no se corten en mobile

---

## Routing

Las rutas están en `src/App.jsx`. Todas las rutas protegidas van dentro de:

```jsx
<Route element={<ProtectedRoute />}>
    <Route element={<MainLayout />}>
        {/* rutas aquí */}
    </Route>
</Route>
```

---

## Dark Theme

Activado con clase `dark` en `<html>`. Siempre usar variantes `dark:`:

```
bg-white dark:bg-slate-900
border-slate-200 dark:border-slate-800
text-slate-900 dark:text-white
text-slate-500 dark:text-slate-400
bg-slate-50 dark:bg-slate-800/50
```

---

## Manejo de Errores en Formularios

```jsx
const [error, setError] = useState(null);

try {
    await create(form);
} catch (err) {
    setError(err.message || 'Error al guardar');
}

// En JSX:
{error && (
    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
)}
```

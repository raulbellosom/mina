---
name: feature-module
description: "Crear un módulo feature completo para MinaFlow. Use when: necesitas crear un nuevo módulo con página, hook, componentes y ruta. Cubre catálogos, módulos operativos y vistas administrativas."
argument-hint: "Nombre de la entidad y sus campos principales"
---

# Creación de Feature Module para MinaFlow

## Cuándo Usar

- Crear un nuevo módulo CRUD de catálogo (materiales, clientes, etc.)
- Crear un módulo operativo (báscula, mostrador, validación)
- Crear cualquier vista nueva que necesite su propio feature folder

## Pre-requisitos

Antes de crear el módulo, verificar:

1. La colección existe en `appwrite.json` con atributos e índices
2. Los permisos están configurados
3. La ruta no existe ya en `frontend/src/App.jsx`

## Procedimiento

### Paso 1: Crear Estructura de Carpetas

```
frontend/src/features/<modulo>/
├── hooks/
│   └── use<Entidad>.jsx
├── pages/
│   └── <Entidad>.jsx
└── components/   (solo si se necesitan componentes internos)
    └── <Entidad>Form.jsx
```

### Paso 2: Crear el Hook de Datos

Archivo: `frontend/src/features/<modulo>/hooks/use<Entidad>.jsx`

Patrón base:

- Importar `databases`, `DATABASE_ID` desde `shared/lib/appwrite`
- Importar `ID`, `Query` desde `appwrite`
- Exportar función `use<Entidad>()` con:
  - `items` / `loading` — estado de lista
  - `fetchItems()` — recarga
  - `create(data)` — crear documento
  - `update(id, data)` — actualizar documento
  - `toggleActive(id, active)` — eliminación lógica
- Query por defecto: `Query.orderDesc('$createdAt')`, `Query.limit(100)`

### Paso 3: Crear la Página Principal

Archivo: `frontend/src/features/<modulo>/pages/<Entidad>.jsx`

Estructura visual obligatoria:

1. **Header**: breadcrumb + título + botón acción
2. **Tabla**: columnas relevantes + badge activo/inactivo + acciones
3. **Estados**: loading spinner, empty state, error state
4. **Modal**: Radix Dialog para crear/editar
5. **Dark theme**: variantes `dark:` en todos los elementos

Referencia visual: `frontend/src/features/catalogos/pages/Materiales.jsx`

### Paso 4: Registrar Ruta

En `frontend/src/App.jsx`, dentro del bloque `<ProtectedRoute>` + `<MainLayout>`:

```jsx
import NuevaPagina from "./features/<modulo>/pages/<Entidad>";
// ...
<Route path="/<ruta>" element={<NuevaPagina />} />;
```

### Paso 5: Agregar Navegación

Si es catálogo → agregar card/link en `frontend/src/features/catalogos/pages/Catalogos.jsx`
Si es módulo principal → agregar item en `frontend/src/layouts/MainLayout.jsx` (nav items)

### Paso 6: Verificar

- [ ] La página carga sin errores
- [ ] Loading spinner aparece mientras carga
- [ ] Empty state aparece si no hay datos
- [ ] Crear funciona y actualiza la lista
- [ ] Editar funciona y actualiza la lista
- [ ] Desactivar/activar funciona (eliminación lógica)
- [ ] Dark theme es consistente
- [ ] Textos UI en español

## Módulos del Proyecto

Ver referencia completa: [documento maestro](./references/modules.md)

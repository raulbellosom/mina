---
description: "Use when writing or modifying React components, pages, or hooks for MinaFlow. Covers JSX patterns, Appwrite integration, TailwindCSS styling, and Radix UI usage."
applyTo: "frontend/src/**/*.jsx"
---

# Convenciones React para MinaFlow

## Imports

- Appwrite: `import { databases, DATABASE_ID } from '../../shared/lib/appwrite'`
- Iconos: `import { IconName } from 'lucide-react'`
- Radix: `import * as Dialog from '@radix-ui/react-dialog'`

## Estado y Datos

- Siempre usar `useState` + `useEffect` con IIFE async para carga inicial
- Siempre incluir `loading` y manejar los 3 estados: cargando, vacío, con datos
- Para CRUD, extraer lógica a un hook en `features/<modulo>/hooks/`

## UI

- Textos en español
- Dark theme: usar variantes `dark:` de Tailwind
- Tablas: hover effects, badges verde/rojo para activo/inactivo
- Formularios: usar Radix Dialog para modales
- Siempre breadcrumb en header de páginas

## Eliminación

- NUNCA eliminar físicamente; usar campo `active: true/false`
- Acción mostrada como "Desactivar" / "Activar", no "Eliminar"

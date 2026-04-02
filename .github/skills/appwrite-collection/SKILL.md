---
name: appwrite-collection
description: "Configurar una colección Appwrite para MinaFlow. Use when: necesitas crear o modificar una colección en appwrite.json con atributos, índices y permisos. Cubre schema design para entidades maestras y operativas."
argument-hint: "Nombre de la colección y sus campos"
---

# Configuración de Colección Appwrite para MinaFlow

## Cuándo Usar

- Crear una nueva colección en `appwrite.json`
- Agregar atributos o índices a una colección existente
- Configurar permisos de una colección
- Diseñar el schema de una entidad nueva

## Pre-requisitos

1. Leer `appwrite.json` para conocer colecciones existentes
2. Consultar `docs/core/00_documento_maestro_requerimientos.md` sección 12 (entidades)
3. Verificar que la colección no existe ya

## Procedimiento

### Paso 1: Definir Tipo de Entidad

| Tipo               | Campos Base                        | Ejemplo                        |
| ------------------ | ---------------------------------- | ------------------------------ |
| Maestra (catálogo) | `active`, `createdBy`              | materials, clients, drivers    |
| Operativa          | `status`, `createdBy`, `updatedBy` | vouchers, tickets, weight_logs |
| Auditoría          | `action`, `userId`, `details`      | audit_logs, print_logs         |
| Configuración      | campos específicos                 | system_config                  |

### Paso 2: Definir Atributos

Convenciones:

- Nombres en `camelCase`
- Llaves foráneas: `<entidad>Id` (ej: `clientId`, `materialId`)
- Booleanos para flags: `active`, `enabled`, `printed`
- Enums como strings con valores documentados
- Siempre incluir `createdBy` (string, required)

Tipos disponibles en Appwrite:

- `string` (size obligatorio)
- `integer`
- `float`
- `boolean`
- `email`
- `enum` (elements obligatorios)
- `datetime`
- `url`
- `ip`

### Paso 3: Definir Índices

Crear índices para:

- Campos de búsqueda frecuente (ej: `name`, `plates`)
- Llaves foráneas (ej: `clientId`, `materialId`)
- Campos de filtro (ej: `status`, `active`)
- Campos únicos (ej: `RFC` para clients)

Tipos de índices:

- `key` — búsqueda
- `unique` — unicidad
- `fulltext` — búsqueda de texto

### Paso 4: Definir Permisos

**Entidades maestras (catálogos):**

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

**Entidades operativas (tickets, vouchers):**

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

**Entidades de auditoría (logs):**

```json
[
  "read(\"label:admin\")",
  "read(\"label:owner\")",
  "create(\"label:user\")",
  "create(\"label:admin\")",
  "create(\"label:owner\")"
]
```

### Paso 5: Agregar a appwrite.json

Editar `appwrite.json` → `databases[0].collections[]`. Seguir la estructura exacta de las colecciones existentes como referencia.

### Paso 6: Deploy

```bash
# Verificar schema
npx node migrate-schema.mjs

# O desplegar con Appwrite CLI
appwrite deploy collection
```

### Paso 7: Verificar

- [ ] Colección aparece en Appwrite console
- [ ] Atributos tienen tipos y defaults correctos
- [ ] Índices están creados
- [ ] Permisos están configurados
- [ ] Se puede crear un documento de prueba
- [ ] Las queries funcionan con los índices definidos

## Estados Operativos del Sistema

Referencia para entidades operativas:

- `draft`, `issued`, `printed`, `loading`, `loaded`
- `pending_exit_validation`, `completed`, `cancelled`
- `rejected`, `blocked`, `sync_pending`, `sync_error`

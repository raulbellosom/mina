---
description: "Use when modifying appwrite.json to add collections, attributes, indexes, or permissions for MinaFlow. Covers Appwrite schema conventions and deployment."
applyTo: "appwrite.json"
---

# Convenciones appwrite.json para MinaFlow

## Colecciones

- Nombres en `snake_case`: `material_categories`, `weight_logs`
- Database: `mina_db`

## Atributos

- Nombres en `camelCase`: `userId`, `categoryId`, `commercialQty`
- Entidades maestras: incluir `active` (boolean, default: true) y `createdBy` (string)
- Entidades operativas: incluir `status` (enum), `createdBy`, `updatedBy`
- Llaves foráneas: `<entidad>Id`

## Permisos Estándar (catálogos)

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

## Después de Modificar

- Verificar JSON válido
- Deploy: `appwrite deploy collection` o `node migrate-schema.mjs`

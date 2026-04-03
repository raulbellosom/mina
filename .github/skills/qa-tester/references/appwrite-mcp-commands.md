# Verificaciones Appwrite MCP — Referencia Rápida

Comandos MCP frecuentes para validación QA. Todos usan `databaseId: "mina_db"`.

## Verificar Colección

```
Tool: mcp_appwrite-api_databases_get_collection
Params: databaseId="mina_db", collectionId="<id>"
→ Verifica: nombre, permisos, enabled, documentSecurity
```

## Listar Atributos

```
Tool: mcp_appwrite-api_databases_list_attributes
Params: databaseId="mina_db", collectionId="<id>"
→ Verifica: todos los campos existen, tipos correctos, required, default values
```

## Listar Índices

```
Tool: mcp_appwrite-api_databases_list_indexes
Params: databaseId="mina_db", collectionId="<id>"
→ Verifica: índices para queries frecuentes, fulltext para búsquedas
```

## Crear Documento de Prueba

```
Tool: mcp_appwrite-api_databases_create_document
Params: databaseId="mina_db", collectionId="<id>", documentId="unique()", data={...}
→ Nota: Usar prefijo "qa_test_" en valores para identificar datos de prueba
```

## Listar Documentos

```
Tool: mcp_appwrite-api_databases_list_documents
Params: databaseId="mina_db", collectionId="<id>", queries=["..."]
→ Queries útiles: Query.equal("active", true), Query.orderDesc("$createdAt")
```

## Eliminar Documento de Prueba

```
Tool: mcp_appwrite-api_databases_delete_document
Params: databaseId="mina_db", collectionId="<id>", documentId="<id>"
→ SOLO para datos de prueba creados durante QA
```

## Verificar Documentación Appwrite

```
Tool: mcp_appwrite-docs_search
Params: query="<SDK method or concept>"
→ Útil para verificar uso correcto del SDK en el código
```

## Colecciones del Proyecto

| ID                  | Tipo      | Tasks Relacionados |
| ------------------- | --------- | ------------------ |
| users_profile       | Catálogo  | 01, 03, 04         |
| roles               | Catálogo  | 01, 05             |
| permissions_catalog | Catálogo  | 01, 05             |
| role_permissions    | Operativa | 01, 05             |
| material_categories | Catálogo  | 06                 |
| materials           | Catálogo  | 07                 |
| clients             | Catálogo  | 08                 |
| drivers             | Catálogo  | 09                 |
| trucks              | Catálogo  | 10                 |
| plants              | Catálogo  | 11                 |
| vouchers            | Operativa | 12                 |
| tickets             | Operativa | 13, 14, 15, 16, 17 |
| counter_sales       | Operativa | 15                 |
| weight_logs         | Operativa | 16                 |
| print_logs          | Auditoría | 14                 |
| scan_logs           | Auditoría | 17                 |
| audit_logs          | Auditoría | 18 (consulta)      |
| system_config       | Config    | 02, 23             |

# Referencia de Requisitos por Task

Mapeo rápido de qué requisitos del documento maestro corresponden a cada task.

## Tasks de Infraestructura

### Task 01 — Identidad, Roles y Permisos

- Appwrite Auth como identidad principal
- users_profile como extensión operativa
- Labels: owner > admin > user > pending
- Colecciones: roles, permissions_catalog, role_permissions
- Enforcement en dos capas: frontend + Functions

### Task 02 — Base Técnica Frontend + Appwrite Config

- React 18 + Vite + JavaScript (NO TypeScript)
- TailwindCSS 4.1, Radix UI, lucide-react, framer-motion
- Appwrite SDK v16 configurado
- Dark/light theme toggle

### Task 03 — Auth Bootstrap + users_profile

- Login con email/password via Appwrite Auth
- Carga de users_profile al autenticarse
- ProtectedRoute funcional
- useAuth hook expone: user, profile, loading

## Tasks de Catálogos

### Task 04 — Módulo Usuarios Internos

- CRUD de usuarios (via Function create-user)
- Listado con roles y estado
- Activar/desactivar usuarios

### Task 05 — Módulo Roles y Permisos

- CRUD de roles funcionales
- Asignación de permisos a roles
- Evaluación de permisos por usuario

### Task 06 — CRUD Categorías de Materiales

- Colección: material_categories
- Campos: name, description, active, createdBy
- Eliminación lógica

### Task 07 — CRUD Materiales con Imagen

- Colección: materials
- Campos: name, categoryId, description, unit, imageFileId, active, createdBy
- Upload de imagen a Storage
- Relación con material_categories

### Task 08 — CRUD Clientes

- Colección: clients
- Campos: name, rfc, phone, email, address, notes, active, createdBy

### Task 09 — CRUD Choferes

- Colección: drivers
- Campos: name, phone, licenseNumber, licenseExpiry, notes, active, createdBy
- Relación no rígida con cliente

### Task 10 — CRUD Camiones

- Colección: trucks
- Campos: plates, brand, model, year, type, capacity, capacityUnit, notes, active, createdBy
- Un chofer puede operar múltiples camiones

### Task 11 — CRUD Plantas/Orígenes

- Colección: plants
- Campos: name, location, description, active, createdBy

## Tasks Operativas

### Task 12 — Vouchers/Referencias Prepago

- Colección: vouchers
- Estados: draft → issued → redeemed → cancelled
- Vincula: cliente, chofer, camión, material, planta
- Cantidad comercial y unidad comercial
- Folio único

### Task 13 — Tickets Operativos con QR

- Colección: tickets
- Generado a partir de voucher válido O venta mostrador
- QR único por ticket
- Estados: issued → printed → pending_exit_validation → completed
- Vincula todos los datos operativos

### Task 14 — Impresión y Reimpresión Controlada

- Colección: print_logs
- Primera impresión libre
- Reimpresión requiere motivo + auditoría
- Contador de impresiones por ticket
- Permiso específico para reimprimir

### Task 15 — Flujo de Venta en Mostrador

- Colección: counter_sales
- Venta directa sin voucher previo
- Genera ticket operativo automáticamente
- Captura: cliente, chofer, camión, material, planta, cantidad, método pago

### Task 16 — Flujo de Báscula

- Colección: weight_logs
- Peso de entrada y peso de salida
- Cálculo de tara y peso neto
- Vinculado a ticket
- Flujo: entrada → carga → salida

### Task 17 — Validación de Salida por QR

- Colección: scan_logs
- Escaneo de QR con cámara
- Fallback captura manual de folio
- Validaciones: ticket existe, estado correcto, no usado, no cancelado
- Aprobación/rechazo con motivo
- Marca ticket como completed

### Task 18 — Auditoría y Bitácoras

- Colección: audit_logs (consulta, no creación)
- Filtros por acción, usuario, fecha, colección
- Vista de detalle con JSON
- Solo accesible para admin/owner

### Task 19 — Reportes Base

- Reportes operativos y comerciales
- Por período, cliente, material, camión, chofer, planta
- Totales y subtotales
- Gráficas básicas

### Task 20 — Exportación Controlada

- Exportación a CSV/Excel
- Controlada por permisos
- Registro en auditoría

### Task 21 — Persistencia Offline

- Detección de conectividad
- Cola de operaciones pendientes
- Almacenamiento local (IndexedDB/localStorage)

### Task 22 — Sincronización al Reconectar

- Procesamiento de cola al reconectar
- Resolución de conflictos
- Estados sync_pending / sync_error

### Task 23 — Pulido Final y Despliegue

- PWA configurada
- Performance optimizada
- Despliegue en Appwrite Sites

# Task 01 — Arquitectura de usuarios, perfiles, labels, roles y permisos

## 1. Nombre del task

**Task 01 — Diseñar e implementar la arquitectura de identidad, perfiles, roles y permisos**

---

## 2. Objetivo

Definir e implementar la base de seguridad y control de acceso del sistema, usando Appwrite Auth como fuente principal de identidad, `users_profile` como extensión operativa, labels para agrupación de acceso y una matriz de permisos propia por módulo/acción.

Este task debe dejar resuelta la arquitectura que gobernará todo el sistema antes de construir los demás módulos.

---

## 3. Alcance

Incluye:
- estrategia de identidad con Appwrite Auth
- diseño de `users_profile`
- estrategia de labels en Appwrite Auth
- diseño de roles funcionales
- diseño de permisos por módulo y acción
- propuesta de collections relacionadas
- propuesta de guards y validaciones
- propuesta de auditoría para acciones de seguridad
- implementación base si ya corresponde según fase de trabajo

No incluye aún:
- CRUD completo de materiales
- vouchers
- tickets
- flujos de mostrador
- flujos de báscula
- reportes
- sincronización offline

---

## 4. Problema que resuelve

Evita que la aplicación crezca sin una base segura y consistente de acceso. Define desde el inicio:
- quién es un usuario
- qué información vive en Auth
- qué información vive en `users_profile`
- cómo se asignan roles
- cómo se restringen acciones
- cómo se auditan cambios importantes

---

## 5. Logro esperado

Al terminar este task debe existir una definición clara y, si aplica en la fase actual, una implementación funcional de:
1. usuarios en Appwrite Auth
2. colección `users_profile`
3. estrategia de labels
4. estrategia de roles
5. catálogo de permisos
6. relación rol-permisos
7. evaluación de permisos por usuario
8. lineamientos de seguridad frontend/backend
9. lineamientos de auditoría

---

## 6. Preguntas que este task debe cerrar

1. ¿Qué datos pertenecen a Appwrite Auth y cuáles a `users_profile`?
2. ¿Cómo se crearán usuarios internos del sistema?
3. ¿Qué labels se usarán y para qué?
4. ¿Cómo se modelarán roles y permisos?
5. ¿Cómo se definirá el acceso por módulo y acción?
6. ¿Cómo se protegerán rutas y acciones en frontend?
7. ¿Qué acciones deberán reforzarse desde Functions/backend?
8. ¿Cómo se registrarán cambios de seguridad?

---

## 7. Decisiones arquitectónicas esperadas

- **Identidad:** Appwrite Auth como fuente principal
- **Perfil extendido:** `users_profile` como extensión operativa
- **Labels:** segmentación por grupos funcionales
- **Roles:** uno o más roles funcionales asignables
- **Permisos:** matriz fina por módulo/acción
- **Enforcement:** frontend + backend
- **Auditoría:** logs específicos para cambios de seguridad y permisos

---

## 8. Diseño esperado de entidades relacionadas

### `users_profile`
Campos sugeridos:
- authUserId
- firstName
- lastName
- fullName
- email
- phone
- employeeCode
- roleId o roleIds según estrategia
- status
- enabled
- avatarFileId opcional
- notes
- lastLoginAt opcional
- createdBy
- updatedBy

### `roles`
- name
- code
- description
- enabled
- isSystem

### `permissions_catalog`
- module
- action
- code
- description
- enabled

### `role_permissions`
- roleId
- permissionCode o permissionId
- enabled

### `audit_logs`
- entityType
- entityId
- action
- performedBy
- summary
- metadata
- createdAt

Claude debe validar con Appwrite 1.8.1 qué atributos e índices convienen realmente y ajustarlo a las limitaciones reales.

---

## 9. Módulos afectados

- autenticación
- usuarios
- roles y permisos
- navegación protegida
- auditoría
- todo el resto del sistema como dependencia futura

---

## 10. Reglas de negocio específicas

1. Todo usuario operativo debe existir primero en Appwrite Auth.
2. Todo usuario operativo debe tener o generar un `users_profile` relacionado.
3. El sistema no debe depender solo de labels para permisos finos.
4. Los permisos deben definirse por módulo y acción.
5. Los cambios de rol o permisos deben quedar auditados.
6. Un usuario deshabilitado no debe poder operar en la plataforma.
7. No todos los usuarios pueden gestionar usuarios o roles.
8. Los permisos críticos deberán reforzarse en backend/Functions.

---

## 11. Roles iniciales sugeridos

- admin
- supervisor
- capturista_bascula
- mostrador
- guardia_salida
- operador_carga
- secretaria

---

## 12. Permisos funcionales iniciales sugeridos

### Usuarios y seguridad
- users.view
- users.create
- users.update
- users.disable
- roles.view
- roles.create
- roles.update
- permissions.view
- permissions.assign

### Catálogos
- catalogs.view
- catalogs.create
- catalogs.update
- catalogs.disable

### Materiales
- materials.view
- materials.create
- materials.update
- materials.disable
- materials.export

### Operación
- vouchers.view
- vouchers.create
- vouchers.update
- tickets.print
- tickets.reprint
- weights.register
- exit.validate
- exit.reject

### Reportes
- reports.view
- reports.export

### Auditoría
- audit.view

---

## 13. Criterios de aceptación

1. existe una definición clara de arquitectura Auth + Profile + Roles + Permissions
2. existe propuesta validada de labels a utilizar
3. existe modelo de datos propuesto o implementado para seguridad
4. existe catálogo inicial de roles
5. existe catálogo inicial de permisos por módulo/acción
6. existe estrategia clara de route guards y UI guards
7. existe estrategia clara de validación backend para acciones críticas
8. existe estrategia de auditoría de cambios sensibles
9. la solución es compatible con Appwrite 1.8.1 validada con `appwrite-docs` y `appwrite-api`

---

## 14. Riesgos del task

1. confiar demasiado en labels y no modelar permisos finos
2. mezclar datos de Auth con datos operativos
3. dejar la seguridad solo del lado frontend
4. no auditar cambios de rol/permisos
5. sobrediseñar la matriz de permisos antes de tiempo

---

## 15. Entregables esperados

1. documento técnico breve de la arquitectura de seguridad
2. propuesta final de collections/campos para seguridad
3. propuesta final de labels
4. propuesta final de roles
5. propuesta final de permisos
6. lineamientos de frontend guards
7. lineamientos de backend enforcement
8. si la fase ya lo permite: implementación base de estas piezas

---

## 16. Prompt sugerido para Claude Code

```text
Necesito que ejecutes exclusivamente el Task 01 de este proyecto. No avances todavía a vouchers, tickets, báscula, mostrador, reportes ni sincronización offline.

CONTEXTO
Estoy construyendo un sistema operativo y administrativo para una mina de materiales usando:
- Appwrite self-hosted 1.8.1
- Appwrite CLI
- MCP appwrite-api
- MCP appwrite-docs
- frontend con React + Vite + JavaScript + TailwindCSS 4.1 + Radix UI + vite-plugin-pwa

OBJETIVO DEL TASK
Diseñar y dejar lista la arquitectura de identidad, perfiles, labels, roles y permisos del sistema.

LO QUE QUIERO QUE HAGAS
1. Revisa con `appwrite-docs` y `appwrite-api` las capacidades reales de Appwrite 1.8.1 relacionadas con:
   - Auth users
   - labels
   - permissions
   - modelado recomendado para perfiles extendidos
   - restricciones relevantes de databases e índices
2. Propón la arquitectura final de seguridad del proyecto.
3. Define claramente:
   - qué vive en Appwrite Auth
   - qué vive en `users_profile`
   - qué se resuelve con labels
   - qué se resuelve con roles
   - qué se resuelve con permisos por módulo/acción
4. Diseña el modelo de datos mínimo necesario para:
   - users_profile
   - roles
   - permissions_catalog
   - role_permissions
   - audit_logs
5. Propón el catálogo inicial de roles y permisos del sistema.
6. Define la estrategia de enforcement en frontend y backend.
7. Define cómo se auditarán cambios de seguridad.
8. Si ya es viable en esta fase del repo, implementa la base técnica correspondiente.

REGLAS IMPORTANTES
- No uses TypeScript.
- No avances a otros módulos fuera de este task.
- No dependas solo de labels para permisos finos.
- Usa Appwrite Auth como fuente principal de identidad.
- Usa `users_profile` como extensión operativa.
- Refuerza acciones críticas en backend/Functions cuando corresponda.
- Documenta decisiones importantes de forma breve y clara.

CRITERIOS DE ACEPTACIÓN
Tu resultado debe dejar resuelto:
- arquitectura Auth + Profile + Roles + Permissions
- catálogo inicial de roles
- catálogo inicial de permisos
- diseño de collections/campos
- estrategia de guards frontend
- estrategia de enforcement backend
- estrategia de auditoría
- compatibilidad validada con Appwrite 1.8.1

ENTREGABLES
Entrégame:
1. documento técnico breve
2. diseño final de collections y campos
3. propuesta final de roles y permisos
4. lineamientos de implementación
5. implementación base si ya corresponde

No sigas al siguiente task. Quédate solo en Task 01.
```

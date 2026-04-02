# Task 05 — Módulo de roles y permisos

## 1. Nombre del task

**Task 05 — Implementar el módulo de roles y permisos**

---

## 2. Objetivo

Construir el módulo administrativo para definir, consultar, editar y aplicar roles y permisos del sistema, tomando como base la arquitectura de seguridad definida en el Task 01, la base técnica del Task 02, la autenticación y bootstrap del Task 03, y el módulo de usuarios internos del Task 04.

Este task debe consolidar la capa de autorización del sistema para que cada usuario opere únicamente dentro del alcance que le corresponde, por módulo y por acción.

---

## 3. Alcance

Incluye:

- listado de roles
- vista de detalle de rol
- creación de roles funcionales
- edición de roles
- activación/desactivación lógica de roles
- catálogo de permisos por módulo/acción
- asignación de permisos a roles
- visualización de permisos efectivos de un rol
- integración base de roles con usuarios internos
- enforcement inicial en frontend según permisos
- lineamientos y refuerzo para enforcement backend en acciones sensibles
- auditoría de cambios de seguridad relacionados con roles y permisos

No incluye todavía:

- módulos de negocio como materiales, clientes, vouchers, tickets, báscula o mostrador
- un sistema avanzado de herencia jerárquica compleja entre roles
- delegación temporal de permisos
- multi-tenant
- sincronización offline
- reportes funcionales completos

---

## 4. Problema que resuelve

Evita que el sistema dependa de acceso amplio o improvisado. Define de forma explícita qué puede hacer cada tipo de usuario en cada módulo, permitiendo crecer el proyecto con seguridad, trazabilidad y control.

---

## 5. Logro esperado

Al terminar este task debe existir un módulo funcional donde un usuario con permisos suficientes pueda:

1. ver roles existentes
2. crear roles funcionales
3. editar nombre, código, descripción y estado de un rol
4. consultar catálogo de permisos disponibles
5. asignar y retirar permisos a un rol
6. visualizar permisos efectivos por rol
7. vincular el rol principal a usuarios internos según la arquitectura vigente
8. dejar auditados los cambios de seguridad

---

## 6. Preguntas que este task debe cerrar

1. ¿Cuál será el catálogo inicial definitivo de permisos por módulo/acción?
2. ¿Cómo se almacenarán y consultarán los permisos efectivos de un rol?
3. ¿Se manejará un rol principal por usuario o múltiples roles por usuario en esta primera fase?
4. ¿Cómo se reflejarán los cambios de rol/permisos en el frontend autenticado?
5. ¿Qué acciones deben reforzarse inmediatamente desde backend/Functions?
6. ¿Cómo se auditarán altas, cambios y desactivaciones de roles?

---

## 7. Dependencia arquitectónica obligatoria

Este task debe obedecer estas reglas ya definidas:

- **Appwrite Auth** = identidad principal
- **users_profile** = extensión operativa
- **labels de Appwrite** = segmentación principal de acceso
- **roles y permisos finos** = modelo propio del sistema

Los labels no deben sustituir la matriz de permisos finos. Deben coexistir con ella.

---

## 8. Alcance funcional detallado

### 8.1 Listado de roles
Debe existir una vista de tabla o lista con como mínimo:

- nombre
- código
- descripción breve
- estatus
- número de permisos asignados si es viable
- fecha de creación
- acciones disponibles según permisos del usuario autenticado

### 8.2 Detalle de rol
Debe existir una vista o panel de detalle que permita ver:

- datos generales del rol
- permisos asignados
- módulos cubiertos
- estatus
- auditoría básica relacionada si es viable en esta fase

### 8.3 Crear rol
Debe existir un flujo para dar de alta un nuevo rol funcional.

Debe contemplar:
- nombre
- código único
- descripción
- estado inicial
- asignación inicial de permisos

### 8.4 Editar rol
Debe permitirse editar:

- nombre
- código si aplica y si no rompe referencias
- descripción
- permisos asignados
- estado

### 8.5 Activar/desactivar rol
No debe borrarse físicamente un rol como flujo normal.
Se debe privilegiar:

- deshabilitar el rol
- impedir su asignación futura si está deshabilitado
- conservar historial

### 8.6 Catálogo de permisos
Debe existir una representación clara del catálogo de permisos del sistema, agrupado idealmente por módulo.

Ejemplos esperados:
- users.view
- users.create
- users.update
- users.disable
- roles.view
- roles.create
- roles.update
- permissions.assign
- materials.view
- materials.create
- materials.update
- materials.disable
- materials.export
- vouchers.view
- vouchers.create
- tickets.print
- tickets.reprint
- weights.register
- exit.validate
- exit.reject
- reports.view
- reports.export
- audit.view

Claude debe ajustar el catálogo a la arquitectura ya definida y al estado real del proyecto.

### 8.7 Asignación de permisos a roles
Debe existir una UI clara para:

- ver permisos asignados
- agregar permisos
- quitar permisos
- agruparlos por módulo o categoría

### 8.8 Integración con usuarios internos
Debe quedar resuelto cómo se vincula el rol con cada usuario interno, respetando el trabajo hecho en Task 04.

### 8.9 Seguridad del módulo
Este módulo debe quedar protegido para que solo usuarios con permisos apropiados puedan acceder y modificarlo.

---

## 9. Reglas de negocio específicas

1. Los roles no deben borrarse físicamente como flujo normal.
2. Un rol debe tener un código único y estable.
3. Los permisos deben definirse por módulo y acción.
4. No todos los usuarios pueden ver o modificar roles.
5. No todos los usuarios pueden asignar permisos.
6. Los cambios de seguridad deben quedar auditados.
7. Un rol deshabilitado no debe poder asignarse a nuevos usuarios.
8. Si un rol cambia, el sistema debe poder reflejar el cambio en la experiencia del usuario sin rehacer la arquitectura.
9. Los permisos críticos deben reforzarse también desde backend/Functions cuando aplique.

---

## 10. Entidades involucradas

### `roles`
Como catálogo principal de roles funcionales.

### `permissions_catalog`
Como catálogo de permisos del sistema.

### `role_permissions`
Como relación entre rol y permiso.

### `users_profile`
Para vincular usuarios con rol principal o equivalente.

### `audit_logs`
Para registrar acciones sensibles.

Opcionalmente, según la implementación:
- snapshot o helper de permisos efectivos si se decide cachear lectura en frontend

---

## 11. Datos mínimos esperados en la gestión de roles

Claude debe ajustarlo a la arquitectura real, pero como mínimo se espera manejar:

### Datos de `roles`
- name
- code
- description
- enabled/status
- isSystem si aplica
- createdBy
- updatedBy

### Datos de `permissions_catalog`
- module
- action
- code
- description
- enabled

### Datos de `role_permissions`
- roleId
- permissionCode o permissionId
- enabled

---

## 12. Operaciones que debe cubrir el módulo

### 12.1 Ver roles
- listado
- detalle
- filtros mínimos si es viable

### 12.2 Crear rol
- alta de rol
- asignación inicial de permisos

### 12.3 Editar rol
- edición de datos generales
- edición de permisos asignados

### 12.4 Deshabilitar rol
- impedir asignación futura
- conservar historial

### 12.5 Consultar permisos efectivos
- vista clara de permisos asignados por módulo/acción

---

## 13. Seguridad esperada del módulo

Claude debe implementar o dejar lista la lógica para que:

- solo usuarios con permiso `roles.view` vean el módulo
- solo usuarios con permiso `roles.create` creen roles
- solo usuarios con permiso `roles.update` editen roles
- solo usuarios con permiso `permissions.assign` asignen permisos a roles
- solo usuarios con permiso suficiente puedan deshabilitar/reactivar roles

Además, las acciones sensibles no deben depender solo del frontend.
Si la modificación de roles/permisos requiere mayor seguridad, debe resolverse mediante Function o capa backend apropiada.

---

## 14. Consideración técnica importante

Claude debe evaluar cuidadosamente si ciertas operaciones deben hacerse directamente desde frontend o mediante Functions, especialmente:

- creación y edición de roles si impactan seguridad global
- asignación de permisos
- cambios que afecten acceso inmediato del sistema

La decisión debe priorizar seguridad, compatibilidad con Appwrite 1.8.1 y mantenibilidad.

---

## 15. Interfaz esperada

El módulo debe seguir la línea visual definida en la base del proyecto:

- interfaz profesional
- clara
- administrativa
- rápida de usar
- tabla/listado limpio
- agrupación visual de permisos por módulo
- formularios consistentes
- badges de estado
- feedback visual de loading/error/success

La asignación de permisos debe ser comprensible y no caótica.

---

## 16. Criterios de aceptación

Este task se considera logrado cuando:

1. existe módulo accesible solo por usuarios autorizados
2. existe listado funcional de roles
3. existe detalle funcional de rol
4. existe creación de rol
5. existe edición de rol
6. existe catálogo visible de permisos
7. existe asignación funcional de permisos a roles
8. la UI respeta permisos básicos de seguridad
9. las acciones sensibles quedan auditadas
10. la base queda lista para conectar permisos con módulos de negocio futuros sin rehacer la arquitectura

---

## 17. Validaciones funcionales esperadas

Claude debe contemplar o demostrar que:

- un usuario sin permiso no entra al módulo
- un usuario con `roles.view` puede consultar roles
- un usuario con `roles.create` puede crear rol
- un usuario con `permissions.assign` puede modificar permisos asignados
- un rol deshabilitado no se asigna a nuevos usuarios
- los cambios de rol/permisos generan auditoría
- los permisos efectivos pueden reflejarse en el frontend autenticado

---

## 18. Riesgos del task

1. diseñar un catálogo de permisos inconsistente entre módulos
2. sobrecomplicar la matriz de permisos demasiado pronto
3. dejar la asignación de permisos solo en frontend
4. no auditar cambios de seguridad
5. no dejar clara la relación entre rol y usuario

Claude debe resolver estos puntos con criterio práctico y escalable.

---

## 19. Dependencias previas

Depende de:
- Task 01: arquitectura de identidad, roles y permisos
- Task 02: base técnica del proyecto
- Task 03: autenticación, bootstrap y carga de `users_profile`
- Task 04: módulo de usuarios internos

---

## 20. Dependencias posteriores

Este task habilita directamente:
- protección fina de CRUDs de negocio
- control de acceso real por módulo/acción
- materiales, clientes, vouchers, tickets y reportes con enforcement más preciso

---

## 21. Entregables esperados

Claude debe entregar:

1. módulo de roles funcional
2. listado de roles
3. formulario de alta/edición
4. vista clara de permisos
5. asignación de permisos a roles
6. integración base con usuarios internos
7. auditoría básica de acciones sensibles
8. nota técnica breve sobre decisiones clave

---

## 22. Restricciones del task

- no usar TypeScript
- no avanzar aún a materiales, vouchers, tickets, báscula, mostrador o reportes
- no romper la arquitectura definida en Task 01
- no dejar seguridad solo del lado frontend
- no borrar físicamente roles como flujo normal

---

## 23. Prompt sugerido para Claude Code — Task 05

```text
Necesito que ejecutes exclusivamente el Task 05 de este proyecto. No avances todavía a materiales, clientes, vouchers, tickets, báscula, mostrador, reportes ni sincronización offline.

CONTEXTO
Estoy construyendo un sistema operativo y administrativo para una mina de materiales usando:
- Appwrite self-hosted 1.8.1 en https://appwrite.racoondevs.com
- Appwrite CLI
- MCP appwrite-api
- MCP appwrite-docs
- frontend con React + Vite + JavaScript + TailwindCSS 4.1 + Radix UI + vite-plugin-pwa + framer-motion

La arquitectura del proyecto ya definió que:
- Appwrite Auth = identidad principal
- users_profile = extensión operativa
- labels de Appwrite = segmentación principal
- roles/permisos finos = modelo propio del sistema

Además, ya existe o debe existir la base técnica, la autenticación/bootstrapping y el módulo de usuarios internos de los tasks previos.

OBJETIVO DEL TASK
Implementar el módulo de roles y permisos para que personal autorizado pueda crear, consultar, editar y deshabilitar roles, así como asignar permisos por módulo/acción, respetando la arquitectura del proyecto.

LO QUE QUIERO QUE HAGAS
1. Revisa la arquitectura ya definida para roles y permisos.
2. Implementa el módulo de roles respetando esa arquitectura.
3. Crea listado de roles.
4. Crea vista de detalle de rol.
5. Implementa alta de rol.
6. Implementa edición de rol.
7. Implementa deshabilitación lógica de rol.
8. Implementa o integra el catálogo de permisos del sistema.
9. Implementa la asignación de permisos a roles.
10. Vincula correctamente el rol con usuarios internos según la estrategia vigente.
11. Protege el módulo según permisos como `roles.view`, `roles.create`, `roles.update`, `permissions.assign` y los que correspondan.
12. Registra auditoría básica de acciones sensibles.
13. Si ciertas operaciones deben hacerse mediante Function por seguridad, hazlo así y documenta brevemente la razón.

REGLAS IMPORTANTES
- No uses TypeScript.
- No avances todavía a otros módulos de negocio.
- No dejes seguridad solo del lado frontend.
- No borres físicamente roles como flujo normal.
- Mantén compatibilidad con Appwrite 1.8.1 validando decisiones con `appwrite-docs` y `appwrite-api` cuando sea necesario.
- Mantén compatibilidad con el módulo de usuarios internos ya construido.

CRITERIOS DE ACEPTACIÓN
Tu resultado debe dejar:
- módulo protegido de roles
- listado funcional
- detalle funcional
- alta funcional
- edición funcional
- deshabilitación lógica
- catálogo claro de permisos
- asignación funcional de permisos a roles
- auditoría básica
- base lista para proteger módulos de negocio futuros

ENTREGABLES
Entrégame:
1. módulo de roles
2. listado
3. formulario de alta/edición
4. vista clara de permisos
5. asignación de permisos a roles
6. integración base con usuarios internos
7. auditoría básica
8. breve nota técnica de decisiones clave

No sigas al siguiente task. Quédate solo en Task 05.
```


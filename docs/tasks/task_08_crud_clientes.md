# Task 08 — CRUD de clientes

## 1. Nombre del task

**Task 08 — Implementar el CRUD de clientes**

---

## 2. Objetivo

Construir el módulo administrativo para crear, consultar, editar, activar y desactivar clientes del sistema, contemplando que puedan ser personas o empresas, y dejando la base lista para vincularlos posteriormente con vouchers, tickets, ventas en mostrador, choferes, camiones y reportes.

Este task debe resolver la gestión del cliente comercial sin confundirlo todavía con relaciones más complejas como transportistas, choferes o camiones, aunque sí debe dejar la estructura preparada para esas asociaciones futuras.

---

## 3. Alcance

Incluye:

- listado de clientes
- vista de detalle de cliente
- creación de cliente
- edición de cliente
- activación/desactivación lógica de cliente
- soporte para cliente tipo persona o empresa
- datos comerciales y de contacto básicos
- validaciones básicas de consistencia y unicidad
- integración con permisos del sistema
- auditoría de acciones sensibles relacionadas con clientes

No incluye todavía:

- CRUD completo de choferes
- CRUD completo de camiones
- relaciones completas cliente-chofer o cliente-camión
- módulo específico de transportistas si luego se decide separarlo
- integración completa con vouchers, tickets, báscula o mostrador
- reportes funcionales
- sincronización offline

---

## 4. Problema que resuelve

Permite gestionar adecuadamente a los clientes que compran material, evitando depender de nombres sueltos o capturas repetidas en los flujos operativos. Deja un catálogo limpio y reutilizable para identificar a quién se le vende, sin mezclar todavía toda la logística de transporte.

---

## 5. Logro esperado

Al terminar este task debe existir un módulo funcional donde un usuario autorizado pueda:

1. ver listado de clientes
2. consultar detalle de un cliente
3. crear nuevos clientes
4. editar clientes existentes
5. activar o desactivar clientes
6. distinguir entre cliente persona y cliente empresa
7. dejar auditadas las acciones sensibles
8. dejar el catálogo listo para ser consumido por vouchers, tickets y reportes posteriores

---

## 6. Preguntas que este task debe cerrar

1. ¿Qué datos mínimos necesita un cliente en esta operación?
2. ¿Cómo se distinguirá entre persona y empresa?
3. ¿Qué campos deben ser obligatorios según el tipo de cliente?
4. ¿Cómo se manejará la unicidad de nombre, email, teléfono o identificador fiscal si aplica?
5. ¿Cómo se desactiva un cliente sin perder historial futuro?
6. ¿Qué permisos controlarán el acceso a este módulo?
7. ¿Qué datos deben quedar listos para futuras asociaciones con choferes y camiones?

---

## 7. Dependencia arquitectónica obligatoria

Este task debe obedecer estas reglas ya definidas:

- el acceso al módulo debe respetar roles y permisos del sistema
- el CRUD debe apoyarse en la base técnica y auth ya construidas
- la eliminación debe ser lógica, no destructiva, como política preferente
- los cambios sensibles deben quedar auditados
- el modelo debe dejar abierta la posibilidad de relaciones futuras con choferes, camiones y operaciones

---

## 8. Alcance funcional detallado

### 8.1 Listado de clientes
Debe existir una vista de tabla o lista con como mínimo:

- nombre o razón social
- tipo de cliente (persona/empresa)
- contacto principal si aplica
- teléfono o email principal si aplica
- estado
- fecha de creación
- acciones disponibles según permisos

### 8.2 Detalle de cliente
Debe existir una vista o panel de detalle que permita ver:

- tipo de cliente
- nombre completo o razón social
- datos de contacto
- observaciones
- estado
- metadata relevante si aplica
- auditoría básica relacionada si es viable en esta fase

### 8.3 Crear cliente
Debe existir un flujo para dar de alta un nuevo cliente.

Debe contemplar como mínimo:
- tipo de cliente
- nombre o razón social
- nombre comercial opcional si aplica
- persona de contacto opcional si aplica
- teléfono
- email
- dirección opcional
- identificador fiscal opcional si aplica
- observaciones opcionales
- estado inicial

### 8.4 Editar cliente
Debe permitirse editar:

- tipo de cliente si no rompe consistencia futura
- nombre o razón social
- datos de contacto
- observaciones
- estado

### 8.5 Activar/desactivar cliente
No debe borrarse físicamente un cliente como flujo normal.
Se debe privilegiar:

- deshabilitarlo
- impedir su selección futura en nuevas operaciones activas si está deshabilitado
- conservar historial futuro en operaciones relacionadas

### 8.6 Seguridad del módulo
Este módulo debe quedar protegido para que solo usuarios con permisos apropiados puedan acceder y modificarlo.

---

## 9. Reglas de negocio específicas

1. Un cliente puede ser persona o empresa.
2. Un cliente no debe borrarse físicamente como flujo normal.
3. Un cliente deshabilitado no debe poder seleccionarse en nuevas operaciones activas.
4. El catálogo de clientes debe ser reutilizable por vouchers, tickets, mostrador y reportes.
5. Las relaciones más complejas con choferes y camiones se resolverán en tasks posteriores, pero este módulo debe dejar base limpia para ello.
6. Los cambios de creación, edición y desactivación deben quedar auditados.
7. El acceso al módulo debe respetar permisos del sistema.

---

## 10. Entidades involucradas

### `clients`
Como catálogo principal de clientes.

### `audit_logs`
Para registrar acciones sensibles.

Opcionalmente, según la implementación:
- estructuras futuras de relación con `drivers` y `trucks`

---

## 11. Datos mínimos esperados en la gestión de clientes

Claude debe ajustar esto a la arquitectura real, pero como mínimo se espera manejar:

- type (`person` / `company` o equivalente)
- legalName o fullName
- displayName o tradeName si aplica
- contactName
- phone
- email
- address
- taxId opcional
- notes
- enabled/status
- createdBy
- updatedBy

Opcionalmente, si aporta valor:
- city
- state
- tags
- billingNotes

---

## 12. Operaciones que debe cubrir el módulo

### 12.1 Ver clientes
- listado
- detalle
- filtros mínimos si es viable
- búsqueda básica si es viable

### 12.2 Crear cliente
- alta de cliente
- validaciones mínimas de consistencia
- soporte correcto para persona/empresa

### 12.3 Editar cliente
- edición de datos generales
- control de cambios sensibles

### 12.4 Deshabilitar cliente
- impedir uso futuro sin destruir historial

### 12.5 Reactivar cliente
- recomendable dejar contemplado si se deshabilitó por error o cambio operativo

---

## 13. Seguridad esperada del módulo

Claude debe implementar o dejar lista la lógica para que:

- solo usuarios con permiso `catalogs.view` o permiso específico equivalente vean el módulo
- solo usuarios con permiso `catalogs.create` o permiso específico equivalente creen clientes
- solo usuarios con permiso `catalogs.update` o permiso específico equivalente editen clientes
- solo usuarios con permiso `catalogs.disable` o permiso específico equivalente deshabiliten/reactiven clientes

Si el proyecto ya contempla permisos más granulares para clientes, Claude puede usarlos, siempre que mantenga coherencia con la matriz de permisos existente.

---

## 14. Consideración técnica importante

Claude debe evaluar si basta con acceso directo a la colección o si ciertas operaciones deben pasar por Function, especialmente si el proyecto ya centraliza auditoría y validaciones críticas en backend.

La decisión debe priorizar:

- seguridad
- compatibilidad con Appwrite 1.8.1
- mantenibilidad
- consistencia con módulos anteriores

---

## 15. Interfaz esperada

El módulo debe seguir la línea visual definida en la base del proyecto:

- interfaz profesional
- clara
- administrativa
- tabla/listado limpio
- formulario consistente
- distinción clara entre persona y empresa
- badges de estado
- feedback visual de loading/error/success
- experiencia sobria y rápida

---

## 16. Criterios de aceptación

Este task se considera logrado cuando:

1. existe módulo accesible solo por usuarios autorizados
2. existe listado funcional de clientes
3. existe detalle funcional de cliente
4. existe creación de cliente
5. existe edición de cliente
6. existe activación/desactivación lógica
7. existe soporte correcto para cliente persona o empresa
8. la UI respeta permisos básicos
9. las acciones sensibles quedan auditadas
10. la base queda lista para que choferes, camiones y vouchers consuman el catálogo sin rehacerlo

---

## 17. Validaciones funcionales esperadas

Claude debe contemplar o demostrar que:

- un usuario sin permiso no entra al módulo
- un usuario autorizado puede ver el listado
- un cliente se crea con datos consistentes
- el tipo persona/empresa afecta correctamente el formulario si aplica
- un cliente deshabilitado cambia correctamente su estado
- la edición actualiza correctamente la entidad
- las acciones sensibles generan auditoría
- el cliente puede ser consumido después por vouchers/tickets sin rehacer el modelo

---

## 18. Riesgos del task

1. mezclar demasiado pronto al cliente con la logística de transporte
2. no distinguir bien persona vs empresa
3. permitir eliminación destructiva innecesaria
4. no auditar cambios del catálogo
5. sobrecargar el cliente con campos que todavía no se necesitan

Claude debe mantener el foco estricto en clientes como catálogo comercial.

---

## 19. Dependencias previas

Depende de:
- Task 01: arquitectura de identidad, roles y permisos
- Task 02: base técnica del proyecto
- Task 03: autenticación, bootstrap y carga de `users_profile`
- Task 04: módulo de usuarios internos
- Task 05: módulo de roles y permisos
- Task 06: CRUD de categorías de materiales
- Task 07: CRUD de materiales con imagen de referencia

---

## 20. Dependencias posteriores

Este task habilita directamente:
- Task 09: CRUD de choferes
- Task 10: CRUD de camiones
- Task 11: CRUD de plantas/orígenes
- futuros vouchers, tickets, ventas en mostrador y reportes por cliente

---

## 21. Entregables esperados

Claude debe entregar:

1. módulo funcional de clientes
2. listado
3. formulario de alta/edición
4. detalle de cliente
5. deshabilitación/reactivación lógica
6. auditoría básica
7. nota técnica breve sobre decisiones clave

---

## 22. Restricciones del task

- no usar TypeScript
- no avanzar aún a choferes, camiones, vouchers, tickets, báscula, mostrador o reportes
- no mezclar este task con la logística completa de transporte
- no dejar seguridad solo del lado frontend
- no borrar físicamente clientes como flujo normal

---

## 23. Prompt sugerido para Claude Code — Task 08

```text
Necesito que ejecutes exclusivamente el Task 08 de este proyecto. No avances todavía a choferes, camiones, plantas, vouchers, tickets, báscula, mostrador, reportes o sincronización offline.

CONTEXTO
Estoy construyendo un sistema operativo y administrativo para una mina de materiales usando:
- Appwrite self-hosted 1.8.1 en https://appwrite.racoondevs.com
- Appwrite CLI
- MCP appwrite-api
- MCP appwrite-docs
- frontend con React + Vite + JavaScript + TailwindCSS 4.1 + Radix UI + vite-plugin-pwa + framer-motion

Ya existen o deben existir:
- base técnica del proyecto
- autenticación y bootstrap de sesión
- módulo de usuarios internos
- módulo de roles y permisos
- CRUD de categorías de materiales
- CRUD de materiales con imagen de referencia

OBJETIVO DEL TASK
Implementar el CRUD de clientes para que el sistema tenga un catálogo comercial reutilizable, contemplando clientes tipo persona o empresa y dejando la base lista para operaciones posteriores.

LO QUE QUIERO QUE HAGAS
1. Implementa el módulo de clientes.
2. Crea listado de clientes.
3. Crea vista de detalle de cliente.
4. Implementa alta de cliente.
5. Implementa edición de cliente.
6. Implementa activación/desactivación lógica de cliente.
7. Soporta cliente tipo persona o empresa.
8. Protege el módulo según permisos del sistema como `catalogs.view`, `catalogs.create`, `catalogs.update`, `catalogs.disable` o los equivalentes definidos.
9. Registra auditoría básica de acciones sensibles.
10. Mantén la estructura lista para que choferes, camiones, vouchers y reportes consuman este catálogo sin rehacerlo.
11. Si ciertas operaciones deben pasar por Function por seguridad o consistencia, hazlo así y documenta brevemente la razón.

REGLAS IMPORTANTES
- No uses TypeScript.
- No avances todavía a otros módulos de negocio fuera del catálogo de clientes.
- No mezcles este task con la logística completa de transporte.
- No dejes seguridad solo del lado frontend.
- No borres físicamente clientes como flujo normal.
- Mantén compatibilidad con Appwrite 1.8.1 y con la arquitectura de permisos ya definida.

CRITERIOS DE ACEPTACIÓN
Tu resultado debe dejar:
- módulo protegido de clientes
- listado funcional
- detalle funcional
- alta funcional
- edición funcional
- deshabilitación/reactivación lógica
- soporte correcto para persona/empresa
- auditoría básica
- base lista para módulos posteriores

ENTREGABLES
Entrégame:
1. módulo de clientes
2. listado
3. formulario de alta/edición
4. detalle
5. deshabilitación/reactivación lógica
6. auditoría básica
7. breve nota técnica de decisiones clave

No sigas al siguiente task. Quédate solo en Task 08.
```


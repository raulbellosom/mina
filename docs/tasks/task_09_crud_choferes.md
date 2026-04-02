# Task 09 — CRUD de choferes

## 1. Nombre del task

**Task 09 — Implementar el CRUD de choferes**

---

## 2. Objetivo

Construir el módulo administrativo para crear, consultar, editar, activar y desactivar choferes del sistema, de forma que puedan ser reutilizados posteriormente en vouchers, tickets, báscula, venta en mostrador, validación de salida y reportes.

Este task debe tratar al chofer como una entidad operativa propia, separada del cliente y del camión, aunque dejando preparada la base para relaciones futuras con ambos.

---

## 3. Alcance

Incluye:

- listado de choferes
- vista de detalle de chofer
- creación de chofer
- edición de chofer
- activación/desactivación lógica de chofer
- datos personales y operativos básicos
- soporte para relación opcional futura con cliente/empresa
- soporte para relación opcional futura con camión principal
- validaciones básicas de consistencia y unicidad
- integración con permisos del sistema
- auditoría de acciones sensibles relacionadas con choferes

No incluye todavía:

- CRUD completo de camiones
- relación completa y administrable chofer-camión
- módulo independiente de transportistas
- integración completa con vouchers, tickets, báscula o mostrador
- reportes funcionales
- sincronización offline

---

## 4. Problema que resuelve

Permite gestionar adecuadamente a los operadores o choferes que mueven los camiones dentro de la operación, evitando capturas repetidas o improvisadas en los flujos operativos. Deja un catálogo limpio y reutilizable para identificar quién conduce o presenta el vehículo en cada salida.

---

## 5. Logro esperado

Al terminar este task debe existir un módulo funcional donde un usuario autorizado pueda:

1. ver listado de choferes
2. consultar detalle de un chofer
3. crear nuevos choferes
4. editar choferes existentes
5. activar o desactivar choferes
6. dejar preparada la referencia futura a cliente/empresa y camión principal
7. dejar auditadas las acciones sensibles
8. dejar el catálogo listo para ser consumido por vouchers, tickets y flujos operativos posteriores

---

## 6. Preguntas que este task debe cerrar

1. ¿Qué datos mínimos necesita un chofer en esta operación?
2. ¿Qué identificadores deben considerarse relevantes para evitar duplicados?
3. ¿Debe existir relación opcional con un cliente/empresa desde esta fase o solo dejarse preparada?
4. ¿Debe existir referencia a camión principal desde esta fase o solo dejarse preparada?
5. ¿Cómo se desactiva un chofer sin perder historial futuro?
6. ¿Qué permisos controlarán el acceso a este módulo?
7. ¿Qué datos deben quedar listos para vincular al chofer con operaciones futuras?

---

## 7. Dependencia arquitectónica obligatoria

Este task debe obedecer estas reglas ya definidas:

- el acceso al módulo debe respetar roles y permisos del sistema
- el CRUD debe apoyarse en la base técnica y auth ya construidas
- la eliminación debe ser lógica, no destructiva, como política preferente
- los cambios sensibles deben quedar auditados
- el modelo debe dejar abierta la posibilidad de relaciones futuras con clientes, camiones y operaciones

---

## 8. Alcance funcional detallado

### 8.1 Listado de choferes
Debe existir una vista de tabla o lista con como mínimo:

- nombre completo
- teléfono principal si aplica
- licencia o identificador operativo si aplica
- cliente/empresa relacionado si aplica o está disponible
- estado
- fecha de creación
- acciones disponibles según permisos

### 8.2 Detalle de chofer
Debe existir una vista o panel de detalle que permita ver:

- nombre completo
- datos de contacto
- datos operativos relevantes
- cliente/empresa relacionado si aplica
- camión principal de referencia si aplica
- observaciones
- estado
- metadata relevante si aplica
- auditoría básica relacionada si es viable en esta fase

### 8.3 Crear chofer
Debe existir un flujo para dar de alta un nuevo chofer.

Debe contemplar como mínimo:
- nombre(s)
- apellidos
- nombre completo derivado o calculado si aplica
- teléfono
- email opcional
- número de licencia o identificador operativo opcional
- cliente/empresa de referencia opcional si la arquitectura ya lo soporta
- observaciones opcionales
- estado inicial

### 8.4 Editar chofer
Debe permitirse editar:

- nombres y apellidos
- datos de contacto
- licencia o identificador operativo
- cliente/empresa de referencia si aplica
- observaciones
- estado

### 8.5 Activar/desactivar chofer
No debe borrarse físicamente un chofer como flujo normal.
Se debe privilegiar:

- deshabilitarlo
- impedir su selección futura en nuevas operaciones activas si está deshabilitado
- conservar historial futuro en operaciones relacionadas

### 8.6 Seguridad del módulo
Este módulo debe quedar protegido para que solo usuarios con permisos apropiados puedan acceder y modificarlo.

---

## 9. Reglas de negocio específicas

1. Un chofer es una entidad operativa distinta del cliente y del camión.
2. Un chofer normalmente puede tener un camión principal de referencia, pero puede operar otros camiones en el futuro.
3. Un chofer puede estar relacionado con una empresa o cliente, pero no debe forzarse una relación rígida si todavía no está cerrada la arquitectura completa.
4. Un chofer no debe borrarse físicamente como flujo normal.
5. Un chofer deshabilitado no debe poder seleccionarse en nuevas operaciones activas.
6. El catálogo de choferes debe ser reutilizable por vouchers, tickets, mostrador, báscula y reportes.
7. Los cambios de creación, edición y desactivación deben quedar auditados.
8. El acceso al módulo debe respetar permisos del sistema.

---

## 10. Entidades involucradas

### `drivers`
Como catálogo principal de choferes.

### `clients`
Como referencia opcional futura si se decide ligar un chofer a un cliente/empresa desde esta fase.

### `audit_logs`
Para registrar acciones sensibles.

Opcionalmente, según la implementación:
- referencias futuras con `trucks`

---

## 11. Datos mínimos esperados en la gestión de choferes

Claude debe ajustar esto a la arquitectura real, pero como mínimo se espera manejar:

- firstName
- lastName
- fullName
- phone
- email
- licenseNumber o identificador operativo equivalente
- clientId opcional
- primaryTruckReference opcional o campo equivalente si solo se deja como dato temporal
- notes
- enabled/status
- createdBy
- updatedBy

Opcionalmente, si aporta valor:
- alternatePhone
- governmentId
- address
- tags

---

## 12. Operaciones que debe cubrir el módulo

### 12.1 Ver choferes
- listado
- detalle
- filtros mínimos si es viable
- búsqueda básica si es viable

### 12.2 Crear chofer
- alta de chofer
- validaciones mínimas de consistencia
- soporte correcto para relaciones opcionales futuras

### 12.3 Editar chofer
- edición de datos generales
- control de cambios sensibles

### 12.4 Deshabilitar chofer
- impedir uso futuro sin destruir historial

### 12.5 Reactivar chofer
- recomendable dejar contemplado si se deshabilitó por error o cambio operativo

---

## 13. Seguridad esperada del módulo

Claude debe implementar o dejar lista la lógica para que:

- solo usuarios con permiso `catalogs.view` o permiso específico equivalente vean el módulo
- solo usuarios con permiso `catalogs.create` o permiso específico equivalente creen choferes
- solo usuarios con permiso `catalogs.update` o permiso específico equivalente editen choferes
- solo usuarios con permiso `catalogs.disable` o permiso específico equivalente deshabiliten/reactiven choferes

Si el proyecto ya contempla permisos más granulares para choferes, Claude puede usarlos, siempre que mantenga coherencia con la matriz de permisos existente.

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
- soporte claro para datos operativos
- badges de estado
- feedback visual de loading/error/success
- experiencia sobria y rápida

---

## 16. Criterios de aceptación

Este task se considera logrado cuando:

1. existe módulo accesible solo por usuarios autorizados
2. existe listado funcional de choferes
3. existe detalle funcional de chofer
4. existe creación de chofer
5. existe edición de chofer
6. existe activación/desactivación lógica
7. existe soporte correcto para relaciones opcionales futuras con cliente y camión
8. la UI respeta permisos básicos
9. las acciones sensibles quedan auditadas
10. la base queda lista para que camiones, vouchers y tickets consuman el catálogo sin rehacerlo

---

## 17. Validaciones funcionales esperadas

Claude debe contemplar o demostrar que:

- un usuario sin permiso no entra al módulo
- un usuario autorizado puede ver el listado
- un chofer se crea con datos consistentes
- un chofer deshabilitado cambia correctamente su estado
- la edición actualiza correctamente la entidad
- las acciones sensibles generan auditoría
- el chofer puede ser consumido después por vouchers/tickets sin rehacer el modelo

---

## 18. Riesgos del task

1. mezclar demasiado pronto al chofer con toda la lógica de camiones o clientes
2. no prever relación flexible con camión futuro
3. permitir eliminación destructiva innecesaria
4. no auditar cambios del catálogo
5. sobrecargar el chofer con campos todavía no necesarios

Claude debe mantener el foco estricto en choferes como catálogo operativo.

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
- Task 08: CRUD de clientes

---

## 20. Dependencias posteriores

Este task habilita directamente:
- Task 10: CRUD de camiones
- Task 11: CRUD de plantas/orígenes
- futuros vouchers, tickets, validaciones de salida y reportes por chofer

---

## 21. Entregables esperados

Claude debe entregar:

1. módulo funcional de choferes
2. listado
3. formulario de alta/edición
4. detalle de chofer
5. deshabilitación/reactivación lógica
6. auditoría básica
7. nota técnica breve sobre decisiones clave

---

## 22. Restricciones del task

- no usar TypeScript
- no avanzar aún a camiones, vouchers, tickets, báscula, mostrador o reportes
- no mezclar este task con la logística completa de transporte
- no dejar seguridad solo del lado frontend
- no borrar físicamente choferes como flujo normal

---

## 23. Prompt sugerido para Claude Code — Task 09

```text
Necesito que ejecutes exclusivamente el Task 09 de este proyecto. No avances todavía a camiones, plantas, vouchers, tickets, báscula, mostrador, reportes o sincronización offline.

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
- CRUD de clientes

OBJETIVO DEL TASK
Implementar el CRUD de choferes para que el sistema tenga un catálogo operativo reutilizable, dejando la base lista para relaciones futuras con clientes, camiones y operaciones.

LO QUE QUIERO QUE HAGAS
1. Implementa el módulo de choferes.
2. Crea listado de choferes.
3. Crea vista de detalle de chofer.
4. Implementa alta de chofer.
5. Implementa edición de chofer.
6. Implementa activación/desactivación lógica de chofer.
7. Deja preparada la estructura para referencias futuras a cliente/empresa y camión principal, sin sobrecomplicar el modelo.
8. Protege el módulo según permisos del sistema como `catalogs.view`, `catalogs.create`, `catalogs.update`, `catalogs.disable` o los equivalentes definidos.
9. Registra auditoría básica de acciones sensibles.
10. Mantén la estructura lista para que camiones, vouchers, tickets y reportes consuman este catálogo sin rehacerlo.
11. Si ciertas operaciones deben pasar por Function por seguridad o consistencia, hazlo así y documenta brevemente la razón.

REGLAS IMPORTANTES
- No uses TypeScript.
- No avances todavía a otros módulos de negocio fuera del catálogo de choferes.
- No mezcles este task con la logística completa de transporte.
- No dejes seguridad solo del lado frontend.
- No borres físicamente choferes como flujo normal.
- Mantén compatibilidad con Appwrite 1.8.1 y con la arquitectura de permisos ya definida.

CRITERIOS DE ACEPTACIÓN
Tu resultado debe dejar:
- módulo protegido de choferes
- listado funcional
- detalle funcional
- alta funcional
- edición funcional
- deshabilitación/reactivación lógica
- base preparada para relaciones futuras con cliente y camión
- auditoría básica
- base lista para módulos posteriores

ENTREGABLES
Entrégame:
1. módulo de choferes
2. listado
3. formulario de alta/edición
4. detalle
5. deshabilitación/reactivación lógica
6. auditoría básica
7. breve nota técnica de decisiones clave

No sigas al siguiente task. Quédate solo en Task 09.
```


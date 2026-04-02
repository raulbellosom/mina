# Task 13 — Tickets operativos con QR

## 1. Nombre del task

**Task 13 — Implementar la generación y gestión de tickets operativos con QR**

---

## 2. Objetivo

Construir el módulo o capa funcional que permita generar tickets operativos con QR a partir de vouchers válidos, manteniendo una separación clara entre la autorización comercial inicial y el documento operativo que acompañará al chofer durante carga, validación y salida.

Este task debe definir el ticket como la pieza operativa central que:

- se emite desde un voucher válido
- contiene la información necesaria para la operación
- incorpora un QR único
- puede ser consumido por impresión, báscula, mostrador y validación de salida en tasks posteriores

---

## 3. Alcance

Incluye:

- definición del modelo de ticket operativo
- generación de ticket a partir de voucher válido
- asignación de identificador único del ticket
- generación de QR para el ticket
- listado de tickets
- vista de detalle de ticket
- estados base del ticket
- reglas de emisión y no duplicidad básica
- vínculo ticket ↔ voucher
- integración con permisos del sistema
- auditoría de acciones sensibles relacionadas con tickets

No incluye todavía:

- impresión completa del ticket
- reimpresión controlada completa
- validación de salida escaneando QR
- flujo completo de mostrador
- flujo completo de báscula
- reportes funcionales finales
- sincronización offline completa

---

## 4. Problema que resuelve

Permite convertir una referencia comercial válida en un documento operativo utilizable en campo. Sin esta separación, el sistema mezclaría autorización comercial, documento físico y validación final, dificultando trazabilidad, impresión, control de fraude y auditoría.

---

## 5. Logro esperado

Al terminar este task debe existir una solución funcional donde un usuario autorizado pueda:

1. generar un ticket a partir de un voucher válido
2. consultar listado de tickets
3. consultar detalle de un ticket
4. ver el QR del ticket
5. identificar el estado actual del ticket
6. impedir emisión indebida desde vouchers inválidos o cancelados
7. dejar auditadas las acciones sensibles
8. dejar la base lista para impresión, mostrador, báscula y validación de salida

---

## 6. Preguntas que este task debe cerrar

1. ¿Qué campos mínimos debe tener un ticket operativo?
2. ¿Qué diferencia exacta se establecerá entre voucher y ticket en el modelo?
3. ¿Qué información debe resolver el QR y qué información no debe exponer directamente?
4. ¿Cómo se generará el identificador único del ticket?
5. ¿Cuándo puede emitirse un ticket y cuándo no?
6. ¿Se permitirá más de un ticket por voucher en esta fase o solo uno?
7. ¿Qué estados iniciales debe tener el ticket?
8. ¿Qué permisos controlarán el acceso a este módulo o a la emisión?

---

## 7. Dependencia arquitectónica obligatoria

Este task debe obedecer estas reglas ya definidas:

- el acceso al módulo debe respetar roles y permisos del sistema
- debe apoyarse en la base técnica y auth ya construidas
- debe consumir vouchers válidos como fuente de emisión
- el ticket debe ser una entidad separada del voucher y del weight log
- los cambios sensibles deben quedar auditados
- el QR debe diseñarse pensando en seguridad, trazabilidad y operación rápida

---

## 8. Definición operativa del ticket en este proyecto

Para este sistema, un **ticket operativo** es el documento derivado de un voucher válido que acompaña la operación física y sirve como base para:

- impresión de copias operativas
- guía para el operador de carga
- referencia para báscula
- validación por guardia o control de salida
- escaneo QR posterior

El ticket:
- no sustituye al voucher
- no sustituye el registro de pesos
- debe quedar vinculado al voucher de origen
- debe tener QR único
- debe representar un estado operativo trazable

---

## 9. Alcance funcional detallado

### 9.1 Generar ticket desde voucher
Debe existir un flujo o acción que permita emitir ticket cuando el voucher esté en estado válido.

Debe contemplar como mínimo:
- validación del voucher
- generación de identificador único
- creación de ticket vinculado al voucher
- generación del QR
- definición del estado inicial del ticket

### 9.2 Listado de tickets
Debe existir una vista de tabla o lista con como mínimo:

- folio o identificador del ticket
- voucher relacionado
- cliente
- material
- planta/origen
- estado
- fecha de emisión
- acciones disponibles según permisos

### 9.3 Detalle de ticket
Debe existir una vista o panel de detalle que permita ver:

- identificador del ticket
- voucher relacionado
- cliente
- chofer
- camión
- material
- planta/origen
- cantidad comercial
- unidad comercial
- QR
- estado
- metadata relevante si aplica
- auditoría básica relacionada si es viable en esta fase

### 9.4 Estado del ticket
Debe existir una estrategia clara de estados iniciales del ticket.

Claude debe validar y proponer una versión razonable, por ejemplo:
- generated
- ready_to_print
- printed
- loading
- pending_exit_validation
- completed
- cancelled
- blocked

No es obligatorio implementar toda la transición operativa completa en este task, pero sí dejar el modelo listo.

### 9.5 Reglas de emisión
Debe existir control para evitar emisión inválida.

Ejemplos:
- no emitir desde voucher cancelado
- no emitir desde voucher bloqueado
- no emitir si ya existe ticket activo y la política es 1:1

### 9.6 Seguridad del módulo
Este módulo debe quedar protegido para que solo usuarios con permisos apropiados puedan consultar o emitir tickets.

---

## 10. Reglas de negocio específicas

1. Un ticket operativo debe derivarse de un voucher válido.
2. Un ticket no es lo mismo que un voucher.
3. Un ticket debe tener identificador único.
4. Un ticket debe tener QR único.
5. El QR no debe exponer innecesariamente toda la data sensible en texto plano si puede evitarse.
6. Un voucher cancelado o bloqueado no debe generar ticket válido.
7. La política inicial recomendada es un ticket activo por voucher, salvo que exista una razón justificada para otra estrategia.
8. El ticket debe quedar listo para impresión, carga, validación y salida en tasks posteriores.
9. Los cambios de emisión, bloqueo o cancelación deben quedar auditados.
10. El acceso al módulo debe respetar permisos del sistema.

---

## 11. Estrategia sugerida para el QR

Claude debe evaluar e implementar una estrategia segura y operativa. Se sugiere evitar que el QR contenga toda la información sensible en texto plano.

Una dirección esperada sería:
- ticketId o publicId
- token corto, checksum o firma simple si aporta valor
- resolución posterior contra backend/Function o lookup seguro

El diseño exacto debe priorizar:
- rapidez de lectura
- simplicidad operativa
- no duplicidad fácil
- compatibilidad con validación futura

---

## 12. Entidades involucradas

### `tickets`
Como entidad principal del ticket operativo.

### `vouchers`
Como origen comercial del ticket.

### `clients`
### `drivers`
### `trucks`
### `materials`
### `plants`
Como referencias operativas heredadas o vinculadas.

### `audit_logs`
Para registrar acciones sensibles.

Opcionalmente, según la implementación:
- metadata del QR
- public identifier separado del document ID interno

---

## 13. Datos mínimos esperados en la gestión de tickets

Claude debe ajustar esto a la arquitectura real, pero como mínimo se espera manejar:

- ticketNumber o publicTicketId
- voucherId
- clientId
- driverId
- truckId
- materialId
- plantId
- commercialQuantity
- commercialUnit
- qrPayload o qrReference
- status
- issuedAt
- createdBy
- updatedBy

Opcionalmente, si aporta valor:
- qrToken
- printableSnapshot
- metadata

---

## 14. Operaciones que debe cubrir el módulo

### 14.1 Emitir ticket
- emisión desde voucher válido
- validaciones mínimas de consistencia
- generación de identificador y QR

### 14.2 Ver tickets
- listado
- detalle
- filtros mínimos si es viable
- búsqueda básica si es viable

### 14.3 Bloquear o cancelar ticket
- opcionalmente contemplado si se requiere antes de impresión o validación
- sin destruir historial

### 14.4 Marcar estados base
- no se requiere todo el flujo completo todavía, pero sí dejar el modelo y algunas transiciones iniciales correctas

---

## 15. Seguridad esperada del módulo

Claude debe implementar o dejar lista la lógica para que:

- solo usuarios con permiso `tickets.view` vean tickets
- solo usuarios con permiso `tickets.generate` o equivalente emitan tickets
- solo usuarios con permiso suficiente bloqueen/cancelen tickets si esa acción existe en esta fase

Además, la emisión del ticket y generación de QR probablemente deban reforzarse mediante Function o capa backend apropiada si la arquitectura lo requiere.

---

## 16. Consideración técnica importante

Claude debe evaluar cuidadosamente:

- si la emisión de ticket debe hacerse mediante Function por seguridad y consistencia
- cómo garantizar unicidad de ticket
- cómo garantizar unicidad y trazabilidad del QR
- cómo evitar emisión doble accidental
- cómo preparar el ticket para impresión futura sin acoplar este task a la impresión completa

La decisión debe priorizar:
- seguridad
- compatibilidad con Appwrite 1.8.1
- mantenibilidad
- trazabilidad clara

---

## 17. Interfaz esperada

El módulo debe seguir la línea visual definida en la base del proyecto:

- interfaz profesional
- clara
- administrativa/operativa
- tabla/listado limpio
- detalle claro del ticket
- QR visible en detalle
- estados visibles
- feedback visual de loading/error/success
- experiencia sobria y rápida

---

## 18. Criterios de aceptación

Este task se considera logrado cuando:

1. existe mecanismo funcional para generar ticket desde voucher válido
2. existe listado funcional de tickets
3. existe detalle funcional de ticket
4. existe identificador único del ticket
5. existe QR funcional asociado al ticket
6. no se generan tickets desde vouchers inválidos/cancelados/bloqueados
7. existe política clara de no duplicidad básica
8. la UI respeta permisos básicos
9. las acciones sensibles quedan auditadas
10. la base queda lista para Task 14, impresión, mostrador, báscula y validación posterior

---

## 19. Validaciones funcionales esperadas

Claude debe contemplar o demostrar que:

- un usuario sin permiso no emite tickets
- un usuario autorizado puede emitir ticket desde voucher válido
- un voucher inválido no genera ticket
- el ticket se crea con datos consistentes
- el QR se genera correctamente
- las acciones sensibles generan auditoría
- el ticket puede ser consumido después por impresión y validación sin rehacer el modelo

---

## 20. Riesgos del task

1. mezclar ticket con voucher y perder trazabilidad
2. exponer demasiada información en el QR
3. no controlar emisión doble
4. dejar estados ambiguos
5. no auditar emisión o bloqueo
6. acoplar demasiado este task a impresión o validación de salida

Claude debe mantener el foco estricto en tickets operativos con QR como entidad documental-operativa.

---

## 21. Dependencias previas

Depende de:
- Task 01: arquitectura de identidad, roles y permisos
- Task 02: base técnica del proyecto
- Task 03: autenticación, bootstrap y carga de `users_profile`
- Task 04: módulo de usuarios internos
- Task 05: módulo de roles y permisos
- Task 06: CRUD de categorías de materiales
- Task 07: CRUD de materiales con imagen de referencia
- Task 08: CRUD de clientes
- Task 09: CRUD de choferes
- Task 10: CRUD de camiones
- Task 11: CRUD de plantas/orígenes
- Task 12: vouchers/referencias prepago

---

## 22. Dependencias posteriores

Este task habilita directamente:
- Task 14: impresión y reimpresión controlada
- Task 15: flujo de venta en mostrador
- Task 16: flujo de báscula
- Task 17: validación de salida por QR
- reportes por ticket

---

## 23. Entregables esperados

Claude debe entregar:

1. mecanismo funcional de emisión de tickets
2. entidad/modelo de tickets
3. listado
4. detalle de ticket
5. QR funcional
6. auditoría básica
7. nota técnica breve sobre decisiones clave

---

## 24. Restricciones del task

- no usar TypeScript
- no avanzar aún a impresión completa, mostrador, báscula o validación de salida
- no dejar seguridad solo del lado frontend
- no borrar físicamente tickets como flujo normal
- no mezclar este task con el cierre total de la operación

---

## 25. Prompt sugerido para Claude Code — Task 13

```text
Necesito que ejecutes exclusivamente el Task 13 de este proyecto. No avances todavía a impresión completa, reimpresión controlada, mostrador, báscula, validación de salida, reportes finales o sincronización offline.

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
- CRUD de choferes
- CRUD de camiones
- CRUD de plantas/orígenes
- módulo de vouchers/referencias prepago

OBJETIVO DEL TASK
Implementar la generación y gestión base de tickets operativos con QR a partir de vouchers válidos, manteniendo clara la diferencia entre voucher y ticket.

LO QUE QUIERO QUE HAGAS
1. Diseña e implementa la entidad y módulo de tickets operativos.
2. Implementa emisión de ticket desde voucher válido.
3. Crea identificador único del ticket.
4. Genera QR funcional asociado al ticket.
5. Crea listado de tickets.
6. Crea vista de detalle de ticket.
7. Define estados base del ticket.
8. Evita emisión desde vouchers inválidos, cancelados o bloqueados.
9. Define y aplica una política básica de no duplicidad del ticket por voucher si es la estrategia elegida.
10. Protege el módulo según permisos del sistema como `tickets.view`, `tickets.generate` o los equivalentes definidos.
11. Registra auditoría básica de acciones sensibles.
12. Si la emisión o generación del QR debe pasar por Function por seguridad o consistencia, hazlo así y documenta brevemente la razón.
13. Deja la estructura lista para que el siguiente task resuelva impresión y reimpresión sin rehacer el modelo.

REGLAS IMPORTANTES
- No uses TypeScript.
- No avances todavía a impresión completa, mostrador, báscula o validación de salida.
- No mezcles este task con el cierre operativo total.
- No dejes seguridad solo del lado frontend.
- No borres físicamente tickets como flujo normal.
- Mantén compatibilidad con Appwrite 1.8.1 y con la arquitectura de permisos ya definida.
- Mantén clara la diferencia entre voucher y ticket.
- Diseña el QR pensando en seguridad y trazabilidad, evitando exponer más información de la necesaria.

CRITERIOS DE ACEPTACIÓN
Tu resultado debe dejar:
- mecanismo funcional de emisión de tickets
- entidad/modelo de tickets clara
- listado funcional
- detalle funcional
- QR funcional
- control básico de emisión válida/no duplicada
- auditoría básica
- base lista para Task 14

ENTREGABLES
Entrégame:
1. mecanismo de emisión de tickets
2. entidad/modelo de tickets
3. listado
4. detalle de ticket
5. QR funcional
6. auditoría básica
7. breve nota técnica de decisiones clave

No sigas al siguiente task. Quédate solo en Task 13.
```


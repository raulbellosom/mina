# Task 12 — Vouchers / referencias prepago

## 1. Nombre del task

**Task 12 — Diseñar e implementar el modelo y CRUD base de vouchers / referencias prepago**

---

## 2. Objetivo

Construir el módulo administrativo-operativo para crear, consultar, editar, activar/cancelar y gestionar vouchers o referencias prepago, de forma que representen la intención comercial inicial de una operación antes de convertirse en ticket operativo, carga, validación de salida y cierre de la operación.

Este task debe modelar correctamente el concepto de voucher/referencia como entidad propia, separada del ticket con QR y separada también del registro de pesos, para mantener trazabilidad clara entre la venta/comercialización y la ejecución operativa.

---

## 3. Alcance

Incluye:

- definición del modelo de voucher/referencia prepago
- listado de vouchers
- vista de detalle de voucher
- creación de voucher
- edición de voucher mientras siga en estado editable
- cancelación o desactivación lógica de voucher según reglas
- vínculo con cliente, chofer, camión, material y planta/origen
- registro de cantidad comercial y unidad comercial
- soporte para folio o referencia externa
- soporte para estado del voucher
- integración con permisos del sistema
- auditoría de acciones sensibles relacionadas con vouchers

No incluye todavía:

- ticket operativo con QR
- impresión
- flujo completo de mostrador
- flujo completo de báscula
- validación de salida
- reportes funcionales finales
- sincronización offline completa

---

## 4. Problema que resuelve

Permite registrar formalmente la intención o autorización comercial previa de una operación cuando el cliente llega con un vale, folio o referencia prepago, evitando mezclar este concepto con el ticket operativo o con el cierre físico de la salida. Esto ayuda a separar correctamente:

- lo que se vendió o autorizó comercialmente
- lo que se imprimió para la operación
- lo que finalmente se cargó y salió

---

## 5. Logro esperado

Al terminar este task debe existir un módulo funcional donde un usuario autorizado pueda:

1. ver listado de vouchers/referencias
2. consultar detalle de un voucher
3. crear un voucher prepago
4. editarlo mientras siga en estado permitido
5. cancelarlo o bloquearlo según reglas
6. relacionarlo con cliente, chofer, camión, material y planta
7. registrar cantidad comercial y unidad comercial
8. dejar auditadas las acciones sensibles
9. dejar la base lista para que el Task 13 genere tickets con QR a partir de un voucher válido

---

## 6. Preguntas que este task debe cerrar

1. ¿Qué campos mínimos debe tener un voucher prepago?
2. ¿Qué diferencia exacta se establecerá entre voucher y ticket?
3. ¿Cómo se manejará el folio interno vs referencia externa?
4. ¿Qué estados tendrá el voucher?
5. ¿Hasta qué momento puede editarse un voucher?
6. ¿Cómo se cancela sin destruir historial?
7. ¿Qué permisos controlarán el acceso a este módulo?
8. ¿Qué campos deben quedar listos para convertir un voucher en ticket operativo?

---

## 7. Dependencia arquitectónica obligatoria

Este task debe obedecer estas reglas ya definidas:

- el acceso al módulo debe respetar roles y permisos del sistema
- el CRUD debe apoyarse en la base técnica y auth ya construidas
- los catálogos previos (clientes, choferes, camiones, materiales, plantas) deben consumirse como referencias reales
- la eliminación debe ser lógica/no destructiva
- los cambios sensibles deben quedar auditados
- el voucher debe ser una entidad separada del ticket y del weight log

---

## 8. Definición operativa del voucher en este proyecto

Para este sistema, un **voucher/referencia prepago** representa la autorización o registro comercial inicial de una operación cuando el cliente ya cuenta con un vale, folio o referencia previa.

El voucher:
- puede existir antes del ticket
- no sustituye al ticket operativo
- no sustituye el registro de pesos
- debe poder vincularse posteriormente con un ticket emitido
- debe conservar la cantidad comercial autorizada
- debe reflejar el origen/planta y el material acordado

Esto será la base para que el sistema pueda trazar:
- autorización comercial
- ejecución operativa
- validación final

---

## 9. Alcance funcional detallado

### 9.1 Listado de vouchers
Debe existir una vista de tabla o lista con como mínimo:

- folio interno
- referencia externa si aplica
- cliente
- material
- planta/origen
- cantidad comercial
- estado
- fecha de creación
- acciones disponibles según permisos

### 9.2 Detalle de voucher
Debe existir una vista o panel de detalle que permita ver:

- folio interno
- referencia externa
- cliente
- chofer
- camión
- material
- planta/origen
- cantidad comercial
- unidad comercial
- observaciones
- estado
- metadata relevante si aplica
- auditoría básica relacionada si es viable en esta fase

### 9.3 Crear voucher
Debe existir un flujo para dar de alta un voucher prepago.

Debe contemplar como mínimo:
- folio interno generado o campo equivalente
- referencia externa opcional
- cliente
- chofer opcional o requerido según regla final
- camión opcional o requerido según regla final
- material
- planta/origen
- cantidad comercial
- unidad comercial
- observaciones opcionales
- estado inicial

### 9.4 Editar voucher
Debe permitirse editar voucher mientras se encuentre en estados válidos.

Debe permitirse editar como mínimo:
- referencia externa
- cliente
- chofer
- camión
- material
- planta/origen
- cantidad comercial
- unidad comercial
- observaciones

Siempre respetando que ciertos estados posteriores ya no permitan edición libre.

### 9.5 Cancelar o bloquear voucher
No debe borrarse físicamente un voucher como flujo normal.
Se debe privilegiar:

- cancelarlo
- bloquearlo
- marcarlo como no utilizable
- conservar historial completo

### 9.6 Seguridad del módulo
Este módulo debe quedar protegido para que solo usuarios con permisos apropiados puedan acceder y modificarlo.

---

## 10. Reglas de negocio específicas

1. Un voucher prepago representa una autorización o registro comercial inicial.
2. Un voucher no es lo mismo que un ticket operativo.
3. Un voucher no debe borrarse físicamente como flujo normal.
4. Un voucher debe vincular cliente, material y planta/origen como mínimo, salvo decisión técnica justificada.
5. La cantidad comercial debe mantenerse separada del peso real futuro del camión.
6. Un voucher cancelado o bloqueado no debe convertirse en ticket válido.
7. Un voucher debe poder consumirse después por el flujo operativo sin rehacer datos.
8. Los cambios de creación, edición, cancelación y bloqueo deben quedar auditados.
9. El acceso al módulo debe respetar permisos del sistema.

---

## 11. Estados sugeridos del voucher

Claude debe validarlos y refinarlos, pero se espera algo cercano a:

- draft
- issued
- ready_for_ticket
- consumed
- cancelled
- blocked

También puede simplificarlos si propone una mejor primera fase, siempre que documente claramente la razón.

---

## 12. Entidades involucradas

### `vouchers`
Como entidad principal de vouchers/referencias prepago.

### `clients`
Como referencia comercial principal.

### `drivers`
Como referencia operativa del chofer.

### `trucks`
Como referencia operativa del camión.

### `materials`
Como referencia del material autorizado.

### `plants`
Como referencia del origen/planta.

### `audit_logs`
Para registrar acciones sensibles.

---

## 13. Datos mínimos esperados en la gestión de vouchers

Claude debe ajustar esto a la arquitectura real, pero como mínimo se espera manejar:

- internalFolio
- externalReference
- clientId
- driverId
- truckId
- materialId
- plantId
- commercialQuantity
- commercialUnit
- status
- notes
- createdBy
- updatedBy

Opcionalmente, si aporta valor:
- requestedAt
- scheduledAt
- sourceType
- metadata

---

## 14. Operaciones que debe cubrir el módulo

### 14.1 Ver vouchers
- listado
- detalle
- filtros mínimos si es viable
- búsqueda básica si es viable

### 14.2 Crear voucher
- alta de voucher prepago
- validaciones mínimas de consistencia
- referencias correctas a catálogos base

### 14.3 Editar voucher
- edición de datos generales según estado permitido
- control de cambios sensibles

### 14.4 Cancelar o bloquear voucher
- impedir uso futuro sin destruir historial
- conservar trazabilidad completa

### 14.5 Marcar voucher listo para ticket
- opcional en esta fase, pero recomendable contemplar la transición al siguiente task

---

## 15. Seguridad esperada del módulo

Claude debe implementar o dejar lista la lógica para que:

- solo usuarios con permiso `vouchers.view` vean el módulo
- solo usuarios con permiso `vouchers.create` creen vouchers
- solo usuarios con permiso `vouchers.update` editen vouchers
- solo usuarios con permiso suficiente cancelen o bloqueen vouchers

Si el proyecto todavía usa permisos más generales para esta fase, Claude puede mapearlos a la matriz existente, siempre que mantenga coherencia con la arquitectura definida.

---

## 16. Consideración técnica importante

Claude debe evaluar cuidadosamente:

- cómo generar el folio interno
- si ciertas transiciones de estado deben hacerse mediante Functions
- cómo evitar que vouchers inválidos o cancelados se conviertan en tickets
- cómo preparar la relación voucher → ticket sin construir todavía el módulo completo de tickets

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
- formulario consistente
- estados visibles
- resumen claro del voucher
- feedback visual de loading/error/success
- experiencia sobria y rápida

---

## 18. Criterios de aceptación

Este task se considera logrado cuando:

1. existe módulo accesible solo por usuarios autorizados
2. existe listado funcional de vouchers
3. existe detalle funcional de voucher
4. existe creación de voucher
5. existe edición de voucher en estados válidos
6. existe cancelación o bloqueo lógico
7. existe vínculo correcto con cliente, chofer, camión, material y planta
8. la cantidad comercial queda bien separada del peso real futuro
9. la UI respeta permisos básicos
10. las acciones sensibles quedan auditadas
11. la base queda lista para que Task 13 genere tickets con QR sin rehacer el modelo

---

## 19. Validaciones funcionales esperadas

Claude debe contemplar o demostrar que:

- un usuario sin permiso no entra al módulo
- un usuario autorizado puede ver el listado
- un voucher se crea con datos consistentes
- un voucher cancelado o bloqueado cambia correctamente su estado
- la edición respeta los estados permitidos
- las acciones sensibles generan auditoría
- el voucher puede ser consumido después por tickets sin rehacer el modelo

---

## 20. Riesgos del task

1. mezclar voucher con ticket y perder claridad conceptual
2. no separar cantidad comercial de peso real futuro
3. dejar estados ambiguos
4. permitir eliminación destructiva innecesaria
5. no auditar cambios sensibles
6. construir demasiada lógica operativa completa antes del task correspondiente

Claude debe mantener el foco estricto en vouchers como entidad comercial-operativa inicial.

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

---

## 22. Dependencias posteriores

Este task habilita directamente:
- Task 13: tickets operativos con QR
- Task 14: impresión y reimpresión controlada
- Task 16: flujo de báscula
- reportes por voucher/referencia

---

## 23. Entregables esperados

Claude debe entregar:

1. módulo funcional de vouchers/referencias prepago
2. listado
3. formulario de alta/edición
4. detalle de voucher
5. cancelación/bloqueo lógico
6. auditoría básica
7. nota técnica breve sobre decisiones clave

---

## 24. Restricciones del task

- no usar TypeScript
- no avanzar aún al módulo completo de tickets con QR
- no avanzar aún a impresión, báscula, mostrador o validación de salida
- no dejar seguridad solo del lado frontend
- no borrar físicamente vouchers como flujo normal

---

## 25. Prompt sugerido para Claude Code — Task 12

```text
Necesito que ejecutes exclusivamente el Task 12 de este proyecto. No avances todavía al módulo completo de tickets con QR, impresión, báscula, mostrador, validación de salida, reportes finales o sincronización offline.

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

OBJETIVO DEL TASK
Implementar el modelo y CRUD base de vouchers/referencias prepago como entidad separada del ticket operativo, para representar correctamente la autorización o registro comercial inicial de una operación.

LO QUE QUIERO QUE HAGAS
1. Diseña e implementa la entidad y módulo de vouchers/referencias prepago.
2. Crea listado de vouchers.
3. Crea vista de detalle de voucher.
4. Implementa alta de voucher.
5. Implementa edición de voucher mientras esté en estados válidos.
6. Implementa cancelación o bloqueo lógico de voucher.
7. Vincula correctamente cada voucher con cliente, chofer, camión, material y planta/origen.
8. Registra cantidad comercial y unidad comercial separadas del peso real futuro.
9. Protege el módulo según permisos del sistema como `vouchers.view`, `vouchers.create`, `vouchers.update` y los equivalentes definidos.
10. Registra auditoría básica de acciones sensibles.
11. Deja la estructura lista para que el siguiente task genere tickets con QR a partir de vouchers válidos, sin rehacer el modelo.
12. Si ciertas transiciones de estado o validaciones deben pasar por Function por seguridad o consistencia, hazlo así y documenta brevemente la razón.

REGLAS IMPORTANTES
- No uses TypeScript.
- No avances todavía al módulo completo de tickets con QR.
- No mezcles este task con impresión, báscula o mostrador.
- No dejes seguridad solo del lado frontend.
- No borres físicamente vouchers como flujo normal.
- Mantén compatibilidad con Appwrite 1.8.1 y con la arquitectura de permisos ya definida.
- Mantén clara la diferencia entre voucher y ticket.

CRITERIOS DE ACEPTACIÓN
Tu resultado debe dejar:
- módulo protegido de vouchers/referencias prepago
- listado funcional
- detalle funcional
- alta funcional
- edición funcional en estados válidos
- cancelación/bloqueo lógico
- vínculos correctos con catálogos base
- cantidad comercial bien modelada
- auditoría básica
- base lista para Task 13

ENTREGABLES
Entrégame:
1. módulo de vouchers/referencias prepago
2. listado
3. formulario de alta/edición
4. detalle
5. cancelación/bloqueo lógico
6. auditoría básica
7. breve nota técnica de decisiones clave

No sigas al siguiente task. Quédate solo en Task 12.
```


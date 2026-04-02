# Task 15 — Flujo de venta en mostrador

## 1. Nombre del task

**Task 15 — Implementar el flujo de venta en mostrador**

---

## 2. Objetivo

Construir el flujo operativo de venta en mostrador para los casos en que el chofer o comprador llega por cuenta propia, realiza una compra directa en sitio y requiere que el sistema registre la operación comercial, genere el ticket operativo correspondiente y deje la base lista para carga, validación de salida y trazabilidad posterior.

Este task debe modelar claramente la diferencia entre:

- venta prepago basada en voucher previo
- venta directa en mostrador

Sin mezclar todavía toda la lógica de báscula o validación final de salida, aunque sí debe dejar la estructura completamente preparada para esas fases.

---

## 3. Alcance

Incluye:

- definición del flujo de venta en mostrador
- creación de la operación de mostrador
- captura de cliente/cliente genérico según estrategia final
- captura de chofer
- captura de camión
- selección de material
- selección de planta/origen
- captura de cantidad comercial y unidad comercial
- captura de método de pago referencial
- captura de referencia bancaria o de pago opcional
- generación o vinculación del ticket operativo resultante
- estados base de la venta mostrador
- integración con permisos del sistema
- auditoría de acciones sensibles relacionadas con mostrador

No incluye todavía:

- impresión completa y reimpresión controlada si ya quedó como task separado
- flujo completo de báscula
- validación final de salida por QR
- reportes funcionales finales
- sincronización offline completa

---

## 4. Problema que resuelve

Permite registrar de forma controlada las ventas directas que no vienen de un voucher prepago, evitando que estas operaciones queden fuera de trazabilidad o sean más vulnerables a errores, descontrol o fuga de material.

Además, establece el punto de partida operativo para el flujo donde la venta ocurre en mostrador y luego debe pasar por carga y validación antes de la salida final.

---

## 5. Logro esperado

Al terminar este task debe existir una solución funcional donde un usuario autorizado pueda:

1. registrar una venta directa en mostrador
2. capturar cliente, chofer, camión, material y planta/origen
3. registrar cantidad comercial y unidad comercial
4. registrar método de pago referencial y referencia si aplica
5. generar o asociar el ticket operativo resultante
6. consultar la venta mostrador creada
7. identificar su estado operativo
8. dejar auditadas las acciones sensibles
9. dejar la base lista para impresión, carga y validación posterior de salida

---

## 6. Preguntas que este task debe cerrar

1. ¿La venta en mostrador tendrá su propia entidad o se modelará como un tipo específico de voucher/ticket?
2. ¿Cómo se representará el cliente en mostrador cuando sea una operación ocasional?
3. ¿Qué datos son obligatorios al momento de la venta?
4. ¿Qué métodos de pago referenciales se capturarán en esta fase?
5. ¿Qué referencia bancaria o de transferencia podrá registrarse?
6. ¿En qué momento exacto se genera el ticket operativo?
7. ¿Qué estados base tendrá la venta mostrador?
8. ¿Qué permisos controlarán este flujo?

---

## 7. Dependencia arquitectónica obligatoria

Este task debe obedecer estas reglas ya definidas:

- el acceso al módulo/flujo debe respetar roles y permisos del sistema
- debe apoyarse en la base técnica y auth ya construidas
- debe consumir los catálogos previos (clientes, choferes, camiones, materiales, plantas)
- debe mantener separación clara entre venta mostrador, ticket, registro de pesos y validación final
- las acciones sensibles deben quedar auditadas
- la cantidad comercial debe mantenerse separada del peso real futuro del camión

---

## 8. Definición operativa de venta en mostrador en este proyecto

Para este sistema, una **venta en mostrador** representa la operación comercial creada directamente en sitio cuando el comprador o chofer no llega con voucher prepago previo.

La venta en mostrador:
- se registra por personal autorizado de mostrador
- captura el contexto comercial básico de la operación
- genera o dispara el ticket operativo
- no equivale todavía a salida completada
- debe quedar sujeta a carga y validación posterior

Esto permite separar correctamente:
- venta directa capturada en caja/mostrador
- documento operativo derivado
- validación final antes de salida

---

## 9. Alcance funcional detallado

### 9.1 Crear venta en mostrador
Debe existir un flujo claro para registrar una nueva venta directa.

Debe contemplar como mínimo:
- cliente o cliente genérico según estrategia definida
- chofer
- camión
- material
- planta/origen
- cantidad comercial
- unidad comercial
- método de pago referencial
- referencia de pago opcional
- observaciones
- estado inicial

### 9.2 Listado de ventas mostrador
Debe existir una vista de tabla o lista con como mínimo:

- identificador interno
- cliente
- chofer
- camión
- material
- planta/origen
- cantidad comercial
- método de pago referencial
- estado
- fecha de creación
- acciones disponibles según permisos

### 9.3 Detalle de venta mostrador
Debe existir una vista o panel de detalle que permita ver:

- identificador
- cliente
- chofer
- camión
- material
- planta/origen
- cantidad comercial
- unidad comercial
- método de pago referencial
- referencia de pago
- ticket relacionado si ya se genera en esta fase
- estado
- observaciones
- auditoría básica relacionada si es viable en esta fase

### 9.4 Edición de venta mostrador
Debe permitirse editar la venta mientras se encuentre en estados válidos.

Debe permitirse editar como mínimo:
- cliente
- chofer
- camión
- material
- planta/origen
- cantidad comercial
- unidad comercial
- método de pago referencial
- referencia de pago
- observaciones

Siempre respetando que ciertos estados posteriores ya no permitan edición libre.

### 9.5 Cancelar o bloquear venta mostrador
No debe borrarse físicamente una venta mostrador como flujo normal.
Se debe privilegiar:

- cancelarla
- bloquearla
- marcarla como no utilizable
- conservar historial completo

### 9.6 Generación o vínculo con ticket
Este task debe dejar resuelto cómo la venta mostrador produce o vincula un ticket operativo.

La estrategia puede ser, por ejemplo:
- generar ticket inmediatamente al confirmar la venta
- generar ticket al pasar a estado operativo válido

Claude debe elegir una estrategia consistente y documentarla.

### 9.7 Seguridad del módulo
Este flujo debe quedar protegido para que solo usuarios con permisos apropiados puedan operarlo.

---

## 10. Reglas de negocio específicas

1. La venta en mostrador representa una operación comercial directa en sitio.
2. La venta en mostrador no sustituye la validación final de salida.
3. La venta en mostrador no debe borrarse físicamente como flujo normal.
4. Debe registrar material, planta/origen, cantidad comercial y contexto operativo mínimo.
5. Debe registrar método de pago solo como referencia operativa, no como procesamiento de pago real.
6. La referencia bancaria o de transferencia debe poder registrarse cuando aplique.
7. La cantidad comercial debe mantenerse separada del peso real futuro.
8. Una venta mostrador cancelada o bloqueada no debe generar ni mantener ticket operativo válido si la política final así lo exige.
9. Los cambios de creación, edición, cancelación y bloqueo deben quedar auditados.
10. El acceso al flujo debe respetar permisos del sistema.

---

## 11. Estados sugeridos de la venta mostrador

Claude debe validarlos y refinarlos, pero se espera algo cercano a:

- draft
- confirmed
- ticket_generated
- cancelled
- blocked
- completed

Puede simplificarlos si propone una mejor primera fase, siempre que documente claramente la razón.

---

## 12. Entidades involucradas

Claude debe decidir si la venta mostrador vive en una entidad propia o como especialización de otra estructura existente, pero debe mantener claridad conceptual.

Se espera algo cercano a:

### `counter_sales` o equivalente
Como entidad principal de venta mostrador.

### `tickets`
Como documento operativo derivado o vinculado.

### `clients`
### `drivers`
### `trucks`
### `materials`
### `plants`
Como referencias operativas.

### `audit_logs`
Para registrar acciones sensibles.

---

## 13. Datos mínimos esperados en la gestión de venta mostrador

Claude debe ajustar esto a la arquitectura real, pero como mínimo se espera manejar:

- internalNumber o folio interno
- clientId
- driverId
- truckId
- materialId
- plantId
- commercialQuantity
- commercialUnit
- paymentMethodReference
- paymentReference
- relatedTicketId si ya se genera
- status
- notes
- createdBy
- updatedBy

Opcionalmente, si aporta valor:
- saleChannel
- metadata
- cashierNameSnapshot

---

## 14. Operaciones que debe cubrir el módulo

### 14.1 Crear venta mostrador
- alta de venta
- validaciones mínimas de consistencia
- referencias correctas a catálogos base

### 14.2 Editar venta mostrador
- edición de datos generales según estado permitido
- control de cambios sensibles

### 14.3 Ver ventas mostrador
- listado
- detalle
- filtros mínimos si es viable
- búsqueda básica si es viable

### 14.4 Cancelar o bloquear venta mostrador
- impedir uso futuro sin destruir historial
- conservar trazabilidad completa

### 14.5 Generar o vincular ticket
- mecanismo claro y consistente con la arquitectura del Task 13

---

## 15. Seguridad esperada del módulo

Claude debe implementar o dejar lista la lógica para que:

- solo usuarios con permiso `counter_sales.view` o equivalente vean este módulo
- solo usuarios con permiso `counter_sales.create` o equivalente creen ventas mostrador
- solo usuarios con permiso `counter_sales.update` o equivalente editen ventas mostrador
- solo usuarios con permiso suficiente cancelen o bloqueen ventas mostrador

Si el proyecto todavía usa permisos más generales para esta fase, Claude puede mapearlos a la matriz existente, siempre que mantenga coherencia con la arquitectura definida.

---

## 16. Consideración técnica importante

Claude debe evaluar cuidadosamente:

- si la creación/confirmación de la venta mostrador debe pasar por Function por seguridad y consistencia
- cómo relacionar la venta mostrador con el ticket operativo sin duplicar datos innecesariamente
- cómo impedir que ventas inválidas o canceladas generen tickets válidos
- cómo preparar la venta mostrador para impresión y validación futura sin acoplar este task a esos módulos

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
- formulario rápido de captura
- tabla/listado limpio
- estados visibles
- resumen claro de la venta
- feedback visual de loading/error/success
- experiencia sobria y rápida para operación de mostrador

---

## 18. Criterios de aceptación

Este task se considera logrado cuando:

1. existe flujo funcional para registrar venta en mostrador
2. existe listado funcional de ventas mostrador
3. existe detalle funcional de venta mostrador
4. existe edición en estados válidos
5. existe cancelación o bloqueo lógico
6. se capturan correctamente cliente, chofer, camión, material, planta y cantidad comercial
7. se captura método de pago referencial y referencia opcional
8. existe estrategia clara y funcional para generar o vincular el ticket operativo
9. la UI respeta permisos básicos
10. las acciones sensibles quedan auditadas
11. la base queda lista para impresión, carga y validación posterior

---

## 19. Validaciones funcionales esperadas

Claude debe contemplar o demostrar que:

- un usuario sin permiso no entra al flujo
- un usuario autorizado puede registrar una venta mostrador
- la venta se crea con datos consistentes
- una venta cancelada o bloqueada cambia correctamente su estado
- la edición respeta los estados permitidos
- las acciones sensibles generan auditoría
- la venta mostrador puede ser consumida después por impresión y validación sin rehacer el modelo

---

## 20. Riesgos del task

1. mezclar venta mostrador con voucher prepago y perder claridad conceptual
2. no separar cantidad comercial de peso real futuro
3. no definir claramente cuándo nace el ticket
4. dejar estados ambiguos
5. permitir eliminación destructiva innecesaria
6. no auditar cambios sensibles
7. construir demasiada lógica de báscula o salida antes del task correspondiente

Claude debe mantener el foco estricto en venta mostrador como flujo comercial-operativo directo.

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
- Task 13: tickets operativos con QR
- idealmente Task 14: impresión y reimpresión controlada, o al menos dejar compatibilidad clara con ese task

---

## 22. Dependencias posteriores

Este task habilita directamente:
- Task 16: flujo de báscula
- Task 17: validación de salida por QR
- reportes por venta mostrador

---

## 23. Entregables esperados

Claude debe entregar:

1. flujo funcional de venta en mostrador
2. entidad/modelo correspondiente
3. listado
4. detalle
5. edición en estados válidos
6. cancelación/bloqueo lógico
7. vínculo o generación del ticket operativo
8. auditoría básica
9. nota técnica breve sobre decisiones clave

---

## 24. Restricciones del task

- no usar TypeScript
- no avanzar aún al flujo completo de báscula ni validación final de salida
- no dejar seguridad solo del lado frontend
- no borrar físicamente ventas mostrador como flujo normal
- no mezclar este task con el cierre total de la operación

---

## 25. Prompt sugerido para Claude Code — Task 15

```text
Necesito que ejecutes exclusivamente el Task 15 de este proyecto. No avances todavía al flujo completo de báscula, validación final de salida, reportes finales o sincronización offline.

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
- tickets operativos con QR
- idealmente impresión/reimpresión controlada o al menos compatibilidad con ese módulo

OBJETIVO DEL TASK
Implementar el flujo de venta en mostrador para registrar operaciones directas en sitio, capturar el contexto comercial-operativo básico y generar o vincular el ticket operativo resultante.

LO QUE QUIERO QUE HAGAS
1. Diseña e implementa la entidad o flujo de venta mostrador.
2. Implementa alta de venta mostrador.
3. Crea listado de ventas mostrador.
4. Crea vista de detalle de venta mostrador.
5. Implementa edición mientras la venta esté en estados válidos.
6. Implementa cancelación o bloqueo lógico.
7. Captura correctamente cliente, chofer, camión, material, planta/origen, cantidad comercial y unidad comercial.
8. Captura método de pago referencial y referencia de pago opcional.
9. Define y aplica una estrategia clara para generar o vincular el ticket operativo.
10. Protege el módulo según permisos del sistema como `counter_sales.view`, `counter_sales.create`, `counter_sales.update` y los equivalentes definidos.
11. Registra auditoría básica de acciones sensibles.
12. Si ciertas transiciones o validaciones deben pasar por Function por seguridad o consistencia, hazlo así y documenta brevemente la razón.
13. Deja la estructura lista para que báscula y validación de salida consuman este flujo sin rehacer el modelo.

REGLAS IMPORTANTES
- No uses TypeScript.
- No avances todavía al flujo completo de báscula ni validación final de salida.
- No mezcles este task con el cierre total de la operación.
- No dejes seguridad solo del lado frontend.
- No borres físicamente ventas mostrador como flujo normal.
- Mantén compatibilidad con Appwrite 1.8.1 y con la arquitectura de permisos ya definida.
- Mantén clara la diferencia entre venta mostrador, voucher, ticket y validación final.

CRITERIOS DE ACEPTACIÓN
Tu resultado debe dejar:
- flujo funcional de venta en mostrador
- entidad/modelo correspondiente
- listado funcional
- detalle funcional
- edición funcional en estados válidos
- cancelación/bloqueo lógico
- captura correcta del contexto comercial-operativo
- vínculo o generación clara del ticket operativo
- auditoría básica
- base lista para tasks posteriores

ENTREGABLES
Entrégame:
1. flujo de venta en mostrador
2. entidad/modelo correspondiente
3. listado
4. detalle
5. edición/cancelación/bloqueo lógico
6. vínculo o generación de ticket
7. auditoría básica
8. breve nota técnica de decisiones clave

No sigas al siguiente task. Quédate solo en Task 15.
```

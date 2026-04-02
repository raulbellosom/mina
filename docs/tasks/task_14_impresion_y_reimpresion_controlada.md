# Task 14 — Impresión y reimpresión controlada

## 1. Nombre del task

**Task 14 — Implementar impresión y reimpresión controlada de tickets operativos**

---

## 2. Objetivo

Construir el módulo o capa funcional que permita preparar, visualizar, imprimir y reimprimir tickets operativos de forma controlada, manteniendo trazabilidad completa de cada impresión y evitando abuso o fraude mediante reimpresiones no autorizadas.

Este task debe tomar como base los tickets operativos con QR ya definidos en el Task 13 y convertirlos en documentos imprimibles utilizables en campo, contemplando que normalmente deben existir **3 copias** por operación:

- copia para báscula o mostrador
- copia para operador de carga
- copia para chofer

---

## 3. Alcance

Incluye:

- definición del formato imprimible base del ticket
- vista previa de impresión
- impresión del ticket en cantidad controlada de copias
- reimpresión controlada del ticket
- registro de eventos de impresión y reimpresión
- conteo de impresiones / reimpresiones
- motivo de reimpresión cuando aplique
- reglas de permisos para imprimir y reimprimir
- auditoría de acciones sensibles relacionadas con impresión
- preparación para integración con mostrador, báscula y validación de salida

No incluye todavía:

- flujo completo de mostrador
- flujo completo de báscula
- validación de salida por escaneo QR
- integración avanzada con hardware propietario de impresión
- generación PDF avanzada si no es necesaria en esta fase
- reportes finales
- sincronización offline completa

---

## 4. Problema que resuelve

Permite convertir el ticket operativo en un documento físico útil y controlado. Sin este task, el ticket existiría solo como entidad digital y no cumpliría su función práctica dentro de la operación, donde intervienen chofer, operador de carga, báscula/mostrador y guardia.

Además, resuelve una necesidad crítica del negocio: **la reimpresión no debe ser libre ni invisible**, porque puede ser un punto de abuso operativo.

---

## 5. Logro esperado

Al terminar este task debe existir una solución funcional donde un usuario autorizado pueda:

1. abrir la vista imprimible de un ticket
2. imprimir el ticket con formato claro y útil para operación
3. imprimir el número estándar de copias requerido
4. reimprimir un ticket solo si tiene permiso
5. registrar el motivo de reimpresión cuando aplique
6. consultar cuántas veces se imprimió o reimprimió un ticket
7. dejar auditadas las acciones sensibles
8. dejar la base lista para que mostrador, báscula y salida operen sobre tickets físicos reales

---

## 6. Preguntas que este task debe cerrar

1. ¿Qué datos exactos debe mostrar el ticket impreso?
2. ¿Cuál será la estructura visual del ticket para operación?
3. ¿Cómo se manejarán las 3 copias requeridas?
4. ¿Qué diferencia se registrará entre impresión inicial y reimpresión?
5. ¿Cuándo debe pedirse motivo de reimpresión?
6. ¿Quién puede reimprimir y quién no?
7. ¿Cómo se auditarán las impresiones y reimpresiones?
8. ¿Qué entidad registrará los eventos de impresión?

---

## 7. Dependencia arquitectónica obligatoria

Este task debe obedecer estas reglas ya definidas:

- debe apoyarse en tickets válidos ya emitidos
- debe respetar roles y permisos del sistema
- debe registrar trazabilidad de impresión y reimpresión
- la reimpresión debe tratarse como acción sensible
- debe dejar la base lista para uso operativo real
- debe mantenerse separado del flujo de validación de salida, aunque preparándolo

---

## 8. Definición operativa de impresión en este proyecto

Para este sistema, la impresión del ticket no es solo una vista visual. Es un **evento operativo auditado**.

Se deben distinguir al menos dos conceptos:

### Impresión inicial
Primera impresión operativa del ticket emitido.

### Reimpresión
Nueva impresión posterior de un ticket ya impreso, que debe quedar registrada y controlada.

La reimpresión debe considerarse una acción sensible porque puede afectar control físico del material y trazabilidad de la salida.

---

## 9. Alcance funcional detallado

### 9.1 Vista imprimible del ticket
Debe existir una vista o formato claro y compacto que incluya, como mínimo:

- identificador o folio del ticket
- QR del ticket
- voucher o referencia relacionada si aplica
- cliente
- chofer
- camión
- material
- planta/origen
- cantidad comercial
- unidad comercial
- fecha/hora de emisión
- estado del ticket
- marcadores visuales si el ticket fue reimpreso

Claude puede proponer campos adicionales útiles, siempre sin sobrecargar innecesariamente el diseño.

### 9.2 Impresión inicial
Debe existir una acción de impresión inicial que:

- abra la vista imprimible o el flujo de impresión
- registre el evento de impresión
- considere las 3 copias requeridas o una estrategia clara para obtenerlas
- actualice el estado del ticket si la lógica del sistema lo requiere

### 9.3 Reimpresión controlada
Debe existir una acción separada para reimprimir un ticket.

Debe contemplar:
- verificación de permisos
- solicitud de motivo de reimpresión si la política final lo exige
- registro del evento como reimpresión
- incremento del contador correspondiente
- marca visible en la vista si el ticket ya fue reimpreso una o más veces

### 9.4 Historial de impresión
Debe existir una forma de consultar el historial o resumen mínimo de impresión del ticket, por ejemplo:

- primera impresión
- número total de reimpresiones
- última reimpresión
- usuario que imprimió o reimprimió

### 9.5 Seguridad del módulo
La impresión inicial y, sobre todo, la reimpresión deben estar protegidas por permisos explícitos.

---

## 10. Reglas de negocio específicas

1. Todo ticket imprimible debe derivarse de un ticket válido emitido.
2. La impresión inicial debe registrarse.
3. La reimpresión debe registrarse siempre.
4. La reimpresión debe considerarse una acción sensible.
5. No todos los usuarios pueden reimprimir.
6. Un ticket reimpreso debe dejar evidencia visible o trazable en el sistema.
7. Debe mantenerse el requisito operativo de 3 copias del ticket.
8. El sistema no debe borrar físicamente el historial de impresión.
9. Las acciones de impresión y reimpresión deben quedar auditadas.
10. El acceso al módulo debe respetar permisos del sistema.

---

## 11. Estrategia sugerida para impresión

Claude debe evaluar e implementar una estrategia práctica y mantenible. Una dirección esperada sería:

- vista HTML/CSS preparada para impresión desde navegador
- diseño compacto y estable
- soporte razonable para impresoras comunes
- separación clara entre pantalla administrativa y formato imprimible

Si propone PDF o una capa adicional, debe justificarlo brevemente. En esta fase, lo más importante es que sea utilizable y controlado.

---

## 12. Entidades involucradas

### `tickets`
Como entidad principal del documento operativo.

### `print_logs`
Como entidad recomendada para registrar eventos de impresión y reimpresión.

### `audit_logs`
Para registrar acciones sensibles relacionadas con seguridad y control.

Opcionalmente, según la implementación:
- snapshot imprimible
- printCount / reprintCount en `tickets`

---

## 13. Datos mínimos esperados en la gestión de impresión

Claude debe ajustar esto a la arquitectura real, pero como mínimo se espera manejar:

### En `print_logs`
- ticketId
- printType (`initial_print` / `reprint` o equivalente)
- printedBy
- printedAt
- copiesCount
- reason (para reimpresión si aplica)
- metadata

### En `tickets` si conviene
- firstPrintedAt
- lastPrintedAt
- printCount
- reprintCount
- lastPrintedBy

---

## 14. Operaciones que debe cubrir el módulo

### 14.1 Ver ticket imprimible
- abrir vista imprimible
- validar que el ticket exista y sea elegible

### 14.2 Imprimir ticket
- ejecutar impresión inicial
- registrar evento
- marcar datos relacionados si aplica

### 14.3 Reimprimir ticket
- verificar permisos
- solicitar motivo si corresponde
- registrar evento como reimpresión
- actualizar contadores y trazabilidad

### 14.4 Consultar historial de impresión
- ver resumen o historial mínimo del ticket

---

## 15. Seguridad esperada del módulo

Claude debe implementar o dejar lista la lógica para que:

- solo usuarios con permiso `tickets.print` impriman tickets
- solo usuarios con permiso `tickets.reprint` reimpriman tickets
- solo usuarios con permiso suficiente consulten historial sensible si aplica

Además, si la arquitectura del proyecto ya centraliza acciones sensibles en backend, Claude debe considerar que impresión/reimpresión pueda registrar eventos mediante Function o capa backend apropiada.

---

## 16. Consideración técnica importante

Claude debe evaluar cuidadosamente:

- cómo generar una vista imprimible estable
- cómo registrar el evento de impresión sin depender solo del frontend si eso pone en riesgo la trazabilidad
- cómo manejar 3 copias requeridas sin complicar innecesariamente la UX
- cómo evitar reimpresiones invisibles o no auditadas
- cómo dejar una base sólida para integrarse con mostrador y báscula

La decisión debe priorizar:
- seguridad
- compatibilidad con Appwrite 1.8.1
- mantenibilidad
- trazabilidad clara
- utilidad operativa real

---

## 17. Interfaz esperada

El módulo debe seguir la línea visual definida en la base del proyecto:

- vista administrativa clara del ticket
- acceso a vista imprimible
- formato imprimible compacto y claro
- indicadores visibles de impresión/reimpresión
- feedback visual de loading/error/success
- experiencia sobria y rápida

---

## 18. Criterios de aceptación

Este task se considera logrado cuando:

1. existe vista imprimible funcional del ticket
2. existe impresión inicial funcional
3. existe reimpresión controlada funcional
4. se registran eventos de impresión y reimpresión
5. existe conteo o historial mínimo de impresiones
6. la reimpresión exige permisos apropiados
7. la reimpresión puede registrar motivo si así se define
8. la UI respeta permisos básicos
9. las acciones sensibles quedan auditadas
10. la base queda lista para Task 15, Task 16 y Task 17

---

## 19. Validaciones funcionales esperadas

Claude debe contemplar o demostrar que:

- un usuario sin permiso no imprime o no reimprime
- un usuario autorizado puede imprimir un ticket válido
- la impresión genera trazabilidad
- la reimpresión genera trazabilidad diferenciada
- los contadores o historial se actualizan correctamente
- el ticket muestra información suficiente para operación en campo
- la base puede ser consumida después por mostrador, báscula y salida sin rehacer el modelo

---

## 20. Riesgos del task

1. tratar impresión como simple vista y no como evento auditado
2. permitir reimpresión libre sin control
3. no registrar motivo o contexto de reimpresión
4. hacer un formato de impresión demasiado complejo o frágil
5. acoplar demasiado la impresión al navegador sin dejar trazabilidad real
6. mezclar este task con validación de salida o báscula antes de tiempo

Claude debe mantener el foco estricto en impresión y reimpresión controlada.

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
- Task 13: tickets operativos con QR

---

## 22. Dependencias posteriores

Este task habilita directamente:
- Task 15: flujo de venta en mostrador
- Task 16: flujo de báscula
- Task 17: validación de salida por QR
- reportes y auditorías por impresión/reimpresión

---

## 23. Entregables esperados

Claude debe entregar:

1. formato/vista imprimible funcional del ticket
2. impresión inicial funcional
3. reimpresión controlada funcional
4. registro de eventos de impresión
5. historial o resumen mínimo de impresión
6. auditoría básica
7. nota técnica breve sobre decisiones clave

---

## 24. Restricciones del task

- no usar TypeScript
- no avanzar aún al flujo completo de mostrador, báscula o validación de salida
- no dejar seguridad solo del lado frontend
- no tratar reimpresión como acción libre o invisible
- no mezclar este task con cierre total de la operación

---

## 25. Prompt sugerido para Claude Code — Task 14

```text
Necesito que ejecutes exclusivamente el Task 14 de este proyecto. No avances todavía al flujo completo de mostrador, báscula, validación de salida, reportes finales o sincronización offline.

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
- catálogos base del negocio
- vouchers/referencias prepago
- tickets operativos con QR

OBJETIVO DEL TASK
Implementar impresión y reimpresión controlada de tickets operativos, tratando cada impresión como un evento auditado y dejando la base lista para operación real.

LO QUE QUIERO QUE HAGAS
1. Diseña e implementa una vista/formato imprimible funcional del ticket.
2. Implementa impresión inicial del ticket.
3. Registra cada impresión inicial.
4. Implementa reimpresión controlada.
5. Exige permisos apropiados para reimprimir.
6. Si aplica, solicita motivo de reimpresión y regístralo.
7. Lleva conteo o historial mínimo de impresiones/reimpresiones.
8. Mantén contemplado el requisito operativo de 3 copias del ticket.
9. Protege el módulo según permisos del sistema como `tickets.print`, `tickets.reprint` o los equivalentes definidos.
10. Registra auditoría básica de acciones sensibles.
11. Si el registro de impresión/reimpresión debe pasar por Function por seguridad o consistencia, hazlo así y documenta brevemente la razón.
12. Deja la estructura lista para que el siguiente task resuelva flujo de mostrador sin rehacer el modelo.

REGLAS IMPORTANTES
- No uses TypeScript.
- No avances todavía a mostrador, báscula o validación de salida.
- No trates la impresión como simple vista sin trazabilidad.
- No dejes seguridad solo del lado frontend.
- No permitas reimpresión libre sin control.
- Mantén compatibilidad con Appwrite 1.8.1 y con la arquitectura de permisos ya definida.
- Mantén el formato imprimible claro, compacto y útil en operación.

CRITERIOS DE ACEPTACIÓN
Tu resultado debe dejar:
- vista imprimible funcional
- impresión inicial funcional
- reimpresión controlada funcional
- registro de eventos de impresión
- historial o resumen mínimo de impresiones
- permisos aplicados correctamente
- auditoría básica
- base lista para Task 15

ENTREGABLES
Entrégame:
1. vista/formato imprimible del ticket
2. impresión inicial funcional
3. reimpresión controlada funcional
4. registro de eventos de impresión
5. historial o resumen mínimo
6. auditoría básica
7. breve nota técnica de decisiones clave

No sigas al siguiente task. Quédate solo en Task 14.
```

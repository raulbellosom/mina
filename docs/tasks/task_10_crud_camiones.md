# Task 10 — CRUD de camiones

## 1. Nombre del task

**Task 10 — Implementar el CRUD de camiones**

---

## 2. Objetivo

Construir el módulo administrativo para crear, consultar, editar, activar y desactivar camiones del sistema, de forma que puedan ser reutilizados posteriormente en vouchers, tickets, báscula, venta en mostrador, validación de salida y reportes.

Este task debe tratar al camión como una entidad operativa propia, separada del chofer y del cliente, aunque dejando preparada la base para relaciones futuras con ambos.

---

## 3. Alcance

Incluye:

- listado de camiones
- vista de detalle de camión
- creación de camión
- edición de camión
- activación/desactivación lógica de camión
- datos vehiculares y operativos básicos
- soporte para relación opcional futura con cliente/empresa
- soporte para relación opcional futura con chofer principal o habitual
- validaciones básicas de consistencia y unicidad
- integración con permisos del sistema
- auditoría de acciones sensibles relacionadas con camiones

No incluye todavía:

- relación completa y administrable camión-chofer
- relación completa y administrable camión-cliente
- control avanzado de documentos vehiculares
- mantenimiento vehicular
- integración completa con vouchers, tickets, báscula o mostrador
- reportes funcionales
- sincronización offline

---

## 4. Problema que resuelve

Permite gestionar adecuadamente los camiones que participan en la operación, evitando capturas repetidas o improvisadas en los flujos operativos. Deja un catálogo limpio y reutilizable para identificar con precisión qué unidad entra, carga material y sale del sitio.

---

## 5. Logro esperado

Al terminar este task debe existir un módulo funcional donde un usuario autorizado pueda:

1. ver listado de camiones
2. consultar detalle de un camión
3. crear nuevos camiones
4. editar camiones existentes
5. activar o desactivar camiones
6. dejar preparada la referencia futura a cliente/empresa y chofer principal o habitual
7. dejar auditadas las acciones sensibles
8. dejar el catálogo listo para ser consumido por vouchers, tickets y flujos operativos posteriores

---

## 6. Preguntas que este task debe cerrar

1. ¿Qué datos mínimos necesita un camión en esta operación?
2. ¿Qué identificadores deben considerarse relevantes para evitar duplicados?
3. ¿Cómo se manejará la placa, número económico o identificador interno?
4. ¿Debe existir relación opcional con un cliente/empresa desde esta fase o solo dejarse preparada?
5. ¿Debe existir referencia a chofer principal desde esta fase o solo dejarse preparada?
6. ¿Cómo se desactiva un camión sin perder historial futuro?
7. ¿Qué permisos controlarán el acceso a este módulo?

---

## 7. Dependencia arquitectónica obligatoria

Este task debe obedecer estas reglas ya definidas:

- el acceso al módulo debe respetar roles y permisos del sistema
- el CRUD debe apoyarse en la base técnica y auth ya construidas
- la eliminación debe ser lógica, no destructiva, como política preferente
- los cambios sensibles deben quedar auditados
- el modelo debe dejar abierta la posibilidad de relaciones futuras con clientes, choferes y operaciones

---

## 8. Alcance funcional detallado

### 8.1 Listado de camiones
Debe existir una vista de tabla o lista con como mínimo:

- placa principal
- número económico o identificador interno si aplica
- tipo o clase de camión si aplica
- cliente/empresa relacionado si aplica o está disponible
- chofer habitual de referencia si aplica
- estado
- fecha de creación
- acciones disponibles según permisos

### 8.2 Detalle de camión
Debe existir una vista o panel de detalle que permita ver:

- placa
- número económico o identificador equivalente
- tipo o clase
- capacidad referencial si aplica
- cliente/empresa relacionado si aplica
- chofer habitual de referencia si aplica
- observaciones
- estado
- metadata relevante si aplica
- auditoría básica relacionada si es viable en esta fase

### 8.3 Crear camión
Debe existir un flujo para dar de alta un nuevo camión.

Debe contemplar como mínimo:
- placa principal
- placa secundaria opcional si aplica
- número económico o identificador interno opcional
- tipo o clase de camión
- capacidad referencial opcional
- cliente/empresa de referencia opcional si la arquitectura ya lo soporta
- chofer habitual de referencia opcional si la arquitectura ya lo soporta
- observaciones opcionales
- estado inicial

### 8.4 Editar camión
Debe permitirse editar:

- placas
- número económico o identificador
- tipo o clase
- capacidad referencial
- cliente/empresa de referencia si aplica
- chofer habitual de referencia si aplica
- observaciones
- estado

### 8.5 Activar/desactivar camión
No debe borrarse físicamente un camión como flujo normal.
Se debe privilegiar:

- deshabilitarlo
- impedir su selección futura en nuevas operaciones activas si está deshabilitado
- conservar historial futuro en operaciones relacionadas

### 8.6 Seguridad del módulo
Este módulo debe quedar protegido para que solo usuarios con permisos apropiados puedan acceder y modificarlo.

---

## 9. Reglas de negocio específicas

1. Un camión es una entidad operativa distinta del chofer y del cliente.
2. Un camión normalmente puede tener un chofer habitual, pero puede ser operado por otros choferes en el futuro.
3. Un camión puede estar relacionado con una empresa o cliente, pero no debe forzarse una relación rígida si todavía no está cerrada la arquitectura completa.
4. Un camión no debe borrarse físicamente como flujo normal.
5. Un camión deshabilitado no debe poder seleccionarse en nuevas operaciones activas.
6. El catálogo de camiones debe ser reutilizable por vouchers, tickets, mostrador, báscula y reportes.
7. Los cambios de creación, edición y desactivación deben quedar auditados.
8. El acceso al módulo debe respetar permisos del sistema.

---

## 10. Entidades involucradas

### `trucks`
Como catálogo principal de camiones.

### `clients`
Como referencia opcional futura si se decide ligar un camión a un cliente/empresa desde esta fase.

### `drivers`
Como referencia opcional futura si se decide ligar un chofer habitual desde esta fase.

### `audit_logs`
Para registrar acciones sensibles.

---

## 11. Datos mínimos esperados en la gestión de camiones

Claude debe ajustar esto a la arquitectura real, pero como mínimo se espera manejar:

- plateNumber
- secondaryPlateNumber opcional
- internalCode o economicNumber
- truckType o class
- referenceCapacity opcional
- clientId opcional
- habitualDriverId opcional
- notes
- enabled/status
- createdBy
- updatedBy

Opcionalmente, si aporta valor:
- color
- brand
- model
- year
- axleType
- tareReference
- tags

---

## 12. Operaciones que debe cubrir el módulo

### 12.1 Ver camiones
- listado
- detalle
- filtros mínimos si es viable
- búsqueda básica si es viable

### 12.2 Crear camión
- alta de camión
- validaciones mínimas de consistencia
- soporte correcto para relaciones opcionales futuras

### 12.3 Editar camión
- edición de datos generales
- control de cambios sensibles

### 12.4 Deshabilitar camión
- impedir uso futuro sin destruir historial

### 12.5 Reactivar camión
- recomendable dejar contemplado si se deshabilitó por error o cambio operativo

---

## 13. Seguridad esperada del módulo

Claude debe implementar o dejar lista la lógica para que:

- solo usuarios con permiso `catalogs.view` o permiso específico equivalente vean el módulo
- solo usuarios con permiso `catalogs.create` o permiso específico equivalente creen camiones
- solo usuarios con permiso `catalogs.update` o permiso específico equivalente editen camiones
- solo usuarios con permiso `catalogs.disable` o permiso específico equivalente deshabiliten/reactiven camiones

Si el proyecto ya contempla permisos más granulares para camiones, Claude puede usarlos, siempre que mantenga coherencia con la matriz de permisos existente.

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
- soporte claro para datos vehiculares y operativos
- badges de estado
- feedback visual de loading/error/success
- experiencia sobria y rápida

---

## 16. Criterios de aceptación

Este task se considera logrado cuando:

1. existe módulo accesible solo por usuarios autorizados
2. existe listado funcional de camiones
3. existe detalle funcional de camión
4. existe creación de camión
5. existe edición de camión
6. existe activación/desactivación lógica
7. existe soporte correcto para relaciones opcionales futuras con cliente y chofer
8. la UI respeta permisos básicos
9. las acciones sensibles quedan auditadas
10. la base queda lista para que vouchers, tickets y báscula consuman el catálogo sin rehacerlo

---

## 17. Validaciones funcionales esperadas

Claude debe contemplar o demostrar que:

- un usuario sin permiso no entra al módulo
- un usuario autorizado puede ver el listado
- un camión se crea con datos consistentes
- un camión deshabilitado cambia correctamente su estado
- la edición actualiza correctamente la entidad
- las acciones sensibles generan auditoría
- el camión puede ser consumido después por vouchers/tickets sin rehacer el modelo

---

## 18. Riesgos del task

1. mezclar demasiado pronto al camión con toda la lógica de choferes o clientes
2. no prever relación flexible con chofer futuro
3. no modelar bien identificadores como placa y número económico
4. permitir eliminación destructiva innecesaria
5. no auditar cambios del catálogo
6. sobrecargar el camión con campos todavía no necesarios

Claude debe mantener el foco estricto en camiones como catálogo operativo.

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
- Task 09: CRUD de choferes

---

## 20. Dependencias posteriores

Este task habilita directamente:
- Task 11: CRUD de plantas/orígenes
- futuros vouchers, tickets, validaciones de salida y reportes por camión

---

## 21. Entregables esperados

Claude debe entregar:

1. módulo funcional de camiones
2. listado
3. formulario de alta/edición
4. detalle de camión
5. deshabilitación/reactivación lógica
6. auditoría básica
7. nota técnica breve sobre decisiones clave

---

## 22. Restricciones del task

- no usar TypeScript
- no avanzar aún a vouchers, tickets, báscula, mostrador o reportes
- no mezclar este task con la logística completa de transporte
- no dejar seguridad solo del lado frontend
- no borrar físicamente camiones como flujo normal

---

## 23. Prompt sugerido para Claude Code — Task 10

```text
Necesito que ejecutes exclusivamente el Task 10 de este proyecto. No avances todavía a plantas, vouchers, tickets, báscula, mostrador, reportes o sincronización offline.

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

OBJETIVO DEL TASK
Implementar el CRUD de camiones para que el sistema tenga un catálogo operativo reutilizable, dejando la base lista para relaciones futuras con clientes, choferes y operaciones.

LO QUE QUIERO QUE HAGAS
1. Implementa el módulo de camiones.
2. Crea listado de camiones.
3. Crea vista de detalle de camión.
4. Implementa alta de camión.
5. Implementa edición de camión.
6. Implementa activación/desactivación lógica de camión.
7. Deja preparada la estructura para referencias futuras a cliente/empresa y chofer habitual, sin sobrecomplicar el modelo.
8. Protege el módulo según permisos del sistema como `catalogs.view`, `catalogs.create`, `catalogs.update`, `catalogs.disable` o los equivalentes definidos.
9. Registra auditoría básica de acciones sensibles.
10. Mantén la estructura lista para que vouchers, tickets, báscula y reportes consuman este catálogo sin rehacerlo.
11. Si ciertas operaciones deben pasar por Function por seguridad o consistencia, hazlo así y documenta brevemente la razón.

REGLAS IMPORTANTES
- No uses TypeScript.
- No avances todavía a otros módulos de negocio fuera del catálogo de camiones.
- No mezcles este task con la logística completa de transporte.
- No dejes seguridad solo del lado frontend.
- No borres físicamente camiones como flujo normal.
- Mantén compatibilidad con Appwrite 1.8.1 y con la arquitectura de permisos ya definida.

CRITERIOS DE ACEPTACIÓN
Tu resultado debe dejar:
- módulo protegido de camiones
- listado funcional
- detalle funcional
- alta funcional
- edición funcional
- deshabilitación/reactivación lógica
- base preparada para relaciones futuras con cliente y chofer
- auditoría básica
- base lista para módulos posteriores

ENTREGABLES
Entrégame:
1. módulo de camiones
2. listado
3. formulario de alta/edición
4. detalle
5. deshabilitación/reactivación lógica
6. auditoría básica
7. breve nota técnica de decisiones clave

No sigas al siguiente task. Quédate solo en Task 10.
```


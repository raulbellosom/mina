# Task 11 — CRUD de plantas / orígenes

## 1. Nombre del task

**Task 11 — Implementar el CRUD de plantas / orígenes**

---

## 2. Objetivo

Construir el módulo administrativo para crear, consultar, editar, activar y desactivar plantas u orígenes de carga del sistema, de forma que cada operación futura pueda identificar claramente de qué mina, planta o punto de origen proviene el material.

Este task debe resolver el cambio importante del negocio donde ya no solo se vende material de una sola mina, sino de múltiples orígenes, dejando la base lista para que vouchers, tickets, báscula, mostrador y reportes segmenten correctamente por planta/origen.

---

## 3. Alcance

Incluye:

- listado de plantas/orígenes
- vista de detalle de planta/origen
- creación de planta/origen
- edición de planta/origen
- activación/desactivación lógica de planta/origen
- datos operativos básicos del origen
- validaciones básicas de consistencia y unicidad
- integración con permisos del sistema
- auditoría de acciones sensibles relacionadas con plantas/orígenes

No incluye todavía:

- geolocalización avanzada
- mapas
- inventario por planta
- configuración logística compleja entre plantas
- integración completa con vouchers, tickets, báscula o mostrador
- reportes funcionales
- sincronización offline

---

## 4. Problema que resuelve

Permite identificar correctamente de dónde sale o se carga cada material, evitando que todas las operaciones se mezclen como si provinieran del mismo lugar. Esto es clave para trazabilidad, control operativo y reporteo por origen.

---

## 5. Logro esperado

Al terminar este task debe existir un módulo funcional donde un usuario autorizado pueda:

1. ver listado de plantas/orígenes
2. consultar detalle de una planta/origen
3. crear nuevos orígenes
4. editar orígenes existentes
5. activar o desactivar orígenes
6. dejar auditadas las acciones sensibles
7. dejar el catálogo listo para ser consumido por vouchers, tickets, báscula, mostrador y reportes posteriores

---

## 6. Preguntas que este task debe cerrar

1. ¿Qué datos mínimos necesita una planta/origen en esta operación?
2. ¿Cómo se manejará la unicidad de nombre, código o clave del origen?
3. ¿Cómo se desactiva un origen sin perder historial futuro?
4. ¿Qué pasa con un origen deshabilitado que ya tenga operaciones asociadas en el futuro?
5. ¿Qué permisos controlarán el acceso a este módulo?
6. ¿Qué datos deben quedar listos para reportes y segmentación futura?

---

## 7. Dependencia arquitectónica obligatoria

Este task debe obedecer estas reglas ya definidas:

- el acceso al módulo debe respetar roles y permisos del sistema
- el CRUD debe apoyarse en la base técnica y auth ya construidas
- la eliminación debe ser lógica, no destructiva, como política preferente
- los cambios sensibles deben quedar auditados
- el modelo debe dejar el origen listo para integrarse como referencia estable en operaciones futuras

---

## 8. Alcance funcional detallado

### 8.1 Listado de plantas/orígenes
Debe existir una vista de tabla o lista con como mínimo:

- nombre
- código o clave si aplica
- tipo o clasificación si aplica
- ubicación resumida si aplica
- estado
- fecha de creación
- acciones disponibles según permisos

### 8.2 Detalle de planta/origen
Debe existir una vista o panel de detalle que permita ver:

- nombre
- código o clave
- descripción
- tipo o clasificación
- ubicación o referencia operativa
- observaciones
- estado
- metadata relevante si aplica
- auditoría básica relacionada si es viable en esta fase

### 8.3 Crear planta/origen
Debe existir un flujo para dar de alta un nuevo origen.

Debe contemplar como mínimo:
- nombre
- código o clave opcional/requerida según diseño final
- tipo o clasificación opcional
- ubicación o referencia operativa opcional
- descripción/observaciones opcionales
- estado inicial

### 8.4 Editar planta/origen
Debe permitirse editar:

- nombre
- código o clave si aplica
- tipo o clasificación
- ubicación o referencia operativa
- descripción/observaciones
- estado

### 8.5 Activar/desactivar planta/origen
No debe borrarse físicamente una planta/origen como flujo normal.
Se debe privilegiar:

- deshabilitarla
- impedir su selección futura en nuevas operaciones activas si está deshabilitada
- conservar historial futuro en operaciones relacionadas

### 8.6 Seguridad del módulo
Este módulo debe quedar protegido para que solo usuarios con permisos apropiados puedan acceder y modificarlo.

---

## 9. Reglas de negocio específicas

1. Una planta/origen representa el punto desde donde se carga o proviene el material.
2. El sistema debe soportar múltiples plantas/orígenes activos.
3. Una planta/origen no debe borrarse físicamente como flujo normal.
4. Una planta/origen deshabilitada no debe poder seleccionarse en nuevas operaciones activas.
5. El catálogo de plantas/orígenes debe ser reutilizable por vouchers, tickets, mostrador, báscula y reportes.
6. Los cambios de creación, edición y desactivación deben quedar auditados.
7. El acceso al módulo debe respetar permisos del sistema.

---

## 10. Entidades involucradas

### `plants`
Como catálogo principal de plantas/orígenes.

### `audit_logs`
Para registrar acciones sensibles.

---

## 11. Datos mínimos esperados en la gestión de plantas/orígenes

Claude debe ajustar esto a la arquitectura real, pero como mínimo se espera manejar:

- name
- code
- type
- locationReference
- description
- notes
- enabled/status
- createdBy
- updatedBy

Opcionalmente, si aporta valor:
- region
- contactName
- contactPhone
- sortOrder

---

## 12. Operaciones que debe cubrir el módulo

### 12.1 Ver plantas/orígenes
- listado
- detalle
- filtros mínimos si es viable
- búsqueda básica si es viable

### 12.2 Crear planta/origen
- alta de origen
- validaciones mínimas de consistencia

### 12.3 Editar planta/origen
- edición de datos generales
- control de cambios sensibles

### 12.4 Deshabilitar planta/origen
- impedir uso futuro sin destruir historial

### 12.5 Reactivar planta/origen
- recomendable dejar contemplado si se deshabilitó por error o cambio operativo

---

## 13. Seguridad esperada del módulo

Claude debe implementar o dejar lista la lógica para que:

- solo usuarios con permiso `catalogs.view` o permiso específico equivalente vean el módulo
- solo usuarios con permiso `catalogs.create` o permiso específico equivalente creen plantas/orígenes
- solo usuarios con permiso `catalogs.update` o permiso específico equivalente editen plantas/orígenes
- solo usuarios con permiso `catalogs.disable` o permiso específico equivalente deshabiliten/reactiven plantas/orígenes

Si el proyecto ya contempla permisos más granulares para este catálogo, Claude puede usarlos, siempre que mantenga coherencia con la matriz de permisos existente.

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
- soporte claro para datos operativos del origen
- badges de estado
- feedback visual de loading/error/success
- experiencia sobria y rápida

---

## 16. Criterios de aceptación

Este task se considera logrado cuando:

1. existe módulo accesible solo por usuarios autorizados
2. existe listado funcional de plantas/orígenes
3. existe detalle funcional de planta/origen
4. existe creación de planta/origen
5. existe edición de planta/origen
6. existe activación/desactivación lógica
7. la UI respeta permisos básicos
8. las acciones sensibles quedan auditadas
9. la base queda lista para que vouchers, tickets, báscula, mostrador y reportes consuman este catálogo sin rehacerlo

---

## 17. Validaciones funcionales esperadas

Claude debe contemplar o demostrar que:

- un usuario sin permiso no entra al módulo
- un usuario autorizado puede ver el listado
- una planta/origen se crea con datos consistentes
- una planta/origen deshabilitada cambia correctamente su estado
- la edición actualiza correctamente la entidad
- las acciones sensibles generan auditoría
- el origen puede ser consumido después por vouchers/tickets sin rehacer el modelo

---

## 18. Riesgos del task

1. dejar el origen demasiado ambiguo
2. no modelar bien la clave/código del origen si se necesita para operación
3. permitir eliminación destructiva innecesaria
4. no auditar cambios del catálogo
5. mezclar este task con inventario o logística avanzada antes de tiempo

Claude debe mantener el foco estricto en plantas/orígenes como catálogo operativo.

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
- Task 10: CRUD de camiones

---

## 20. Dependencias posteriores

Este task habilita directamente:
- Task 12: modelo/CRUD de vouchers o referencias prepago
- Task 13: tickets con QR
- flujos de mostrador, báscula y validación de salida
- reportes por planta/origen

---

## 21. Entregables esperados

Claude debe entregar:

1. módulo funcional de plantas/orígenes
2. listado
3. formulario de alta/edición
4. detalle de planta/origen
5. deshabilitación/reactivación lógica
6. auditoría básica
7. nota técnica breve sobre decisiones clave

---

## 22. Restricciones del task

- no usar TypeScript
- no avanzar aún a vouchers, tickets, báscula, mostrador o reportes
- no mezclar este task con logística avanzada o inventario por planta
- no dejar seguridad solo del lado frontend
- no borrar físicamente plantas/orígenes como flujo normal

---

## 23. Prompt sugerido para Claude Code — Task 11

```text
Necesito que ejecutes exclusivamente el Task 11 de este proyecto. No avances todavía a vouchers, tickets, báscula, mostrador, reportes o sincronización offline.

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

OBJETIVO DEL TASK
Implementar el CRUD de plantas/orígenes para que el sistema tenga un catálogo operativo reutilizable que identifique de dónde proviene el material y que pueda ser consumido por vouchers, tickets y flujos operativos posteriores.

LO QUE QUIERO QUE HAGAS
1. Implementa el módulo de plantas/orígenes.
2. Crea listado de plantas/orígenes.
3. Crea vista de detalle de planta/origen.
4. Implementa alta de planta/origen.
5. Implementa edición de planta/origen.
6. Implementa activación/desactivación lógica de planta/origen.
7. Protege el módulo según permisos del sistema como `catalogs.view`, `catalogs.create`, `catalogs.update`, `catalogs.disable` o los equivalentes definidos.
8. Registra auditoría básica de acciones sensibles.
9. Mantén la estructura lista para que vouchers, tickets, báscula, mostrador y reportes consuman este catálogo sin rehacerlo.
10. Si ciertas operaciones deben pasar por Function por seguridad o consistencia, hazlo así y documenta brevemente la razón.

REGLAS IMPORTANTES
- No uses TypeScript.
- No avances todavía a otros módulos de negocio fuera del catálogo de plantas/orígenes.
- No mezcles este task con inventario o logística avanzada por planta.
- No dejes seguridad solo del lado frontend.
- No borres físicamente plantas/orígenes como flujo normal.
- Mantén compatibilidad con Appwrite 1.8.1 y con la arquitectura de permisos ya definida.

CRITERIOS DE ACEPTACIÓN
Tu resultado debe dejar:
- módulo protegido de plantas/orígenes
- listado funcional
- detalle funcional
- alta funcional
- edición funcional
- deshabilitación/reactivación lógica
- auditoría básica
- base lista para módulos posteriores

ENTREGABLES
Entrégame:
1. módulo de plantas/orígenes
2. listado
3. formulario de alta/edición
4. detalle
5. deshabilitación/reactivación lógica
6. auditoría básica
7. breve nota técnica de decisiones clave

No sigas al siguiente task. Quédate solo en Task 11.
```


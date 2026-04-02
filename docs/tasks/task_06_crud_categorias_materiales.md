# Task 06 — CRUD de categorías de materiales

## 1. Nombre del task

**Task 06 — Implementar el CRUD de categorías de materiales**

---

## 2. Objetivo

Construir el módulo administrativo para crear, consultar, editar, activar y desactivar categorías de materiales, de forma que sirvan como base organizativa para el catálogo de materiales del sistema y permitan agrupar productos como gravas, arenas, bases hidráulicas, desperdicios y otros tipos definidos por la operación.

Este task debe preparar la estructura necesaria para que el Task 07 implemente correctamente el CRUD de materiales con imagen de referencia, unidad comercial y demás metadatos.

---

## 3. Alcance

Incluye:

- listado de categorías de materiales
- vista de detalle de categoría
- creación de categoría
- edición de categoría
- activación/desactivación lógica de categoría
- validaciones de unicidad y consistencia básicas
- integración con permisos del sistema
- auditoría de acciones sensibles relacionadas con categorías

No incluye todavía:

- CRUD completo de materiales
- carga de imágenes
- integración con vouchers, tickets, báscula o mostrador
- reportes funcionales
- sincronización offline

---

## 4. Problema que resuelve

Permite definir una estructura ordenada para clasificar los materiales del sistema antes de crear el catálogo detallado de materiales. Evita que los materiales queden desorganizados o dependan de nombres libres sin agrupación.

---

## 5. Logro esperado

Al terminar este task debe existir un módulo funcional donde un usuario autorizado pueda:

1. ver listado de categorías de materiales
2. consultar detalle de una categoría
3. crear nuevas categorías
4. editar categorías existentes
5. activar o desactivar categorías
6. mantener consistencia del catálogo para que el Task 07 use estas categorías al crear materiales
7. dejar auditadas las acciones sensibles

---

## 6. Preguntas que este task debe cerrar

1. ¿Qué estructura mínima tendrá una categoría de material?
2. ¿Cómo se manejará la unicidad del nombre y/o código de una categoría?
3. ¿Cómo se desactiva una categoría sin perder historial?
4. ¿Qué pasa con una categoría deshabilitada que ya tiene materiales asociados en el futuro?
5. ¿Qué permisos controlarán el acceso a este módulo?
6. ¿Qué acciones deben auditarse obligatoriamente?

---

## 7. Dependencia arquitectónica obligatoria

Este task debe obedecer estas reglas ya definidas:

- el acceso al módulo debe respetar roles y permisos del sistema
- el CRUD debe apoyarse en la base técnica y auth ya construidas
- la eliminación debe ser lógica, no destructiva, como política preferente
- los cambios sensibles deben quedar auditados

---

## 8. Alcance funcional detallado

### 8.1 Listado de categorías
Debe existir una vista de tabla o lista con como mínimo:

- nombre
- código si se define
- descripción breve
- estado
- fecha de creación
- acciones disponibles según permisos

### 8.2 Detalle de categoría
Debe existir una vista o panel de detalle que permita ver:

- nombre
- código si aplica
- descripción
- estado
- metadata relevante si aplica
- auditoría básica relacionada si es viable en esta fase

### 8.3 Crear categoría
Debe existir un flujo para dar de alta una nueva categoría.

Debe contemplar como mínimo:
- nombre
- código opcional o requerido según diseño final
- descripción opcional
- estado inicial

### 8.4 Editar categoría
Debe permitirse editar:

- nombre
- código si aplica
- descripción
- estado

### 8.5 Activar/desactivar categoría
No debe borrarse físicamente una categoría como flujo normal.
Se debe privilegiar:

- deshabilitarla
- impedir su selección futura si está deshabilitada
- conservar historial y relaciones futuras con materiales

### 8.6 Seguridad del módulo
Este módulo debe quedar protegido para que solo usuarios con permisos apropiados puedan acceder y modificarlo.

---

## 9. Reglas de negocio específicas

1. Las categorías agrupan materiales del catálogo principal.
2. Una categoría no debe borrarse físicamente como flujo normal.
3. Una categoría deshabilitada no debe poder seleccionarse para nuevos materiales activos, salvo que la lógica futura lo justifique.
4. El nombre de categoría debe ser claro y consistente con la operación.
5. Si se usa código de categoría, debe ser único y estable.
6. Los cambios de creación, edición y desactivación deben quedar auditados.
7. El acceso al módulo debe respetar permisos del sistema.

---

## 10. Entidades involucradas

### `material_categories`
Como catálogo principal de categorías de materiales.

### `audit_logs`
Para registrar acciones sensibles.

Opcionalmente, según la implementación:
- referencia futura desde `materials`

---

## 11. Datos mínimos esperados en la gestión de categorías

Claude debe ajustar esto a la arquitectura real, pero como mínimo se espera manejar:

- name
- code
- description
- enabled/status
- sortOrder opcional si aporta valor
- createdBy
- updatedBy

---

## 12. Operaciones que debe cubrir el módulo

### 12.1 Ver categorías
- listado
- detalle
- filtros mínimos si es viable
- búsqueda básica si es viable

### 12.2 Crear categoría
- alta de categoría
- validaciones mínimas de unicidad y consistencia

### 12.3 Editar categoría
- edición de datos generales
- control de cambios sensibles

### 12.4 Deshabilitar categoría
- impedir uso futuro sin destruir historial

### 12.5 Reactivar categoría
- recomendable dejar contemplado si se deshabilitó por error o cambio operativo

---

## 13. Seguridad esperada del módulo

Claude debe implementar o dejar lista la lógica para que:

- solo usuarios con permiso `catalogs.view` o permiso específico equivalente vean el módulo
- solo usuarios con permiso `catalogs.create` o permiso específico equivalente creen categorías
- solo usuarios con permiso `catalogs.update` o permiso específico equivalente editen categorías
- solo usuarios con permiso `catalogs.disable` o permiso específico equivalente deshabiliten/reactiven categorías

Si el proyecto ya contempla permisos más granulares para categorías de materiales, Claude puede usarlos, siempre que mantenga coherencia con la matriz de permisos existente.

---

## 14. Consideración técnica importante

Claude debe evaluar si basta con el acceso directo a la colección o si ciertas operaciones sensibles deben pasar por Function, especialmente si el proyecto ya está centralizando auditoría y validaciones críticas en backend.

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
- badges de estado
- feedback visual de loading/error/success
- experiencia sobria y rápida

---

## 16. Criterios de aceptación

Este task se considera logrado cuando:

1. existe módulo accesible solo por usuarios autorizados
2. existe listado funcional de categorías de materiales
3. existe detalle funcional de categoría
4. existe creación de categoría
5. existe edición de categoría
6. existe activación/desactivación lógica
7. la UI respeta permisos básicos
8. las acciones sensibles quedan auditadas
9. la base queda lista para que Task 07 cree materiales vinculados a categorías

---

## 17. Validaciones funcionales esperadas

Claude debe contemplar o demostrar que:

- un usuario sin permiso no entra al módulo
- un usuario autorizado puede ver el listado
- una categoría se crea con datos consistentes
- una categoría deshabilitada cambia correctamente su estado
- la edición actualiza correctamente la entidad
- las acciones sensibles generan auditoría
- la categoría puede ser usada como referencia por materiales en el task siguiente

---

## 18. Riesgos del task

1. crear categorías demasiado ambiguas o sin criterio operativo
2. no validar unicidad suficiente
3. permitir eliminación destructiva innecesaria
4. no auditar cambios del catálogo
5. mezclar este módulo con el CRUD completo de materiales antes de tiempo

Claude debe mantener el foco estricto en categorías.

---

## 19. Dependencias previas

Depende de:
- Task 01: arquitectura de identidad, roles y permisos
- Task 02: base técnica del proyecto
- Task 03: autenticación, bootstrap y carga de `users_profile`
- Task 04: módulo de usuarios internos
- Task 05: módulo de roles y permisos

---

## 20. Dependencias posteriores

Este task habilita directamente:
- Task 07: CRUD de materiales con imagen de referencia
- organización correcta del catálogo de materiales
- filtros y reportes futuros por categoría

---

## 21. Entregables esperados

Claude debe entregar:

1. módulo funcional de categorías de materiales
2. listado
3. formulario de alta/edición
4. detalle de categoría
5. deshabilitación/reactivación lógica
6. auditoría básica
7. nota técnica breve sobre decisiones clave

---

## 22. Restricciones del task

- no usar TypeScript
- no avanzar aún al CRUD completo de materiales
- no avanzar aún a vouchers, tickets, báscula, mostrador o reportes
- no dejar seguridad solo del lado frontend
- no borrar físicamente categorías como flujo normal

---

## 23. Prompt sugerido para Claude Code — Task 06

```text
Necesito que ejecutes exclusivamente el Task 06 de este proyecto. No avances todavía al CRUD completo de materiales, ni a clientes, vouchers, tickets, báscula, mostrador, reportes o sincronización offline.

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

OBJETIVO DEL TASK
Implementar el CRUD de categorías de materiales para que el sistema tenga una base ordenada de clasificación antes de construir el CRUD de materiales.

LO QUE QUIERO QUE HAGAS
1. Implementa el módulo de categorías de materiales.
2. Crea listado de categorías.
3. Crea vista de detalle de categoría.
4. Implementa alta de categoría.
5. Implementa edición de categoría.
6. Implementa activación/desactivación lógica de categoría.
7. Protege el módulo según permisos del sistema como `catalogs.view`, `catalogs.create`, `catalogs.update`, `catalogs.disable` o los equivalentes definidos.
8. Registra auditoría básica de acciones sensibles.
9. Mantén la estructura lista para que el siguiente task construya materiales vinculados a estas categorías.
10. Si ciertas operaciones deben pasar por Function por seguridad o consistencia, hazlo así y documenta brevemente la razón.

REGLAS IMPORTANTES
- No uses TypeScript.
- No avances todavía al CRUD completo de materiales.
- No avances todavía a otros módulos de negocio.
- No dejes seguridad solo del lado frontend.
- No borres físicamente categorías como flujo normal.
- Mantén compatibilidad con Appwrite 1.8.1 y con la arquitectura de permisos ya definida.

CRITERIOS DE ACEPTACIÓN
Tu resultado debe dejar:
- módulo protegido de categorías de materiales
- listado funcional
- detalle funcional
- alta funcional
- edición funcional
- deshabilitación/reactivación lógica
- auditoría básica
- base lista para Task 07

ENTREGABLES
Entrégame:
1. módulo de categorías de materiales
2. listado
3. formulario de alta/edición
4. detalle
5. deshabilitación/reactivación lógica
6. auditoría básica
7. breve nota técnica de decisiones clave

No sigas al siguiente task. Quédate solo en Task 06.
```


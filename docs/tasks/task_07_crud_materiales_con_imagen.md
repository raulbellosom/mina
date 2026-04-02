# Task 07 — CRUD de materiales con imagen de referencia

## 1. Nombre del task

**Task 07 — Implementar el CRUD de materiales con imagen de referencia**

---

## 2. Objetivo

Construir el módulo administrativo para crear, consultar, editar, activar y desactivar materiales del sistema, incluyendo su imagen de referencia, categoría, unidad comercial y metadatos operativos necesarios para que puedan usarse después en vouchers, tickets, báscula, mostrador y validación de salida.

Este task debe convertir la taxonomía creada en el Task 06 en un catálogo real de materiales utilizables en la operación.

---

## 3. Alcance

Incluye:

- listado de materiales
- vista de detalle de material
- creación de material
- edición de material
- activación/desactivación lógica de material
- asociación con categoría de material
- carga y gestión de imagen de referencia
- visualización de imagen en listado y detalle cuando aplique
- validaciones básicas de consistencia y unicidad
- integración con permisos del sistema
- auditoría de acciones sensibles relacionadas con materiales

No incluye todavía:

- integración completa con vouchers, tickets, báscula o mostrador
- validación automática por visión computacional
- múltiples imágenes avanzadas por material si no son necesarias en esta fase
- reportes funcionales
- sincronización offline

---

## 4. Problema que resuelve

Permite registrar correctamente los materiales reales que vende la operación, evitando depender de nombres sueltos o catálogos ambiguos. Además, incorpora una imagen de referencia que servirá más adelante como apoyo visual para validar que el contenido cargado en el camión corresponda al material registrado.

---

## 5. Logro esperado

Al terminar este task debe existir un módulo funcional donde un usuario autorizado pueda:

1. ver listado de materiales
2. consultar detalle de un material
3. crear nuevos materiales
4. editar materiales existentes
5. activar o desactivar materiales
6. asociar materiales a categorías
7. cargar y visualizar una imagen de referencia
8. dejar auditadas las acciones sensibles
9. dejar el catálogo listo para ser usado por los módulos operativos posteriores

---

## 6. Preguntas que este task debe cerrar

1. ¿Qué datos mínimos debe tener un material para esta operación?
2. ¿La imagen de referencia será obligatoria desde esta fase o solo altamente recomendada?
3. ¿Cómo se manejará la unicidad del nombre o código del material?
4. ¿Qué unidad comercial o referencia operativa debe guardar cada material?
5. ¿Cómo se desactiva un material sin perder historial futuro?
6. ¿Cómo se almacenará la imagen de referencia en Appwrite Storage?
7. ¿Qué permisos controlarán el acceso a este módulo?

---

## 7. Dependencia arquitectónica obligatoria

Este task debe obedecer estas reglas ya definidas:

- el acceso al módulo debe respetar roles y permisos del sistema
- el CRUD debe apoyarse en la base técnica y auth ya construidas
- las categorías del Task 06 deben usarse como referencia real
- la eliminación debe ser lógica, no destructiva, como política preferente
- los cambios sensibles deben quedar auditados
- las imágenes deben manejarse correctamente con Storage y referencias seguras

---

## 8. Alcance funcional detallado

### 8.1 Listado de materiales
Debe existir una vista de tabla o lista con como mínimo:

- nombre
- categoría
- imagen miniatura si aplica
- unidad comercial por defecto si aplica
- estado
- fecha de creación
- acciones disponibles según permisos

### 8.2 Detalle de material
Debe existir una vista o panel de detalle que permita ver:

- nombre
- categoría
- descripción
- imagen de referencia
- unidad comercial
- estado
- metadata relevante si aplica
- auditoría básica relacionada si es viable en esta fase

### 8.3 Crear material
Debe existir un flujo para dar de alta un nuevo material.

Debe contemplar como mínimo:
- nombre
- código opcional o requerido según diseño final
- categoría
- descripción opcional
- unidad comercial base o referencia operativa
- imagen de referencia
- estado inicial

### 8.4 Editar material
Debe permitirse editar:

- nombre
- código si aplica
- categoría
- descripción
- unidad comercial
- imagen de referencia
- estado

### 8.5 Activar/desactivar material
No debe borrarse físicamente un material como flujo normal.
Se debe privilegiar:

- deshabilitarlo
- impedir su selección futura si está deshabilitado
- conservar historial futuro en operaciones relacionadas

### 8.6 Gestión de imagen de referencia
Debe existir soporte para:

- subir imagen
- reemplazar imagen
- visualizar imagen
- conservar referencia al archivo correcto
- manejar ausencia de imagen si la política final lo permite

La imagen de referencia debe pensarse como apoyo visual operativo para los módulos posteriores.

### 8.7 Seguridad del módulo
Este módulo debe quedar protegido para que solo usuarios con permisos apropiados puedan acceder y modificarlo.

---

## 9. Reglas de negocio específicas

1. Todo material debe pertenecer a una categoría válida si la política final lo exige.
2. El nombre del material debe ser claro y consistente con la operación real.
3. Si se usa código de material, debe ser único y estable.
4. Un material deshabilitado no debe poder seleccionarse en nuevas operaciones activas.
5. El material no debe borrarse físicamente como flujo normal.
6. La imagen de referencia debe apoyar la validación visual futura del contenido del camión.
7. La unidad comercial del material no sustituye el peso real del camión; ambas cosas son conceptos distintos.
8. Los cambios de creación, edición, reemplazo de imagen y desactivación deben quedar auditados.

---

## 10. Entidades involucradas

### `materials`
Como catálogo principal de materiales.

### `material_categories`
Como referencia para clasificación.

### Storage bucket de imágenes de materiales
Para almacenar la imagen de referencia.

### `audit_logs`
Para registrar acciones sensibles.

---

## 11. Datos mínimos esperados en la gestión de materiales

Claude debe ajustar esto a la arquitectura real, pero como mínimo se espera manejar:

- name
- code
- categoryId
- description
- referenceImageFileId o campo equivalente
- referenceImageUrl o resolución equivalente si aplica en frontend
- defaultCommercialUnit o referencia operativa equivalente
- enabled/status
- createdBy
- updatedBy

Opcionalmente, si aporta valor:
- sortOrder
- aliases
- notes

---

## 12. Operaciones que debe cubrir el módulo

### 12.1 Ver materiales
- listado
- detalle
- filtros mínimos si es viable
- búsqueda básica si es viable

### 12.2 Crear material
- alta de material
- validaciones mínimas de consistencia
- asociación correcta con categoría
- subida de imagen de referencia

### 12.3 Editar material
- edición de datos generales
- cambio de categoría
- reemplazo de imagen
- control de cambios sensibles

### 12.4 Deshabilitar material
- impedir uso futuro sin destruir historial

### 12.5 Reactivar material
- recomendable dejar contemplado si se deshabilitó por error o cambio operativo

---

## 13. Seguridad esperada del módulo

Claude debe implementar o dejar lista la lógica para que:

- solo usuarios con permiso `materials.view` vean el módulo
- solo usuarios con permiso `materials.create` creen materiales
- solo usuarios con permiso `materials.update` editen materiales
- solo usuarios con permiso `materials.disable` deshabiliten/reactiven materiales
- solo usuarios con permiso adecuado gestionen la subida o reemplazo de imagen si se considera una acción sensible diferenciada

Además, si el proyecto ya centraliza auditoría o control de Storage con mayor rigor, Claude debe mantener coherencia con ello.

---

## 14. Consideración técnica importante

Claude debe evaluar cuidadosamente:

- cómo modelar la referencia al archivo de imagen en Storage
- si la subida de imagen debe hacerse directamente o con una capa más controlada
- cómo evitar referencias rotas al reemplazar imágenes
- cómo resolver previsualización segura y consistente en frontend

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
- miniaturas bien manejadas
- formulario consistente
- selector de categoría usable
- feedback visual de loading/error/success
- experiencia sobria y rápida

---

## 16. Criterios de aceptación

Este task se considera logrado cuando:

1. existe módulo accesible solo por usuarios autorizados
2. existe listado funcional de materiales
3. existe detalle funcional de material
4. existe creación de material
5. existe edición de material
6. existe activación/desactivación lógica
7. existe asociación correcta con categoría
8. existe subida y visualización de imagen de referencia
9. la UI respeta permisos básicos
10. las acciones sensibles quedan auditadas
11. la base queda lista para usar materiales en Task 08 y módulos operativos posteriores

---

## 17. Validaciones funcionales esperadas

Claude debe contemplar o demostrar que:

- un usuario sin permiso no entra al módulo
- un usuario autorizado puede ver el listado
- un material se crea con categoría válida
- una imagen de referencia puede subirse y visualizarse correctamente
- un material deshabilitado cambia correctamente su estado
- la edición actualiza correctamente la entidad
- las acciones sensibles generan auditoría
- el material puede ser consumido después por vouchers/tickets sin rehacer el modelo

---

## 18. Riesgos del task

1. subir imágenes sin estrategia clara de Storage
2. dejar referencias rotas al reemplazar imagen
3. mezclar la unidad comercial con peso real del camión
4. permitir eliminación destructiva innecesaria
5. no auditar cambios del catálogo
6. avanzar demasiado pronto a lógica operativa de vouchers o tickets

Claude debe mantener el foco estricto en materiales como catálogo.

---

## 19. Dependencias previas

Depende de:
- Task 01: arquitectura de identidad, roles y permisos
- Task 02: base técnica del proyecto
- Task 03: autenticación, bootstrap y carga de `users_profile`
- Task 04: módulo de usuarios internos
- Task 05: módulo de roles y permisos
- Task 06: CRUD de categorías de materiales

---

## 20. Dependencias posteriores

Este task habilita directamente:
- Task 08: CRUD de clientes
- Task 09: CRUD de choferes
- Task 10: CRUD de camiones
- Task 11: CRUD de plantas/orígenes
- y sobre todo los módulos operativos que necesitarán seleccionar materiales y mostrar su imagen de referencia

---

## 21. Entregables esperados

Claude debe entregar:

1. módulo funcional de materiales
2. listado
3. formulario de alta/edición
4. detalle de material
5. deshabilitación/reactivación lógica
6. integración con categoría
7. manejo de imagen de referencia
8. auditoría básica
9. nota técnica breve sobre decisiones clave

---

## 22. Restricciones del task

- no usar TypeScript
- no avanzar aún a vouchers, tickets, báscula, mostrador o reportes
- no mezclar este task con validación operativa completa
- no dejar seguridad solo del lado frontend
- no borrar físicamente materiales como flujo normal

---

## 23. Prompt sugerido para Claude Code — Task 07

```text
Necesito que ejecutes exclusivamente el Task 07 de este proyecto. No avances todavía a clientes, choferes, camiones, plantas, vouchers, tickets, báscula, mostrador, reportes o sincronización offline.

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

OBJETIVO DEL TASK
Implementar el CRUD de materiales con imagen de referencia para que el sistema tenga un catálogo real de materiales listo para usarse en operación y validación visual futura.

LO QUE QUIERO QUE HAGAS
1. Implementa el módulo de materiales.
2. Crea listado de materiales.
3. Crea vista de detalle de material.
4. Implementa alta de material.
5. Implementa edición de material.
6. Implementa activación/desactivación lógica de material.
7. Vincula correctamente cada material con una categoría válida.
8. Implementa la carga, reemplazo y visualización de la imagen de referencia.
9. Protege el módulo según permisos del sistema como `materials.view`, `materials.create`, `materials.update`, `materials.disable` o los equivalentes definidos.
10. Registra auditoría básica de acciones sensibles.
11. Mantén la estructura lista para que módulos posteriores como vouchers, tickets y validación de salida consuman este catálogo sin rehacerlo.
12. Si ciertas operaciones de Storage o auditoría deben pasar por Function por seguridad o consistencia, hazlo así y documenta brevemente la razón.

REGLAS IMPORTANTES
- No uses TypeScript.
- No avances todavía a otros módulos de negocio fuera del catálogo de materiales.
- No mezcles este task con la lógica completa de operación.
- No dejes seguridad solo del lado frontend.
- No borres físicamente materiales como flujo normal.
- Mantén compatibilidad con Appwrite 1.8.1 y con la arquitectura de permisos ya definida.

CRITERIOS DE ACEPTACIÓN
Tu resultado debe dejar:
- módulo protegido de materiales
- listado funcional
- detalle funcional
- alta funcional
- edición funcional
- deshabilitación/reactivación lógica
- integración correcta con categorías
- manejo funcional de imagen de referencia
- auditoría básica
- base lista para módulos posteriores

ENTREGABLES
Entrégame:
1. módulo de materiales
2. listado
3. formulario de alta/edición
4. detalle
5. deshabilitación/reactivación lógica
6. integración con categoría
7. manejo de imagen de referencia
8. auditoría básica
9. breve nota técnica de decisiones clave

No sigas al siguiente task. Quédate solo en Task 07.
```


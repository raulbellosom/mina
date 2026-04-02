# Task 04 — Módulo administrativo de usuarios internos

## 1. Nombre del task

**Task 04 — Implementar el módulo administrativo de usuarios internos**

---

## 2. Objetivo

Construir el módulo administrativo para gestionar a los usuarios internos de la plataforma, apoyándose en la capa de autenticación y bootstrap ya implementada en el Task 03, y respetando la arquitectura de identidad, perfiles, labels, roles y permisos definida en el Task 01.

Este task debe permitir administrar el personal que usará el sistema, dejando claro qué vive en Appwrite Auth y qué vive en `users_profile`.

---

## 3. Alcance

Incluye:
- listado de usuarios internos
- vista de detalle de usuario
- creación de usuarios internos
- edición de datos operativos del usuario
- activación/desactivación lógica del usuario
- asignación inicial de labels y rol funcional según arquitectura definida
- vínculo entre usuario Auth y `users_profile`
- validaciones de acceso para que solo personal autorizado gestione usuarios
- auditoría de acciones sensibles sobre usuarios

No incluye todavía:
- gestión avanzada de roles y permisos como módulo independiente
- CRUD completo de roles
- editor completo de matriz de permisos
- módulos de negocio como materiales, clientes, vouchers, tickets, báscula o mostrador
- recuperación de contraseña avanzada o autoservicio del usuario

---

## 4. Problema que resuelve

Permite que el sistema no dependa de creación manual externa desordenada de usuarios. Da una forma controlada y auditable de dar acceso al personal operativo y administrativo, vinculando correctamente Appwrite Auth con el perfil extendido `users_profile`.

---

## 5. Logro esperado

Al terminar este task debe existir un módulo funcional donde un usuario con permiso suficiente pueda:

1. ver listado de usuarios internos
2. consultar detalle de un usuario
3. crear un nuevo usuario interno
4. registrar o completar su `users_profile`
5. asignar labels y rol inicial según la estrategia definida
6. activar o desactivar usuarios
7. editar información operativa permitida
8. dejar registro auditado de acciones sensibles

---

## 6. Dependencia arquitectónica obligatoria

Este task debe obedecer estas reglas ya definidas:

- **Appwrite Auth** = identidad principal
- **users_profile** = extensión operativa del usuario
- **labels de Appwrite** = segmentación principal de acceso
- **roles y permisos finos** = modelo propio del sistema

No se debe duplicar innecesariamente información de Auth dentro de `users_profile`, salvo la mínima necesaria por trazabilidad o conveniencia operativa.

---

## 7. Alcance funcional detallado

### 7.1 Listado de usuarios internos
Debe existir una vista de tabla o lista con como mínimo:
- nombre
- email
- rol principal
- labels principales si aplica
- estatus
- fecha de creación
- acciones disponibles según permisos

### 7.2 Detalle de usuario
Debe existir una vista o panel de detalle que permita ver:
- datos de Auth relevantes
- datos de `users_profile`
- rol/labels asignados
- estatus
- auditoría básica relacionada si es viable en esta fase

### 7.3 Crear usuario interno
Debe existir un flujo para dar de alta un nuevo usuario interno.

Debe contemplar:
- creación del usuario en Appwrite Auth
- creación o vinculación de `users_profile`
- asignación inicial de rol
- asignación inicial de labels
- estatus inicial definido

### 7.4 Editar usuario interno
Debe permitirse editar datos operativos del perfil.

Por ejemplo:
- nombre visible
- teléfono
- código interno
- notas
- rol inicial si la fase ya lo permite
- labels iniciales si la fase ya lo permite

### 7.5 Activar/desactivar usuario
No debe borrarse físicamente a un usuario interno como flujo normal.
Se debe privilegiar:
- deshabilitar acceso operativo
- marcar `enabled = false` o estatus equivalente
- impedir operación futura si el usuario está deshabilitado

### 7.6 Seguridad del módulo
Este módulo debe quedar protegido para que solo usuarios con permisos apropiados puedan acceder.

---

## 8. Reglas de negocio específicas

1. Todo usuario interno debe existir primero o crearse dentro de Appwrite Auth.
2. Todo usuario interno debe tener `users_profile` relacionado.
3. No todos los usuarios autenticados pueden administrar usuarios.
4. El módulo debe respetar permisos de ver, crear, editar, deshabilitar y, si aplica, reactivar.
5. La desactivación debe ser lógica, no borrado destructivo por defecto.
6. El alta y cambios sensibles deben quedar auditados.
7. Si se asignan labels, deben alinearse con la estrategia del Task 01.
8. Si se asigna rol principal, debe alinearse con la estrategia del Task 01.
9. Un usuario deshabilitado no debe poder operar aunque la sesión exista.

---

## 9. Entidades involucradas

### Appwrite Auth user
Como fuente principal de identidad.

### `users_profile`
Como extensión operativa.

### `roles`
Para rol principal o referencia funcional.

### `audit_logs`
Para registrar acciones sensibles.

Opcionalmente, según la implementación definida:
- `role_permissions`
- `permissions_catalog`

---

## 10. Operaciones que debe cubrir el módulo

### 10.1 Ver usuarios
- listado
- búsqueda básica si es viable
- filtros mínimos si es viable

### 10.2 Crear usuario
- crear identidad
- crear perfil
- asignar configuración inicial

### 10.3 Editar usuario
- editar perfil operativo
- actualizar rol/labels si entra en este task

### 10.4 Deshabilitar usuario
- impedir acceso operativo futuro
- conservar historial

### 10.5 Reactivar usuario
- opcional en esta fase, pero recomendable dejar contemplado

---

## 11. Seguridad esperada del módulo

Claude debe implementar o dejar lista la lógica para que:
- solo usuarios con permiso `users.view` vean el módulo
- solo usuarios con permiso `users.create` puedan crear
- solo usuarios con permiso `users.update` puedan editar
- solo usuarios con permiso `users.disable` puedan deshabilitar/reactivar

Además, las acciones sensibles no deben depender solo del frontend.
Si la creación o modificación de usuarios requiere mayor seguridad, debe resolverse mediante Function o capa backend apropiada.

---

## 12. Consideración técnica importante

Claude debe evaluar cuidadosamente si ciertas operaciones deben hacerse directamente desde frontend o mediante Functions, especialmente:
- creación de usuarios Auth
- asignación de labels
- operaciones sensibles de administración

La decisión debe priorizar seguridad, compatibilidad con Appwrite 1.8.1 y buenas prácticas.

---

## 13. Criterios de aceptación

1. existe módulo accesible solo por usuarios autorizados
2. existe listado funcional de usuarios internos
3. existe detalle de usuario
4. existe creación de usuario interno
5. se crea correctamente la relación Auth + `users_profile`
6. se pueden editar datos operativos permitidos
7. se puede deshabilitar lógicamente a un usuario
8. la UI respeta permisos básicos
9. las acciones sensibles quedan auditadas
10. la base queda lista para que Task 05 profundice en roles y permisos sin rehacer el módulo

---

## 14. Entregables esperados

1. módulo de usuarios internos funcional
2. listado de usuarios
3. formulario de alta
4. vista o panel de detalle/edición
5. flujo de deshabilitación lógica
6. validaciones de acceso por permiso
7. auditoría básica de acciones sensibles
8. nota técnica breve sobre decisiones clave

---

## 15. Prompt sugerido para Claude Code

```text
Necesito que ejecutes exclusivamente el Task 04 de este proyecto. No avances todavía a materiales, clientes, vouchers, tickets, báscula, mostrador, reportes, sincronización offline ni al módulo avanzado de roles y permisos.

CONTEXTO
Estoy construyendo un sistema operativo y administrativo para una mina de materiales usando:
- Appwrite self-hosted 1.8.1 en https://appwrite.racoondevs.com
- Appwrite CLI
- MCP appwrite-api
- MCP appwrite-docs
- frontend con React + Vite + JavaScript + TailwindCSS 4.1 + Radix UI + vite-plugin-pwa + framer-motion

La arquitectura del proyecto ya definió que:
- Appwrite Auth = identidad principal
- users_profile = extensión operativa
- labels de Appwrite = segmentación principal
- roles/permisos finos = modelo propio del sistema

Además, ya existe o debe existir la base técnica y la capa de autenticación/bootstrapping de sesión de los tasks previos.

OBJETIVO DEL TASK
Implementar el módulo administrativo de usuarios internos para que personal autorizado pueda crear, consultar, editar y deshabilitar usuarios del sistema, manteniendo correctamente la relación entre Appwrite Auth y `users_profile`.

LO QUE QUIERO QUE HAGAS
1. Revisa la arquitectura ya definida para Auth + users_profile + labels + roles.
2. Implementa el módulo de usuarios internos respetando esa arquitectura.
3. Crea listado de usuarios internos.
4. Crea vista de detalle de usuario.
5. Implementa alta de usuario interno.
6. Al crear un usuario, resuelve correctamente:
   - creación del usuario en Appwrite Auth o estrategia segura equivalente
   - creación/vinculación de `users_profile`
   - asignación inicial de labels si corresponde en esta fase
   - asignación inicial de rol si corresponde en esta fase
7. Implementa edición de datos operativos del usuario.
8. Implementa deshabilitación lógica del usuario.
9. Protege el módulo según permisos como `users.view`, `users.create`, `users.update`, `users.disable`.
10. Registra auditoría básica de acciones sensibles.
11. Si ciertas operaciones deben hacerse mediante Function por seguridad, hazlo así y documenta brevemente la razón.

REGLAS IMPORTANTES
- No uses TypeScript.
- No avances todavía a otros módulos de negocio.
- No construyas aún el módulo avanzado de roles/permisos completo.
- No dejes seguridad solo del lado frontend.
- No borres físicamente usuarios como flujo normal.
- Mantén compatibilidad con Appwrite 1.8.1 validando decisiones con `appwrite-docs` y `appwrite-api` cuando sea necesario.

CRITERIOS DE ACEPTACIÓN
Tu resultado debe dejar:
- módulo protegido de usuarios internos
- listado funcional
- detalle funcional
- alta funcional
- relación Auth + users_profile correcta
- edición de perfil operativo
- deshabilitación lógica
- auditoría básica
- base lista para el Task 05

ENTREGABLES
Entrégame:
1. módulo de usuarios internos
2. listado
3. formulario de alta
4. detalle/edición
5. deshabilitación lógica
6. auditoría básica
7. breve nota técnica de decisiones clave

No sigas al siguiente task. Quédate solo en Task 04.
```

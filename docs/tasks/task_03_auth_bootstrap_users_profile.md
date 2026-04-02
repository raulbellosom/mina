# Task 03 — Autenticación, bootstrap de sesión y carga de users_profile

## 1. Nombre del task

**Task 03 — Implementar autenticación, bootstrap de sesión y carga del perfil extendido `users_profile`**

---

## 2. Objetivo

Implementar la primera capa funcional real de acceso al sistema: inicio de sesión, restauración de sesión, cierre de sesión, carga del usuario autenticado desde Appwrite Auth, carga de su perfil extendido desde `users_profile`, y bootstrap del estado global necesario para que los siguientes módulos puedan trabajar con identidad, rol y permisos.

---

## 3. Alcance

Incluye:
- login con Appwrite Auth
- manejo de sesión actual
- restauración de sesión al recargar
- logout
- carga del usuario autenticado
- consulta y carga de `users_profile`
- integración base con roles/labels/permisos según lo definido en Task 01
- bootstrap global de auth state
- route guards iniciales
- pantallas mínimas de acceso y estados de carga/error
- manejo de usuario deshabilitado o inconsistente

No incluye todavía CRUD administrativo completo de usuarios ni módulos de negocio.

---

## 4. Logro esperado

1. un usuario puede iniciar sesión
2. la sesión persiste y se restaura correctamente
3. el sistema obtiene el usuario actual desde Appwrite
4. el sistema obtiene su `users_profile`
5. el frontend conoce el estado de autenticación
6. el frontend conoce el estado base de perfil/rol/labels/permisos
7. existen rutas protegidas mínimas
8. un usuario inconsistente o deshabilitado es tratado correctamente

---

## 5. Requerimientos concretos del task

### A. Pantalla de login
- formulario claro
- email
- password
- estados de loading
- mensajes de error controlados

### B. Inicio de sesión
- flujo de inicio de sesión usando Appwrite
- manejo de error de credenciales
- manejo de errores inesperados

### C. Restauración de sesión
- loading inicial
- sesión activa válida
- sesión inexistente
- sesión inválida

### D. Carga del usuario actual
Después de autenticar o restaurar sesión, cargar el usuario actual desde Appwrite Auth.

### E. Carga de `users_profile`
Con el usuario autenticado, buscar su perfil extendido en `users_profile`.
Manejar:
- perfil encontrado
- perfil no encontrado
- perfil deshabilitado
- datos inconsistentes

### F. Contexto global de autenticación
Exponer:
- estado de inicialización
- estado autenticado/no autenticado
- auth user
- users_profile
- logout
- refresh session/profile si conviene

### G. Route guards base
- guard para rutas públicas
- guard para rutas autenticadas
- estructura preparada para permisos posteriores

### H. Logout
- limpiar estado local
- invalidar navegación autenticada
- redirigir adecuadamente

### I. Manejo de inconsistencia operativa
Definir qué verá el usuario cuando:
- existe sesión pero falta `users_profile`
- `users_profile` está deshabilitado
- hay un error de bootstrap

---

## 6. Estados que debe manejar el frontend

Como mínimo:
- initializing
- unauthenticated
- authenticating
- authenticated
- loading_profile
- profile_missing
- disabled
- error

---

## 7. Criterios de aceptación

1. existe una pantalla funcional de login
2. el usuario puede autenticarse con Appwrite
3. la sesión se restaura al recargar
4. el sistema carga el usuario actual
5. el sistema carga `users_profile`
6. existe un contexto global reutilizable de autenticación
7. existen rutas autenticadas protegidas
8. el logout funciona correctamente
9. el sistema maneja perfil faltante, perfil deshabilitado y errores de bootstrap
10. la base queda lista para que Task 04 construya el CRUD de usuarios sin rehacer auth

---

## 8. Entregables esperados

1. pantalla de login funcional
2. capa o provider global de autenticación
3. bootstrap de sesión
4. carga de `users_profile`
5. route guard base
6. logout funcional
7. manejo de estados de error/inconsistencia
8. nota técnica breve sobre el flujo implementado

---

## 9. Prompt sugerido para Claude Code

```text
Necesito que ejecutes exclusivamente el Task 03 de este proyecto. No avances todavía al CRUD administrativo de usuarios, roles avanzados, materiales, clientes, vouchers, tickets, báscula, mostrador, reportes ni sincronización offline.

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

OBJETIVO DEL TASK
Implementar autenticación, bootstrap de sesión y carga del perfil extendido `users_profile` para que la app ya tenga acceso real y contexto global de identidad.

LO QUE QUIERO QUE HAGAS
1. Implementa la pantalla de login para usuarios internos.
2. Implementa el flujo de login con Appwrite Auth.
3. Implementa restauración/bootstrap de sesión al cargar la app.
4. Obtén el usuario actual autenticado desde Appwrite.
5. Busca y carga su `users_profile`.
6. Crea una capa global reutilizable para exponer:
   - estado auth
   - usuario auth
   - users_profile
   - labels/rol/permisos base si ya aplica
   - login/logout
7. Implementa route guards base para rutas autenticadas.
8. Implementa logout correcto.
9. Maneja correctamente estos casos:
   - sin sesión
   - sesión inválida
   - users_profile faltante
   - users_profile deshabilitado
   - error inesperado en bootstrap
10. Deja la base lista para que el siguiente task construya el CRUD de usuarios internos sin rehacer la capa auth.

REGLAS IMPORTANTES
- No uses TypeScript.
- No construyas todavía el CRUD completo de usuarios.
- No avances todavía a módulos de negocio.
- Mantén la lógica de auth centralizada.
- Respeta la arquitectura definida en Task 01 y la base técnica del Task 02.
- Documenta brevemente las decisiones clave.

CRITERIOS DE ACEPTACIÓN
Tu resultado debe dejar:
- login funcional
- sesión restaurable
- auth user cargado
- users_profile cargado
- contexto global de auth
- guard base para rutas autenticadas
- logout funcional
- manejo correcto de perfil faltante/deshabilitado/error

ENTREGABLES
Entrégame:
1. pantalla de login
2. provider/capa global de auth
3. bootstrap de sesión
4. carga de users_profile
5. route guard base
6. logout
7. breve nota técnica del flujo

No sigas al siguiente task. Quédate solo en Task 03.
```

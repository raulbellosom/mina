# Documento maestro de requerimientos v1

## 1. Nombre provisional del proyecto

Sistema de control operativo, comercial y de trazabilidad para venta y salida de materiales de mina.

Nombre técnico provisional sugerido: **MinaFlow**.

---

## 2. Propósito del sistema

Desarrollar una plataforma web administrativa y operativa para gestionar la venta, despacho, carga, validación y salida de materiales pétreos o minerales de construcción, con foco en:

- control de operaciones de báscula
- control de venta en mostrador
- trazabilidad de tickets/vouchers con QR
- registro de pesos y cantidades comerciales
- validación de salida para evitar fugas o robo de material
- administración de usuarios, roles y permisos
- persistencia local temporal ante fallas de internet y sincronización posterior con Appwrite
- reporteo operativo y comercial por cliente, material, camión, chofer, planta y periodo

---

## 3. Objetivos de negocio

1. Reducir pérdidas o fugas de material mediante doble validación operativa.
2. Tener trazabilidad completa de cada salida de material.
3. Registrar adecuadamente la venta, ya sea por cliente con vale/referencia o por venta en mostrador.
4. Identificar cantidades comerciales vendidas y, cuando aplique, contrastarlas contra pesos reales.
5. Mejorar el control de usuarios y responsabilidades dentro de la operación.
6. Permitir operación continua incluso con intermitencia de internet.
7. Obtener reportes confiables para supervisión y toma de decisiones.

---

## 4. Alcance general del sistema

El sistema deberá cubrir:

- autenticación de usuarios internos mediante Appwrite Auth
- perfiles extendidos mediante colección `users_profile`
- control de roles y permisos por módulo y acción
- gestión de catálogos maestros
- generación de vouchers/tickets con QR
- flujo operativo de báscula
- flujo operativo de venta en mostrador
- validación de salida mediante escaneo QR o captura manual
- bitácoras y auditoría
- reportes operativos y comerciales
- persistencia offline local y sincronización posterior

Fuera de alcance inicial:

- procesamiento real de pagos
- facturación fiscal
- integración con dispositivos físicos de báscula de forma directa
- integración nativa con impresoras industriales específicas
- integración con hardware handheld especializado por SDK propietario
- apps nativas móviles

---

## 5. Stack tecnológico obligatorio

### Backend
- Appwrite self-hosted 1.8.1
- Endpoint actual: `https://appwrite.racoondevs.com`
- Uso de:
  - Auth
  - Databases
  - Storage
  - Functions
  - Sites
- Uso de Appwrite CLI
- Validación de decisiones con MCP:
  - `appwrite-api`
  - `appwrite-docs`

### Frontend
- React
- Vite
- JavaScript (no TypeScript)
- TailwindCSS 4.1
- vite-plugin-pwa
- Radix UI
- lucide-react
- phosphor-icons solo si aporta valor real
- framer-motion
- light theme y dark theme

---

## 6. Actores del sistema

### 6.1 Administrador
Responsable de configuración general del sistema.

Puede:
- gestionar usuarios
- gestionar roles y permisos
- gestionar catálogos
- ver todos los reportes
- ver auditoría
- cancelar operaciones si tiene privilegio
- reimprimir tickets si tiene privilegio

### 6.2 Supervisor
Responsable de supervisar operaciones y detectar anomalías.

Puede:
- consultar operaciones
- validar incidencias
- ver reportes
- autorizar acciones sensibles según permisos

### 6.3 Capturista de báscula
Responsable de registrar operaciones de báscula.

Puede:
- registrar operaciones por vale/referencia
- registrar pesos de entrada y salida
- imprimir tickets
- validar información visualmente
- consultar operaciones relacionadas con báscula

### 6.4 Personal de mostrador
Responsable de ventas directas no asociadas a un cliente con vale previo.

Puede:
- registrar venta en mostrador
- registrar referencias de pago
- generar e imprimir ticket
- consultar operaciones de mostrador

### 6.5 Guardia de salida
Responsable de validar la salida del camión.

Puede:
- escanear QR
- consultar resumen del ticket
- aprobar o rechazar salida según reglas
- registrar observaciones

### 6.6 Operador de carga
Responsable de cargar el material según el ticket.

Puede:
- consultar ticket u orden de carga
- confirmar que el material y la cantidad comercial correspondan
- opcionalmente marcar paso de carga si el flujo final lo requiere

### 6.7 Secretaria / personal administrativo
Responsable de registrar entidades maestras y apoyar en administración.

Puede:
- registrar clientes
- registrar camiones
- registrar choferes
- gestionar ciertos catálogos según permisos

---

## 7. Módulos del sistema

1. Autenticación
2. Usuarios
3. Roles y permisos
4. Materiales
5. Categorías de materiales
6. Clientes
7. Transportistas (si se separan de clientes)
8. Choferes
9. Camiones
10. Asignaciones chofer-camión
11. Plantas / orígenes
12. Vouchers / referencias prepago
13. Tickets / órdenes operativas
14. Báscula
15. Venta en mostrador
16. Validación de salida
17. Auditoría / bitácoras
18. Reportes
19. Sincronización offline
20. Configuración general

---

## 8. Flujos principales del negocio

## 8.1 Flujo A: cliente con vale o referencia prepago

### Descripción
Un cliente ya cuenta con un vale, folio o referencia previa. El chofer llega a báscula, se registra la operación, se emiten tickets, se carga el material, el camión vuelve a báscula y se valida la salida.

### Flujo resumido
1. Chofer llega a báscula.
2. Entrega vale, folio o referencia.
3. Capturista registra la operación.
4. Se imprime ticket en 3 copias.
5. Chofer pasa al operador de carga.
6. Se carga el material.
7. El camión vuelve a báscula.
8. Se registra peso de salida.
9. Se calcula tara y peso neto si aplica.
10. Se valida y autoriza la salida.

### Datos clave capturados
- cliente
- chofer
- camión
- material
- planta/origen
- cantidad comercial
- unidad comercial
- folio/referencia
- peso de entrada
- peso de salida
- tara
- peso neto
- observaciones
- usuario que registró

### Resultado esperado
Operación cerrada con trazabilidad completa, QR válido y registro comercial + operativo.

---

## 8.2 Flujo B: venta en mostrador

### Descripción
Un chofer llega por cuenta propia, compra material en mostrador, recibe ticket, se carga el material y posteriormente su salida debe ser validada por guardia y/o personal de báscula.

### Flujo resumido
1. Chofer llega a mostrador.
2. Personal registra venta.
3. Se captura tipo de pago referencial y referencia bancaria si aplica.
4. Se genera ticket con QR.
5. Se imprime ticket en 3 copias.
6. Chofer pasa a carga.
7. Al salir, guardia escanea QR.
8. Báscula o control valida visualmente información del camión/material.
9. Se aprueba o rechaza salida.

### Datos clave capturados
- tipo de venta = mostrador
- cliente genérico o cliente directo de mostrador
- chofer
- camión
- material
- planta/origen
- cantidad comercial
- forma de pago referencial
- referencia bancaria opcional
- QR
- estado de validación de salida

### Resultado esperado
La venta queda registrada y la salida solo puede completarse tras la validación correspondiente.

---

## 8.3 Flujo C: validación de salida por QR

### Descripción
El guardia escanea el QR o captura manualmente folio/ticket, el sistema recupera el registro y se confirma si la salida es válida.

### Validaciones mínimas
- ticket existe
- ticket vigente
- ticket no cancelado
- ticket no usado anteriormente
- ticket no bloqueado
- material y camión coinciden visualmente con la operación

### Posibles resultados
- salida aprobada
- salida rechazada
- salida bloqueada por inconsistencia
- salida pendiente de revisión

---

## 9. Reglas de negocio conocidas

1. La venta se realiza generalmente por camión lleno.
2. Aun así, se debe conservar la cantidad comercial declarada en el vale o venta.
3. La cantidad comercial debe quedar separada del peso real del camión.
4. Un chofer normalmente tiene un camión principal, pero puede operar otros.
5. Una empresa puede tener choferes relacionados.
6. Una empresa puede tener camiones, pero no siempre.
7. Un material siempre debe tener nombre configurable desde catálogo.
8. Debe existir soporte para múltiples plantas/orígenes.
9. Cada ticket debe tener QR único.
10. Debe existir control de reimpresión.
11. Debe existir control de estados operativos.
12. Debe existir registro de auditoría para acciones sensibles.
13. Los pagos solo se registran como referencia operativa; no se procesan dentro de la plataforma.
14. La validación de salida debe impedir reuso fraudulento de tickets.
15. Debe existir una imagen de referencia del material para apoyar la validación visual.

---

## 10. Requerimientos funcionales

## RF-01. Autenticación de usuarios internos
El sistema debe permitir login de usuarios internos mediante Appwrite Auth.

### Criterios de aceptación
- existe inicio de sesión
- la sesión persiste correctamente
- el sistema identifica al usuario autenticado
- el sistema carga el perfil extendido del usuario

---

## RF-02. Gestión de usuarios
El sistema debe permitir crear y administrar usuarios internos.

### Criterios de aceptación
- un administrador puede crear usuarios
- el usuario se crea en Auth de Appwrite
- se crea o vincula un `users_profile`
- se pueden editar datos operativos del usuario
- se puede activar o desactivar acceso

---

## RF-03. Gestión de roles y permisos
El sistema debe permitir asignar roles y permisos por módulo y acción.

### Criterios de aceptación
- un usuario puede tener uno o más labels/roles según estrategia final
- el sistema limita ver, crear, modificar, eliminar, exportar, imprimir, reimprimir y validar
- los permisos se respetan en frontend y backend

---

## RF-04. CRUD de materiales
El sistema debe permitir crear, editar, listar, consultar y desactivar materiales.

### Criterios de aceptación
- cada material tiene nombre
- puede tener categoría
- puede tener imagen de referencia
- puede desactivarse sin borrarse físicamente
- puede consultarse desde voucher/ticket/validación

---

## RF-05. CRUD de categorías de materiales
El sistema debe permitir crear y gestionar categorías o tipos de material.

### Criterios de aceptación
- una categoría puede agrupar materiales
- se puede activar o desactivar
- materiales pueden asociarse a una categoría

---

## RF-06. CRUD de clientes
El sistema debe permitir gestionar clientes tipo persona o empresa.

### Criterios de aceptación
- se pueden registrar datos generales
- se puede identificar si es persona o empresa
- se pueden consultar operaciones asociadas

---

## RF-07. CRUD de choferes
El sistema debe permitir gestionar choferes.

### Criterios de aceptación
- se registran datos básicos del chofer
- se puede relacionar con empresa si aplica
- se puede consultar historial de operaciones

---

## RF-08. CRUD de camiones
El sistema debe permitir gestionar camiones.

### Criterios de aceptación
- se registran placas y datos básicos
- se pueden relacionar con choferes o empresas según corresponda
- se puede consultar historial de operaciones

---

## RF-09. CRUD de plantas/orígenes
El sistema debe permitir gestionar plantas u orígenes de carga.

### Criterios de aceptación
- se pueden crear múltiples plantas
- cada operación puede registrar su origen
- se pueden emitir reportes por planta

---

## RF-10. Gestión de vouchers/referencias
El sistema debe permitir registrar vouchers o referencias de operación/venta.

### Criterios de aceptación
- existe distinción entre voucher prepago y venta mostrador
- el voucher conserva cantidad comercial
- el voucher puede vincular cliente, chofer, camión, material y planta
- el voucher tiene estado

---

## RF-11. Generación de ticket con QR
El sistema debe generar un ticket operativo con QR único.

### Criterios de aceptación
- el ticket tiene identificador único
- el QR se puede escanear para resolver la operación
- el ticket puede imprimirse
- el sistema registra impresión y reimpresión

---

## RF-12. Flujo de báscula
El sistema debe permitir registrar una operación de báscula desde inicio hasta salida.

### Criterios de aceptación
- se puede buscar/crear operación
- se puede registrar peso de entrada
- se puede registrar peso de salida
- se puede calcular tara y neto
- se puede cerrar la operación con auditoría

---

## RF-13. Flujo de venta en mostrador
El sistema debe permitir registrar una venta directa desde mostrador.

### Criterios de aceptación
- se puede registrar chofer, camión, material, planta y cantidad
- se puede registrar tipo de pago referencial
- se puede generar ticket
- se requiere validación posterior para completar salida

---

## RF-14. Validación de salida
El sistema debe permitir validar la salida de un camión por QR o captura manual.

### Criterios de aceptación
- el sistema recupera la operación correcta
- se puede aprobar o rechazar salida
- se registra quién validó
- se evita reuso del ticket

---

## RF-15. Auditoría y bitácoras
El sistema debe registrar eventos sensibles.

### Criterios de aceptación
- se registra creación de ticket
- se registra impresión/reimpresión
- se registra validación de salida
- se registran cambios relevantes en entidades maestras y usuarios

---

## RF-16. Reportes operativos y comerciales
El sistema debe generar reportes filtrables.

### Criterios de aceptación
- reportes por fecha
- reportes por cliente
- reportes por material
- reportes por chofer
- reportes por camión
- reportes por planta
- reportes por tipo de venta
- exportación según permisos

---

## RF-17. Persistencia offline local
El sistema debe conservar operaciones críticas cuando no haya internet.

### Criterios de aceptación
- la operación no se pierde si se va el internet
- la operación se guarda localmente
- el usuario es notificado de que está pendiente de sincronizar
- la información sigue disponible aunque se cierre el navegador

---

## RF-18. Sincronización posterior con Appwrite
El sistema debe sincronizar la información pendiente cuando regrese la conexión.

### Criterios de aceptación
- al reconectar se detectan registros pendientes
- el sistema intenta sincronizar automáticamente o manualmente
- los registros sincronizados cambian de estado
- los errores de sincronización quedan visibles

---

## 11. Requerimientos no funcionales

## RNF-01. Disponibilidad operativa ante fallos de internet
Debe existir persistencia local para operaciones críticas y sincronización posterior.

## RNF-02. Seguridad
La plataforma debe respetar autenticación, autorización, validación de permisos y trazabilidad de acciones sensibles.

## RNF-03. Trazabilidad
Toda operación crítica debe poder rastrearse por usuario, fecha, hora y contexto.

## RNF-04. Rendimiento operativo
La interfaz debe ser rápida para captura en escritorio y utilizable en dispositivos móviles/handheld para validación.

## RNF-05. Escalabilidad funcional
La base del sistema debe permitir crecer en módulos sin rehacer arquitectura.

## RNF-06. Mantenibilidad
El código debe estar modularizado y documentado.

## RNF-07. Usabilidad
Las pantallas deben priorizar claridad, rapidez de captura y confirmación visual.

## RNF-08. Compatibilidad de despliegue
La plataforma debe quedar preparada para Appwrite Sites y el entorno self-hosted actual.

---

## 12. Entidades de negocio identificadas inicialmente

### Seguridad / usuarios
- users_profile
- roles
- permissions_catalog
- role_permissions
- audit_logs

### Catálogos
- material_categories
- materials
- clients
- drivers
- trucks
- plants
- payment_reference_types

### Relaciones opcionales
- driver_truck_assignments
- client_driver_links
- client_truck_links

### Operación
- vouchers
- tickets
- dispatches
- weight_logs
- print_logs
- scan_logs
- sync_queue_local_reference (solo conceptual; la persistencia local del navegador no necesariamente será colección Appwrite)

---

## 13. Estados operativos sugeridos

### Estados de voucher/ticket/operación
- draft
- issued
- printed
- loading
- loaded
- pending_exit_validation
- completed
- cancelled
- rejected
- blocked
- sync_pending
- sync_error

Estos estados deberán refinarse por entidad concreta en diseño posterior.

---

## 14. Permisos funcionales sugeridos

Acciones base por módulo:
- view
- create
- update
- delete
- export
- print
- reprint
- approve
- reject
- validate_exit
- register_weight
- manage_users
- manage_roles
- manage_catalogs
- view_reports
- manage_vouchers
- manage_counter_sales

---

## 15. Riesgos y consideraciones

1. El flujo offline requiere diseño cuidadoso para evitar duplicidades al sincronizar.
2. La validación visual de material depende del criterio humano; la imagen solo apoya.
3. Si luego se desea integración directa con báscula física, habrá que diseñar una fase posterior.
4. La impresión puede variar según impresora disponible, por lo que inicialmente debe resolverse con una estrategia web robusta.
5. La seguridad de tickets QR debe evitar reutilización o falsificación simple.
6. Las relaciones entre cliente, chofer y camión no deben modelarse de forma rígida.
7. Los permisos no deben quedarse solo en frontend; deberán reforzarse con Functions.

---

## 16. Decisiones arquitectónicas preliminares

1. Appwrite Auth será la fuente de identidad principal.
2. `users_profile` será una extensión operativa del usuario.
3. Los permisos deberán modelarse de forma explícita por módulo/acción.
4. Los labels de Appwrite Auth se usarán como base de agrupación/segmentación de acceso.
5. Las acciones críticas deberán pasar por Functions cuando sea necesario.
6. La persistencia offline se resolverá del lado frontend con almacenamiento local persistente y una cola de sincronización.
7. Los materiales deberán soportar imagen de referencia almacenada en Storage.
8. Vouchers, tickets y registros de peso deberán tratarse como entidades separadas para mantener trazabilidad.

---

## 17. Definiciones pendientes por cerrar

1. Si “transportista” será una entidad independiente o si inicialmente se absorberá en clientes/empresa.
2. Si el operador de carga tendrá una vista activa dentro del sistema o solo dependerá del ticket impreso.
3. Qué datos exactos llevará el ticket impreso.
4. Qué tipo de unidad comercial se manejará formalmente además de “camión lleno”.
5. Qué tan detallado será el manejo de cancelaciones e incidencias.
6. Si el guardia validará directamente o si la validación final siempre deberá pasar también por báscula.
7. Si habrá una vista de timeline por operación.
8. Si la referencia bancaria tendrá estructura libre o validaciones específicas.

---

## 18. Fases macro del proyecto

### Fase 0. Descubrimiento y diseño
- cerrar requerimientos
- validar arquitectura Appwrite
- cerrar modelo de datos inicial

### Fase 1. Base técnica
- frontend base
- auth
- theme
- pwa
- appwrite config

### Fase 2. Seguridad
- users_profile
- roles
- permisos
- gestión de usuarios

### Fase 3. Catálogos
- materiales
- categorías
- clientes
- choferes
- camiones
- plantas

### Fase 4. Documentos operativos
- vouchers
- tickets
- QR
- impresión

### Fase 5. Operación
- báscula
- mostrador
- validación de salida

### Fase 6. Persistencia offline
- cola local
- sincronización
- estados de sync

### Fase 7. Reportes y auditoría
- reportes
- exportación
- auditoría

### Fase 8. Pulido y despliegue
- validaciones finales
- endurecimiento de permisos
- documentación final
- despliegue

---

## 19. Backlog inicial de implementación por tasks pequeñas

### Task 01
Definir arquitectura de usuarios, perfiles, labels, roles y permisos.

### Task 02
Inicializar proyecto frontend y configuración base Appwrite.

### Task 03
Implementar autenticación y carga de perfil extendido.

### Task 04
Implementar módulo de usuarios internos.

### Task 05
Implementar módulo de roles y permisos.

### Task 06
Implementar CRUD de categorías de materiales.

### Task 07
Implementar CRUD de materiales con imagen de referencia.

### Task 08
Implementar CRUD de plantas/orígenes.

### Task 09
Implementar CRUD de clientes.

### Task 10
Implementar CRUD de choferes.

### Task 11
Implementar CRUD de camiones.

### Task 12
Implementar relaciones chofer-camión y asociaciones opcionales.

### Task 13
Diseñar modelo y estados de vouchers.

### Task 14
Implementar emisión de voucher.

### Task 15
Implementar ticket con QR.

### Task 16
Implementar impresión y reimpresión controlada.

### Task 17
Implementar flujo de venta en mostrador.

### Task 18
Implementar flujo de báscula.

### Task 19
Implementar validación de salida por QR.

### Task 20
Implementar bitácoras y auditoría.

### Task 21
Implementar persistencia offline para operaciones críticas.

### Task 22
Implementar sincronización al reconectar.

### Task 23
Implementar reportes base.

### Task 24
Implementar exportación controlada.

### Task 25
Pulido final y validaciones cruzadas.

---

## 20. Meta inmediata recomendada

La siguiente meta recomendada es cerrar el **Task 01: arquitectura de usuarios, perfiles, labels, roles y permisos**, porque eso condiciona seguridad, CRUDs, módulos y flujo completo del sistema.

---

## 21. Resultado esperado de este documento

Este documento funciona como base viva del proyecto para:

- seguir refinando alcance
- convertir cada task en prompt individual para Claude Code
- controlar dependencias entre módulos
- evitar que la IA construya todo a la vez sin orden
- mantener consistencia entre negocio, arquitectura y desarrollo

---

## 22. Revisión y ajustes estratégicos al documento maestro

Después de revisar el alcance completo, se agregan estas precisiones para fortalecer la base del proyecto antes de iniciar implementación:

### 22.1 Separación clara entre identidad, perfil y permisos

Se confirma esta arquitectura como dirección preferente:

- **Appwrite Auth** = identidad principal del usuario
- **users_profile** = extensión operativa del usuario dentro del sistema
- **labels de Appwrite Auth** = segmentación principal de acceso por área o grupo operativo
- **matriz de permisos propia** = permisos finos por módulo y acción

Esto significa que el sistema no debe depender únicamente de labels para toda la seguridad. Los labels ayudarán a agrupar y segmentar, pero la lógica fina de permisos deberá modelarse explícitamente.

### 22.2 Seguridad en dos capas

La seguridad deberá aplicarse en dos niveles:

1. **Frontend**
   - ocultar módulos no permitidos
   - deshabilitar acciones no permitidas
   - proteger rutas

2. **Backend / Functions / Appwrite**
   - validar acciones sensibles
   - impedir que un usuario ejecute acciones aunque manipule el frontend
   - registrar auditoría de acciones críticas

### 22.3 Catálogos con eliminación lógica

Las entidades maestras no deben eliminarse físicamente cuando ya existan operaciones relacionadas.
Se deberá privilegiar:

- `enabled: true/false`
- o `status: active/inactive`

Esto aplica especialmente para:
- materiales
- categorías
- clientes
- choferes
- camiones
- plantas
- roles

### 22.4 Materiales con soporte visual obligatorio

Se eleva a requisito fuerte que cada material pueda tener:

- imagen de referencia principal
- descripción opcional
- categoría
- unidad comercial por defecto si aplica

La imagen de referencia debe visualizarse en:
- catálogo de materiales
- detalle del material
- voucher/ticket
- validación de salida

### 22.5 Operación offline acotada por fases

La persistencia offline no debe intentar cubrir todo desde el inicio.
Se recomienda el siguiente alcance por etapas:

**Fase offline inicial:**
- creación de venta mostrador
- creación de voucher
- registro de pesos
- validación de salida
- bitácora mínima

**Fuera de alcance offline inicial:**
- reportes complejos
- administración completa de usuarios
- catálogos avanzados con sincronización conflictiva

### 22.6 Estados y trazabilidad obligatoria

Toda entidad operativa importante deberá tener:

- estado actual
- usuario creador
- usuario actualizador cuando aplique
- timestamps
- logs separados para eventos sensibles

Se refuerza la recomendación de separar entidades como:
- vouchers
- tickets
- dispatches
- weight_logs
- print_logs
- scan_logs
- audit_logs

### 22.7 Reimpresión como acción sensible

La reimpresión deberá considerarse una acción sensible y auditada. No todos los usuarios podrán reimprimir.
La reimpresión debe registrar:

- quién reimprimió
- cuándo
- motivo
- número de reimpresiones acumuladas

### 22.8 Guardias y validación de salida

La validación de salida debe diseñarse pensando en operación rápida, idealmente con:

- vista de escaneo QR
- fallback de captura manual por folio
- resumen visual compacto
- confirmación rápida de estado
- bloqueo inmediato por ticket inválido, cancelado o usado

### 22.9 Entidad de transportista pendiente de cierre

Aún queda por decidir si “transportista” será:

- una entidad separada de `clients`
- o una clasificación dentro de clientes/empresas

Por ahora se mantiene como decisión pendiente, pero el diseño de `drivers` y `trucks` no debe asumir que siempre pertenecen a un cliente.

### 22.10 Meta de arquitectura inmediata

Antes de construir flujos operativos, debe quedar completamente resuelto:

- cómo se crean usuarios
- cómo se vinculan con `users_profile`
- cómo se asignan labels
- cómo se asignan roles
- cómo se evalúan permisos
- cómo se auditan cambios de seguridad

Esto convierte al **Task 01** en el primer bloque obligatorio de diseño e implementación.

---

## 23. Task 01 detallado: arquitectura de usuarios, perfiles, labels, roles y permisos

## 23.1 Nombre del task

**Task 01 — Diseñar e implementar la arquitectura de identidad, perfiles, roles y permisos**

---

## 23.2 Objetivo

Definir e implementar la base de seguridad y control de acceso del sistema, usando Appwrite Auth como fuente principal de identidad, `users_profile` como extensión operativa, labels para agrupación de acceso y una matriz de permisos propia por módulo/acción.

Este task debe dejar resuelta la arquitectura que gobernará todo el sistema antes de construir los demás módulos.

---

## 23.3 Alcance

Incluye:

- estrategia de identidad con Appwrite Auth
- diseño de `users_profile`
- estrategia de labels en Appwrite Auth
- diseño de roles funcionales
- diseño de permisos por módulo y acción
- propuesta de collections relacionadas
- propuesta de guards y validaciones
- propuesta de auditoría para acciones de seguridad
- implementación base si ya corresponde según fase de trabajo

No incluye aún:

- CRUD completo de materiales
- vouchers
- tickets
- flujos de mostrador
- flujos de báscula
- reportes
- sincronización offline

---

## 23.4 Problema que resuelve

Evita que la aplicación crezca sin una base segura y consistente de acceso. Define desde el inicio:

- quién es un usuario
- qué información vive en Auth
- qué información vive en `users_profile`
- cómo se asignan roles
- cómo se restringen acciones
- cómo se auditan cambios importantes

---

## 23.5 Logro esperado

Al terminar este task debe existir una definición clara y, si aplica en la fase actual, una implementación funcional de:

1. usuarios en Appwrite Auth
2. colección `users_profile`
3. estrategia de labels
4. estrategia de roles
5. catálogo de permisos
6. relación rol-permisos
7. evaluación de permisos por usuario
8. lineamientos de seguridad frontend/backend
9. lineamientos de auditoría

---

## 23.6 Preguntas que este task debe cerrar

1. ¿Qué datos pertenecen a Appwrite Auth y cuáles a `users_profile`?
2. ¿Cómo se crearán usuarios internos del sistema?
3. ¿Qué labels se usarán y para qué?
4. ¿Cómo se modelarán roles y permisos?
5. ¿Cómo se definirá el acceso por módulo y acción?
6. ¿Cómo se protegerán rutas y acciones en frontend?
7. ¿Qué acciones deberán reforzarse desde Functions/backend?
8. ¿Cómo se registrarán cambios de seguridad?

---

## 23.7 Decisiones arquitectónicas que se esperan como resultado

Claude debe proponer y dejar justificadas, como mínimo, estas decisiones:

### Identidad
- Appwrite Auth como fuente de identidad principal

### Perfil extendido
- `users_profile` como extensión operativa del usuario

### Labels
- labels de Appwrite para segmentación por grupos funcionales

### Roles
- uno o más roles funcionales asignables

### Permisos
- permisos finos por módulo/acción en una matriz propia

### Enforcement
- enforcement en frontend y backend

### Auditoría
- logs específicos para cambios de seguridad y permisos

---

## 23.8 Diseño esperado de entidades relacionadas

Claude debe evaluar y proponer una versión final, pero se espera algo cercano a:

### `users_profile`
Campos sugeridos:
- authUserId
- firstName
- lastName
- fullName
- email
- phone
- employeeCode
- roleId o roleIds según estrategia
- status
- enabled
- avatarFileId opcional
- notes
- lastLoginAt opcional
- createdBy
- updatedBy

### `roles`
Campos sugeridos:
- name
- code
- description
- enabled
- isSystem

### `permissions_catalog`
Campos sugeridos:
- module
- action
- code
- description
- enabled

### `role_permissions`
Campos sugeridos:
- roleId
- permissionCode o permissionId
- enabled

### `audit_logs`
Campos mínimos para esta fase:
- entityType
- entityId
- action
- performedBy
- summary
- metadata
- createdAt

Claude debe validar con Appwrite 1.8.1 qué atributos e índices convienen realmente y ajustarlo a las limitaciones reales.

---

## 23.9 Módulos del sistema afectados por este task

- autenticación
- usuarios
- roles y permisos
- navegación protegida
- auditoría
- todo el resto del sistema como dependencia futura

---

## 23.10 Reglas de negocio específicas del task

1. Todo usuario operativo debe existir primero en Appwrite Auth.
2. Todo usuario operativo debe tener o generar un `users_profile` relacionado.
3. El sistema no debe depender solo de labels para permisos finos.
4. Los permisos deben definirse por módulo y acción.
5. Los cambios de rol o permisos deben quedar auditados.
6. Un usuario deshabilitado no debe poder operar en la plataforma.
7. No todos los usuarios pueden gestionar usuarios o roles.
8. Los permisos críticos deberán reforzarse en backend/Functions.

---

## 23.11 Roles iniciales sugeridos

Claude debe validarlos y refinarlos, pero la base sugerida es:

- admin
- supervisor
- capturista_bascula
- mostrador
- guardia_salida
- operador_carga
- secretaria

---

## 23.12 Permisos funcionales iniciales sugeridos

Claude debe proponer catálogo final, pero inicialmente debe contemplar al menos:

### Usuarios y seguridad
- users.view
- users.create
- users.update
- users.disable
- roles.view
- roles.create
- roles.update
- permissions.view
- permissions.assign

### Catálogos
- catalogs.view
- catalogs.create
- catalogs.update
- catalogs.disable

### Materiales
- materials.view
- materials.create
- materials.update
- materials.disable
- materials.export

### Operación
- vouchers.view
- vouchers.create
- vouchers.update
- tickets.print
- tickets.reprint
- weights.register
- exit.validate
- exit.reject

### Reportes
- reports.view
- reports.export

### Auditoría
- audit.view

---

## 23.13 Criterios de aceptación

Este task se considera logrado cuando:

1. existe una definición clara de arquitectura Auth + Profile + Roles + Permissions
2. existe propuesta validada de labels a utilizar
3. existe modelo de datos propuesto o implementado para seguridad
4. existe catálogo inicial de roles
5. existe catálogo inicial de permisos por módulo/acción
6. existe estrategia clara de route guards y UI guards
7. existe estrategia clara de validación backend para acciones críticas
8. existe estrategia de auditoría de cambios sensibles
9. la solución es compatible con Appwrite 1.8.1 validada con `appwrite-docs` y `appwrite-api`

---

## 23.14 Validaciones funcionales esperadas

Claude debe dejar contemplado cómo se comprobará que:

- un usuario sin permiso no ve un módulo restringido
- un usuario sin permiso no puede ejecutar una acción restringida aunque manipule la UI
- un usuario deshabilitado queda bloqueado
- un cambio de rol modifica correctamente la experiencia de acceso
- un cambio de seguridad queda auditado

---

## 23.15 Riesgos del task

1. confiar demasiado en labels y no modelar permisos finos
2. mezclar datos de Auth con datos operativos
3. dejar la seguridad solo del lado frontend
4. no auditar cambios de rol/permisos
5. sobrediseñar la matriz de permisos antes de tiempo

Claude debe encontrar un punto de equilibrio práctico y escalable.

---

## 23.16 Dependencias previas

No tiene dependencias funcionales previas. Es el primer bloque prioritario.

Sí depende técnicamente de:
- proyecto base Appwrite
- conocimiento validado de Appwrite 1.8.1

---

## 23.17 Dependencias posteriores

Este task habilita directamente:
- gestión de usuarios
- módulos protegidos
- CRUDs maestros
- operaciones de mostrador y báscula
- reportes
- auditoría

---

## 23.18 Entregables esperados

Claude debe entregar:

1. documento técnico breve de la arquitectura de seguridad
2. propuesta final de collections/campos para seguridad
3. propuesta final de labels
4. propuesta final de roles
5. propuesta final de permisos
6. lineamientos de frontend guards
7. lineamientos de backend enforcement
8. si la fase ya lo permite: implementación base de estas piezas

---

## 23.19 Restricciones del task

- no usar TypeScript
- no construir aún vouchers o tickets completos
- no desviarse a otros módulos no dependientes directos
- no asumir formatos de Appwrite sin validarlos con MCP
- no dejar la solución solo conceptual si ya es viable implementarla

---

## 23.20 Prompt sugerido para Claude Code — Task 01

```text
Necesito que ejecutes exclusivamente el Task 01 de este proyecto. No avances todavía a vouchers, tickets, báscula, mostrador, reportes ni sincronización offline.

CONTEXTO
Estoy construyendo un sistema operativo y administrativo para una mina de materiales usando:
- Appwrite self-hosted 1.8.1
- Appwrite CLI
- MCP appwrite-api
- MCP appwrite-docs
- frontend con React + Vite + JavaScript + TailwindCSS 4.1 + Radix UI + vite-plugin-pwa

OBJETIVO DEL TASK
Diseñar y dejar lista la arquitectura de identidad, perfiles, labels, roles y permisos del sistema.

LO QUE QUIERO QUE HAGAS
1. Revisa con `appwrite-docs` y `appwrite-api` las capacidades reales de Appwrite 1.8.1 relacionadas con:
   - Auth users
   - labels
   - permissions
   - modelado recomendado para perfiles extendidos
   - restricciones relevantes de databases e índices
2. Propón la arquitectura final de seguridad del proyecto.
3. Define claramente:
   - qué vive en Appwrite Auth
   - qué vive en `users_profile`
   - qué se resuelve con labels
   - qué se resuelve con roles
   - qué se resuelve con permisos por módulo/acción
4. Diseña el modelo de datos mínimo necesario para:
   - users_profile
   - roles
   - permissions_catalog
   - role_permissions
   - audit_logs
5. Propón el catálogo inicial de roles y permisos del sistema.
6. Define la estrategia de enforcement en frontend y backend.
7. Define cómo se auditarán cambios de seguridad.
8. Si ya es viable en esta fase del repo, implementa la base técnica correspondiente.

REGLAS IMPORTANTES
- No uses TypeScript.
- No avances a otros módulos fuera de este task.
- No dependas solo de labels para permisos finos.
- Usa Appwrite Auth como fuente principal de identidad.
- Usa `users_profile` como extensión operativa.
- Refuerza acciones críticas en backend/Functions cuando corresponda.
- Documenta decisiones importantes de forma breve y clara.

CRITERIOS DE ACEPTACIÓN
Tu resultado debe dejar resuelto:
- arquitectura Auth + Profile + Roles + Permissions
- catálogo inicial de roles
- catálogo inicial de permisos
- diseño de collections/campos
- estrategia de guards frontend
- estrategia de enforcement backend
- estrategia de auditoría
- compatibilidad validada con Appwrite 1.8.1

ENTREGABLES
Entrégame:
1. documento técnico breve
2. diseño final de collections y campos
3. propuesta final de roles y permisos
4. lineamientos de implementación
5. implementación base si ya corresponde

No sigas al siguiente task. Quédate solo en Task 01.
```

---

## 24. Task 02 detallado: base técnica del proyecto, frontend inicial y configuración Appwrite

## 24.1 Nombre del task

**Task 02 — Inicializar el proyecto desde cero y dejar lista la base técnica con Appwrite + frontend + PWA + theme**

---

## 24.2 Objetivo

Crear la base técnica real del proyecto desde cero usando el stack definido, dejando listo el frontend, la integración inicial con Appwrite self-hosted, la configuración del proyecto para Appwrite CLI, la PWA, el sistema de tema y la arquitectura de carpetas para continuar con los siguientes tasks sin rehacer la base.

Este task no debe construir todavía módulos de negocio completos como materiales, clientes, vouchers, tickets o reportes. Debe enfocarse exclusivamente en la infraestructura inicial del proyecto.

---

## 24.3 Alcance

Incluye:

- inicialización del proyecto frontend
- estructura base del repositorio
- configuración de React + Vite + JavaScript
- configuración de TailwindCSS 4.1
- configuración de Radix UI como base de componentes
- configuración de iconografía principal
- configuración de Framer Motion
- configuración de vite-plugin-pwa
- configuración de theme light/dark
- configuración inicial de Appwrite SDK en frontend
- definición de variables de entorno
- validación de la configuración real requerida por Appwrite CLI
- generación o preparación de la configuración Appwrite correcta del proyecto
- base de layouts, rutas, guards y páginas iniciales
- documentación mínima de arranque

No incluye todavía:

- CRUD de usuarios completo
- CRUD de materiales
- CRUD de clientes
- vouchers
- tickets
- QR completo
- báscula
- mostrador
- validación de salida
- reportes
- sincronización offline funcional completa

Sí puede dejar preparadas las bases para esas futuras fases.

---

## 24.4 Problema que resuelve

Evita que el proyecto comience con una estructura improvisada o técnicamente incorrecta. Define desde el inicio una base sólida, modular, escalable y alineada con Appwrite self-hosted y el stack habitual del proyecto.

---

## 24.5 Logro esperado

Al terminar este task debe existir un proyecto real que:

1. corra localmente
2. tenga frontend base funcional
3. tenga conexión inicial con Appwrite
4. tenga sistema de tema light/dark
5. esté preparado como PWA
6. tenga estructura modular profesional
7. tenga rutas iniciales
8. tenga layout base
9. tenga capa inicial de servicios/utilidades
10. tenga lista la configuración Appwrite correcta para continuar con push y fases posteriores

---

## 24.6 Preguntas que este task debe cerrar

1. ¿Cuál es la forma correcta y actual de configurar el proyecto Appwrite desde CLI para este caso?
2. ¿Qué archivo de configuración real corresponde usar?
3. ¿Cómo debe organizarse el repo para frontend, functions y documentación?
4. ¿Cómo se manejarán las variables de entorno en frontend?
5. ¿Cómo se integrará Appwrite SDK de forma limpia y reutilizable?
6. ¿Cómo se implementará el theme desde el inicio?
7. ¿Cómo se dejará preparada la PWA?
8. ¿Qué estructura base de rutas y layouts se usará?

---

## 24.7 Decisiones arquitectónicas que se esperan como resultado

Claude debe proponer e implementar, como mínimo, estas decisiones:

### Estructura del repo
Definir una estructura clara para:
- app web
- functions
- documentación
- configuración Appwrite
- assets y archivos públicos

### Configuración Appwrite
Validar con `appwrite-docs` y `appwrite-api` cuál es la forma real y vigente de estructurar la configuración del proyecto.

Si el archivo correcto no es `appwrite.config.js`, debe usar la alternativa real correcta y documentar brevemente el motivo.

### Frontend base
Definir e implementar una estructura profesional y consistente.

### Env handling
Definir una estrategia limpia para variables de entorno compartibles y mantenibles.

### Theme
Definir la implementación base de light/dark mode desde el inicio.

### PWA
Definir el nivel base de soporte PWA que quedará listo en esta fase.

### Integración Appwrite
Crear una base clara para:
- cliente Appwrite
- auth bootstrap
- servicios por dominio
- utilidades compartidas

---

## 24.8 Stack obligatorio de este task

### Backend / plataforma
- Appwrite self-hosted 1.8.1
- endpoint actual: `https://appwrite.racoondevs.com`
- Appwrite CLI
- MCP `appwrite-api`
- MCP `appwrite-docs`

### Frontend
- React
- Vite
- JavaScript
- TailwindCSS 4.1
- vite-plugin-pwa
- Radix UI
- lucide-react
- phosphor-icons solo si aporta valor
- framer-motion
- light theme y dark theme

---

## 24.9 Estructura esperada del proyecto

Claude debe proponer una estructura final profesional. Una dirección esperada sería similar a:

- raíz del proyecto
- `src/`
- `src/app/`
- `src/layouts/`
- `src/pages/`
- `src/components/`
- `src/features/` o `src/modules/`
- `src/hooks/`
- `src/context/`
- `src/services/`
- `src/lib/`
- `src/utils/`
- `src/styles/`
- `src/assets/`
- `src/config/`
- `functions/`
- `docs/`
- `public/`

Claude puede ajustar esta estructura si tiene una mejor propuesta, pero debe mantener consistencia y justificar cambios importantes.

---

## 24.10 Reglas de implementación del task

1. No usar TypeScript.
2. No usar shadcn/ui.
3. Usar Radix UI como base de primitives cuando convenga.
4. Implementar TailwindCSS 4.1 correctamente.
5. Implementar theme light/dark desde el inicio.
6. Preparar PWA realista, no fingida.
7. No construir todavía módulos operativos completos.
8. No hardcodear IDs o secretos sensibles.
9. Validar con MCP la configuración real de Appwrite CLI y del proyecto.
10. Si se requiere `appwrite push --force` en flujos no interactivos, dejarlo contemplado en documentación o scripts.

---

## 24.11 Requerimientos concretos del task

### A. Inicialización del frontend
- crear proyecto React + Vite + JavaScript
- instalar dependencias base
- configurar scripts necesarios

### B. Configuración de estilos
- configurar TailwindCSS 4.1
- crear base de estilos globales
- definir tokens base si conviene
- asegurar modo light/dark

### C. Sistema de tema
- crear provider o estrategia equivalente
- persistir preferencia del tema
- respetar preferencia del sistema si aplica
- permitir toggle visible o al menos infraestructura lista

### D. Configuración de UI base
- integrar Radix UI para primitives base
- crear componentes base iniciales si conviene
- preparar convenciones de diseño

### E. Configuración de animaciones
- integrar Framer Motion
- dejar preparada infraestructura para transiciones de layout o páginas

### F. Configuración de PWA
- instalar y configurar vite-plugin-pwa
- definir manifest inicial
- definir iconos requeridos o placeholders organizados
- dejar service worker/base installable lista

### G. Configuración Appwrite frontend
- instalar SDK correspondiente
- crear cliente Appwrite
- centralizar endpoint, project id y demás variables
- crear wrappers o helpers iniciales

### H. Configuración Appwrite CLI / proyecto
- validar cómo debe quedar la configuración del proyecto
- crear la configuración correcta y versionable
- dejar lista la estructura para futuras collections, functions y sites
- documentar el flujo de push

### I. Routing y layouts
- crear router base
- crear layout público y/o autenticado si aplica
- crear páginas placeholder iniciales mínimas
- preparar route guards para el task de seguridad

### J. Documentación mínima
- README inicial
- `.env.example`
- instrucciones básicas de arranque
- nota breve de configuración Appwrite real

---

## 24.12 Integración con el Task 01

Este task debe quedar subordinado a la arquitectura del Task 01.

Eso significa que Claude debe dejar preparada la base para:
- carga de sesión
- carga de `users_profile`
- route guards
- permisos por módulo/acción

Aunque el CRUD completo de usuarios no se construya todavía en este task.

---

## 24.13 Criterios de aceptación

Este task se considera logrado cuando:

1. existe un proyecto frontend funcional con React + Vite + JavaScript
2. TailwindCSS 4.1 está correctamente configurado
3. existe soporte light/dark real
4. Radix UI está integrado como base de UI
5. framer-motion está integrado
6. vite-plugin-pwa está configurado
7. existe manifest y base installable
8. existe cliente Appwrite configurado
9. existen variables de entorno documentadas
10. existe estructura de carpetas profesional
11. existe configuración Appwrite real y validada con MCP
12. existe router/layout base listo para continuar
13. existe documentación mínima para arrancar el proyecto

---

## 24.14 Validaciones funcionales esperadas

Claude debe dejar contemplado o demostrar que:

- el proyecto levanta localmente
- el theme cambia correctamente o queda listo con soporte real
- la PWA compila y registra la base necesaria
- las variables de entorno se consumen correctamente
- el cliente Appwrite se inicializa correctamente
- el router funciona
- la estructura es mantenible y escalable

---

## 24.15 Riesgos del task

1. usar una configuración desactualizada de Appwrite CLI
2. asumir un archivo de configuración incorrecto
3. dejar la PWA solo “simulada” sin configuración real
4. mezclar lógica de negocio demasiado pronto en la base técnica
5. crear una estructura de carpetas que luego haya que rehacer
6. implementar dark mode superficialmente

Claude debe evitar estos errores validando con los MCP y manteniendo foco estricto en la base técnica.

---

## 24.16 Dependencias previas

Depende conceptualmente del Task 01, porque la base técnica debe dejar espacio para la estrategia de seguridad definida allí.

---

## 24.17 Dependencias posteriores

Este task habilita directamente:
- Task 03: autenticación y carga de perfil extendido
- Task 04: módulo de usuarios
- Task 05: roles y permisos
- y todos los CRUDs posteriores

---

## 24.18 Entregables esperados

Claude debe entregar:

1. estructura inicial real del proyecto
2. configuración del frontend completa
3. configuración de Appwrite del proyecto validada
4. configuración PWA
5. systema de theme base
6. cliente Appwrite inicial
7. router/layout base
8. `.env.example`
9. README o documentación mínima
10. breve nota técnica sobre decisiones importantes

---

## 24.19 Restricciones del task

- no usar TypeScript
- no construir aún módulos de negocio completos
- no saltarse la validación con MCP de la configuración Appwrite
- no dejar solo pseudocódigo si ya es viable implementar la base real
- no usar shadcn/ui

---

## 24.20 Prompt sugerido para Claude Code — Task 02

```text
Necesito que ejecutes exclusivamente el Task 02 de este proyecto. No avances todavía a CRUDs de negocio como materiales, clientes, vouchers, tickets, báscula, mostrador, reportes ni sincronización offline completa.

CONTEXTO
Estoy construyendo un sistema operativo y administrativo para una mina de materiales usando:
- Appwrite self-hosted 1.8.1 en https://appwrite.racoondevs.com
- Appwrite CLI
- MCP appwrite-api
- MCP appwrite-docs
- frontend con React + Vite + JavaScript + TailwindCSS 4.1 + Radix UI + vite-plugin-pwa + framer-motion

La arquitectura de seguridad del proyecto se basa en:
- Appwrite Auth como identidad principal
- users_profile como extensión operativa
- labels de Appwrite para segmentación principal
- roles y permisos finos por módulo/acción

OBJETIVO DEL TASK
Inicializar el proyecto desde cero y dejar lista la base técnica completa para continuar con los siguientes tasks sin rehacer nada estructural.

LO QUE QUIERO QUE HAGAS
1. Valida con `appwrite-docs` y `appwrite-api` cuál es la forma correcta y actual de estructurar/configurar el proyecto Appwrite desde CLI para este caso.
2. Si el archivo/configuración real no corresponde a `appwrite.config.js`, usa la forma correcta y documenta brevemente por qué.
3. Inicializa el frontend con React + Vite + JavaScript.
4. Configura TailwindCSS 4.1 correctamente.
5. Integra Radix UI como base de UI.
6. Integra lucide-react como iconografía principal.
7. Integra framer-motion.
8. Configura vite-plugin-pwa con manifest e infraestructura base real.
9. Implementa el sistema de theme light/dark desde el inicio.
10. Crea una estructura profesional de carpetas para app, layouts, pages, components, services, utils, config, etc.
11. Instala y configura el SDK de Appwrite en frontend.
12. Centraliza variables de entorno y crea `.env.example`.
13. Crea router y layout base.
14. Deja lista la base para futuras rutas protegidas, carga de sesión y carga de users_profile.
15. Crea README o documentación mínima de arranque.
16. Si aplica, deja preparada la estructura para functions y configuración de futuras colecciones/sites.

REGLAS IMPORTANTES
- No uses TypeScript.
- No uses shadcn/ui.
- No avances todavía a módulos de negocio.
- No hardcodees secretos.
- No asumas configuración Appwrite de memoria si puedes validarla con los MCP.
- Mantén foco estricto en la base técnica.
- Deja el proyecto listo para continuar con autenticación, permisos y CRUDs en los siguientes tasks.

CRITERIOS DE ACEPTACIÓN
Tu resultado debe dejar:
- proyecto frontend funcional
- TailwindCSS 4.1 configurado
- theme light/dark real
- PWA base configurada
- cliente Appwrite listo
- env handling limpio
- estructura de repo profesional
- router/layout base
- configuración Appwrite validada y documentada
- README inicial y `.env.example`

ENTREGABLES
Entrégame:
1. estructura inicial del proyecto
2. configuración Appwrite correcta
3. frontend base funcional
4. PWA base
5. theme base
6. cliente Appwrite inicial
7. README inicial
8. `.env.example`
9. breve nota técnica de decisiones clave

No sigas al siguiente task. Quédate solo en Task 02.
```

---

## 25. Task 03 detallado: autenticación, bootstrap de sesión y carga de users_profile

## 25.1 Nombre del task

**Task 03 — Implementar autenticación, bootstrap de sesión y carga del perfil extendido `users_profile`**

---

## 25.2 Objetivo

Implementar la primera capa funcional real de acceso al sistema: inicio de sesión, restauración de sesión, cierre de sesión, carga del usuario autenticado desde Appwrite Auth, carga de su perfil extendido desde `users_profile`, y bootstrap del estado global necesario para que los siguientes módulos puedan trabajar con identidad, rol y permisos.

Este task debe convertir la arquitectura definida en el Task 01 y la base técnica del Task 02 en una experiencia funcional de acceso al sistema.

---

## 25.3 Alcance

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

No incluye todavía:

- CRUD administrativo completo de usuarios
- pantalla para crear usuarios internos
- gestión avanzada de roles
- gestión avanzada de permisos
- módulos de negocio
- sincronización offline
- reportes

---

## 25.4 Problema que resuelve

Permite que la aplicación deje de ser solo una base técnica y pase a tener un acceso real con identidad operativa consistente. Define cómo entra un usuario al sistema, cómo se reconstruye su estado al abrir la app y cómo se obtiene el contexto mínimo necesario para proteger rutas y preparar permisos futuros.

---

## 25.5 Logro esperado

Al terminar este task debe existir una experiencia funcional donde:

1. un usuario puede iniciar sesión
2. la sesión persiste y se restaura correctamente
3. el sistema obtiene el usuario actual desde Appwrite
4. el sistema obtiene su `users_profile`
5. el frontend conoce el estado de autenticación
6. el frontend conoce el estado base de perfil/rol/labels/permisos
7. existen rutas protegidas mínimas
8. un usuario inconsistente o deshabilitado es tratado correctamente

---

## 25.6 Preguntas que este task debe cerrar

1. ¿Cuál será el flujo exacto de login con Appwrite en este proyecto?
2. ¿Cómo se manejará el bootstrap inicial de sesión al abrir la app?
3. ¿Cómo se resolverá la relación entre Auth user y `users_profile`?
4. ¿Qué pasa si existe usuario Auth pero no existe `users_profile`?
5. ¿Qué pasa si el usuario está deshabilitado en `users_profile`?
6. ¿Cómo quedará disponible el contexto global de auth para route guards y módulos futuros?
7. ¿Cómo se expondrán labels, roles y permisos al frontend en esta etapa?

---

## 25.7 Decisiones arquitectónicas que se esperan como resultado

Claude debe proponer e implementar, como mínimo, estas decisiones:

### Estrategia de login
Definir el flujo correcto de autenticación con Appwrite para usuarios internos.

### Bootstrap de sesión
Definir cómo se reconstruye el estado al cargar o refrescar la app.

### Relación Auth → users_profile
Definir cómo se busca y valida el perfil extendido.

### Estado global
Definir si se usará Context, store o una estrategia equivalente para exponer:
- session state
- auth user
- users_profile
- labels
- role(s)
- permission snapshot inicial

### Route guards
Definir una primera versión de protección de rutas:
- rutas públicas
- rutas autenticadas
- rutas restringidas por permisos más adelante

### Manejo de inconsistencias
Definir la respuesta del sistema cuando:
- no hay sesión
- la sesión es inválida
- falta `users_profile`
- el perfil está deshabilitado

---

## 25.8 Reglas de implementación del task

1. Usar Appwrite Auth como fuente de identidad principal.
2. Usar `users_profile` como fuente operativa extendida.
3. No confiar únicamente en el frontend para seguridad definitiva, pero sí dejar el estado listo para guards.
4. No construir todavía el CRUD administrativo de usuarios.
5. No mezclar lógica de módulos de negocio dentro de este task.
6. Mantener compatibilidad con la arquitectura del Task 01.
7. Mantener compatibilidad con la estructura técnica del Task 02.
8. No usar TypeScript.

---

## 25.9 Requerimientos concretos del task

### A. Pantalla de login
Debe existir una pantalla mínima y funcional de login para usuarios internos.

Debe contemplar:
- formulario claro
- email
- password
- estados de loading
- mensajes de error controlados

### B. Inicio de sesión
Debe implementarse el flujo de inicio de sesión usando Appwrite.

Debe contemplar:
- credenciales válidas
- manejo de error de credenciales
- manejo de errores inesperados

### C. Restauración de sesión
Al abrir o recargar la app, el sistema debe intentar restaurar sesión.

Debe contemplar:
- loading inicial
- sesión activa válida
- sesión inexistente
- sesión inválida

### D. Carga del usuario actual
Después de autenticar o restaurar sesión, debe cargarse el usuario actual desde Appwrite Auth.

### E. Carga de `users_profile`
Con el usuario autenticado, el sistema debe buscar su perfil extendido en `users_profile`.

Debe contemplar:
- perfil encontrado
- perfil no encontrado
- perfil deshabilitado
- datos inconsistentes

### F. Contexto global de autenticación
Debe existir una capa global reutilizable para exponer al resto de la app:
- estado de inicialización
- estado autenticado/no autenticado
- auth user
- users_profile
- logout
- refresh session/profile si conviene

### G. Route guards base
Deben existir como mínimo:
- guard para rutas públicas
- guard para rutas autenticadas
- estructura preparada para permisos posteriores

### H. Logout
Debe implementarse cierre de sesión correcto.

Debe contemplar:
- limpiar estado local
- invalidar navegación autenticada
- redirigir adecuadamente

### I. Manejo de inconsistencia operativa
Debe definirse qué verá el usuario cuando:
- existe sesión pero falta `users_profile`
- `users_profile` está deshabilitado
- hay un error de bootstrap

Se espera una estrategia clara, por ejemplo una pantalla de acceso denegado, configuración pendiente o contacto con administrador.

---

## 25.10 Entidades involucradas

Este task se apoya principalmente en:

- Appwrite Auth users
- `users_profile`
- `roles` (si ya existe consulta básica)
- `permissions_catalog` y `role_permissions` solo a nivel de lectura si ya fueron modelados

No necesita todavía administrar estas entidades de forma completa.

---

## 25.11 Estados que debe manejar el frontend

Como mínimo, Claude debe modelar estados como:

- initializing
- unauthenticated
- authenticating
- authenticated
- loading_profile
- profile_missing
- disabled
- error

Puede ajustar los nombres, pero debe dejar el flujo claro.

---

## 25.12 Criterios de aceptación

Este task se considera logrado cuando:

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

## 25.13 Validaciones funcionales esperadas

Claude debe dejar contemplado o demostrar que:

- sin sesión, el usuario ve login o ruta pública correspondiente
- con sesión válida, el usuario entra al área autenticada
- al refrescar, la sesión no se pierde indebidamente
- si falta `users_profile`, el sistema no se rompe silenciosamente
- si el perfil está deshabilitado, el usuario no puede operar
- logout limpia correctamente el estado

---

## 25.14 Riesgos del task

1. asumir que Auth user y `users_profile` siempre estarán sincronizados
2. no manejar casos de perfil faltante
3. dispersar la lógica de auth por toda la app en lugar de centralizarla
4. dejar route guards difíciles de extender a permisos finos
5. mezclar demasiado pronto CRUD de usuarios con bootstrap de sesión

Claude debe centralizar bien la lógica y dejarla lista para crecer.

---

## 25.15 Dependencias previas

Depende de:
- Task 01: arquitectura de identidad, perfiles, roles y permisos
- Task 02: base técnica del proyecto

---

## 25.16 Dependencias posteriores

Este task habilita directamente:
- Task 04: módulo de usuarios internos
- Task 05: roles y permisos
- cualquier módulo protegido de negocio

---

## 25.17 Entregables esperados

Claude debe entregar:

1. pantalla de login funcional
2. capa o provider global de autenticación
3. bootstrap de sesión
4. carga de `users_profile`
5. route guard base
6. logout funcional
7. manejo de estados de error/inconsistencia
8. nota técnica breve sobre el flujo implementado

---

## 25.18 Restricciones del task

- no usar TypeScript
- no construir todavía CRUD administrativo de usuarios
- no avanzar aún a materiales, vouchers o tickets
- no dejar la lógica de auth esparcida sin centralización
- no asumir perfiles siempre válidos sin validación

---

## 25.19 Prompt sugerido para Claude Code — Task 03

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

---

## 26. Siguiente paso recomendado

Una vez cerrado el Task 03, el siguiente paso recomendado será:

**Task 04 — Implementar el módulo administrativo de usuarios internos**, ya con la capa real de acceso funcionando.


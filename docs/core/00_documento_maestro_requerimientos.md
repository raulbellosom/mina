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

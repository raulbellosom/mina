Quiero que actúes como un senior full-stack engineer y solution architect especializado en Appwrite 1.8.1, React, Vite y sistemas administrativos operativos. Vas a construir una aplicación completa por fases, pero sin dejar cosas a medias ni dar solo ejemplos. Necesito implementación real, estructura profesional, y que uses en todo momento estas herramientas y criterios:

HERRAMIENTAS Y FUENTES OBLIGATORIAS
- Usa Appwrite CLI para crear, configurar y empujar la infraestructura del proyecto.
- Usa los MCP:
  - appwrite-api
  - appwrite-docs
- Usa appwrite-api y appwrite-docs para validar que cada decisión técnica, atributo, índice, collection, relación, function, permiso, storage bucket, site, deployment y limitación esté alineada con Appwrite 1.8.1.
- Si para aplicar cambios se requiere `appwrite push --force`, úsalo cuando sea necesario.
- No asumas cosas de memoria si puedes validarlas con los MCP.
- No me des teoría excesiva: implementa.

OBJETIVO GENERAL
Desarrollar un software administrativo y operativo para una mina de materiales pétreos o minerales de construcción, centrado en el control de entradas, salidas, venta por vale prepago, venta en mostrador, báscula, carga de material, validación de salida, impresión de tickets con QR, escaneo por guardia, validación por personal de báscula, y reportes operativos/comerciales.

CONTEXTO DEL NEGOCIO
La operación gira alrededor de la venta y salida de materiales como:
- Grava de 1 1/2
- Grava de 3/4
- Grava de 1/2
- Arena línea 1
- Arena línea 2
- Grava controlada
- Base hidráulica de 3 afinos
- Base hidráulica de 1/2 afino
- Grim o desperdicio
- Otros

Antes solo se vendía material de una sola mina, pero ahora también se venderá material de distintas plantas u orígenes mineros, por lo tanto el sistema debe contemplar múltiples orígenes o plantas.

La plataforma NO procesa pagos directamente. Solo registra:
- tipo de pago
- referencia de pago
- notas
- validaciones operativas

FLUJOS PRINCIPALES DEL NEGOCIO

FLUJO 1: CLIENTE CON VALE PREPAGADO / REFERENCIA
1. El chofer llega a la báscula.
2. Entrega un vale prepago, folio o referencia.
3. El personal de báscula/captura registra:
   - cliente
   - chofer
   - camión
   - material
   - origen/planta
   - volumen/cantidad vendida según vale
   - tipo de unidad o criterio comercial
   - referencia / folio / QR
   - peso inicial del camión vacío o peso de entrada, cuando aplique
4. Se imprimen tickets en 3 copias:
   - copia para báscula/captura
   - copia para operador de carga
   - copia para chofer
5. El chofer va con el operador de la pala/grúa/montacargas.
6. El operador valida en el ticket qué material y cuánto debe cargar.
7. El camión vuelve a la báscula.
8. Se registra:
   - peso del camión cargado
   - tara
   - peso neto estimado o real
   - validación de salida
9. El chofer sale con ticket validado y QR.

Objetivo de este flujo:
- llevar control comercial
- llevar control operativo
- poder estimar o registrar tonelaje/peso
- llevar historial por cliente, camión, chofer, material y origen

FLUJO 2: VENTA EN MOSTRADOR / CHOFER QUE LLEGA POR SU CUENTA
1. El chofer llega al mostrador, no a la báscula.
2. Compra material en efectivo o transferencia.
3. El personal de mostrador registra:
   - chofer
   - camión
   - cliente genérico o venta mostrador
   - material
   - origen/planta
   - tipo de pago
   - referencia de pago si aplica
   - volumen/cantidad comercial
4. Se imprimen 3 tickets iguales:
   - mostrador
   - operador de carga
   - chofer
5. El chofer va a cargar material.
6. Al salir, no necesariamente vuelve a la báscula.
7. En otra salida hay un guardia de seguridad.
8. El guardia escanea el QR con un handheld o dispositivo móvil.
9. Al personal de báscula o validación le aparece la información para confirmar visualmente:
   - camión correcto
   - material correcto
   - ticket vigente
   - ticket no duplicado
   - ticket no usado anteriormente
10. Se autoriza o rechaza la salida.
11. El registro de peso en este flujo puede ser opcional.

Objetivo de este flujo:
- doble verificación para reducir robo o fuga de material
- validación cruzada entre mostrador, guardia y báscula
- trazabilidad total de cada salida

IMPORTANTE SOBRE LOS TICKETS
- Cada ticket debe tener QR único.
- Debe poderse imprimir en 3 copias.
- El QR debe resolver un identificador único de la transacción/salida.
- El QR debe poder ser escaneado para validar la salida.
- Un ticket debe poder pasar por estados como:
  - creado
  - impreso
  - en carga
  - cargado
  - validado para salida
  - salido
  - cancelado
  - bloqueado / inconsistente
- Debe evitarse el reuso fraudulento de tickets.
- Debe existir bitácora de quién creó, imprimió, validó, escaneó, autorizó o canceló.

CRUDS PRINCIPALES REQUERIDOS
1. Minerales / materiales
2. Clientes (empresas o personas)
3. Camiones
4. Choferes
5. Personal interno / usuarios de la plataforma
6. Origen / planta minera
7. Reportes operativos y comerciales
8. Vales o referencias prepago si el diseño lo requiere como entidad separada
9. Tickets / salidas / órdenes de carga

REGLAS IMPORTANTES DEL NEGOCIO
- Un chofer normalmente tiene un vehículo asignado, pero puede operar otros camiones.
- Una empresa puede tener choferes asociados.
- Una empresa puede tener camiones asociados, pero no siempre.
- La venta generalmente es por camión lleno, pero se debe registrar también la cantidad comercial del vale, separada del peso real del camión.
- Debe diferenciarse claramente:
  - venta por cliente con vale/referencia
  - venta de mostrador
- Debe registrarse origen/planta de donde se cargó el material.
- Debe existir soporte para múltiples materiales configurables mediante CRUD, no hardcodeados.
- Debe existir soporte para categorías o tipos de material.
- Debe contemplarse “otros”.

STACK Y ENFOQUE TÉCNICO
Quiero que construyas una aplicación completa con:
- Frontend: React + Vite + JavaScript
- Backend: Appwrite 1.8.1
- Appwrite features a usar:
  - Databases
  - Storage
  - Functions
  - Sites
  - Auth
- Usa Appwrite CLI para bootstrap y push del proyecto.
- Usa una estructura profesional de proyecto.
- No uses TypeScript.
- No uses datos mock para flujos reales.
- Todo debe quedar listo para seguir creciendo.

REQUISITOS FUNCIONALES MÍNIMOS

AUTENTICACIÓN Y ROLES
Define e implementa roles mínimos:
- admin
- capturista_bascula
- mostrador
- operador_carga
- guardia_salida
- secretaria
- supervisor

Debes decidir si los roles van:
- en Auth + profile document
- o solo en profile document
pero debe quedar bien implementado y seguro.

MÓDULOS PRINCIPALES
1. Dashboard
2. Materiales
3. Clientes
4. Choferes
5. Camiones
6. Plantas / Orígenes
7. Vales / Referencias prepago
8. Tickets / Salidas / Órdenes de carga
9. Báscula
10. Mostrador
11. Validación de salida / escaneo QR
12. Reportes
13. Usuarios / personal

MÓDULO BÁSCULA
Debe permitir:
- capturar vale o buscar por folio
- escanear QR
- seleccionar cliente
- seleccionar chofer
- seleccionar camión
- seleccionar material
- seleccionar origen/planta
- registrar cantidad comercial
- registrar peso de entrada
- registrar peso de salida
- calcular tara y neto
- marcar estado de proceso
- imprimir ticket
- reimprimir con control de auditoría
- ver historial del ticket

MÓDULO MOSTRADOR
Debe permitir:
- crear venta de mostrador
- registrar método de pago solo como referencia operativa
- registrar referencia bancaria si existe
- seleccionar o crear rápidamente chofer/camión si hace falta
- generar ticket con QR
- imprimir las 3 copias
- dejar trazabilidad
- marcar ticket listo para carga

MÓDULO VALIDACIÓN DE SALIDA
Debe permitir:
- escanear QR desde una vista rápida
- traer ticket/orden correspondiente
- mostrar estado actual
- validar si:
  - sigue vigente
  - ya fue usado
  - está cancelado
  - coincide material y camión
- autorizar salida
- rechazar salida
- registrar observaciones
- guardar bitácora del guardia y/o personal de báscula

REPORTES
Implementa reportes con filtros por fecha y exportables si es viable:
- salidas por cliente
- salidas por mostrador
- salidas por material
- salidas por origen/planta
- salidas por camión
- salidas por chofer
- pesos registrados
- comparación cantidad comercial vs peso real
- tickets cancelados
- tickets reimpresos
- productividad / volumen por periodo
- diferencias operativas o anomalías

IMPRESIÓN Y QR
- Implementa generación de QR para cada ticket.
- Implementa formato imprimible del ticket.
- Piensa en impresión térmica o formato compacto.
- Deben existir 3 copias del ticket.
- Define una estrategia realista para impresión desde navegador.
- El QR debe apuntar o resolver un identificador único y usable internamente.
- Si conviene, crea una vista pública mínima o una ruta protegida para resolver tickets por QR, pero prioriza seguridad.

MODELO DE DATOS
Diseña e implementa un modelo de datos robusto en Appwrite, incluyendo colecciones, atributos, índices y relaciones válidas para 1.8.1. Quiero diseño real, no conceptual solamente.

Propón y crea como mínimo entidades similares a estas, pero ajusta lo que haga falta:
- users_profile
- staff_roles o role handling dentro de profile
- materials
- material_categories
- clients
- drivers
- trucks
- plants
- prepaid_vouchers o vouchers
- orders / tickets / dispatches
- weight_logs
- print_logs
- scan_logs
- audit_logs
- payment_references
- truck_driver_assignments si ayuda
- client_truck_links si ayuda
- client_driver_links si ayuda

Cada colección debe tener:
- nombre profesional y consistente
- atributos válidos para Appwrite 1.8.1
- required / optional correctamente definidos
- índices realmente compatibles con Appwrite
- longitudes válidas
- enums donde sí convenga
- estados definidos
- campo enabled o status cuando sea útil
- timestamps
- createdBy / updatedBy cuando aplique

Debes evitar decisiones incompatibles con Appwrite 1.8.1.
Valida todo con appwrite-docs y appwrite-api.

SEGURIDAD Y PERMISOS
Implementa permisos correctamente:
- solo el personal autorizado ve o modifica lo que corresponde
- el guardia no debería editar catálogos administrativos
- mostrador no debería administrar usuarios
- secretaria puede registrar entidades maestras pero no necesariamente validar salidas
- supervisor/admin sí pueden auditar todo

La seguridad debe estar pensada tanto en frontend como en backend.
Las operaciones sensibles deben resolverse en Functions cuando aplique.

FUNCTIONS
Evalúa e implementa Functions para los procesos sensibles, por ejemplo:
- generar ticket con QR
- validar salida por QR
- cambiar estados sensibles
- registrar bitácora
- reimpresión controlada
- validaciones operativas
- consolidación ligera de reportes si hace falta
No hagas lógica crítica solo en el frontend.

STORAGE
Usa Storage si ayuda para:
- plantillas imprimibles
- logos
- adjuntos
- evidencias
- PDFs generados
- archivos exportados
Decide una estructura clara.

SITES
Configura el proyecto para que el frontend pueda desplegarse en Appwrite Sites.
Usa Appwrite CLI para inicializar y preparar el sitio.
Si hace falta configurar variables o build settings, hazlo.
Quiero una base sólida para deploy real.

INTERFAZ
Quiero una interfaz profesional, clara y operativa.
Prioridades:
- rapidez de captura
- pantallas claras para personal operativo
- formularios ágiles
- tablas con filtros
- estatus visibles
- QR visibles
- impresión fácil
- UX buena para escritorio, porque es una operación administrativa
- responsive aceptable, especialmente para guardia o handheld
No te enfoques en algo demasiado artístico; enfócate en claridad y productividad.

FASES DE IMPLEMENTACIÓN
Quiero que trabajes por fases reales, pero completando cada fase antes de avanzar. No quiero solo planeación eterna. Ve ejecutando.

FASE 0: ANÁLISIS Y VALIDACIÓN TÉCNICA
- Analiza todo el requerimiento.
- Identifica vacíos y resuélvelos con decisiones razonables sin detenerte.
- Valida capacidades y limitaciones de Appwrite 1.8.1 con appwrite-docs y appwrite-api.
- Propón arquitectura final.
- Crea documentación inicial del proyecto.
- Si hace falta, genera un README técnico y un plan de implementación.

FASE 1: BOOTSTRAP DEL PROYECTO
- Inicializa estructura del proyecto.
- Configura frontend React + Vite + JavaScript.
- Configura Appwrite CLI.
- Configura appwrite.json o archivos necesarios.
- Prepara proyecto para push.
- Configura Sites, Functions, Databases y Storage base.
- Usa `appwrite push --force` cuando convenga para evitar bloqueos interactivos.

FASE 2: DISEÑO E IMPLEMENTACIÓN DEL MODELO DE DATOS
- Crea todas las collections necesarias.
- Crea atributos, índices y relaciones válidas.
- Documenta el modelo.
- Ajusta para Appwrite real, no inventado.

FASE 3: AUTH, PERFILES Y ROLES
- Implementa login.
- Implementa profiles.
- Implementa guards y control de acceso.
- Deja listo el seed o proceso inicial para admin.

FASE 4: CRUDS MAESTROS
- Materiales
- Categorías de materiales
- Clientes
- Choferes
- Camiones
- Plantas / orígenes
- Usuarios/personal
Con vistas completas y funcionales.

FASE 5: FLUJO DE BÁSCULA
- Registro por vale/referencia
- captura de pesos
- generación de ticket
- estados
- impresión
- historial

FASE 6: FLUJO DE MOSTRADOR
- venta mostrador
- referencias de pago
- ticket
- impresión
- estados
- auditoría

FASE 7: ESCANEO QR Y VALIDACIÓN DE SALIDA
- pantalla de escaneo / captura manual
- validación del ticket
- autorización / rechazo
- bitácora
- prevención de uso doble

FASE 8: REPORTES
- filtros
- tablas
- totales
- exportación si es viable
- comparación de cantidades vs pesos

FASE 9: HARDENING Y PULIDO
- revisión de permisos
- validaciones
- errores
- estados inconsistentes
- auditoría
- reimpresión controlada
- pruebas manuales del flujo completo

FASE 10: DEPLOY Y ENTREGA
- dejar el proyecto listo para deploy
- validar appwrite sites
- revisar variables necesarias
- dejar instrucciones claras de uso y mantenimiento

DECISIONES QUE QUIERO QUE TOMES TÚ
Si hay ambigüedades, decide con criterio senior y sigue avanzando. Por ejemplo:
- cómo modelar voucher vs ticket vs dispatch
- cómo modelar pesos
- cómo modelar bitácoras
- cómo modelar estados
- cuándo usar Functions
- cómo separar venta mostrador de cliente con vale
- cómo estructurar impresión
- cómo evitar fraude o doble uso
- cómo indexar para reportes
Siempre que decidas algo importante, documenta brevemente el porqué.

ENTREGABLES ESPERADOS
Quiero que generes e implementes:
- código del frontend
- configuración Appwrite CLI
- collections y schema reales
- functions necesarias
- storage buckets si aplican
- configuración del site
- documentación técnica
- instrucciones de deploy
- flujo completo funcional
No quiero solo maquetas o TODOs.

REGLAS DE EJECUCIÓN
- No te limites a proponer: ejecuta cambios.
- No dejes pseudocódigo cuando ya puedas implementarlo.
- No uses TypeScript.
- No uses datos mock como sustituto del sistema real.
- No sobre simplifiques el dominio.
- No ignores Appwrite 1.8.1.
- Usa los MCP para validar compatibilidad.
- Si una operación de CLI requiere modo no interactivo, intenta resolverlo con `appwrite push --force` u otra estrategia compatible.
- Si detectas una mejor estructura de datos o arquitectura, aplícala y documenta la razón.
- Mantén nombres claros y profesionales.
- Prioriza trazabilidad, auditoría y seguridad operativa.
- Quiero una base sólida, escalable y realmente útil para negocio.

NOMBRE DEL PROYECTO
Puedes proponer un nombre técnico interno profesional para el sistema si ayuda, pero orientado a operación minera / báscula / despacho de materiales.

LO PRIMERO QUE QUIERO QUE HAGAS AHORA
1. Analiza este requerimiento completo.
2. Revisa con appwrite-docs y appwrite-api todas las limitaciones relevantes de Appwrite 1.8.1 para este proyecto.
3. Propón la arquitectura final.
4. Propón el modelo de datos completo.
5. Genera el plan de implementación por fases.
6. Después comienza a ejecutar la Fase 1 de inmediato.
7. Continúa avanzando fase por fase, implementando realmente, no solo describiendo.

IMPORTANTE
Cuando encuentres algo que podría romperse por limitaciones de Appwrite, no te detengas: propón e implementa la alternativa correcta.
Quiero que este proyecto quede construido con criterio de producción, buena estructura y foco real en la operación de la mina.
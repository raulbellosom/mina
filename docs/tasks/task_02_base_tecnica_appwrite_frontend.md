# Task 02 — Base técnica del proyecto, frontend inicial y configuración Appwrite

## 1. Nombre del task

**Task 02 — Inicializar el proyecto desde cero y dejar lista la base técnica con Appwrite + frontend + PWA + theme**

---

## 2. Objetivo

Crear la base técnica real del proyecto desde cero usando el stack definido, dejando listo el frontend, la integración inicial con Appwrite self-hosted, la configuración del proyecto para Appwrite CLI, la PWA, el sistema de tema y la arquitectura de carpetas para continuar con los siguientes tasks sin rehacer la base.

---

## 3. Alcance

Incluye:
- inicialización del proyecto frontend
- estructura base del repositorio
- configuración de React + Vite + JavaScript
- configuración de TailwindCSS 4.1
- configuración de Radix UI
- iconografía principal
- Framer Motion
- vite-plugin-pwa
- theme light/dark
- Appwrite SDK en frontend
- variables de entorno
- validación de la configuración real requerida por Appwrite CLI
- base de layouts, rutas, guards y páginas iniciales
- documentación mínima de arranque

No incluye todavía módulos de negocio completos.

---

## 4. Logro esperado

1. proyecto corre localmente
2. frontend base funcional
3. conexión inicial con Appwrite
4. theme light/dark
5. preparado como PWA
6. estructura modular profesional
7. rutas iniciales
8. layout base
9. capa inicial de servicios/utilidades
10. configuración Appwrite correcta para continuar con push

---

## 5. Preguntas que este task debe cerrar

1. ¿Cuál es la forma correcta y actual de configurar el proyecto Appwrite desde CLI para este caso?
2. ¿Qué archivo de configuración real corresponde usar?
3. ¿Cómo debe organizarse el repo para frontend, functions y documentación?
4. ¿Cómo se manejarán las variables de entorno en frontend?
5. ¿Cómo se integrará Appwrite SDK de forma limpia y reutilizable?
6. ¿Cómo se implementará el theme desde el inicio?
7. ¿Cómo se dejará preparada la PWA?
8. ¿Qué estructura base de rutas y layouts se usará?

---

## 6. Reglas de implementación del task

1. No usar TypeScript.
2. No usar shadcn/ui.
3. Usar Radix UI como base.
4. Implementar TailwindCSS 4.1 correctamente.
5. Implementar theme light/dark desde el inicio.
6. Preparar PWA realista.
7. No construir todavía módulos operativos completos.
8. No hardcodear IDs o secretos sensibles.
9. Validar con MCP la configuración real de Appwrite CLI y del proyecto.
10. Si se requiere `appwrite push --force` en flujos no interactivos, dejarlo contemplado.

---

## 7. Requerimientos concretos del task

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
- integrar Radix UI
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
- instalar SDK
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

## 8. Criterios de aceptación

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

## 9. Entregables esperados

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

## 10. Prompt sugerido para Claude Code

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

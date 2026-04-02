Toma este mensaje como contexto técnico obligatorio del proyecto y úsalo junto con el requerimiento funcional principal.

STACK TECNOLÓGICO OBLIGATORIO
Este proyecto debe construirse exactamente con este stack, sin desviarse:

BACKEND
- Appwrite como backend en su totalidad
- Appwrite 1.8.1
- Usar Appwrite para:
  - Auth
  - Databases
  - Storage
  - Functions
  - Sites
- Usar Appwrite CLI para inicializar, configurar y hacer push del proyecto
- Validar decisiones técnicas con los MCP:
  - appwrite-api
  - appwrite-docs

FRONTEND
- React
- Vite
- JavaScript, NO TypeScript
- vite-plugin-pwa
- TailwindCSS 4.1
- Light theme y dark theme
- Radix UI para componentes base
- lucide-react para iconografía principal
- phosphor-icons solo si realmente aporta valor adicional
- framer-motion / motion para animaciones
- Arquitectura limpia, profesional y escalable
- Sin datos mock para los flujos reales

REGLAS DE IMPLEMENTACIÓN DEL STACK
- No uses TypeScript en ninguna parte del frontend.
- No uses shadcn/ui.
- La UI debe basarse en Radix UI y estilos propios con TailwindCSS 4.1.
- El proyecto debe contemplar light mode y dark mode desde el inicio.
- El tema debe implementarse correctamente, no solo visualmente a medias.
- Debe existir estructura clara de componentes, layouts, módulos, hooks, servicios y utilidades.
- El frontend debe estar preparado para PWA real usando vite-plugin-pwa.
- La interfaz debe ser muy usable en escritorio y aceptable en móvil para módulos como guardia o validación QR.
- Las animaciones con Framer Motion deben usarse con criterio, principalmente para transiciones, modales, paneles, tabs, dropdowns y cambios de estado; no quiero animaciones exageradas.

OBJETIVO DE ESTE PROMPT
Quiero que tomes el proyecto desde cero a nivel técnico y de estructura, de forma profesional, de manera que no tenga que corregirse después por malas decisiones de base.

ARRANQUE DESDE CERO
Quiero que hagas el proyecto desde cero, contemplando:

1. ESTRUCTURA BASE DEL REPO
Define una estructura profesional y clara, por ejemplo ajustándola si hace falta:
- raíz del proyecto
- frontend web con React + Vite
- configuración de Appwrite CLI
- functions
- documentación
- scripts útiles
- archivos de entorno de ejemplo
- configuración PWA
- assets
- configuración de theme
- configuración de Radix + Tailwind

2. CONFIGURACIÓN APPWRITE DESDE CERO
Quiero que prepares todo para que el proyecto quede conectado correctamente a Appwrite desde el inicio.
Debes:
- inicializar Appwrite CLI si hace falta
- generar la configuración necesaria del proyecto Appwrite
- crear o preparar correctamente el archivo de configuración que corresponda para el proyecto Appwrite
- si el flujo correcto usa `appwrite.json`, `appwrite.yaml`, `appwrite.config.json`, `appwrite.config.js` u otra variante compatible según Appwrite CLI real, entonces debes validar eso con appwrite-docs y appwrite-api y usar la opción correcta
- no inventes el formato: valídalo primero
- dejar el proyecto listo para usar `appwrite push`
- cuando sea necesario evitar interacción manual, usar `appwrite push --force`

IMPORTANTE SOBRE appwrite.config.js
Yo quiero que el proyecto quede bien preparado desde cero y que se genere la configuración necesaria de Appwrite para que todo quede ordenado y versionable. Si el nombre exacto del archivo o el enfoque correcto no es `appwrite.config.js`, entonces debes:
- validarlo
- usar el formato correcto real
- explicarme brevemente por qué
- implementarlo correctamente en el proyecto

3. FRONTEND BASE PROFESIONAL
Quiero que dejes listo un frontend real y bien estructurado con:
- React + Vite + JavaScript
- TailwindCSS 4.1
- vite-plugin-pwa
- sistema de tema light/dark
- layout principal
- sistema de rutas
- páginas base
- guards si hacen falta
- estructura modular
- configuración de aliases si conviene
- capa de servicios
- capa de utilidades
- componentes reutilizables
- integración con Appwrite SDK donde corresponda

4. PWA
Quiero que la app quede preparada como PWA real.
Debes:
- configurar vite-plugin-pwa correctamente
- definir manifest
- definir iconos requeridos o placeholders organizados
- preparar comportamiento base offline si es viable
- dejar buena base para instalación en escritorio y móvil
- no sobreprometer offline total si no aplica, pero sí dejar bien configurada la infraestructura PWA

5. TAILWINDCSS 4.1
Configura TailwindCSS 4.1 correctamente desde cero.
- Usa una convención profesional de estilos
- Prepara tokens base si ayuda
- Asegura compatibilidad con light/dark mode
- Mantén consistencia visual
- No hagas estilos improvisados o desordenados

6. RADIX UI
Usa Radix UI como base de componentes donde tenga sentido.
Por ejemplo:
- Dialog
- Dropdown Menu
- Tabs
- Tooltip
- Select
- Popover
- Alert Dialog
- Scroll Area
- Accordion
Pero con estilo completamente propio usando Tailwind.
No quiero que la app se vea genérica.

7. ICONOGRAFÍA
- lucide-react como librería principal
- phosphor-icons solo si realmente hace falta
- Mantén consistencia visual y no mezcles iconos sin criterio

8. ANIMACIONES
Usa Framer Motion para:
- transiciones de páginas
- paneles laterales
- modales
- cambios de estado
- listas o tablas si aporta
- feedback visual elegante
Sin exagerar ni sacrificar rendimiento o claridad operativa

9. PRINCIPIOS DE ARQUITECTURA
Quiero una arquitectura limpia y mantenible.
Debes proponer y aplicar una estructura consistente, por ejemplo:
- src/app
- src/layouts
- src/pages
- src/components
- src/features
- src/modules
- src/hooks
- src/context
- src/services
- src/lib
- src/utils
- src/styles
- src/assets
Pero decide una estructura final profesional y mantenla consistente.

10. INTEGRACIÓN CON APPWRITE
Desde el inicio, prepara correctamente:
- cliente Appwrite
- configuración por variables de entorno
- wrapper o capa de acceso
- servicios por dominio
- integración de auth
- separación clara entre frontend y lógica sensible que deba ir en Functions
- configuración para Sites y despliegue

11. VARIABLES DE ENTORNO
Quiero que manejes correctamente variables de entorno para:
- endpoint Appwrite
- project id
- database ids si aplica
- bucket ids
- function ids
- app name
- entorno local / producción
- configuraciones del frontend necesarias

Genera:
- `.env.example`
- documentación breve de variables
- estrategia clara para no hardcodear cosas sensibles

12. DISEÑO BASE DE INTERFAZ
Quiero que el diseño inicial de la aplicación tenga estas prioridades:
- se vea profesional
- moderna
- sobria
- operativa
- rápida de usar
- clara para personal administrativo y operativo
- con buen contraste en light/dark mode
- con componentes consistentes
- con tablas, formularios, badges, modales y paneles bien hechos

13. QUÉ DEBES HACER PRIMERO
Con este contexto técnico, quiero que:
1. Valides con appwrite-docs y appwrite-api cuál es la forma correcta y actual de estructurar la configuración Appwrite del proyecto desde CLI.
2. Definas la estructura técnica inicial del repo.
3. Generes el proyecto desde cero con este stack exacto.
4. Dejes lista la configuración de Appwrite.
5. Dejes listo el frontend base con PWA, theme, Tailwind, Radix y routing.
6. Continúes con las fases funcionales del proyecto principal.

14. ESTÁNDARES IMPORTANTES
- No uses TypeScript
- No uses componentes inventados que luego haya que rehacer
- No dejes solo scaffolding vacío
- No te quedes en pura teoría
- Implementa base real
- Si alguna parte de Appwrite CLI o config cambió respecto a versiones anteriores, valídalo con los MCP y usa la forma correcta
- Si hay conflicto entre lo que yo creo que se llama `appwrite.config.js` y lo que Appwrite realmente usa, prioriza la realidad validada con docs/API y deja el proyecto bien hecho

15. RESULTADO ESPERADO
Quiero que este contexto técnico influya en todo el proyecto y que desde el día 1:
- la base del frontend sea correcta
- la integración con Appwrite sea correcta
- la PWA quede bien preparada
- el sistema de tema esté bien implementado
- la arquitectura sea profesional
- el proyecto quede listo para crecer sin tener que rehacer la base técnica

Usa este mensaje como regla técnica permanente durante toda la construcción del proyecto.
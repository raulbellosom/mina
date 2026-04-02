# Task 23 — Pulido final y despliegue

## 1. Nombre del task

**Task 23 — Pulido final, validaciones cruzadas y despliegue a producción**

---

## 2. Objetivo

Completar el ciclo de desarrollo cerrando todos los detalles pendientes: validaciones cruzadas de flujos, hardening de permisos, corrección de inconsistencias detectadas en pruebas de integración, configuración de PWA, optimización de rendimiento y despliegue a Appwrite Sites.

Este task no introduce funcionalidad nueva, sino que asegura que todo lo construido en los tasks anteriores funciona de forma cohesionada, segura y lista para operación real.

---

## 3. Alcance

Incluye:

- validación de flujos end-to-end: voucher → ticket → báscula → validación de salida
- validación del flujo de mostrador: mostrador → ticket → validación de salida
- revisión y hardening de permisos en todos los módulos
- corrección de bugs o inconsistencias encontradas
- configuración completa del service worker PWA (vite-plugin-pwa)
- manifesto de la app (nombre, iconos, colores, modo standalone)
- prueba de instalación como PWA en dispositivos reales
- optimización de bundle (code splitting, lazy loading)
- revisión de responsividad en todos los módulos
- configuración de despliegue en Appwrite Sites
- variables de entorno de producción
- despliegue final

---

## 4. Validaciones end-to-end a realizar

### Flujo A: voucher → báscula → salida
1. Crear voucher desde catálogos
2. Generar ticket con QR
3. Imprimir ticket (simulado)
4. Registrar peso de entrada en báscula → estado `loading`
5. Registrar peso de salida en báscula → estado `pending_exit_validation`
6. Escanear QR en validación de salida → aprobar salida → estado `completed`
7. Verificar que todos los registros están en audit_logs
8. Verificar que el ticket aparece correctamente en reportes

### Flujo B: mostrador → salida
1. Registrar venta en mostrador
2. Generar ticket
3. Imprimir ticket (simulado)
4. Validar salida por QR → estado `completed`
5. Verificar auditoría y reportes

### Flujo C: reimpresión controlada
1. Tomar un ticket impreso
2. Intentar reimprimir sin permiso → rechazar
3. Reimprimir con permiso y motivo → registrar en print_logs
4. Verificar que el contador de reimpresiones aumentó

### Flujo D: usuario sin permisos
1. Crear usuario con rol sin permisos específicos
2. Intentar acceder a módulos protegidos → verificar bloqueo correcto
3. Verificar que el banner de "Acceso Denegado" aparece correctamente

---

## 5. Hardening de permisos

Revisar que todos los módulos implementan correctamente:

- `can('permiso.accion')` antes de mostrar botones y acciones
- `ProtectedRoute requiredPermission` en rutas que lo necesiten
- validación de permisos también en las Functions de Appwrite (no solo frontend)
- que owner tiene acceso a todo
- que pending no tiene acceso a nada
- que los labels de Appwrite en las colecciones coinciden con la seguridad del frontend

---

## 6. Configuración PWA

### vite-plugin-pwa
```js
// vite.config.js
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'MinaFlow',
    short_name: 'MinaFlow',
    description: 'Sistema operativo para mina de materiales',
    theme_color: '#1e40af',
    background_color: '#0f172a',
    display: 'standalone',
    icons: [/* 192x192, 512x512 */]
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    runtimeCaching: [/* estrategias por tipo de recurso */]
  }
})
```

### Funcionalidades PWA esperadas
- instalable en desktop y móvil
- funciona en modo standalone (sin barra del navegador)
- pantalla de splash
- icono en pantalla de inicio

---

## 7. Optimización de bundle

- verificar que las páginas de módulos grandes usen `React.lazy` y `Suspense`
- analizar el bundle con `vite-bundle-visualizer`
- separar dependencias grandes (framer-motion, QR libraries) en chunks separados
- verificar que el tamaño total del bundle inicial sea razonable (< 500KB gzip)

---

## 8. Configuración de despliegue en Appwrite Sites

```bash
# Build de producción
cd frontend && npm run build

# Desplegar en Appwrite Sites
appwrite deploy site
```

Variables de entorno de producción:
- `VITE_APPWRITE_ENDPOINT`
- `VITE_APPWRITE_PROJECT_ID`
- `VITE_APPWRITE_DATABASE_ID`

---

## 9. Revisión de responsividad

Verificar en todos los módulos:
- mobile (360px-639px): tabla scrollable o tarjetas, formularios full-width
- tablet (640px-1023px): sidebar oculto, layout de dos columnas donde aplica
- desktop (1024px+): sidebar visible, tablas completas

Módulos prioritarios para revisar:
- Báscula (operación en campo desde tablet)
- Validación de salida (operación desde móvil o tablet)
- Venta mostrador (operación desde tablet de mostrador)

---

## 10. Criterios de aceptación

1. los 4 flujos end-to-end funcionan correctamente sin errores
2. el hardening de permisos no tiene brechas detectadas
3. la PWA es instalable y funciona en modo standalone
4. el bundle está optimizado con code splitting
5. el despliegue en Appwrite Sites está configurado y documentado
6. todos los módulos son responsivos en los 3 breakpoints principales
7. no hay errores de consola en ningún módulo en producción

---

## 11. Dependencias previas

- Todos los tasks del 01 al 22

---

## 12. Entregables esperados

1. resultados de validación end-to-end (lista de flujos verificados)
2. correcciones de bugs encontrados
3. configuración PWA completa en vite.config.js
4. optimizaciones de bundle aplicadas
5. configuración de despliegue documentada
6. sistema desplegado y funcional en Appwrite Sites

---

## 13. Restricciones

- no usar TypeScript
- no introducir funcionalidad nueva en este task
- las correcciones deben ser quirúrgicas — no refactorizaciones masivas
- documentar brevemente cada corrección realizada

---

## 14. Prompt sugerido para Claude Code

```text
Necesito que ejecutes exclusivamente el Task 23 de este proyecto.

CONTEXTO
Sistema operativo para mina de materiales con Appwrite 1.8.1, React + Vite + JS + TailwindCSS 4.1 + Radix UI.

Todos los módulos están implementados. Este es el task final de pulido y despliegue.

OBJETIVO
Validar los flujos end-to-end, hacer hardening de permisos, configurar PWA completa, optimizar el bundle, revisar responsividad en todos los módulos y desplegar en Appwrite Sites.

LO QUE QUIERO QUE HAGAS
1. Ejecutar y documentar los 4 flujos end-to-end definidos en el task.
2. Revisar y corregir cualquier brecha de permisos encontrada.
3. Configurar vite-plugin-pwa con manifesto completo e íconos.
4. Aplicar React.lazy en módulos grandes.
5. Analizar y documentar el tamaño del bundle.
6. Revisar responsividad en báscula, validación de salida y mostrador.
7. Configurar el despliegue en Appwrite Sites.
8. Documentar todas las correcciones realizadas.

REGLAS
- No TypeScript.
- No funcionalidad nueva.
- Correcciones quirúrgicas.
- Documentar cada corrección.

No avances a otro task. Este es el task final.
```

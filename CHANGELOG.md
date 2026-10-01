# Registro de Cambios (Changelog)

Todas las modificaciones notables introducidas en este proyecto seran documentadas de forma continua en este archivo.

El formato se basa estrictamente en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y este proyecto se adhiere a [Semantic Versioning 2.0.0](https://semver.org/lang/es/).

---

## [2.0.0] - 2026-10-01

### Anadido
- Actualizacion mayor a la arquitectura moderna de **Angular 22** con deteccion de cambios Zoneless (`provideZonelessChangeDetection`) y reactividad granular con Signals.
- Modernizacion a **TypeScript 5.9 / 6.0** con tipado riguroso y erradicacion total de tipos debiles (`any`).
- Script de auditoria y gobernanza empresarial (`scripts/guardian.js`) ejecutable mediante `npm run guardian`.
- Flujo de Integracion Continua automatizado en GitHub Actions (`.github/workflows/ci.yml`).
- Plantillas estandarizadas para Pull Requests (`.github/PULL_REQUEST_TEMPLATE.md`) y reporte de incidencias (`.github/ISSUE_TEMPLATE/`).
- Definicion de propietarios de codigo (`.github/CODEOWNERS`).
- Suite documental tecnica y operativa completa: `docs/ARCHITECTURE.md`, `docs/COMPONENTS.md`, `docs/USER_MANUAL.md` y `docs/DEPLOYMENT.md`.
- Guia para desarrolladores y estandares de contribucion (`CONTRIBUTING.md`).

### Modificado
- Normalizacion de la documentacion central en `README.md` a codificacion UTF-8 estandar y eliminacion total de caracteres informales o emojis.
- Refuerzo de la politica estricta de 3 reintentos para transacciones de red criticas hacia el orquestador n8n.
- Garantia de ciclo de vida seguro de sesion manteniendo credenciales y tokens exclusivamente en memoria volatil (`sessionStorage`).
- Eliminacion de endpoints obsoletos y actualizacion del dominio a `autoscaner.pro`.

### Corregido
- Blindaje del interceptor de autenticacion y eliminacion de claves API expuestas en el cliente.
- Saneamiento de codigo sin usar, imports huerfanos y optimizacion de paquetes de despliegue.

---

## [1.2.3] - 2026-09-24

### Modificado
- Ajustes preliminares de empaquetado y preparacion de la arquitectura para gobernanza enterprise.

---

## [1.2.2] - 2026-09-24

### Anadido
- Incorporacion del logotipo corporativo oficial de Physis SRL en alta resolucion para componentes visuales y cabeceras.
- Iconografia corporativa adaptada para la PWA (`manifest.webmanifest`) en resoluciones 192x192 y 512x512.

### Modificado
- Restauracion del favicon original de Physis SRL en `src/favicon.ico`.
- Limpieza de dependencias obsoletas en el empaquetador de la aplicacion.

---

## [1.2.1] - 2026-09-23

### Modificado
- Actualizacion de los nombres de dominio de produccion a `autoscaner.pro` para la PWA de escaneo y `portal.autoscaner.pro` para la plataforma de validacion.
- Remocion de endpoints auxiliares de prueba no utilizados en la configuracion de servicios de integracion.

---

## [1.2.0] - 2026-09-15

### Anadido
- Motor de persistencia local resiliente con soporte Offline-First sobre IndexedDB.
- Cola de sincronizacion en segundo plano con detector de conectividad de red.

---

## [1.0.0] - 2026-08-01

### Anadido
- Version inicial de la aplicacion de escaneo de comprobantes en Angular.
- Integracion con orquestador n8n para procesamiento de comprobantes.
- Soporte basico de instalacion como PWA.

[2.0.0]: https://github.com/BrianRuizMoreno/ticket-ofarrell/compare/v1.2.3...v2.0.0
[1.2.3]: https://github.com/BrianRuizMoreno/ticket-ofarrell/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/BrianRuizMoreno/ticket-ofarrell/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/BrianRuizMoreno/ticket-ofarrell/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/BrianRuizMoreno/ticket-ofarrell/compare/v1.0.0...v1.2.0
[1.0.0]: https://github.com/BrianRuizMoreno/ticket-ofarrell/releases/tag/v1.0.0

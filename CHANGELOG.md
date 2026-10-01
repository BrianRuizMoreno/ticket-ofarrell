# Registro de Cambios (Changelog)

Todas las modificaciones notables introducidas en este proyecto seran documentadas de forma continua en este archivo.

El formato se basa estrictamente en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y este proyecto se adhiere a [Semantic Versioning 2.0.0](https://semver.org/lang/es/).

---

## [2.0.0] - 2026-10-01

### Anadido
- Actualizacion mayor a la arquitectura moderna de **Angular 22** con deteccion de cambios Zoneless y reactividad con Signals.
- Actualizacion a **TypeScript 5.9 / 6.0** con tipado riguroso y erradicacion total de tipos debiles (`any`).
- Script de auditoria y gobernanza empresarial (`scripts/guardian.js`) ejecutable mediante `npm run guardian`.
- Flujo automatizado de Integracion Continua con GitHub Actions (`.github/workflows/ci.yml`).
- Plantillas estandarizadas para Pull Requests (`.github/PULL_REQUEST_TEMPLATE.md`) y reporte de incidencias (`.github/ISSUE_TEMPLATE/`).
- Asignacion formal de propietarios de codigo (`.github/CODEOWNERS`).
- Suite documental completa y especializada: `docs/API.md`, `docs/ARCHITECTURE.md`, `docs/COMPONENTS.md`, `docs/USER_MANUAL.md` y `docs/DEPLOYMENT.md`.
- Guia tecnica de contribucion bajo estandares corporativos (`CONTRIBUTING.md`).
- Persistencia relacional en base de datos PostgreSQL 16 con gestion de conexiones mediante pool y tolerancia a fallos.

### Modificado
- Reestructuracion del servidor Express con sanitizacion completa de registros en consola y erradicacion total de caracteres informales o emojis.
- Reemplazo y actualizacion del archivo central `README.md` a codificacion UTF-8 estandar.
- Refuerzo de la politica estricta de 3 reintentos en operaciones criticas de red y acceso a base de datos.
- Configuracion de limitacion de tasa de peticiones (`express-rate-limit`) en rutas sensibles de la API REST.

### Corregido
- Sanitizacion de respuestas HTTP para prevenir fugas de trazas internas en entornos de produccion.
- Garantia de tipado estricto en todos los servicios y componentes del portal frontend sin admision de `any`.

---

## [1.1.0] - 2026-09-23

### Anadido
- Soporte para transicion de estados de rendiciones (`EN_REVISION`, `APROBADA`, `OBSERVADA`, `RECHAZADA`).
- Panel de visualizacion de comprobantes con zoom y contraste asistido.

### Modificado
- Asignacion de dominios productivos formales: `portal.autoscaner.pro` para el portal web y `api.autoscaner.pro` para el servicio backend.

---

## [1.0.0] - 2026-09-01

### Anadido
- Version inicial del validador de comprobantes para el equipo de administracion.
- Servidor basico Express con persistencia preliminar.
- Interfaz Angular inicial para listado de comprobantes.

[2.0.0]: https://github.com/BrianRuizMoreno/ticket-ofarrell/compare/v1.1.0...v2.0.0
[1.1.0]: https://github.com/BrianRuizMoreno/ticket-ofarrell/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/BrianRuizMoreno/ticket-ofarrell/releases/tag/v1.0.0

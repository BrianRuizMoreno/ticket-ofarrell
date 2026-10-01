# Physis Scanner PWA

[![Latest Release](https://img.shields.io/badge/Release-v2.0.0-007ACC?style=flat-square)](https://github.com/BrianRuizMoreno/ticket-ofarrell/releases/tag/v2.0.0)
[![Angular Version](https://img.shields.io/badge/Angular-22.1.7-DD0031?style=flat-square&logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PWA](https://img.shields.io/badge/PWA-Compliant-5A0FC8?style=flat-square)](https://web.dev/progressive-web-apps/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Gobernanza](https://img.shields.io/badge/Guardian-Aprobado-007ACC?style=flat-square)](scripts/guardian.js)
[![Licencia](https://img.shields.io/badge/Licencia-Privada-red?style=flat-square)](#)

Aplicacion web progresiva (PWA) de nivel corporativo disenada para la captura, digitalizacion, preclasificacion asistida y transmision resiliente de comprobantes de gastos y rendiciones hacia el ecosistema ERP de Physis SRL a traves de orquestadores n8n.

---

## 1. Descripcion General del Sistema

Physis Scanner opera en el dominio productivo `autoscaner.pro`. Esta construida bajo la arquitectura moderna de **Angular 22** con procesamiento reactivo basado en **Signals**, modo de deteccion de cambios **Zoneless** y capacidades integrales de ejecucion **Offline-First**.

### Capacidades Principales
- **Captura Optimizada:** Toma fotografica y seleccion de comprobantes con preprocesamiento de imagen local.
- **Tolerancia a Desconexion:** Almacenamiento local seguro en IndexedDB para la operacion ininterrumpida en zonas sin cobertura de red.
- **Sincronizacion en Segundo Plano:** Deteccion automatica de restauracion de red y despacho de colas con politica de 3 reintentos.
- **Seguridad en Memoria:** Ciclo de vida de sesion con proteccion de credenciales y datos temporales en almacenamiento volatil (`sessionStorage`), previniendo persistencia desprotegida.
- **Tipado Estricto:** Ausencia total de tipos debiles (`any`), tipado explicito de modelos (`IComprobante`, `IRendicion`) y contratos de transmision DTO.

---

## 2. Requisitos de Entorno

- **Node.js:** Version 22.x LTS o superior.
- **NPM:** Version 10.x o superior.
- **Angular CLI:** Version 22.x instalada global o localmente (`@angular/cli`).
- **Navegador Compatible:** Google Chrome 115+, Safari 17+, Mozilla Firefox 115+ o Microsoft Edge.

---

## 3. Comandos de Inicio Rapido

### Instalacion de Dependencias
```bash
npm install
```

### Ejecucion en Modo Desarrollo
```bash
npm start
```
El servidor de desarrollo local estara disponible en `http://localhost:4200/`.

### Auditoria de Calidad y Gobernanza (Guardian)
```bash
npm run guardian
```
Verifica la ausencia total de emojis y el tipado estricto en la base de codigo y documentacion.

### Compilacion de Produccion
```bash
npm run build:prod
```
Los artefactos compilados se ubicaran en la carpeta `dist/tickets-physis/browser`.

---

## 4. Estructura del Proyecto

```
Scanner/
|-- .github/                # Plantillas de PR, Issues, Codeowners y CI/CD
|-- docs/                   # Suite de documentacion tecnica y operativa
|   |-- ARCHITECTURE.md     # Topologia, reactividad Zoneless y gestion offline
|   |-- COMPONENTS.md       # Catalogo de componentes UI y tokens visuales
|   |-- DEPLOYMENT.md       # Guia de despliegue en Dokploy con Nginx
|   `-- USER_MANUAL.md      # Manual operativo para el usuario de campo
|-- scripts/
|   `-- guardian.js         # Script de auditoria y gobernanza empresarial
|-- src/
|   |-- app/
|   |   |-- core/           # Servicios nucleo, interceptores, guards y modelos
|   |   |-- features/       # Modulos funcionales (escaneo, tickets, rendiciones)
|   |   `-- shared/         # Componentes y pipes reutilizables
|   |-- assets/             # Recursos estaticos, fuentes y logos corporativos
|   `-- environments/       # Configuraciones por entorno
|-- CHANGELOG.md            # Registro formal de versiones bajo SemVer
|-- CONTRIBUTING.md         # Guia de contribucion y estandares de desarrollo
|-- Dockerfile              # Empaquetado de produccion multi-etapa con Nginx
`-- nginx.conf              # Configuracion de servidor Nginx y encabezados HTTP
```

---

## 5. Centro de Documentacion

Para detalles exhaustivos sobre la solucion, consulte la suite documental en la carpeta `docs/`:

- [Arquitectura del Sistema](docs/ARCHITECTURE.md): Diagramas de flujo, reactividad con Signals, arquitectura de base de datos local y politica de sincronizacion.
- [Catalogo de Componentes](docs/COMPONENTS.md): Inventario de componentes Standalone y pautas de diseno.
- [Manual de Usuario](docs/USER_MANUAL.md): Guia paso a paso para la captura, revision y envio de rendiciones.
- [Guia de Despliegue](docs/DEPLOYMENT.md): Procedimiento de compilacion contenerizada, variables de entorno y configuracion en Dokploy.
- [Guia de Contribucion](CONTRIBUTING.md): Flujo de trabajo Git, reglas de estilo y aprobacion de cambios.
- [Historial de Cambios](CHANGELOG.md): Registro cronologico de versiones bajo Semantic Versioning 2.0.0.
- [Notas de la Version Oficial v2.0.0](https://github.com/BrianRuizMoreno/ticket-ofarrell/releases/tag/v2.0.0): Distribucion oficial y artefactos compilados.

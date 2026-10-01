# Physis ScannerValidator - Portal de Auditoria y API de Validacion

[![Latest Release](https://img.shields.io/badge/Release-v2.0.0-007ACC?style=flat-square)](https://github.com/BrianRuizMoreno/ticket-ofarrell/releases/tag/v2.0.0)
[![Angular Version](https://img.shields.io/badge/Angular-22.1.7-DD0031?style=flat-square&logo=angular&logoColor=white)](https://angular.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gobernanza](https://img.shields.io/badge/Guardian-Aprobado-007ACC?style=flat-square)](scripts/guardian.js)
[![Licencia](https://img.shields.io/badge/Licencia-Privada-red?style=flat-square)](#)

Plataforma integral de auditoria, control contable y aprobacion de comprobantes de gastos para el personal administrativo de Physis SRL. El sistema se compone de un portal web reactivo (Frontend SPA en Angular 22) y un servicio de procesamiento y persistencia REST (Backend en Node.js Express respaldado por PostgreSQL 16).

---

## 1. Descripcion General del Sistema

Physis ScannerValidator opera en los dominios productivos:
- **Portal de Auditoria (Frontend):** `portal.autoscaner.pro`
- **Servicio API REST (Backend):** `api.autoscaner.pro`

### Capacidades Principales
- **Revision Centralizada:** Panel de control para la inspeccion detallada de comprobantes escaneados, imagenes adjuntas y datos extraidos.
- **Flujo de Estados:** Transicion controlada de rendiciones a traves de estados formales (`PENDIENTE`, `EN_REVISION`, `APROBADA`, `OBSERVADA`, `RECHAZADA`).
- **Persistencia Transaccional:** Motor de base de datos relacional PostgreSQL con inicializacion automatica de esquemas y soporte de fallback seguro.
- **Proteccion Perimetral:** Backend equipado con limitacion de tasa de peticiones (`express-rate-limit`), politica restrictiva de CORS y sanitizacion de entradas.
- **Tipado Estricto:** Frontend fuertemente tipado con contratos TypeScript, modelos con prefijo `I` y DTOs de integracion con sufijo `Dto`.

---

## 2. Requisitos de Entorno

- **Node.js:** Version 22.x LTS o superior.
- **PostgreSQL:** Version 16 o superior (o ejecucion contenerizada via Docker).
- **NPM:** Version 10.x o superior.
- **Docker & Docker Compose:** Para despliegue de la suite de servicios contenerizados.

---

## 3. Comandos de Inicio Rapido

### Instalacion de Dependencias
```bash
# Dependencias del Frontend
npm install

# Dependencias del Backend
cd server && npm install && cd ..
```

### Ejecucion Local del Backend
```bash
cd server
npm start
```
El servidor Express se iniciara en el puerto configurado (predeterminado: `http://localhost:3000/api`).

### Ejecucion Local del Frontend
```bash
npm start
```
El portal de auditoria estara disponible en `http://localhost:4200/`.

### Auditoria de Calidad y Gobernanza (Guardian)
```bash
npm run guardian
```
Ejecuta la verificacion automatizada de ausencia de emojis y tipado estricto.

### Compilacion de Produccion del Frontend
```bash
npm run build:prod
```
Genera los archivos compilados en `dist/tickets-physis/browser`.

---

## 4. Estructura del Repositorio

```
ScannerValidator/
|-- .github/                # Plantillas de PR, Issues, Codeowners y CI/CD
|-- docs/                   # Suite de documentacion tecnica y operativa
|   |-- API.md              # Especificacion exhaustiva de endpoints REST
|   |-- ARCHITECTURE.md     # Topologia 3 capas, esquema de BD y seguridad
|   |-- COMPONENTS.md       # Catalogo de componentes UI del portal
|   |-- DEPLOYMENT.md       # Orquestacion Dokploy con Docker Compose
|   `-- USER_MANUAL.md      # Manual operativo para auditores contables
|-- scripts/
|   `-- guardian.js         # Script de auditoria y gobernanza empresarial
|-- server/                 # Backend Node.js Express
|   |-- db.js               # Conexion y repositorio PostgreSQL con reintentos
|   |-- index.js            # Servidor HTTP, middleware y rutas REST
|   `-- package.json        # Dependencias del backend
|-- src/                    # Frontend Angular 22
|   |-- app/
|   |   |-- core/           # Modelos (I*), servicios y estado reactivo
|   |   `-- features/       # Componentes del dashboard de validacion
|   `-- environments/       # Configuracion de entornos
|-- CHANGELOG.md            # Registro formal de versiones bajo SemVer
|-- CONTRIBUTING.md         # Guia de desarrollo y flujo de integracion
|-- docker-compose.yml      # Definicion de servicios multicontenedor
|-- Dockerfile              # Empaquetado de produccion multi-etapa
`-- nginx.conf              # Configuracion de servidor Nginx para frontend
```

---

## 5. Centro de Documentacion

Consulte la documentacion detallada en la carpeta `docs/`:

- [Especificacion de la API REST](docs/API.md): Contratos de endpoints, metodos HTTP, esquemas JSON y codigos de respuesta.
- [Arquitectura del Sistema](docs/ARCHITECTURE.md): Diagramas de topologia, modelo de datos relacional y flujo de estados.
- [Catalogo de Componentes](docs/COMPONENTS.md): Inventario de componentes de auditoria y visualizacion.
- [Manual de Usuario](docs/USER_MANUAL.md): Procedimiento paso a paso para el control y aprobacion de rendiciones.
- [Guia de Despliegue](docs/DEPLOYMENT.md): Orquestacion en Dokploy, configuracion de base de datos y respaldos.
- [Guia de Contribucion](CONTRIBUTING.md): Politicas de codigo, Conventional Commits y aprobaciones.
- [Historial de Cambios](CHANGELOG.md): Registro cronologico de entregas bajo SemVer 2.0.0.
- [Notas de la Version Oficial v2.0.0](https://github.com/BrianRuizMoreno/ticket-ofarrell/releases/tag/v2.0.0): Distribucion oficial y artefactos compilados.

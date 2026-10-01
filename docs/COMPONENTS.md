# Catalogo de Componentes UI - ScannerValidator

Este documento describe la arquitectura de interfaz de usuario y los componentes Standalone del portal web de auditoria Physis ScannerValidator (`portal.autoscaner.pro`).

---

## 1. Sistema de Diseno y Directrices Visuales

El portal esta orientado al uso intensivo en estaciones de trabajo de oficina tecnica y auditoria contable, priorizando legibilidad de tablas, contraste documental y herramientas de revision rapida.

### Paleta Cromatica
- **Fondo de Aplicacion:** `#f1f3f5` (Gris claro de descanso visual).
- **Barra de Navegacion:** `#212529` (Gris grafito corporativo).
- **Accion Principal:** `#0d6efd` (Azul institucional de aprobacion y seleccion).
- **Estado Pendiente:** `#ffc107` (Amarillo ambar de advertencia).
- **Estado Aprobada:** `#198754` (Verde esmeralda de aprobacion definitiva).
- **Estado Observada:** `#fd7e14` (Naranja de revision requerida).
- **Estado Rechazada:** `#dc3545` (Rojo carmesi de desaprobacion).

---

## 2. Inventario de Componentes Standalone

### 2.1. Panel Principal de Rendiciones (`RendicionListComponent`)
- **Ubicacion:** `src/app/features/rendiciones/rendicion-list.component.ts`
- **Responsabilidad:** Vista en tabla y tarjetas de todas las rendiciones ingresadas, con filtros por estado, fecha y empresa.
- **Entradas:** Ninguna (consume el servicio de rendiciones reactivo).
- **Salidas:** Emision de eventos de seleccion de fila hacia el enrutador.

### 2.2. Detalle y Auditoria de Legajo (`RendicionDetailComponent`)
- **Ubicacion:** `src/app/features/rendiciones/rendicion-detail.component.ts`
- **Responsabilidad:** Inspeccion profunda de un legajo seleccionado, exhibiendo los comprobantes asociados, totales declarados vs totales calculados y formulario de observaciones.
- **Entradas:**
  - `id`: Identificador de la rendicion obtenido mediante parametros de ruta (`withComponentInputBinding`).

### 2.3. Visor e Inspector de Comprobante (`TicketInspectorComponent`)
- **Ubicacion:** `src/app/features/tickets/components/ticket-inspector.component.ts`
- **Responsabilidad:** Comparacion lado a lado de la imagen escaneada del comprobante y los datos extraidos (CUIT, razon social, fecha, importe, desglose de IVA).
- **Controles:** Herramientas de rotacion, zoom digital y contraste para lectura de comprobantes con iluminacion deficiente.

### 2.4. Placa de Estado Fiscal (`StatusBadgeComponent`)
- **Ubicacion:** `src/app/shared/components/status-badge.component.ts`
- **Responsabilidad:** Elemento visual reutilizable para la indicacion homogenea del estado formal de un comprobante o rendicion.
- **Entradas:**
  - `estado`: Valor tipado segun el enumerador de estados.

---

## 3. Pautas de Rendimiento y Accesibilidad

- **Deteccion de Cambios Zoneless:** Los componentes se sincronizan mediante `ChangeDetectionStrategy.OnPush` y Signals reactivos.
- **Tabulacion Contable Eficiente:** Los botones de aprobacion, observacion y paso al siguiente comprobante disponen de atajos por teclado para acelerar la auditoria masiva de legajos.

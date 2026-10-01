# Catalogo de Componentes UI - Physis Scanner PWA

Este documento describe la biblioteca de componentes graficos y los patrones de interfaz implementados en Physis Scanner PWA (`autoscaner.pro`).

---

## 1. Sistema de Diseno y Tokens Visuales

La interfaz sigue la identidad corporativa de Physis SRL, priorizando claridad visual, contraste accesible y ergonomia en dispositivos moviles.

### Paleta Cromatica Principal
- **Azul Primario Corporativo:** `#0d6efd` (Acciones principales, botones de confirmacion y enfasis activo).
- **Azul Oscuro de Contraste:** `#0a58ca` (Estados hover y encabezados primarios).
- **Fondo de Interfaz:** `#f8f9fa` (Superficie neutral principal para reducir fatiga visual).
- **Superficie de Tarjetas:** `#ffffff` (Contenedores elevados con sombra suave).
- **Texto Principal:** `#212529` (Alto contraste para lectura en exteriores).
- **Texto Secundario:** `#6c757d` (Metadatos, etiquetas y subtitulos).
- **Estado de Exito:** `#198754` (Comprobante sincronizado, transmision aprobada).
- **Estado de Advertencia:** `#ffc107` (Comprobante pendiente de transmision o sin conexion).
- **Estado de Error:** `#dc3545` (Fallo en captura o rechazo de validacion).

### Tipografia
- Familia principal: Tipografia de sistema optimizada (`system-ui`, `-apple-system`, `Segoe UI`, `Roboto`, `Helvetica Neue`, `sans-serif`).
- Escala de tamanos:
  - Titulo principal (H1): 1.5rem (24px), peso semibold (600).
  - Titulo secundario (H2): 1.25rem (20px), peso semibold (600).
  - Cuerpo de texto: 1rem (16px), peso normal (400).
  - Metadatos y notas al pie: 0.875rem (14px), peso normal (400).

---

## 2. Inventario de Componentes Standalone

Todos los componentes de la aplicacion se desarrollan como componentes independientes (`standalone: true`) bajo la arquitectura modular de Angular 22.

### 2.1. Visor de Captura (`ScannerViewComponent`)
- **Ubicacion:** `src/app/features/scanner/scanner-view.component.ts`
- **Responsabilidad:** Gestion del acceso a camara web o de dispositivo movil, encuadre del comprobante, previsualizacion instantanea y captura de la imagen.
- **Entradas (Inputs):**
  - `resolucionObjetivo`: Especificacion de dimensiones maximas de captura.
- **Salidas (Outputs):**
  - `capturaCompletada`: Evento emitido con el archivo Blob resultante y metadatos preliminares.
  - `errorDispositivo`: Notificacion de denegacion de permisos o indisponibilidad del hardware.

### 2.2. Tarjeta de Comprobante (`TicketCardComponent`)
- **Ubicacion:** `src/app/features/tickets/components/ticket-card.component.ts`
- **Responsabilidad:** Presentacion resumida de un comprobante escaneado, mostrando fecha, emisor, importe total, estado de sincronizacion y acceso a edicion/eliminacion.
- **Entradas (Inputs):**
  - `comprobante`: Instancia tipada del modelo `IComprobante`.
- **Salidas (Outputs):**
  - `seleccionar`: Seleccion del comprobante para visualizacion ampliada.
  - `eliminar`: Solicitud de baja del comprobante en la base local.

### 2.3. Resumen de Rendicion (`RendicionSummaryComponent`)
- **Ubicacion:** `src/app/features/rendiciones/components/rendicion-summary.component.ts`
- **Responsabilidad:** Agrupacion y consolidacion de importes totales de los comprobantes asociados a una rendicion activa.
- **Entradas (Inputs):**
  - `rendicion`: Objeto tipado `IRendicion`.
  - `totalAcumulado`: Valor numerico calculado mediante Signal reactivo.
- **Salidas (Outputs):**
  - `enviarRendicion`: Disparador para la transmision consolidada al orquestador n8n.

### 2.4. Indicador de Conectividad y Cola (`SyncIndicatorComponent`)
- **Ubicacion:** `src/app/shared/components/sync-indicator.component.ts`
- **Responsabilidad:** Notificacion persistente y no intrusiva del estado de conexion de red y cantidad de comprobantes encolados para sincronizacion.
- **Comportamiento:**
  - En linea y cola vacia: Discreto o minimizado.
  - En linea con elementos pendientes: Muestra barra de progreso y estado de reintentos.
  - Fuera de linea: Muestra advertencia informativa indicando que los datos estan seguros en el almacenamiento local.

---

## 3. Pautas de Accesibilidad y Responsividad

- **Navegacion por Teclado:** Todo control interactivo posee indicadores de foco visibles y soporte de navegacion secuencial mediante tabulacion.
- **Tamanos de Toque Tactil:** Los botones y areas interactivas en dispositivos moviles tienen una dimension minima recomendada de 44x44 pixeles.
- **Compatibilidad con Lectores de Pantalla:** Atributos `aria-label` explicitos en botones con iconografia o controles de accion sin texto directo.

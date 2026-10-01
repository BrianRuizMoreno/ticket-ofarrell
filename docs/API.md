# Especificacion de la API REST - ScannerValidator

Este documento detalla la especificacion tecnica de los endpoints expuestos por el servicio backend de Physis ScannerValidator (`https://api.autoscaner.pro`).

---

## 1. Informacion General y Seguridad

### Entornos
- **Produccion:** `https://api.autoscaner.pro/api`
- **Desarrollo Local:** `http://localhost:3000/api`

### Politica de Limitacion de Tasa (Rate Limiting)
- Ventana de tiempo: 15 minutos.
- Maximo de solicitudes: 300 peticiones por direccion IP.
- Encabezados estandar incluidos en cada respuesta:
  - `RateLimit-Limit`
  - `RateLimit-Remaining`
  - `RateLimit-Reset`

### Politica CORS
Origenes autorizados en produccion:
- `https://autoscaner.pro`
- `https://portal.autoscaner.pro`
- `https://api.autoscaner.pro`

---

## 2. Inventario de Endpoints

### 2.1. Verificacion de Estado (Health Check)

Verifica la disponibilidad operativa del servicio y el estado de conexion con el motor PostgreSQL.

- **Ruta:** `GET /api/health`
- **Autenticacion:** No requerida.
- **Respuesta Exitosa (200 OK):**
```json
{
  "status": "ok",
  "postgres": true,
  "timestamp": "2026-10-01T17:00:00.000Z"
}
```

---

### 2.2. Analisis de Comprobante con Inteligencia Artificial

Procesa una imagen digitalizada de comprobante mediante la cascada de modelos de IA de Google Gemini para extraer datos fiscales y tributarios.

- **Ruta:** `POST /api/ai/analizar-ticket`
- **Content-Type:** `multipart/form-data`
- **Parametros del Cuerpo (Form Data):**
  - `imagen` (Archivo binario, requerido): Imagen del comprobante (JPEG, PNG, WebP). Limite maximo: 25 MB.
- **Respuesta Exitosa (200 OK):**
```json
{
  "razon_social": "YPF ESTACION CENTRAL",
  "cuit": "30-54678912-3",
  "n_operacion": "0001-00045612",
  "tipo_gasto": "COMBUSTIBLE",
  "metodo_pago": "Tarjeta de Credito",
  "fecha": "2026-09-28",
  "monto": 35000.00,
  "iva": 7350.00,
  "total": 42350.00,
  "vendor": "YPF",
  "items": [
    "Infinia Nafta 45 Litros"
  ]
}
```
- **Respuestas de Error:**
  - `400 Bad Request`: `{ "error": "No se proporciono ninguna imagen de comprobante." }`
  - `500 Internal Server Error`: `{ "error": "Error al procesar el comprobante con IA" }`

---

### 2.3. Recepcion de Rendiciones

Recibe paquetes de comprobantes remitidos desde la aplicacion cliente Scanner PWA o flujos n8n.

- **Ruta:** `POST /api/rendiciones/recibir`
- **Content-Type:** `application/json`
- **Cuerpo de la Solicitud (JSON):**
```json
{
  "id": "R-1727789000000",
  "usuario": "Juan Perez",
  "empresa": "Physis SRL",
  "empresa_especifica": "Sucursal Rosario",
  "total": 42350.00,
  "observaciones": "Gastos de viaje tecnico",
  "totales": {
    "monto": 35000.00,
    "iva": 7350.00
  },
  "tickets": [
    {
      "id": "TICK-001",
      "tipo": "Factura B",
      "emisor": "YPF ESTACION CENTRAL",
      "cuit": "30-54678912-3",
      "total": 42350.00,
      "fecha": "2026-09-28",
      "imageUrl": "/uploads/ticket_001.jpg"
    }
  ]
}
```
- **Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "id": "R-1727789000000"
}
```
- **Respuestas de Error:**
  - `400 Bad Request`: `{ "error": "Payload de rendicion invalido: se requiere arreglo de tickets." }`
  - `500 Internal Server Error`: `{ "error": "Error al procesar la rendicion" }`

---

### 2.4. Listado de Rendiciones Activas

Obtiene todas las rendiciones registradas en el sistema ordenadas cronologicamente.

- **Ruta:** `GET /api/rendiciones`
- **Content-Type:** `application/json`
- **Respuesta Exitosa (200 OK):**
```json
[
  {
    "id": "R-1727789000000",
    "usuario": "Juan Perez",
    "empresa": "Physis SRL",
    "fecha_recepcion": "2026-10-01T12:00:00.000Z",
    "estado": "pendiente",
    "total": 42350.00,
    "cantidad_tickets": 1,
    "observaciones": "Gastos de viaje tecnico"
  }
]
```

---

### 2.5. Detalle de Rendicion por Identificador

Devuelve el detalle integro de una rendicion, incluyendo todos sus comprobantes desglosados.

- **Ruta:** `GET /api/rendiciones/:id`
- **Parametros de Ruta:**
  - `id`: Identificador unico de la rendicion.
- **Respuesta Exitosa (200 OK):**
```json
{
  "id": "R-1727789000000",
  "usuario": "Juan Perez",
  "empresa": "Physis SRL",
  "estado": "pendiente",
  "total": 42350.00,
  "tickets": [
    {
      "id": "TICK-001",
      "tipo": "Factura B",
      "emisor": "YPF ESTACION CENTRAL",
      "cuit": "30-54678912-3",
      "total": 42350.00
    }
  ]
}
```
- **Respuesta si no existe (404 Not Found):**
```json
{
  "success": false,
  "message": "Rendicion no encontrada"
}
```

---

### 2.6. Actualizacion de Estado y Observaciones

Permite al auditor modificar el estado formal de un legajo o adjuntar requerimientos contables.

- **Ruta:** `PATCH /api/rendiciones/:id`
- **Content-Type:** `application/json`
- **Cuerpo de la Solicitud (JSON):**
```json
{
  "estado": "aprobada",
  "observaciones": "Verificado conforme a politica interna de viaticos."
}
```
*Estados validos:* `pendiente`, `aprobada`, `rechazada`, `eliminada`.
- **Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "rendicion": {
    "id": "R-1727789000000",
    "estado": "aprobada",
    "observaciones": "Verificado conforme a politica interna de viaticos."
  }
}
```
- **Respuestas de Error:**
  - `400 Bad Request`: `{ "error": "Estado invalido..." }`
  - `404 Not Found`: `{ "success": false, "message": "Rendicion no encontrada" }`

---

### 2.7. Eliminacion Logica de Rendicion

Marca una rendicion en estado eliminada sin destruccion fisica inmediata.

- **Ruta:** `DELETE /api/rendiciones/:id`
- **Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "message": "Rendicion eliminada logicamente"
}
```

---

### 2.8. Depuracion General de Rendiciones

Operacion administrativa de mantenimiento para purga de registros de prueba.

- **Ruta:** `DELETE /api/rendiciones/clear`
- **Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "message": "Todas las rendiciones han sido eliminadas"
}
```

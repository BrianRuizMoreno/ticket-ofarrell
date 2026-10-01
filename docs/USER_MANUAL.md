# Manual de Usuario - ScannerValidator

Este manual describe el procedimiento de operacion del portal de validacion y auditoria contable Physis ScannerValidator (`https://portal.autoscaner.pro`) destinado al personal de administracion, tesoreria y control contable.

---

## 1. Acceso al Portal

1. Ingrese mediante un navegador web seguro a la direccion: `https://portal.autoscaner.pro`.
2. Proporcione sus credenciales administrativas autorizadas.
3. El sistema abrira la bandeja de entrada central de rendiciones de gastos.

---

## 2. Bandeja de Entrada y Filtros

En la pantalla principal observara el listado consolidado de legajos remitidos por el personal en campo:
- **Filtrado por Estado:** Permite conmutar entre "Pendientes", "En Revision", "Aprobadas", "Observadas" y "Rechazadas".
- **Busqueda:** Busqueda rapida por nombre de colaborador, empresa o identificador de rendicion.
- **Indicadores Clave:** Cada tarjeta o fila muestra la cantidad de comprobantes contenidos y el monto total acumulado.

---

## 3. Procedimiento de Auditoria de un Legajo

1. Haga clic sobre la rendicion que desea auditar.
2. La vista de detalle mostrara dos secciones principales:
   - **Columna Izquierda / Panel de Documentos:** Listado de los comprobantes adjuntos en el legajo.
   - **Panel Central / Visor:** Imagen ampliada del comprobante seleccionado con herramientas de zoom e inspeccion.
   - **Panel Derecho / Datos Fiscales:** CUIT, razon social, fecha, importe gravado e IVA calculados.

### Cotejo de Datos
Para cada comprobante:
1. Verifique que la imagen coincida fielmente con los campos extraidos.
2. Confirme que la razon social y CUIT correspondan a un proveedor admisible conforme a las politicas internas de la empresa.
3. Corrobore que la fecha del comprobante se encuentre dentro del periodo fiscal habilitado para el viaje o actividad.

---

## 4. Resolucion y Transicion de Estados

Una vez completado el cotejo de todos los items de la rendicion:

### Aprobacion
- Si todos los comprobantes son validos y los importes coinciden, presione el boton **Aprobar Rendicion**.
- El legajo pasara inmediatamente a estado `Aprobada` y quedara habilitado para su imputacion en el sistema ERP.

### Emision de Observaciones
- Si existen dudas sobre un comprobante, faltan especificaciones de concepto o un importe no es legible:
  1. Presione el boton **Observar Rendicion**.
  2. Redacte detalladamente en el cuadro de texto los motivos de la objecion (ejemplo: "Comprobante 3 ilegible; adjuntar nueva fotografia del ticket de combustible").
  3. Presione "Confirmar Observacion".
  4. El colaborador recibira la notificacion para corregir o aclarar el comprobante en su aplicacion de escaneo.

### Rechazo
- Si la rendicion incumple de forma insubsanable las normativas de la compania:
  1. Presione el boton **Rechazar Rendicion**.
  2. Indique la justificacion formal requerida.
  3. Confirme la operacion.

---

## 5. Preguntas Frecuentes

### Que ocurre si la imagen de un comprobante no carga?
- Verifique su conectividad y recargue la vista del legajo. Los archivos residen de forma segura en el servidor de almacenamiento.

### Puede modificarse una rendicion ya aprobada?
- Por motivos de integridad fiscal y auditoria, una rendicion en estado `Aprobada` queda bloqueada contra ediciones adicionales. Si requiere un ajuste excepcional, consulte con el administrador del sistema.

# Manual de Usuario - Physis Scanner PWA

Este manual describe el funcionamiento y procedimiento operativo de la aplicacion Physis Scanner (`https://autoscaner.pro`) para el personal en campo y usuarios responsables de la carga de comprobantes de gastos.

---

## 1. Acceso e Instalacion de la Aplicacion

### Acceso Web
1. Abra el navegador web en su dispositivo movil o computadora.
2. Ingrese a la direccion: `https://autoscaner.pro`.
3. Verifique que la barra de navegacion indique una conexion segura mediante certificado SSL (candado de seguridad).

### Instalacion como Aplicacion Web Progresiva (PWA)
Para operar con mayor comodidad y acceso rapido desde la pantalla de inicio:
- **En Android (Google Chrome):** Presione el menu de tres puntos en la esquina superior derecha y seleccione "Instalar aplicacion" o "Agregar a la pantalla principal".
- **En iOS (Apple Safari):** Presione el boton de compartir (icono de cuadro con flecha hacia arriba) y elija "Agregar al inicio".
- **En Computadora (Chrome / Edge):** Haga clic en el icono de instalacion ubicado en la barra de direcciones superior.

---

## 2. Inicio de Sesion y Seleccion de Rendicion

1. Ingrese su identificador de usuario y contrasena asignada por la administracion.
2. Tras la validacion, el sistema presentara el listado de sus rendiciones activas o le permitira crear una nueva rendicion de gastos.
3. Para iniciar una nueva rendicion, presione el boton "Nueva Rendicion", ingrese un titulo descriptivo (ejemplo: "Gastos Viaje Rosario - Octubre 2026") y confirme la accion.

---

## 3. Captura y Carga de Comprobantes

### Procedimiento de Fotografia
1. Dentro de la rendicion activa, presione el boton "Escanear Comprobante".
2. Otorgue permisos de acceso a la camara cuando el navegador lo solicite.
3. Posicione el ticket o factura sobre una superficie plana, con iluminacion uniforme y evitando sombras o reflejos excesivos.
4. Asegurese de que los cuatro bordes del documento queden dentro del recuadro de encuadre.
5. Presione el disparador de captura.

### Carga desde Galeria o Archivo
Si ya cuenta con la fotografia o comprobante digital en formato PDF o imagen:
1. Presione la opcion "Cargar desde archivo".
2. Seleccione el documento desde el explorador de archivos de su dispositivo.

### Revision y Confirmacion de Datos
1. La aplicacion procesara el documento y presentara una previsualizacion.
2. Verifique o complete los campos requeridos:
   - Fecha de emision.
   - Tipo de comprobante (Factura A, B, C, Ticket, etc.).
   - CUIT del emisor.
   - Importe total del comprobante.
3. Presione "Guardar Comprobante".

---

## 4. Funcionamiento Fuera de Linea (Modo Offline)

Physis Scanner esta disenada para operar plenamente en ubicaciones sin senal celular o sin conexion a Internet:

1. Puede continuar tomando fotografias y guardando comprobantes con normalidad.
2. Los comprobantes permaneceran almacenados de forma segura en la memoria de su dispositivo.
3. En la parte superior de la pantalla vera un indicador informando el estado "Sin conexion" y la cantidad de documentos pendientes.
4. Al recuperar senal de red, la aplicacion sincronizara automaticamente todos los comprobantes pendientes hacia el servidor central sin requerir intervencion manual.

---

## 5. Finalizacion y Envio de la Rendicion

1. Una vez cargados todos los comprobantes correspondientes a la rendicion, acceda a la vista de "Resumen de Rendicion".
2. Compruebe el importe total acumulado y la cantidad de documentos adjuntos.
3. Presione el boton "Enviar para Validacion".
4. El legajo completo cambiara a estado "Enviado" y quedara a disposicion del equipo contable en el portal de validacion (`portal.autoscaner.pro`).

---

## 6. Preguntas Frecuentes y Resolucion de Incidencias

### La camara no se activa o muestra pantalla negra
- Verifique que ha otorgado permisos de camara a la pagina `autoscaner.pro` en la configuracion de privacidad de su navegador.
- Cierre otras aplicaciones que puedan estar utilizando la camara en segundo plano y recargue la pagina.

### La sincronizacion indica comprobantes pendientes y no se despachan
- Asegurese de contar con senal de datos moviles o red Wi-Fi estable.
- Mantenga abierta la aplicacion unos momentos mientras el indicador de transmision procesa los envios pendientes con la politica de 3 reintentos.

### Que sucede si cierro la aplicacion antes de enviar la rendicion?
- Toda la informacion guardada en el dispositivo se conserva de manera permanente en el almacenamiento local seguro y estara disponible cuando vuelva a abrir la aplicacion.

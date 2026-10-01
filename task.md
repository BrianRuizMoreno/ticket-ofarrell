# Registro de Tareas

## Fase 1: Backend y Cloud AI [COMPLETADO]
- [x] Crear servidor Node.js (Express) para orquestacion.
- [x] Configurar endpoint `/api/ai/analizar-ticket` con Gemini 2.5 Flash y Gemini 2.5 Flash-Lite.
- [x] Crear endpoint `/api/rendiciones/recibir` para ingesta de datos.
- [x] Actualizar frontend Scanner para apuntar al backend de produccion.
- [x] Refactorizar Validator para visualizar campos fiscales (IVA, Nro Op, CUIT).

## Fase 2: Soporte Offline y Almacenamiento Local [COMPLETADO]
- [x] Crear SyncQueueService con IndexedDB para almacenamiento offline.
- [x] Garantizar persistencia volátil de sesión y ciclo de vida seguro.
- [x] Eliminar dependencias innecesarias de visión pesada cliente.

## Fase 3: Sincronizacion y Persistencia [COMPLETADO]
- [x] Endpoint en backend para recibir paquetes de sincronizacion.
- [x] Manejo de duplicados en la ingesta.
- [x] Notificaciones de sincronizacion exitosa mediante SnackBar.
- [x] Implementacion de base de datos PostgreSQL con transacciones y fallback a JSON.

## Fase 4: UX y PWA [COMPLETADO]
- [x] Mejorar el indicador de conexion (Badge de conectividad).
- [x] Optimizacion de bundle eliminando Zone.js en modo Zoneless.
- [x] Pruebas finales de sincronizacion y resolucion de bugs de enrutamiento.

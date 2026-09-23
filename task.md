# Lista de Tareas (TODO)

## Fase 1: Backend & Cloud AI ✅
- [x] Crear servidor Node.js (Express) para orquestación.
- [x] Configurar endpoint `/api/ai/analizar-ticket` con **Gemini 2.5 Flash**.
- [x] Crear endpoint `/api/rendiciones/recibir` para ingesta de datos.
- [x] Actualizar frontend Scanner para apuntar al nuevo backend.
- [x] Refactorizar Validator para mostrar nuevos campos (IVA, Nro Op, CUIT).

## Fase 2: Soporte Offline e IA Local (WebLLM) ✅
- [x] Instalar `@mlc-ai/web-llm` en el proyecto Scanner.
- [x] Implementar `LocalAI.service.ts` para carga y ejecución de modelo nativo de visión (LLaVA/Phi-3.5-vision).
- [x] Crear `SyncQueueService` (OfflineStorage) con IndexedDB para almacenamiento offline.
- [x] Implementar lógica de conmutación (Online -> Gemini | Offline -> Vision Model).
- [x] Añadir UI de "Download Manager" para modelos locales y remover dependencia de Tesseract.js.

## Fase 3: Sincronización ✅
- [x] Endpoint en backend para recibir paquetes de sincronización.
- [x] Manejo de duplicados en la ingesta.
- [x] Notificaciones Push/Toast de sincronización exitosa (SnackBar).

## Fase 4: UX & PWA ✅
- [x] Mejorar el indicador de conexión (Offline Badge / Banner).
- [x] Optimizar la comunicación con el usuario (Anonimización de IA).
- [x] Pruebas finales de sincronización automática.
- [x] Implementar polling en Validator para tiempo real.

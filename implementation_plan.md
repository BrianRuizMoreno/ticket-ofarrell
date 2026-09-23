# Plan de Implementación: Scanner & Validator Autónomo

## Objetivo
Transicionar de una arquitectura basada en dependencias (n8n) a una solución local-first, robusta y escalable, utilizando IA híbrida (Gemini 2.5 Flash + WebLLM/Gemma 2B).

## Estado Actual: Fase 1 Completada ✅
- Backend Operativo (localhost:3000)
- Integración Gemini 2.5 Flash Exitosa (Extracción avanzada)
- Scanner redirigido al servidor local
- Validator refactorizado con grilla técnica de alta densidad

## Fase 2: Soporte Offline e IA Local (WebLLM) 🟡
Integrar `@mlc-ai/web-llm` para permitir el procesamiento de tickets cuando no hay conexión a internet.
- Modelo: **Gemma 2B** (Ligero y optimizado para CPU/GPU integrada).
- Fallback: Si Gemini falla o no hay red, se usa Gemma. Si Gemma falla, carga manual.

## Fase 3: Sincronización y Resiliencia (IndexedDB) ⚪
Implementar una cola de sincronización para que los tickets procesados offline se envíen automáticamente al backend al recuperar la red.

## Fase 4: Pulido y PWA ⚪
- Optimización de Service Workers.
- UI de gestión de modelos (Download Manager).
- Auditoría final de seguridad y rendimiento.

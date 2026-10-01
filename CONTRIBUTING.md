# Guia de Contribucion y Gobernanza Tecnica - ScannerValidator

Agradecemos su colaboracion en el desarrollo y mantenimiento del portal de auditoria y servicio de validacion Physis ScannerValidator. El estandar aqui descrito es de cumplimiento obligatorio para garantizar la fiabilidad operativa y la seguridad en el tratamiento de comprobantes fiscales.

---

## 1. Principios Fundamentales

1. **Ausencia Total de Emojis:** Queda terminantemente prohibido el uso de emojis o caracteres informales en codigo fuente (Node.js y Angular), scripts de base de datos, comentarios, documentacion, nombres de ramas, mensajes de commit o descripciones de Pull Request.
2. **Tipado Estricto:** Prohibido el uso de `any` en Frontend TypeScript. Los contratos de datos deben formalizarse mediante interfaces con prefijo `I` (ejemplo: `IRendicionValidacion`) y objetos de transferencia DTO con sufijo `Dto` (ejemplo: `ValidacionComprobanteDto`).
3. **Persistencia y Sesiones Seguras:** Los datos de sesion de los auditores y tokens de autorizacion deben residir en memoria volatil (`sessionStorage`). No se autoriza el almacenamiento de credenciales en `localStorage`.
4. **Politica de Reintentos:** Toda interaccion critica con la base de datos PostgreSQL, APIs remotas o el orquestador n8n debe implementar una politica estricta de 3 reintentos antes de arrojar un fallo permanente.

---

## 2. Flujo de Trabajo con Git

Las contribuciones se coordinan a traves de ramas de funcionalidad orientadas a la rama principal (`main`):

1. **Nomenclatura de Ramas:**
   - `feat/nombre-funcionalidad`
   - `fix/descripcion-error`
   - `docs/nombre-documento`
   - `refactor/nombre-modulo`

2. **Estandar de Mensajes de Commit (Conventional Commits):**
   Los commits deben formularse con tono sobrio e imperativo:
   ```
   <tipo>(<alcance opcional>): <descripcion breve>
   ```
   Tipos autorizados:
   - `feat`: Nueva caracteristica funcional.
   - `fix`: Correccion de defecto.
   - `docs`: Documentacion tecnica u operativa.
   - `style`: Estilos y formato visual.
   - `refactor`: Mejora estructural de codigo sin cambio funcional.
   - `test`: Pruebas unitarias o de integracion.
   - `chore`: Tareas de compilacion, dependencias o infraestructura.
   - `security`: Medidas de hardening o correcciones de vulnerabilidad.

   Ejemplo:
   ```
   fix(api): aplicar limitacion de tasa en ruta de observaciones
   ```

---

## 3. Checklist Previo al Envio de Cambios

Antes de solicitar la revision de un Pull Request:

- [ ] Auditoria Guardian aprobada:
  ```bash
  npm run guardian
  ```
- [ ] Compilacion de produccion del Frontend exitosa:
  ```bash
  npm run build:prod
  ```
- [ ] Verificacion de compatibilidad del Backend:
  ```bash
  cd server && node -c index.js && node -c db.js && cd ..
  ```
- [ ] Verificacion de cero emojis y tipado estricto en todos los archivos modificados.

---

## 4. Revision y Aprobacion

1. Toda integracion debe pasar por un Pull Request formal utilizando la plantilla `.github/PULL_REQUEST_TEMPLATE.md`.
2. El pipeline automatizado de GitHub Actions debe finalizar exitosamente.
3. Se requiere aprobacion expresa de los revisores designados en `.github/CODEOWNERS`.

# Guia de Contribucion y Gobernanza Tecnica

Agradecemos su interes en colaborar con el desarrollo de Physis Scanner. Para asegurar la calidad tecnica, la estabilidad operativa y el cumplimiento de las normativas de la organizacion, todas las contribuciones deben alinearse rigurosamente con los estandares descritos a continuacion.

---

## 1. Principios Fundamentales

1. **Ausencia Total de Emojis:** Queda terminantemente prohibido el uso de emojis o caracteres informales en codigo fuente, comentarios, documentacion, nombres de ramas, mensajes de commit o descripciones de Pull Request.
2. **Tipado Estricto:** Se prohibe el uso del tipo `any` o conversiones no seguras. Toda entidad debe contar con su correspondiente interfaz con prefijo `I` (ejemplo: `IComprobante`) o DTO con sufijo `Dto` (ejemplo: `ComprobanteDto`).
3. **Persistencia Segura:** Los datos de sesion activa, tokens y credenciales deben mantenerse en almacenamiento volatil (`sessionStorage` o memoria de aplicacion). No se permite el uso de `localStorage` para informacion confidencial.
4. **Resiliencia de Red:** Toda peticion de red critica hacia servicios externos o flujos n8n debe implementar una politica de exactamente 3 reintentos antes de declarar un fallo.

---

## 2. Flujo de Trabajo con Git

El proyecto sigue una estrategia basada en ramas tematicas a partir de la rama principal (`main`):

1. **Creacion de Rama:**
   Cree una rama descriptiva utilizando prefijos estandarizados:
   - `feat/nombre-funcionalidad`
   - `fix/descripcion-error`
   - `docs/nombre-documento`
   - `refactor/nombre-modulo`

2. **Convencion de Mensajes de Commit (Conventional Commits):**
   Los mensajes deben redactarse en espanol o ingles, en tono sobrio y sin emojis, siguiendo la estructura:
   ```
   <tipo>(<alcance opcional>): <descripcion breve e imperativa>
   ```
   Tipos permitidos:
   - `feat`: Nueva funcionalidad o capacidad para el usuario.
   - `fix`: Correccion de un error o defecto detectado.
   - `docs`: Incorporacion o modificacion de documentacion.
   - `style`: Ajustes de formato o estilos visuales sin impacto logico.
   - `refactor`: Modificaciones internas que no alteran el comportamiento publico.
   - `test`: Adicion o correccion de pruebas automatizadas.
   - `chore`: Tareas de configuracion de empaquetado, dependencias o herramientas.
   - `security`: Parches o mejoras enfocadas en la seguridad de la aplicacion.

   Ejemplo:
   ```
   feat(sync): implementar cola de reintentos para comprobantes pendientes
   ```

---

## 3. Checklist Previo al Envio de Cambios

Antes de publicar su rama o solicitar la integracion de un Pull Request, ejecute y verifique:

- [ ] Auditoria Guardian exitosa:
  ```bash
  npm run guardian
  ```
- [ ] Compilacion de produccion sin advertencias ni errores:
  ```bash
  npm run build:prod
  ```
- [ ] Verificacion de que ningun archivo nuevo o modificado contenga emojis o el tipo `any`.
- [ ] Enlace al issue o requerimiento correspondiente en el Pull Request.

---

## 4. Proceso de Revision de Codigo

1. Complete todos los campos de la plantilla de Pull Request (`.github/PULL_REQUEST_TEMPLATE.md`).
2. La integracion continua de GitHub Actions debe finalizar con estado exitoso.
3. Se requiere la aprobacion de al menos un revisor designado en `.github/CODEOWNERS` para proceder a la fusion con `main`.

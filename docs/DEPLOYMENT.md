# Guia de Despliegue e Infraestructura - Physis Scanner PWA

Este documento describe el procedimiento tecnico para la construccion de imagenes contenerizadas, configuracion de variables de entorno y despliegue en produccion de Physis Scanner PWA en el dominio `autoscaner.pro` a traves de Dokploy.

---

## 1. Topologia de Infraestructura

Physis Scanner se distribuye como un artefacto estatico optimizado servido por un servidor web Nginx de alto rendimiento dentro de un contenedor Docker ligero:

- **Plataforma de Despliegue:** Dokploy (sobre servidor dedicado Debian/Ubuntu).
- **Servidor Web Interno:** Nginx Alpine.
- **Terminacion SSL/TLS:** Proxy inverso Traefik provisto por Dokploy con certificados Let's Encrypt automaticos.
- **Dominio Productivo:** `autoscaner.pro`.

---

## 2. Variables de Entorno y Configuracion

Las configuraciones para entornos productivos se gestionan a traves del archivo `src/environments/environment.prod.ts`.

### Archivo de Ejemplo (`src/environments/environment.prod.ts`)
```typescript
import { IEnvironment } from './environment.interface';

export const environment: IEnvironment = {
  production: true,
  apiUrl: 'https://api.autoscaner.pro/api',
  n8nWebhookUrl: 'https://n8n.tuempresa.com/webhook/tickets-upload',
  enableDebugLogging: false,
  offlineCacheVersion: 'v1.2.3'
};
```

---

## 3. Empaquetado Multi-Etapa con Docker

El proyecto utiliza un `Dockerfile` optimizado en dos fases para garantizar un peso minimo de imagen final y maxima seguridad:

```dockerfile
# Etapa 1: Compilacion de la aplicacion Angular
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:prod

# Etapa 2: Servidor estatico Nginx optimizado
FROM nginx:alpine
COPY --from=build /app/dist/tickets-physis/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 4. Configuracion de Nginx (`nginx.conf`)

El archivo de configuracion de Nginx implementa resolucion SPA, compresion y cabeceras de proteccion:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Compresion Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # Cabeceras de Seguridad Corporativa
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Enrutamiento SPA (Angular Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache inmutable para recursos estaticos versionados
    location ~* \.(?:ico|css|js|gif|jpe?g|png|svg|woff2?|eot|ttf|webmanifest)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Desactivacion de cache para el Service Worker y el index
    location = /ngsw-worker.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

---

## 5. Procedimiento de Despliegue en Dokploy

1. Acceda al panel de administracion de Dokploy.
2. Cree una nueva aplicacion de tipo "Docker Compose" o "Dockerfile".
3. Configure la fuente apuntando al repositorio de GitHub: `BrianRuizMoreno/ticket-ofarrell`.
4. Asigne la rama de despliegue: `main`.
5. En la configuracion de red de Dokploy:
   - Asigne el dominio publico: `autoscaner.pro`.
   - Habilite la generacion automatica de certificado SSL (Let's Encrypt).
   - Indique el puerto del contenedor: `80`.
6. Presione "Deploy".
7. Verifique la correcta publicacion accediendo via HTTPS a `https://autoscaner.pro`.

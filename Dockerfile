# Etapa 1: Compilación de la aplicación Angular Validator
FROM node:22-alpine AS build
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente y compilar para producción
COPY . .
RUN npm run build:prod

# Etapa 2: Servidor Web Nginx ligero para producción
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

# Limpiar directorio por defecto de Nginx
RUN rm -rf ./*

# Copiar artefactos compilados desde la etapa de build
COPY --from=build /app/dist/tickets-physis/browser/ ./
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

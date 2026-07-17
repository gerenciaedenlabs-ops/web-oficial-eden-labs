# Etapa 1: Construcción (Build)
FROM node:22-alpine AS build

WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos TODAS las dependencias (incluye devDeps para el build)
RUN npm ci

# Copiamos el resto del código
COPY . .

# Construimos la aplicación (SSR con el adaptador @astrojs/node)
RUN npm run build

# Etapa 2: Servidor de Producción (Node)
FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
# Escuchar en todas las interfaces dentro del contenedor
ENV HOST=0.0.0.0
ENV PORT=4321

# Solo dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev

# Copiamos el build (servidor + cliente) desde la etapa anterior
COPY --from=build /app/dist ./dist

EXPOSE 4321

# El adaptador Node en modo standalone genera este entrypoint
CMD ["node", "./dist/server/entry.mjs"]

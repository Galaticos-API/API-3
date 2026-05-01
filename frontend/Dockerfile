# Estágio 1: Build da aplicação React/Vite
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar os arquivos de lock e package
COPY package.json package-lock.json ./

# Instalar as dependências de forma reproduzível
RUN npm ci

# Copiar o restante da aplicação e realizar o build estático
COPY . .
RUN npm run build

# Estágio 2: Subir servidor Nginx estático para servir a aplicação "prod-ready"
FROM nginx:alpine

# Copiar os artefatos cacheados/compilados do estágio de build
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuração customizada do Nginx para suportar as rotas da SPA corretamente (React Router)
RUN echo 'server { \
    listen       80; \
    server_name  localhost; \
    location / { \
        root   /usr/share/nginx/html; \
        index  index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    error_page   500 502 503 504  /50x.html; \
    location = /50x.html { \
        root   /usr/share/nginx/html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expor porta original HTTP
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

FROM node:20-alpine as build

WORKDIR /app

# Copia arquivos de dependência
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o código e faz o build (Vite)
COPY . .
RUN npm run build

# Stage 2: Nginx para servir os arquivos estáticos
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Configuração simples do Nginx para suportar React Router (PWA)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

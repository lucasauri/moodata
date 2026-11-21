FROM node:20-alpine

WORKDIR /app

# Instala dependências do sistema necessárias para o Prisma e bcrypt
RUN apk add --no-cache openssl

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala todas as dependências
RUN npm ci

# Copia o schema do Prisma e gera o client
COPY prisma ./prisma/
RUN npx prisma generate

# Copia o resto do código
COPY . .

# Compila o projeto TypeScript
RUN npm run build

# O processo da aplicação não precisa de privilégios de root.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && chown -R appuser:appgroup /app
USER appuser

# Expõe a porta 3000
EXPOSE 3000

# Inicia o servidor sem executar migrações ou seed automáticos em produção
CMD ["npm", "run", "start:prod"]

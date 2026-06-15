FROM node:20-alpine

WORKDIR /app

# Instala dependências do sistema necessárias para o Prisma e bcrypt
RUN apk add --no-cache openssl

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala todas as dependências
RUN npm install

# Copia o schema do Prisma e gera o client
COPY prisma ./prisma/
RUN npx prisma generate

# Copia o resto do código
COPY . .

# Compila o projeto TypeScript
RUN npm run build

# Expõe a porta 3000
EXPOSE 3000

# Inicia o servidor com migração automática e seed
CMD ["sh", "-c", "npx prisma db push && npx prisma db seed && npm run start:prod"]

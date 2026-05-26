# MooData — Gestão Leiteira Inteligente 🐄🥛

**MooData** (originalmente **Agroleite**) é uma plataforma completa e moderna para a gestão inteligente de rebanhos leiteiros, controle de produção de leite, acompanhamento sanitário e monitoramento de movimentações animais (entradas e saídas). A solução é composta por uma API Backend robusta, uma interface Web responsiva e um aplicativo Mobile nativo para uso no campo.

---

## 🏗️ Arquitetura do Projeto

O ecossistema é dividido em três módulos principais localizados na pasta raiz do repositório:

1. **[`agroleite-backend`](./agroleite-backend/)**: API desenvolvida com **NestJS**, utilizando **Prisma ORM** e banco de dados **PostgreSQL**. Contém as regras de negócio, autenticação JWT, controle multi-inquilino (*multi-tenant*) e rotas de administração.
2. **[`agroleite-final`](./agroleite-final/)**: Frontend Web corporativo desenvolvido com **React** + **Vite**, estilizado com **Tailwind CSS**. Focado no painel administrativo, dashboards estatísticos detalhados de ordenha e análises zootécnicas.
3. **[`agroleite-mobile`](./agroleite-mobile/)**: Aplicativo móvel construído em **React Native** com **Expo** e **TypeScript**, focado na usabilidade offline/campo, facilitando o registro rápido de ordenha, eventos sanitários e consultas ao rebanho diretamente no curral.

---

## 🌟 Principais Funcionalidades

### 🐄 Gestão de Rebanho
- Cadastro completo de animais com brinco (tag), raça, peso, ECC (Escore de Condição Corporal) e categoria (Vaca Leiteira vs. Novilha).
- Cálculo automatizado de indicadores zootécnicos chave:
  - **DEL** (Dias em Lactação): Tempo decorrido desde o último parto.
  - **DEA** (Dias em Aberto): Período sem concepção ativa desde o parto.
  - **IEPA** (Intervalo Entre Partos Projetado): Estimativa baseada no ciclo atual.
- Filtros por status produtivo (Lactação, Secagem, Pré-Parto, Prenha, Doente).

### 🥛 Controle Leiteiro (Ordenha)
- Registro individual de litros produzidos por ordenha (manhã, tarde, noite ou diário).
- Definição do destino do leite (tanque comercial, consumo de bezerros, descarte por carência, etc.).
- Gráficos históricos de produtividade geral da fazenda e individual de cada animal.

### 🏥 Acompanhamento Sanitário e Eventos
- Registro de aplicação de **vacinas**, **medicamentos**, **inseminações**, **partos** e **checkups**.
- Controle automático de **Período de Carência** de leite/carne para animais medicados.
- Integração reativa: O registro de um parto altera automaticamente o status do animal para lactação e promove novilhas para vacas.

### 📊 Movimentação de Animais (Histórico)
- Registro de eventos de **Nascimento**, **Compra** e **Morte (Baixa)** na aba de Eventos.
- Atualização automática de status: Registrar a morte de um animal muda seu status imediatamente para `'dead'` (Baixado/Morto) e o remove do rebanho ativo.
- Tela exclusiva de consulta histórica de **Movimentações** com filtros rápidos por tipo de ocorrência.

### 🛡️ Administração e Segurança
- Autenticação de usuários via tokens JWT.
- Painel do Administrador (Admin Panel) para gestão de usuários, bloqueio/desbloqueio de contas e auditoria.

---

## 🛠️ Tecnologias Utilizadas

### Backend (API)
- **Node.js** com **NestJS** (Arquitetura Modular, Dependency Injection)
- **Prisma ORM** para modelagem e migrações
- **PostgreSQL** como banco de dados principal
- **Passport.js & JWT** para segurança e autenticação
- **Class-Validator** para validação estrita de dados

### Frontend Web
- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** para estilização responsiva e premium
- **Recharts** para renderização de gráficos
- **Lucide React** para o conjunto de ícones

### Aplicativo Mobile
- **React Native** + **Expo SDK 54**
- **React Navigation** (Drawer Navigator para menu lateral, Native Stack para telas internas)
- **Lucide React Native** para suporte a ícones nativos
- **AsyncStorage** para persistência local de tokens
- **Expo Build Properties** para permissões de rede e tráfego HTTP limpo

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- Banco de dados **PostgreSQL** ativo (ou acesso à rede/Tailscale configurada no arquivo `.env`)

---

### 1. Executando o Backend 💻
1. Acesse a pasta do backend:
   ```bash
   cd agroleite-backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie e configure o arquivo `.env` com a sua URL do banco:
   ```env
   DATABASE_URL="postgresql://usuario:senha@host:5432/agroleite_db?schema=public"
   PORT=3000
   JWT_SECRET="sua_chave_secreta"
   ```
4. Gere o client do Prisma e rode as migrações:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. Inicie o servidor em modo de desenvolvimento:
   ```bash
   npm run start:dev
   ```

---

### 2. Executando o Frontend Web 🌐
1. Acesse a pasta da aplicação web:
   ```bash
   cd agroleite-final
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o arquivo `.env` com a URL do backend:
   ```env
   VITE_API_URL=http://localhost:3000
   ```
4. Rode a aplicação em modo de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Acesse no navegador em `http://localhost:5173`.

---

### 3. Executando o Aplicativo Mobile 📱
1. Acesse a pasta do projeto mobile:
   ```bash
   cd agroleite-mobile
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. *(Opcional)* Crie um arquivo `.env` para especificar a URL da API se estiver rodando em dispositivo físico:
   ```env
   EXPO_PUBLIC_API_URL=http://<IP_DA_SUA_MAQUINA>:3000
   ```
   *Nota: No emulador Android, a aplicação se conectará automaticamente ao host usando `http://10.0.2.2:3000` caso a variável de ambiente não esteja configurada.*
4. Inicie o Expo CLI:
   ```bash
   npx expo start
   ```
5. Use o **Expo Go** no seu celular físico (lendo o QR Code) ou pressione **`a`** para abrir no emulador Android ou **`i`** para simulador iOS.

---

### 🐳 Alternativa com Docker Compose
Se preferir rodar toda a infraestrutura encapsulada em containers:
1. Na pasta raiz do projeto (`agroleite-com-auth`), execute:
   ```bash
   docker-compose up --build
   ```
2. O compose irá inicializar o banco de dados PostgreSQL, a API na porta `3000` e o painel web na porta `5173`.

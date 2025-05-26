# 🚀 Deploy Simples - Uma Plataforma para Tudo

## 🏆 **Opção 1: Railway (RECOMENDADO)**
*Melhor para aplicações full-stack - Frontend + Backend + Banco*

### ✅ **Vantagens:**
- Deploy de frontend, backend e banco na mesma plataforma
- Configuração automática de variáveis de ambiente
- Banco PostgreSQL incluído
- Plano gratuito generoso ($5/mês de crédito)
- Deploy automático via Git

### 📋 **Passo a Passo:**

#### 1. Preparar o Projeto
```bash
# Certifique-se que está na pasta do projeto
cd /Users/lucasreis/palpite-f1

# Adicione o arquivo de configuração
# (já criamos o railway-fullstack.toml)
```

#### 2. Deploy no Railway
1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique em **"New Project"**
4. Selecione **"Deploy from GitHub repo"**
5. Conecte seu repositório `palpite-f1`
6. Railway detectará automaticamente que é Next.js

#### 3. Adicionar Banco de Dados
1. No projeto, clique em **"+ New"**
2. Selecione **"Database"** → **"PostgreSQL"**
3. Railway criará automaticamente as variáveis:
   - `DATABASE_URL`
   - `POSTGRES_DB`
   - `POSTGRES_USER`
   - `POSTGRES_PASSWORD`

#### 4. Configurar Variáveis de Ambiente
No painel Railway, adicione:
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=${{RAILWAY_STATIC_URL}}/api
JWT_SECRET=sua-chave-secreta-super-forte-aqui
```

#### 5. Configurar o Banco
1. Clique no serviço PostgreSQL
2. Vá em **"Connect"** → **"Query"**
3. Cole o conteúdo do arquivo `supabase-setup.sql`
4. Execute o script

#### 6. Testar
- Railway fornecerá uma URL: `https://seu-app.railway.app`
- Teste todas as funcionalidades

---

## 🥈 **Opção 2: Render (GRATUITO)**
*Melhor opção gratuita completa*

### ✅ **Vantagens:**
- Completamente gratuito
- Frontend + Backend + Banco PostgreSQL
- SSL automático
- Deploy via Git

### 📋 **Passo a Passo:**

#### 1. Deploy no Render
1. Acesse [render.com](https://render.com)
2. Faça login com GitHub
3. Clique em **"New +"** → **"Web Service"**
4. Conecte seu repositório
5. Configure:
   - **Name**: `palpite-f1`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

#### 2. Criar Banco PostgreSQL
1. No dashboard, clique em **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `palpite-f1-db`
   - **Plan**: Free
3. Anote a **Internal Database URL**

#### 3. Configurar Variáveis
No Web Service, adicione em **Environment**:
```
NODE_ENV=production
DATABASE_URL=[URL do banco PostgreSQL]
JWT_SECRET=sua-chave-secreta
NEXT_PUBLIC_API_URL=https://seu-app.onrender.com/api
```

#### 4. Configurar Banco
1. Acesse o banco via **"Connect"**
2. Execute o script `supabase-setup.sql`

---

## 🥉 **Opção 3: Vercel + Supabase**
*Melhor para performance de frontend*

### ✅ **Vantagens:**
- Frontend super rápido (CDN global)
- Banco gerenciado profissional
- Fácil de configurar

### 📋 **Passo a Passo:**

#### 1. Deploy Frontend na Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Importe seu repositório
3. Deploy automático

#### 2. Configurar Banco no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie novo projeto
3. Execute script `supabase-setup.sql`
4. Obtenha credenciais de conexão

#### 3. Configurar Variáveis na Vercel
```
NEXT_PUBLIC_API_URL=https://seu-projeto.supabase.co/rest/v1
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima
```

---

## 🎯 **Qual Escolher?**

### Para Iniciantes: **Railway**
- Mais simples de configurar
- Tudo em uma plataforma
- Suporte a qualquer tecnologia

### Para Projetos Gratuitos: **Render**
- Completamente gratuito
- Boa performance
- Fácil de usar

### Para Performance Máxima: **Vercel + Supabase**
- Frontend ultra-rápido
- Banco profissional
- Escalabilidade automática

---

## 🚀 **Deploy Rápido com Railway (5 minutos)**

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Deploy
railway deploy

# 4. Adicionar banco
railway add postgresql

# 5. Configurar variáveis
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=sua-chave-secreta
```

---

## 🔧 **Configuração Mínima Necessária**

Independente da plataforma, você precisa:

1. **Variáveis de Ambiente:**
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://...
   JWT_SECRET=chave-secreta-forte
   NEXT_PUBLIC_API_URL=https://sua-api.com/api
   ```

2. **Banco de Dados:**
   - Execute o script `supabase-setup.sql`
   - Crie usuário admin inicial

3. **Domínio (Opcional):**
   - Configure DNS para seu domínio personalizado

---

🎉 **Pronto! Sua aplicação estará no ar em minutos!** 
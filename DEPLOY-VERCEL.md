# 🚀 Deploy na Vercel - Guia Rápido

## ⚡ **Deploy Automático (Recomendado)**

A Vercel detecta automaticamente projetos Next.js e faz o deploy sem necessidade de Dockerfile!

### 📋 **Passo a Passo:**

#### 1. Preparar o Projeto
```bash
# Certifique-se que está na pasta correta
cd /Users/lucasreis/palpite-f1

# Verificar se o build funciona localmente
npm run build
```

#### 2. Deploy na Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em **"New Project"**
4. Selecione seu repositório `palpite-f1`
5. Vercel detectará automaticamente que é Next.js
6. Clique em **"Deploy"**

#### 3. Configurar Variáveis de Ambiente
No painel da Vercel, vá em **Settings** > **Environment Variables** e adicione:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://sua-api.railway.app/api

# Database (se usar Supabase)
DATABASE_URL=postgresql://postgres:senha@host:5432/database
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima

# JWT Secret (se necessário)
JWT_SECRET=sua-chave-secreta-super-forte

# Environment
NODE_ENV=production
```

#### 4. Configurar Domínio (Opcional)
1. No painel Vercel, vá em **Settings** > **Domains**
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções

---

## 🐳 **Deploy com Docker (Alternativo)**

Se você quiser usar Docker em outras plataformas:

### Railway com Docker:
```bash
# 1. Fazer push do código com Dockerfile
git add .
git commit -m "Add Docker configuration"
git push

# 2. No Railway, selecionar "Deploy from GitHub"
# 3. Railway detectará o Dockerfile automaticamente
```

### Render com Docker:
```bash
# 1. No Render, criar "Web Service"
# 2. Conectar repositório
# 3. Selecionar "Docker" como environment
# 4. Render usará o Dockerfile automaticamente
```

---

## 🔧 **Configurações Importantes**

### 1. Atualizar next.config.ts
O arquivo já foi configurado com:
- `output: 'standalone'` para Docker
- Headers de segurança
- Otimizações de build

### 2. Variáveis de Ambiente
Certifique-se de configurar:
- `NEXT_PUBLIC_API_URL`: URL da sua API
- `NODE_ENV=production`
- Outras variáveis específicas do seu projeto

### 3. Build Commands
- **Vercel**: Detecta automaticamente (`npm run build`)
- **Railway**: `npm install && npm run build`
- **Render**: `npm install && npm run build`

---

## 🚀 **Deploy Rápido na Vercel (2 minutos)**

```bash
# Opção 1: Via CLI da Vercel
npm i -g vercel
vercel login
vercel --prod

# Opção 2: Via GitHub (Recomendado)
# 1. Push para GitHub
# 2. Conectar repositório na Vercel
# 3. Deploy automático!
```

---

## ✅ **Checklist Pré-Deploy**

- [ ] `npm run build` funciona localmente
- [ ] Todas as dependências estão no `package.json`
- [ ] Variáveis de ambiente configuradas
- [ ] Código commitado no GitHub
- [ ] API backend funcionando (se aplicável)

---

## 🔍 **Troubleshooting**

### Build Error
```
Error: Cannot find module 'xyz'
```
**Solução**: Adicionar dependência ao `package.json`

### Environment Variables
```
NEXT_PUBLIC_API_URL is undefined
```
**Solução**: Configurar variáveis no painel da Vercel

### 404 em rotas
```
Page not found
```
**Solução**: Verificar estrutura de pastas em `src/app/`

---

## 🎯 **Resultado Final**

Após o deploy, você terá:
- ✅ URL automática: `https://seu-projeto.vercel.app`
- ✅ SSL/HTTPS automático
- ✅ CDN global
- ✅ Deploy automático a cada push
- ✅ Preview deployments para PRs

🎉 **Sua aplicação estará no ar em minutos!** 
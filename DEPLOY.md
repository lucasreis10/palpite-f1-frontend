# 🚀 Guia de Deploy - Palpite F1

## 📋 Pré-requisitos

- Conta no GitHub
- Conta no Vercel (gratuita)
- Conta no Supabase (gratuita)
- Conta no Railway ou Render (gratuita)

## 🗄️ 1. Deploy do Banco de Dados (Supabase)

### Passo 1: Criar projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie uma nova organização ou use existente
4. Clique em "New Project"
5. Escolha um nome: `palpite-f1-db`
6. Defina uma senha forte para o banco
7. Escolha a região mais próxima (South America - São Paulo)
8. Clique em "Create new project"

### Passo 2: Configurar o banco
1. Aguarde a criação do projeto (2-3 minutos)
2. No painel, vá em "SQL Editor"
3. Copie e cole o conteúdo do arquivo `supabase-setup.sql`
4. Clique em "Run" para executar o script
5. Verifique se todas as tabelas foram criadas em "Table Editor"

### Passo 3: Obter credenciais
1. Vá em "Settings" > "Database"
2. Anote as seguintes informações:
   - **Host**: `db.xxx.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: (a senha que você definiu)
3. Vá em "Settings" > "API"
4. Anote:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🖥️ 2. Deploy do Backend (Railway)

### Passo 1: Preparar o código
1. Certifique-se que o backend está na pasta `palpite-f1-backend`
2. Verifique se existe o arquivo `Dockerfile` na raiz do backend
3. Crie o arquivo `application-prod.yml` em `src/main/resources/`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
    username: ${DB_USER}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
  
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true

server:
  port: ${PORT:8080}

cors:
  allowed-origins: ${CORS_ORIGINS:http://localhost:3000}

jwt:
  secret: ${JWT_SECRET:your-super-secret-jwt-key-change-this-in-production}
  expiration: 86400000
```

### Passo 2: Deploy no Railway
1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique em "New Project"
4. Selecione "Deploy from GitHub repo"
5. Conecte seu repositório
6. Selecione a pasta do backend se necessário
7. Configure as variáveis de ambiente:
   - `DB_HOST`: (host do Supabase)
   - `DB_PORT`: `5432`
   - `DB_NAME`: `postgres`
   - `DB_USER`: `postgres`
   - `DB_PASSWORD`: (senha do Supabase)
   - `CORS_ORIGINS`: `https://seu-frontend.vercel.app`
   - `JWT_SECRET`: (gere uma chave secreta forte)
   - `SPRING_PROFILES_ACTIVE`: `prod`

### Passo 3: Verificar deploy
1. Aguarde o build e deploy (5-10 minutos)
2. Acesse a URL fornecida pelo Railway
3. Teste: `https://sua-api.railway.app/actuator/health`
4. Deve retornar: `{"status":"UP"}`

## 🌐 3. Deploy do Frontend (Vercel)

### Passo 1: Preparar o código
1. Certifique-se que o frontend está na raiz do projeto
2. Verifique se existe o arquivo `vercel.json`
3. Atualize o arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://sua-api.railway.app/api
```

### Passo 2: Deploy na Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em "New Project"
4. Importe seu repositório
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (raiz do projeto)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. Adicione variável de ambiente:
   - `NEXT_PUBLIC_API_URL`: `https://sua-api.railway.app/api`
7. Clique em "Deploy"

### Passo 3: Configurar domínio (opcional)
1. No painel da Vercel, vá em "Settings" > "Domains"
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções

## 🔧 4. Configurações Finais

### Atualizar CORS no Backend
1. No Railway, atualize a variável `CORS_ORIGINS`:
   ```
   https://seu-app.vercel.app,https://seu-dominio.com
   ```

### Testar a aplicação
1. Acesse seu frontend na Vercel
2. Teste o registro de usuário
3. Teste o login
4. Verifique se as páginas admin funcionam
5. Teste a criação de palpites

## 🔄 5. Deploy Automático (CI/CD)

### GitHub Actions para Backend
Crie `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths: ['palpite-f1-backend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      - name: Build with Gradle
        run: |
          cd palpite-f1-backend
          ./gradlew build
      - name: Deploy to Railway
        run: |
          # Railway CLI deployment
          echo "Deploy automático configurado"
```

### Vercel Deploy Automático
- A Vercel já configura deploy automático por padrão
- Cada push na branch main fará deploy automático

## 🛠️ 6. Monitoramento e Logs

### Railway Logs
1. No painel Railway, vá em "Deployments"
2. Clique em um deployment para ver logs
3. Use "View Logs" para monitoramento em tempo real

### Vercel Analytics
1. No painel Vercel, vá em "Analytics"
2. Monitore performance e erros
3. Configure alertas se necessário

### Supabase Monitoring
1. No painel Supabase, vá em "Reports"
2. Monitore uso do banco
3. Configure backups automáticos

## 🔐 7. Segurança

### Variáveis de Ambiente Seguras
- Nunca commite senhas ou chaves no código
- Use variáveis de ambiente para todos os secrets
- Gere JWT secrets fortes (32+ caracteres)

### HTTPS
- Vercel e Railway fornecem HTTPS automaticamente
- Sempre use HTTPS em produção

### Backup do Banco
1. No Supabase, vá em "Settings" > "Database"
2. Configure backups automáticos
3. Teste restauração periodicamente

## 📊 8. Alternativas de Deploy

### Opção 2: AWS
- **Frontend**: AWS Amplify
- **Backend**: AWS Elastic Beanstalk
- **Banco**: AWS RDS PostgreSQL

### Opção 3: Google Cloud
- **Frontend**: Firebase Hosting
- **Backend**: Google Cloud Run
- **Banco**: Google Cloud SQL

### Opção 4: Azure
- **Frontend**: Azure Static Web Apps
- **Backend**: Azure Container Instances
- **Banco**: Azure Database for PostgreSQL

## 🚨 Troubleshooting

### Erro de CORS
```
Access to fetch at 'api-url' from origin 'frontend-url' has been blocked by CORS policy
```
**Solução**: Adicione a URL do frontend na variável `CORS_ORIGINS` do backend

### Erro de Conexão com Banco
```
Connection refused
```
**Solução**: Verifique as credenciais do banco nas variáveis de ambiente

### Build Error no Frontend
```
Module not found
```
**Solução**: Execute `npm install` e verifique dependências

### 500 Error no Backend
**Solução**: Verifique logs no Railway e configurações do banco

## 📞 Suporte

- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)

---

🎉 **Parabéns! Sua aplicação está no ar!** 
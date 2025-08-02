# Sistema de Notificações - Palpite F1

Este documento explica como configurar e usar o sistema de notificações por email e SMS do Palpite F1.

## 📧 Configuração de Email

### Opção 1: Resend (Recomendado)

**Gratuito**: 3.000 emails/mês  
**Vantagens**: Fácil configuração, boa entregabilidade

1. Acesse [resend.com](https://resend.com)
2. Crie uma conta gratuita
3. Gere uma API key
4. Adicione no `.env`:
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Opção 2: Gmail SMTP

**Gratuito**: Usando sua conta Gmail  
**Limitações**: 500 emails/dia

1. Ative a verificação em 2 etapas na sua conta Google
2. Gere uma "Senha de app" (não use sua senha normal)
3. Adicione no `.env`:
```bash
GMAIL_USER=seuemail@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

### Opção 3: SendGrid

**Gratuito**: 100 emails/dia  
**Vantagens**: Muito confiável

1. Acesse [sendgrid.com](https://sendgrid.com)
2. Crie uma conta gratuita
3. Gere uma API key
4. Configure no código (implementação necessária)

## 📱 Configuração de SMS

### Opção 1: Twilio (Recomendado)

**Gratuito**: $15 em créditos iniciais  
**Custo**: ~$0.0075 por SMS no Brasil

1. Acesse [twilio.com](https://twilio.com)
2. Crie uma conta gratuita
3. Obtenha Account SID, Auth Token e um número de telefone
4. Adicione no `.env`:
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+15551234567
```

### Opção 2: AWS SNS

**Gratuito**: 100 SMS/mês no free tier  
**Custo**: $0.00645 por SMS no Brasil

1. Acesse [AWS Console](https://aws.amazon.com)
2. Configure SNS
3. Obtenha credenciais de acesso
4. Adicione no `.env`:
```bash
AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=us-east-1
```

## 🔔 Configuração de Push Notifications

### Firebase Cloud Messaging

**Gratuito**: Notificações push ilimitadas

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Crie um projeto
3. Ative Cloud Messaging
4. Obtenha a Server Key
5. Adicione no `.env`:
```bash
FCM_SERVER_KEY=AAAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FCM_PROJECT_ID=palpite-f1-xxxxx
```

## 🚀 Instalação das Dependências

Para ativar todas as funcionalidades, instale as dependências:

```bash
# Email
npm install resend nodemailer

# SMS
npm install twilio aws-sdk

# Push Notifications
npm install firebase-admin

# Agendamento
npm install node-cron
```

## ⚙️ Configuração Básica

Adicione no seu `.env.local`:

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email básico
FROM_EMAIL=noreply@palpitef1.com
FROM_NAME=Palpite F1

# Escolha UMA opção de email
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
# OU
GMAIL_USER=seuemail@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Escolha UMA opção de SMS (opcional)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+15551234567
```

## 📋 Como Usar

### 1. Teste Manual

```bash
# Testar email
curl -X POST "http://localhost:3000/api/reminders/test" \
  -H "Content-Type: application/json" \
  -d '{"email": "seu@email.com"}'

# Testar SMS + Email
curl -X POST "http://localhost:3000/api/reminders/test" \
  -H "Content-Type: application/json" \
  -d '{"email": "seu@email.com", "phone": "+5511999999999"}'
```

### 2. Rotina Automática

```bash
# Executar rotina de lembretes
curl -X GET "http://localhost:3000/api/reminders/test"
```

### 3. Integração com Cron

Para lembretes automáticos, configure um cron job:

```bash
# Executar diariamente às 9h
0 9 * * * curl -X GET "http://localhost:3000/api/reminders/test"
```

## 📊 Monitoramento

O sistema registra logs detalhados:

```
📧 Enviando email via Resend para user@email.com: 🏎️ Lembrete: Palpites GP Brasil
✅ Email enviado via Resend
📱 SMS simulado para User: Lembrete GP Brasil
🔔 Push simulado para User: Lembrete GP Brasil
📢 Enviando lembretes do GP Brasil para 3 usuários...
✅ Lembretes enviados: 3 sucessos, 0 falhas
📊 Estatísticas por método: {"email": 3, "sms (simulado)": 2, "push (simulado)": 3}
```

## 🔧 Personalização

### Templates de Email

Edite `src/services/emailService.ts` para personalizar:
- HTML do email
- Assunto
- Texto alternativo
- Estilos CSS

### Lógica de Lembretes

Edite `src/services/reminderService.ts` para:
- Alterar timing dos lembretes
- Modificar critérios de envio
- Adicionar novos tipos de notificação

### Preferências do Usuário

Implemente no backend Java:
- Tabela de preferências de notificação
- Endpoints para gerenciar preferências
- Integração com o frontend

## 💰 Custos Estimados

Para 1000 usuários ativos:

| Método | Custo/Mês | Observações |
|--------|-----------|-------------|
| **Email (Resend)** | Gratuito | Até 3.000 emails |
| **Email (Gmail)** | Gratuito | Até 15.000 emails |
| **SMS (Twilio)** | $7.50 | ~1000 SMS |
| **SMS (AWS SNS)** | $6.45 | ~1000 SMS |
| **Push (Firebase)** | Gratuito | Ilimitado |

## 🛠️ Próximos Passos

1. **Implementar providers reais** (remover simulações)
2. **Adicionar preferências de usuário** no backend
3. **Configurar cron jobs** para automação
4. **Adicionar templates personalizados**
5. **Implementar analytics** de abertura/clique
6. **Adicionar rate limiting** para evitar spam

## 🔍 Troubleshooting

### Email não está sendo enviado
- Verifique se as credenciais estão corretas no `.env`
- Teste com `curl` na API de teste
- Verifique os logs do servidor

### SMS não funciona
- Confirme se o número está no formato internacional (+55...)
- Verifique se o Twilio está configurado corretamente
- Teste primeiro com números verificados

### Push notifications não aparecem
- Verifique se o Firebase está configurado
- Confirme se o usuário deu permissão para notificações
- Teste em diferentes navegadores

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do servidor
2. Teste os endpoints manualmente
3. Consulte a documentação dos provedores
4. Abra uma issue no repositório 
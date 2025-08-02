# Email de Confirmação de Palpite

Este documento explica como integrar o sistema de email de confirmação de palpite no fluxo de envio de palpites.

## 📧 Funcionalidades

O email de confirmação inclui:
- ✅ **Confirmação visual** de que o palpite foi recebido
- 🏎️ **Top 10 da Classificação** com posição, piloto, código e equipe
- 🏁 **Top 10 da Corrida** com posição, piloto, código e equipe
- 📅 **Data/hora de envio** do palpite
- 🎯 **Nome do Grand Prix**
- 📋 **Comprovante** que o usuário pode guardar
- 🔗 **Link para o ranking** atual

## 🚀 Como Usar

### 1. Endpoint da API

```bash
POST /api/betting/confirmation
```

**Payload:**
```json
{
  "email": "user@example.com",
  "userName": "João Silva",
  "grandPrixName": "Grande Prêmio do Brasil",
  "qualifyingGuesses": [
    {
      "position": 1,
      "pilotName": "Max Verstappen",
      "pilotCode": "VER",
      "teamName": "Red Bull Racing"
    },
    // ... mais 9 palpites
  ],
  "raceGuesses": [
    {
      "position": 1,
      "pilotName": "Max Verstappen", 
      "pilotCode": "VER",
      "teamName": "Red Bull Racing"
    },
    // ... mais 9 palpites
  ]
}
```

### 2. Integração com Backend Java

Adicione no seu controller de palpites (GuessController.java):

```java
@PostMapping("/submit")
public ResponseEntity<String> submitGuess(@RequestBody GuessRequest request) {
    try {
        // 1. Salvar palpite no banco de dados
        Guess savedGuess = guessService.saveGuess(request);
        
        // 2. Buscar dados do usuário e GP
        User user = userService.findById(request.getUserId());
        GrandPrix grandPrix = grandPrixService.findById(request.getGrandPrixId());
        
        // 3. Preparar dados para o email
        BettingConfirmationRequest emailRequest = BettingConfirmationRequest.builder()
            .email(user.getEmail())
            .userName(user.getName())
            .grandPrixName(grandPrix.getName())
            .qualifyingGuesses(convertToEmailFormat(savedGuess.getQualifyingGuesses()))
            .raceGuesses(convertToEmailFormat(savedGuess.getRaceGuesses()))
            .build();
        
        // 4. Enviar email de confirmação (async)
        CompletableFuture.runAsync(() -> {
            try {
                sendConfirmationEmail(emailRequest);
            } catch (Exception e) {
                log.error("Erro ao enviar email de confirmação para {}: {}", 
                    user.getEmail(), e.getMessage());
            }
        });
        
        return ResponseEntity.ok("Palpite enviado com sucesso!");
        
    } catch (Exception e) {
        log.error("Erro ao processar palpite: {}", e.getMessage());
        return ResponseEntity.status(500).body("Erro interno do servidor");
    }
}

private void sendConfirmationEmail(BettingConfirmationRequest request) {
    try {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<BettingConfirmationRequest> entity = new HttpEntity<>(request, headers);
        
        ResponseEntity<String> response = restTemplate.postForEntity(
            "http://localhost:3000/api/betting/confirmation", 
            entity, 
            String.class
        );
        
        if (response.getStatusCode().is2xxSuccessful()) {
            log.info("Email de confirmação enviado com sucesso para {}", request.getEmail());
        } else {
            log.warn("Falha ao enviar email de confirmação: {}", response.getBody());
        }
        
    } catch (Exception e) {
        log.error("Erro ao chamar API de email: {}", e.getMessage());
    }
}
```

### 3. Classe de Request (Java)

```java
@Data
@Builder
public class BettingConfirmationRequest {
    private String email;
    private String userName;
    private String grandPrixName;
    private List<BettingGuessDto> qualifyingGuesses;
    private List<BettingGuessDto> raceGuesses;
}

@Data
@Builder
public class BettingGuessDto {
    private Integer position;
    private String pilotName;
    private String pilotCode;
    private String teamName;
}
```

### 4. Método de Conversão (Java)

```java
private List<BettingGuessDto> convertToEmailFormat(List<Guess> guesses) {
    return guesses.stream()
        .sorted(Comparator.comparing(Guess::getPosition))
        .limit(10) // Top 10 apenas
        .map(guess -> BettingGuessDto.builder()
            .position(guess.getPosition())
            .pilotName(guess.getPilot().getFullName())
            .pilotCode(guess.getPilot().getCode())
            .teamName(guess.getPilot().getTeam().getName())
            .build())
        .collect(Collectors.toList());
}
```

## 🧪 Teste Manual

### Teste com dados mock:
```bash
curl -X GET "http://localhost:3000/api/betting/confirmation"
```

### Teste com dados customizados:
```bash
curl -X POST "http://localhost:3000/api/betting/confirmation" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "userName": "Teste User",
    "grandPrixName": "GP do Brasil",
    "qualifyingGuesses": [
      {"position": 1, "pilotName": "Max Verstappen", "pilotCode": "VER", "teamName": "Red Bull"},
      {"position": 2, "pilotName": "Lando Norris", "pilotCode": "NOR", "teamName": "McLaren"}
    ],
    "raceGuesses": [
      {"position": 1, "pilotName": "Max Verstappen", "pilotCode": "VER", "teamName": "Red Bull"},
      {"position": 2, "pilotName": "Oscar Piastri", "pilotCode": "PIA", "teamName": "McLaren"}
    ]
  }'
```

## 📱 Template do Email

O email inclui:

### Header
- Logo do Palpite F1
- Título "Confirmação de Palpites"
- Cor vermelha do tema

### Conteúdo Principal
- Caixa verde de confirmação
- Nome do usuário personalizado
- Nome do Grand Prix
- Data/hora de envio

### Tabelas de Palpites
- **Classificação**: Tabela com Top 10
- **Corrida**: Tabela com Top 10
- Colunas: Posição, Piloto, Código, Equipe

### Informações Importantes
- Aviso sobre não poder alterar palpites
- Instruções sobre acompanhar pontuação
- Link para o ranking

### Footer
- Informações de contato
- Nota sobre email automático

## ⚙️ Configuração

### Variáveis de Ambiente
```bash
# Para emails funcionarem
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
# OU
GMAIL_USER=seuemail@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# URL do app
NEXT_PUBLIC_APP_URL=https://palpite-f1.com
```

### Dependências
```bash
npm install resend nodemailer
```

## 🔧 Personalização

### Alterar Template
Edite `src/services/emailService.ts`:
- Método `createBettingConfirmationHTML()` para HTML
- Método `createBettingConfirmationText()` para texto

### Alterar Assunto
```typescript
const subject = `✅ Confirmação: Palpites ${grandPrixName}`;
```

### Adicionar Campos
Modifique a interface `BettingGuess`:
```typescript
interface BettingGuess {
  position: number;
  pilotName: string;
  pilotCode: string;
  teamName?: string;
  // Adicione novos campos aqui
}
```

## 📊 Monitoramento

O sistema registra logs detalhados:
```
📧 Enviando confirmação de palpite para Lucas Reis (lucas@email.com)
🏎️ GP: Grande Prêmio do Brasil
📊 Palpites: 10 qualifying + 10 race
✅ Email de confirmação enviado com sucesso via resend
```

## 🚨 Tratamento de Erros

### Falha no Envio
- Sistema continua funcionando mesmo se email falhar
- Logs detalhados para debug
- Não bloqueia o salvamento do palpite

### Validações
- Email obrigatório
- Nome do usuário obrigatório
- Nome do GP obrigatório
- Exatamente 10 palpites para cada modalidade

## 📋 Próximos Passos

1. **Configurar provedor de email** (Resend recomendado)
2. **Integrar com backend Java** usando o código acima
3. **Testar em produção** com usuários reais
4. **Adicionar analytics** de abertura de email
5. **Implementar templates personalizados** por GP
6. **Adicionar attachments** (PDF do palpite)

## 💡 Dicas

- **Envie o email de forma assíncrona** para não atrasar a resposta
- **Guarde logs** de todos os emails enviados
- **Teste com diferentes provedores** de email
- **Monitore taxa de entrega** dos emails
- **Implemente retry** em caso de falha temporária 
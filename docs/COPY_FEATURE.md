# 📋 Funcionalidade: Copiar Palpites

## Descrição
Permite aos usuários copiar seus palpites em formato de texto para compartilhar em mensagens, redes sociais ou outros aplicativos.

## Como Usar

### 1. Faça seus Palpites
- Selecione os pilotos para Qualifying e Race
- Preencha pelo menos algumas posições

### 2. Visualizar Preview (Opcional)
- Clique no botão **"👁️ Preview"** para ver como ficará o texto
- O modal mostrará exatamente o que será copiado

### 3. Copiar para Clipboard
- Clique no botão **"📋 Copiar Palpites"**
- O texto será copiado automaticamente
- Você receberá uma confirmação via toast

## Exemplo de Texto Gerado

```
🏁 Grande Prêmio de São Paulo - 2025
🏎️ Autódromo José Carlos Pace, São Paulo

🏎️ QUALIFYING:
🥇 1º - Max Verstappen
🥈 2º - Lando Norris
🥉 3º - Charles Leclerc
   4º - Oscar Piastri
   5º - Carlos Sainz Jr.
   6º - George Russell
   7º - Lewis Hamilton
   8º - Sergio Pérez
   9º - Fernando Alonso
   10º - Lance Stroll

🏁 RACE:
🥇 1º - Oscar Piastri
🥈 2º - Lando Norris
🥉 3º - Charles Leclerc
   4º - Max Verstappen
   5º - Carlos Sainz Jr.
   6º - George Russell
   7º - Lewis Hamilton
   8º - Sergio Pérez
   9º - Fernando Alonso
   10º - Lance Stroll

🎮 Feito com Palpite F1
```

## Funcionalidades

### ✅ Características
- **Preview em tempo real**: Veja o texto antes de copiar
- **Compatibilidade**: Funciona em todos os navegadores modernos
- **Fallback**: Suporte para browsers antigos
- **Feedback visual**: Confirmação de cópia bem-sucedida
- **Responsivo**: Funciona em mobile e desktop
- **Emojis**: Medalhas para os primeiros 3 lugares

### 🎯 Estados dos Botões
- **Preview**: Habilitado quando há pelo menos um piloto selecionado
- **Copiar**: Habilitado quando há pelo menos um piloto selecionado
- **Loading**: Mostra spinner durante a cópia
- **Sucesso**: Mostra ícone de check quando copiado
- **Desabilitado**: Quando não há palpites para copiar

### 📱 Mobile-Friendly
- Botões adaptativos para mobile
- Texto abreviado em telas pequenas
- Modal responsivo
- Touch-friendly

## Casos de Uso

### 1. WhatsApp/Telegram
```
Meus palpites para o GP de São Paulo! 🏎️

🏎️ QUALIFYING:
🥇 1º - Max Verstappen
🥈 2º - Lando Norris
...
```

### 2. Discord/Slack
```
Galera, segue meu palpite:

🏁 Grande Prêmio de São Paulo - 2025
🏎️ QUALIFYING:
1º - Max Verstappen
2º - Lando Norris
...
```

### 3. Twitter/X
```
Meu palpite pro GP! 🏁
🥇 Verstappen
🥈 Norris  
🥉 Leclerc
#F1 #PalpiteF1
```

## Implementação Técnica

### Hook: useCopyToClipboard
- Gerencia estado da cópia
- Formata texto com emojis
- Suporte a Clipboard API
- Fallback para execCommand

### Componente: BetForm
- Integração com hook
- Botões de ação
- Modal de preview
- Feedback para usuário

### Compatibilidade
- ✅ Chrome/Edge (Clipboard API)
- ✅ Firefox (Clipboard API)
- ✅ Safari (Clipboard API)
- ✅ Mobile browsers
- ✅ Browsers antigos (fallback)

## Melhorias Futuras

### 🚀 Roadmap
- [ ] Templates personalizáveis
- [ ] Copiar apenas Qualifying ou Race
- [ ] Compartilhamento direto para redes sociais
- [ ] Histórico de palpites copiados
- [ ] QR Code para compartilhamento
- [ ] Integração com API do WhatsApp 
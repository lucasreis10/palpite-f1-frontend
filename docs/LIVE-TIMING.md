# Live Timing F1 - Documentação

## Visão Geral

A funcionalidade de Live Timing permite acompanhar os resultados do bolão em tempo real durante as corridas e sessões de treino da Fórmula 1. Esta é uma funcionalidade **experimental** que utiliza a API OpenF1 para buscar dados em tempo real.

## Características

### Dados Disponíveis
- **Classificação ao vivo**: Posições atuais de todos os pilotos
- **Gaps e Intervalos**: Diferença de tempo para o líder e para o piloto à frente
- **Controle de Corrida**: Mensagens oficiais, penalidades, bandeiras
- **Informações da Sessão**: Detalhes sobre a sessão atual (tipo, circuito, horário)

### Recursos da Interface
- **Atualização Automática**: Dados atualizados automaticamente a cada 3-30 segundos
- **Controle Manual**: Botão para atualizar manualmente os dados
- **Interface Responsiva**: Funciona em desktop e dispositivos móveis
- **Indicadores Visuais**: Cores das equipes e status das mensagens

## Como Usar

1. **Acessar a Funcionalidade**
   - Na página inicial, procure a seção "Live Timing F1"
   - Clique no botão "Acessar Live Timing"

2. **Durante uma Sessão**
   - Os dados serão carregados automaticamente
   - Use o checkbox "Atualização automática" para ativar/desativar
   - Selecione o intervalo de atualização desejado
   - Clique em "Atualizar" para buscar dados manualmente

3. **Interpretando os Dados**
   - **Pos**: Posição atual do piloto
   - **Gap**: Tempo de diferença para o líder
   - **Int**: Intervalo para o piloto à frente
   - **LEADER**: Indica o piloto na liderança

## Limitações

### Disponibilidade de Dados
- Dados só estão disponíveis durante sessões oficiais da F1
- Delay de aproximadamente 3 segundos em relação ao tempo real
- Pode haver indisponibilidade temporária do serviço

### Funcionalidade Experimental
- Interface e recursos podem mudar
- Possíveis bugs ou inconsistências
- Feedback dos usuários é bem-vindo

## Tecnologia

### API OpenF1
- API gratuita e open-source
- Não requer autenticação
- Documentação: https://openf1.org/

### Implementação
- **Frontend**: React com Next.js
- **Backend**: API Routes do Next.js
- **Atualização**: Polling com intervalo configurável

## Próximas Melhorias

### Planejadas
- [ ] Gráficos de evolução de posições
- [ ] Histórico de voltas
- [ ] Notificações de eventos importantes
- [ ] Integração com dados do bolão
- [ ] Cache de dados para melhor performance

### Em Consideração
- WebSocket para atualizações em tempo real
- Modo offline com dados salvos
- Comparação com palpites dos usuários
- Estatísticas avançadas

## FAQ

**P: Os dados estão sempre disponíveis?**
R: Não, apenas durante sessões oficiais da F1 (treinos, classificação e corridas).

**P: Qual o delay dos dados?**
R: Aproximadamente 3 segundos em relação ao tempo real.

**P: Posso usar em dispositivos móveis?**
R: Sim, a interface é totalmente responsiva.

**P: O que significa "EXPERIMENTAL"?**
R: A funcionalidade está em desenvolvimento e pode ter mudanças ou instabilidades.

## Suporte

Para reportar problemas ou sugerir melhorias:
- Abra uma issue no GitHub do projeto
- Entre em contato com a equipe de desenvolvimento
- Use o formulário de feedback na aplicação

## Créditos

Esta funcionalidade utiliza a [OpenF1 API](https://openf1.org/), um projeto open-source que democratiza o acesso a dados de F1. 
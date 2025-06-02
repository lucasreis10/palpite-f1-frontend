# Live Timing F1 - Ranking do Bolão em Tempo Real

## Visão Geral

A funcionalidade de **Live Timing** permite acompanhar o **ranking dos palpiteiros em tempo real** durante as corridas da Fórmula 1. Esta é uma funcionalidade **experimental** que calcula a pontuação dos palpites reais dos usuários conforme a corrida evolui, mostrando quem está ganhando o bolão em tempo real!

## O Que É

Imagine poder ver, durante a corrida, como seus palpites estão se saindo comparado aos outros participantes do bolão. A cada mudança de posição na pista, o ranking dos palpiteiros é recalculado automaticamente com base nos **palpites reais** registrados no sistema, mostrando:

- **Quem está ganhando** o bolão no momento
- **Quantos pontos** cada palpiteiro tem baseado nas posições atuais
- **Quantos palpites corretos** cada um acertou até agora
- **Precisão percentual** de cada participante

## Características

### Dados do Ranking ao Vivo
- **Palpites Reais**: Usa os palpites de corrida realmente feitos pelos usuários
- **Ranking dinâmico**: Ordem dos palpiteiros baseada na pontuação atual
- **Pontuação em tempo real**: Calculada conforme as posições mudam na corrida
- **Acertos instantâneos**: Quantos palpites cada pessoa acertou exatamente
- **Precisão percentual**: Eficiência dos palpites de cada participante
- **Sistema visual**: Cores ouro, prata e bronze para os primeiros colocados

### Dados da Corrida (aba secundária)
- **Posições atuais**: Classificação em tempo real dos pilotos (quando disponível)
- **Gaps e Intervalos**: Diferença de tempo para o líder e para o piloto à frente
- **Controle de Corrida**: Mensagens oficiais, penalidades, bandeiras
- **Informações da Sessão**: Detalhes sobre a sessão atual

### Recursos da Interface
- **Duas abas**: Ranking dos Palpiteiros (foco) e Posições da Corrida
- **Atualização Automática**: Dados atualizados automaticamente a cada 3-30 segundos
- **Controle Manual**: Botão para atualizar manualmente os dados
- **Interface Responsiva**: Funciona em desktop e dispositivos móveis
- **Indicadores Visuais**: Medalhas, cores e percentuais para facilitar visualização

## Como Usar

1. **Acessar a Funcionalidade**
   - Na página inicial, procure a seção "Live Timing F1"
   - Clique no botão "Ver Ranking ao Vivo"
   - Ou use o menu: "Live Timing BETA"

2. **Pré-requisitos**
   - **Palpites registrados**: Os usuários devem ter feito palpites de corrida para o próximo Grand Prix
   - **Sessão ativa (opcional)**: Dados da F1 em tempo real funcionam melhor durante sessões oficiais

3. **Durante uma Corrida**
   - A aba "Ranking dos Palpiteiros" já vem selecionada
   - Veja sua posição no ranking em tempo real
   - Compare sua pontuação com outros participantes
   - Observe como as mudanças na corrida afetam o ranking

4. **Interpretando o Ranking**
   - **Posição**: 🥇 Ouro (1º), 🥈 Prata (2º), 🥉 Bronze (3º)
   - **Pontuação**: Pontos atuais / Total possível
   - **Acertos**: Quantos palpites exatamente corretos
   - **Precisão**: Porcentagem de eficiência dos palpites

5. **Sistema de Pontuação**
   - **10 pontos**: Acerto exato da posição
   - **8 pontos**: 1 posição de diferença
   - **6 pontos**: 2 posições de diferença
   - **4 pontos**: 3 posições de diferença
   - **2 pontos**: 4 posições de diferença
   - **1 ponto**: 5 posições de diferença
   - **0 pontos**: Mais de 5 posições de diferença

## Fontes de Dados

### Palpites dos Usuários
- **API do Bolão**: Busca os palpites reais de corrida registrados pelos usuários
- **Grand Prix Atual**: Identifica automaticamente o próximo evento
- **Filtragem**: Apenas palpites de corrida são considerados (não qualifying)

### Dados da F1
- **OpenF1 API**: Dados da corrida em tempo real (quando disponível)
- **Fallback**: Posições simuladas quando não há sessão ativa
- **Delay**: Aproximadamente 3 segundos em relação ao tempo real

## Limitações

### Disponibilidade de Dados
- **Palpites necessários**: Só funciona se houver palpites registrados para o GP atual
- **Dados F1**: Posições reais só estão disponíveis durante sessões oficiais da F1
- **Delay**: Aproximadamente 3 segundos de atraso em relação ao tempo real
- **Cache**: Sistema de cache para otimizar performance

### Funcionalidade Experimental
- Interface e recursos podem mudar
- Possíveis bugs ou inconsistências
- Feedback dos usuários é bem-vindo

## Tecnologia

### APIs Utilizadas
- **OpenF1 API**: Dados da corrida em tempo real (gratuita e open-source)
- **API do Bolão**: Palpites reais dos usuários via endpoint `/guesses/grand-prix/{id}?guessType=RACE`
- **Cálculo Dinâmico**: Pontuação calculada em tempo real

### Implementação
- **Frontend**: React com Next.js
- **Backend**: Spring Boot com PostgreSQL
- **Atualização**: Polling com intervalo configurável
- **Cache**: 3 segundos para otimizar performance
- **Autenticação**: Apenas requisições autenticadas podem acessar palpites

## Próximas Melhorias

### Funcionalidades Planejadas
- [ ] **Histórico de evolução** do ranking durante a corrida
- [ ] **Notificações** quando você subir/descer no ranking
- [ ] **Comparação detalhada** palpite vs realidade
- [ ] **Gráficos de evolução** da pontuação ao longo da corrida
- [ ] **Estatísticas avançadas** por tipo de palpite
- [ ] **Integração com qualifying** para ranking combinado

### Melhorias Técnicas
- [ ] WebSocket para atualizações em tempo real
- [ ] Cache inteligente de palpites
- [ ] Modo offline com dados salvos
- [ ] Performance otimizada para muitos usuários

## FAQ

**P: Preciso ter feito palpites para aparecer no ranking?**
R: Sim, apenas usuários com palpites de corrida registrados para o Grand Prix atual aparecerão no ranking.

**P: A pontuação mostrada é a final?**
R: Não, é a pontuação baseada nas posições atuais da corrida. Pode mudar até o final.

**P: Por que não vejo nenhum palpiteiro?**
R: Pode ser que ninguém tenha feito palpites para o próximo Grand Prix, ou que o sistema não conseguiu identificar o GP atual.

**P: Posso ver o ranking de corridas passadas?**
R: Por enquanto, apenas da corrida atual. Histórico será adicionado em versões futuras.

**P: Como é calculada a pontuação?**
R: Sistema de pontos decrescente: 10 pontos para acerto exato, diminuindo conforme a diferença de posições.

**P: Por que as posições da F1 não estão atualizando?**
R: Dados da F1 só estão disponíveis durante sessões oficiais. Fora dessas sessões, o ranking funciona com posições simuladas.

## Suporte

Para reportar problemas ou sugerir melhorias:
- Abra uma issue no GitHub do projeto
- Entre em contato com a equipe de desenvolvimento
- Use o formulário de feedback na aplicação

## Créditos

Esta funcionalidade utiliza:
- [OpenF1 API](https://openf1.org/) - Dados da F1 em tempo real
- Sistema de palpites do bolão - Dados reais dos usuários
- Cálculo proprietário de pontuação em tempo real 
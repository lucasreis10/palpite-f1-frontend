# Testes Unitários - Calculadores de Pontuação

Este diretório contém testes unitários abrangentes para os calculadores de pontuação do sistema de palpites F1.

## 📁 Estrutura dos Testes

### `scoreCalculators.test.ts`
Testa os calculadores principais de pontuação:
- `QualifyingScoreCalculator` - Cálculo de pontos para qualifying
- `RaceScoreCalculator` - Cálculo de pontos para corrida

### `../app/live-timing/__tests__/calculateLiveScore.test.ts`
Testa a função de cálculo de pontuação em tempo real do live timing.

## 🧪 Cenários de Teste Cobertos

### QualifyingScoreCalculator
- ✅ **Cenário do usuário real**: Testa o caso específico reportado (16.557 pontos)
- ✅ **Pontuação perfeita**: Verifica cálculo com palpite 100% correto
- ✅ **Pontuação zero**: Testa com palpites completamente errados
- ✅ **Correspondências parciais**: Verifica cálculo com algumas posições corretas
- ✅ **Arrays de tamanhos diferentes**: Testa robustez com dados inconsistentes

### RaceScoreCalculator
- ✅ **Cenários de corrida**: Testa cálculos para corridas
- ✅ **Pontuação perfeita**: Verifica máximo de 25 pontos por posição
- ✅ **Sem correspondências**: Testa com pilotos não encontrados
- ✅ **Precisão decimal**: Verifica 3 casas decimais

### Consistência e Edge Cases
- ✅ **Resultados consistentes**: Mesmo input = mesmo output
- ✅ **Posição única**: Testa com apenas 1 piloto
- ✅ **Arrays vazios**: Testa robustez com dados vazios
- ✅ **Diferenças entre tipos**: Qualifying vs Race com mesmos dados

### Live Timing
- ✅ **Detecção de sessão**: Usa calculador correto baseado no tipo
- ✅ **Correspondência de pilotos**: Testa matching por código, nome, etc.
- ✅ **Gerenciamento de arrays**: Testa limitação e padding de arrays
- ✅ **Cenário real do usuário**: Testa caso específico do qualifying

## 🎯 Cenário Real Testado

O teste principal valida o cenário reportado pelo usuário:

**Resultado Real Qualifying:**
1. Russell, 2. Verstappen, 3. Piastri, 4. Antonelli, 5. Hamilton...

**Palpite do Usuário:**
1. Norris, 2. Piastri, 3. Verstappen, 4. Russell, 5. Leclerc...

**Resultado Esperado:** ~16.557 pontos ✅

## 🚀 Executando os Testes

```bash
# Executar todos os testes
npm test

# Executar com cobertura
npm run test:coverage

# Executar em modo watch
npm run test:watch

# Executar apenas testes dos calculadores
npm test scoreCalculators

# Executar apenas testes do live timing
npm test calculateLiveScore
```

## 📊 Cobertura Atual

- **Statements**: 96.75%
- **Branches**: 87.69%
- **Functions**: 100%
- **Lines**: 96.72%

## 🔧 Configuração

Os testes usam:
- **Jest** como framework de testes
- **@testing-library** para testes de componentes
- **Mocks** para isolar unidades de teste
- **TypeScript** para type safety

## 📝 Adicionando Novos Testes

Para adicionar novos testes:

1. Crie arquivos `*.test.ts` no diretório `__tests__`
2. Use a estrutura `describe` > `it` para organizar
3. Inclua cenários de edge cases
4. Documente cenários complexos com comentários
5. Execute `npm run test:coverage` para verificar cobertura

## 🐛 Debugging

Para debuggar testes que falham:

1. Use `console.log` nos testes para inspecionar valores
2. Execute testes individuais: `npm test -- --testNamePattern="nome do teste"`
3. Use `--verbose` para output detalhado
4. Verifique se os mocks estão configurados corretamente 
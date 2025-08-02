# 📊 Sistema de Upload de Excel - Importação de Palpites

Sistema completo para importar palpites históricos diretamente de arquivos Excel através de uma interface web moderna.

## 🎯 Funcionalidades

### ✅ O que o sistema faz:
- **Upload via drag & drop** de arquivos Excel (.xlsx/.xls)
- **Leitura específica da aba "Palpite"** (identifica automaticamente)
- **Processamento inteligente** de estruturas complexas de dados
- **Mapeamento automático** de pilotos e corridas
- **Geração de SQL** pronto para executar no banco
- **Download de arquivos** processados (SQL + JSON)
- **Interface visual** com estatísticas e progresso
- **Validações completas** de dados e estrutura

## 🚀 Como Usar

### 1. Acesse a Interface
```
http://localhost:3000/admin/upload
```

### 2. Faça Upload do Excel
- Arraste e solte o arquivo na área indicada
- Ou clique para selecionar o arquivo
- Arquivo deve ter uma aba chamada "Palpite"

### 3. Processe os Dados
- Clique em "Processar Arquivo"
- Aguarde o processamento (pode levar alguns segundos)
- Visualize as estatísticas geradas

### 4. Baixe os Resultados
- **SQL**: Script pronto para executar no banco de dados
- **JSON**: Dados estruturados para análise

## 📁 Estrutura Esperada do Excel

### Formato do Arquivo:
```
Arquivo.xlsx
├── Aba "Palpite" ← (obrigatória)
├── Outras abas... (ignoradas)
```

### Estrutura da Aba "Palpite":
```
LINHA 1: Cabeçalho com nomes das corridas (AUSTRÁLIA, CHINA, etc.)
LINHA 2: Sub-cabeçalho com "Grid" e "Pts"
LINHA 3+: Dados dos usuários (10 linhas por usuário: 1º a 10º lugar)
```

### Exemplo de Estrutura:
```
| Usuário    |      | AUSTRÁLIA |          |          |          |          | CHINA     |          |
|------------|------|-----------|----------|----------|----------|----------|-----------|----------|
|            |      |           | Grid     | Pts      | Grid     | Pts      |           | Grid     |
| João Silva | João | 1º        | Norris   | 5,000    | Norris   | 25,000   | 1º        | Hamilton |
| João Silva |      | 2º        | Leclerc  | 0,000    | Leclerc  | 0,000    | 2º        | Piastri  |
```

## 🏎️ Mapeamentos Automáticos

### Pilotos Reconhecidos:
- **Red Bull**: Verstappen, Pérez
- **Ferrari**: Leclerc, Sainz  
- **Mercedes**: Hamilton, Russell
- **McLaren**: Norris, Piastri
- **Aston Martin**: Alonso, Stroll
- **Alpine**: Gasly, Ocon
- **Williams**: Albon, Sargeant
- **AlphaTauri/RB**: Tsunoda, Ricciardo, Lawson
- **Sauber**: Bottas, Zhou
- **Haas**: Magnussen, Hulkenberg
- **Rookies**: Bearman, Antonelli, Hadjar, etc.

### Corridas Reconhecidas (2024):
- **Austrália**, **China**, **Japão**, **Bahrein**, **Arábia Saudita**
- **Miami**, **Emília Romagna**, **Mônaco**, **Espanha**, **Canadá**
- **Áustria**, **Inglaterra**, **Bélgica**, **Hungria**, **Holanda**
- **Itália**, **Azerbaijão**, **Singapura**, **EUA**, **México**
- **Brasil**, **Las Vegas**, **Catar**, **Abu Dhabi**

## 🔧 API Endpoints

### GET `/api/upload/excel`
Teste se a API está funcionando:
```bash
curl http://localhost:3000/api/upload/excel
```

### POST `/api/upload/excel`
Upload e processamento de arquivo:
```bash
curl -X POST \
  -F "excel=@arquivo.xlsx" \
  http://localhost:3000/api/upload/excel
```

## 📊 Resultado do Processamento

### Dados Gerados:
```json
{
  "success": true,
  "message": "Processamento completo! 54 usuários, 1,248 palpites",
  "data": {
    "users": [...],
    "guesses": [...],
    "races": [...],
    "stats": {
      "totalUsers": 54,
      "totalGuesses": 1248,
      "totalRaces": 24,
      "qualifyingGuesses": 624,
      "raceGuesses": 624,
      "unmappedPilots": 3
    },
    "sql": "-- SQL gerado automaticamente"
  }
}
```

### SQL Gerado:
- **Criação de usuários** com emails automáticos
- **Inserção de palpites** agrupados por tipo (QUALIFYING/RACE)
- **Associação de pilotos** com posições corretas
- **Tratamento de duplicatas** (INSERT IGNORE)
- **Validações de integridade** referencial

## 🗄️ Integração com Banco de Dados

### 1. Execute o SQL Gerado
```sql
-- Conecte ao seu banco MySQL/MariaDB
mysql -u username -p database_name < palpites-import-2024-01-15.sql
```

### 2. Verifique os Dados
```sql
-- Contar usuários importados
SELECT COUNT(*) FROM users WHERE email LIKE '%@palpitef1.com';

-- Contar palpites importados
SELECT COUNT(*) FROM guesses;

-- Ver estatísticas por corrida
SELECT gp.name, COUNT(*) as total_palpites
FROM guesses g
JOIN grand_prix gp ON g.grand_prix_id = gp.id
GROUP BY gp.name;
```

## 🚨 Tratamento de Erros

### Erros Comuns:

#### "Aba 'Palpite' não encontrada"
- **Solução**: Renomeie a aba do Excel para exatamente "Palpite"

#### "Nenhum palpite processado"
- **Possível causa**: Estrutura do Excel diferente do esperado
- **Solução**: Verifique se as colunas seguem o padrão documentado

#### "Muitos pilotos não mapeados"
- **Solução**: Verifique os nomes dos pilotos no Excel
- **Dica**: Use nomes simples (ex: "Verstappen", não "Max Verstappen")

#### "Erro ao processar arquivo"
- **Solução**: Verifique se o arquivo não está corrompido
- **Dica**: Tente salvar o Excel novamente

## 📱 Interface Visual

### Funcionalidades da Interface:
- ✅ **Drag & Drop** intuitivo
- ✅ **Progress indicators** durante processamento
- ✅ **Estatísticas visuais** com cards coloridos
- ✅ **Download direto** dos arquivos gerados
- ✅ **Instruções contextuais** e ajuda inline
- ✅ **Responsivo** para mobile e desktop

### Cards de Estatísticas:
- 👥 **Usuários** processados
- 🏆 **Palpites** total (qualifying + race)  
- 📅 **Corridas** identificadas
- ⚠️ **Não mapeados** (pilotos não reconhecidos)

## 🔍 Monitoramento e Logs

### Logs do Sistema:
```bash
# Verifique os logs do Next.js
npm run dev

# Procure por mensagens como:
📁 Processando arquivo Excel: palpites.xlsx
📊 Abas encontradas: ['Palpite', 'Resultados', 'Stats']
🎯 Processando aba: Palpite
🏁 Corridas identificadas: 24 corridas
👤 Usuário: Anderson Simões
```

### Debug de Problemas:
```javascript
// Para debugar, adicione console.log no processamento:
console.log('Dados da linha:', row);
console.log('Pilotos encontrados:', pilots);
```

## 🚀 Performance

### Otimizações Implementadas:
- **Streaming de dados** para arquivos grandes
- **Processamento em chunks** para evitar timeout
- **Validação antecipada** de estrutura
- **Memory management** eficiente

### Limites Recomendados:
- **Tamanho máximo**: 10MB por arquivo
- **Usuários**: Até 1000 usuários
- **Palpites**: Até 50,000 palpites

## 📝 Próximas Melhorias

### Futuras Funcionalidades:
- [ ] **Suporte a múltiplas abas** (processar várias de uma vez)
- [ ] **Preview dos dados** antes do processamento
- [ ] **Edição inline** de mapeamentos de pilotos
- [ ] **Histórico de uploads** realizados
- [ ] **Validação avançada** com sugestões de correção
- [ ] **Import incremental** (apenas novos dados)
- [ ] **Backup automático** antes da importação

## 💡 Dicas e Melhores Práticas

### Preparação do Excel:
1. **Mantenha a estrutura simples** - evite células mescladas
2. **Use nomes consistentes** para pilotos
3. **Verifique a aba "Palpite"** antes do upload
4. **Remova formatações complexas** se der erro

### Processamento:
1. **Teste com arquivo pequeno** primeiro
2. **Verifique pilotos não mapeados** e ajuste se necessário
3. **Baixe o JSON** para análise detalhada
4. **Execute o SQL em ambiente de teste** primeiro

### Manutenção:
1. **Monitore os logs** durante o processamento
2. **Mantenha backup** dos dados originais
3. **Documente customizações** nos mapeamentos
4. **Teste após updates** do sistema

---

**Status**: ✅ Sistema completo e funcional

**Última atualização**: Janeiro 2025

**Suporte**: Verifique logs do sistema ou contate o administrador 
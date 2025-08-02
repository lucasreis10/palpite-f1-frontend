# 📊 Importação de Palpites do CSV

Este documento explica o processo completo para importar palpites históricos do arquivo CSV para o sistema Palpite F1.

## 🎯 Objetivo

Importar palpites reais de usuários salvos em um arquivo Excel/CSV para a base de dados do sistema, permitindo:
- Preservar histórico de palpites
- Manter pontuações dos usuários
- Integrar dados históricos com o sistema atual

## 📁 Estrutura dos Arquivos

### Arquivos Gerados
- `Palpites-Table 1.csv` - Arquivo original com palpites
- `scripts/import-csv-palpites-final.js` - Script de processamento
- `scripts/debug-csv.js` - Script para analisar estrutura do CSV
- `import-palpites-final.sql` - SQL gerado para importação
- `palpites-processados-final.json` - Dados processados em JSON

## 🔍 Análise da Estrutura do CSV

### Descobertas sobre o CSV:
1. **743 linhas** total
2. **147 colunas** por linha
3. **24 corridas** identificadas
4. **Cada corrida ocupa 5 colunas**: `[País], [vazio], [vazio], [vazio], [vazio]`
5. **Nas linhas de dados**: `[posição], [piloto grid], [pts grid], [piloto race], [pts race]`

### Estrutura por Usuário:
- Cada usuário tem **10 linhas consecutivas** (1º a 10º lugar)
- **Primeira linha** do usuário: nome repetido nas colunas [0] e [1]  
- **Demais linhas**: coluna [0] tem o nome, coluna [1] vazia

### Exemplos de Dados:
```
LINHA 1: Header com nomes das corridas
LINHA 2: Sub-header com "Grid" e "Pts"
LINHA 3: Anderson Simões, Anderson Simões, 1º, Norris, 5,000, Norris, 25,000...
LINHA 4: Anderson Simões, "", 2º, Leclerc, 0,000, Leclerc, 0,000...
```

## 🏎️ Mapeamento de Pilotos

### Pilotos Identificados:
```javascript
const PILOT_MAPPING = {
  'Verstappen': 'max_verstappen',
  'Leclerc': 'leclerc', 
  'Hamilton': 'hamilton',
  'Russell': 'russell',
  'Norris': 'norris',
  'Piastri': 'piastri',
  'Alonso': 'alonso',
  'Stroll': 'stroll',
  'Gasly': 'gasly',
  'Ocon': 'ocon',
  'Albon': 'albon',
  'Sargeant': 'sargeant',
  'Tsunoda': 'tsunoda',
  'Ricciardo': 'ricciardo',
  'Lawson': 'lawson',
  'Bottas': 'bottas',
  'Zhou': 'zhou',
  'Magnussen': 'magnussen',
  'Hulkenberg': 'hulkenberg',
  'Bearman': 'bearman',
  'Doohan': 'doohan',
  'Pérez': 'perez',
  'Sainz': 'sainz',
  'Antonelli': 'antonelli', 
  'Hadjar': 'hadjar',
  'Colapinto': 'colapinto',
  'Bortoleto': 'bortoleto'
};
```

## 🏁 Mapeamento de Corridas

### Grand Prix 2024:
```javascript
const GP_MAPPING = {
  'AUSTRÁLIA': 'Australian Grand Prix',
  'CHINA': 'Chinese Grand Prix', 
  'JAPÃO': 'Japanese Grand Prix',
  'BAHREIN': 'Bahrain Grand Prix',
  'ARÁBIA': 'Saudi Arabian Grand Prix',
  'MIAMI': 'Miami Grand Prix',
  'EMÍLIA': 'Emilia Romagna Grand Prix',
  'MÔNACO': 'Monaco Grand Prix',
  'ESPANHA': 'Spanish Grand Prix',
  'CANADÁ': 'Canadian Grand Prix',
  'ÁUSTRIA': 'Austrian Grand Prix',
  'INGLATERRA': 'British Grand Prix',
  'BÉLGICA': 'Belgian Grand Prix',
  'HUNGRIA': 'Hungarian Grand Prix',
  'HOLANDA': 'Dutch Grand Prix',
  'ITÁLIA': 'Italian Grand Prix',
  'AZERBAIJÃO': 'Azerbaijan Grand Prix',
  'SINGAPURA': 'Singapore Grand Prix',
  'EUA': 'United States Grand Prix',
  'MÉXICO': 'Mexican Grand Prix',
  'BRASIL': 'Brazilian Grand Prix',
  'LAS VEGAS': 'Las Vegas Grand Prix',
  'CATAR': 'Qatar Grand Prix',
  'EAU': 'Abu Dhabi Grand Prix'
};
```

## 🛠️ Como Usar os Scripts

### 1. Debug da Estrutura
```bash
node scripts/debug-csv.js
```
Analisa e mostra a estrutura exata do CSV.

### 2. Processamento Final  
```bash
node scripts/import-csv-palpites-final.js
```
Processa o CSV e gera SQL para importação.

### 3. Análise dos Resultados
- Verifique `palpites-processados-final.json` para dados estruturados
- Revise `import-palpites-final.sql` para SQL de importação

## 🗄️ Estrutura do Banco de Dados

### Tabelas Envolvidas:

#### `users`
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER',
    active BOOLEAN DEFAULT true
);
```

#### `guesses`
```sql
CREATE TABLE guesses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    grand_prix_id BIGINT NOT NULL,
    guess_type VARCHAR(20) NOT NULL, -- 'QUALIFYING' ou 'RACE'
    score DECIMAL(10,3),
    calculated BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    CONSTRAINT uk_guesses_user_gp_type UNIQUE (user_id, grand_prix_id, guess_type)
);
```

#### `guess_pilots`
```sql
CREATE TABLE guess_pilots (
    guess_id BIGINT NOT NULL,
    pilot_id BIGINT NOT NULL,
    position INT NOT NULL, -- 0-indexed (0=1º lugar)
    PRIMARY KEY (guess_id, position)
);
```

## 🚨 Problema Atual

O script identifica corretamente:
- ✅ 24 corridas
- ✅ 70+ usuários  
- ✅ Estrutura das colunas

Mas não está extraindo os palpites. Possíveis causas:
1. **Estrutura mais complexa** do que mapeado
2. **Encoding/caracteres especiais** no CSV
3. **Lógica de parsing** incorreta

## 📝 Próximos Passos

### Opção 1: Análise Manual Detalhada
1. Abrir o CSV num editor de planilhas
2. Verificar algumas linhas manualmente
3. Mapear exatamente as colunas de cada corrida
4. Ajustar o script com base nos achados

### Opção 2: Importação Simplificada
1. Converter CSV para formato mais simples
2. Focar em algumas corridas principais primeiro
3. Processar em lotes menores

### Opção 3: Processamento Alternativo
1. Usar bibliotecas específicas para CSV (como `papaparse`)
2. Criar script Python com `pandas`
3. Processar dados em Excel primeiro

## 🔧 Comandos Úteis

### Executar Scripts
```bash
# Debug da estrutura
node scripts/debug-csv.js

# Processamento final
node scripts/import-csv-palpites-final.js

# Testar SQL (quando pronto)
mysql -u user -p database < import-palpites-final.sql
```

### Análise Rápida
```bash
# Ver primeiras linhas do CSV
head -5 "Palpites-Table 1.csv"

# Contar linhas
wc -l "Palpites-Table 1.csv"

# Ver colunas de uma linha
head -1 "Palpites-Table 1.csv" | tr ';' '\n' | nl
```

## 📧 Sistema de Email de Confirmação

Já implementado e documentado em `docs/BETTING_CONFIRMATION.md`:
- ✅ API endpoint `/api/betting/confirmation`
- ✅ Templates de email
- ✅ Integração com backend Java
- ✅ Suporte a Resend e Gmail

## 🎯 Resultado Esperado

Quando funcionando corretamente, o sistema deve:
1. Importar **~1000+ palpites** históricos
2. Criar **70+ usuários** com emails gerados
3. Associar palpites aos **Grand Prix de 2024**
4. Manter **posições 1º-10º** para qualifying e race
5. Permitir **cálculo de pontuações** posterior

## 💡 Dicas de Troubleshooting

1. **Verifique encoding** do CSV (UTF-8, ISO-8859-1)
2. **Teste com poucos dados** primeiro
3. **Valide mapeamentos** de pilotos e corridas
4. **Confirme estrutura** do banco de dados
5. **Execute em ambiente de teste** primeiro

---

**Status**: 🟡 Em desenvolvimento - Script criado, estrutura analisada, ajustes finais necessários

**Última atualização**: Janeiro 2025 
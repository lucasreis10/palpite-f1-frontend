const fs = require('fs');
const path = require('path');

// Mapeamento de nomes de pilotos do CSV para driver_id do banco
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
  'Perez': 'perez',
  'Sainz': 'sainz',
  'Antonelli': 'antonelli', // Piloto reserva Mercedes
  'Hadjar': 'hadjar', // Piloto reserva Red Bull
  'Colapinto': 'colapinto',
  'Bortoleto': 'bortoleto' // Piloto futuro
};

// Mapeamento de países/corridas do CSV para nomes de GP
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

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ';' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function extractUserGuesses(csvContent) {
  const lines = csvContent.split('\n');
  if (lines.length < 3) {
    throw new Error('CSV deve ter pelo menos 3 linhas (cabeçalho + dados)');
  }

  // Parse header para identificar colunas das corridas
  const headerLine = lines[0];
  const subHeaderLine = lines[1]; 
  
  const header = parseCSVLine(headerLine);
  const subHeader = parseCSVLine(subHeaderLine);
  
  // Identificar posições das corridas
  const raceColumns = {};
  let currentRace = null;
  
  for (let i = 0; i < header.length; i++) {
    const cell = header[i];
    if (cell && GP_MAPPING[cell]) {
      currentRace = cell;
      raceColumns[currentRace] = {
        gridStart: i + 1, // Próxima coluna após o nome da corrida
        ptsStart: i + 2   // Coluna seguinte
      };
    }
  }

  console.log('🏁 Corridas identificadas:', Object.keys(raceColumns));

  const users = [];
  const allGuesses = [];

  // Processar dados dos usuários (a partir da linha 3)
  for (let lineIndex = 2; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex].trim();
    if (!line) continue;

    const data = parseCSVLine(line);
    
    // Primeira célula tem o nome do usuário principal
    const userName = data[0];
    if (!userName || userName === '-') continue;

    // Verificar se é linha principal do usuário (tem nome) ou linha de posição
    const isMainUserLine = data[1] === userName; // Segunda coluna repetindo o nome
    
    if (isMainUserLine) {
      // Linha principal do usuário - posição 1º
      users.push({
        name: userName,
        startLine: lineIndex
      });
      
      console.log(`👤 Usuário encontrado: ${userName}`);
    }

    // Extrair palpites desta linha (pode ser 1º, 2º, 3º, etc.)
    const positionMatch = data[2]?.match(/^(\d+)º$/);
    if (!positionMatch) continue;
    
    const position = parseInt(positionMatch[1]);
    
    // Processar cada corrida
    Object.keys(raceColumns).forEach(raceName => {
      const raceInfo = raceColumns[raceName];
      const gridColumn = raceInfo.gridStart;
      const ptsColumn = raceInfo.ptsStart;
      
      if (gridColumn < data.length && ptsColumn < data.length) {
        const pilotName = data[gridColumn];
        const points = data[ptsColumn];
        
        if (pilotName && pilotName !== '-' && points) {
          // Mapear nome do piloto
          let driverId = null;
          for (const [csvName, id] of Object.entries(PILOT_MAPPING)) {
            if (pilotName.toLowerCase().includes(csvName.toLowerCase()) || 
                csvName.toLowerCase().includes(pilotName.toLowerCase())) {
              driverId = id;
              break;
            }
          }

          if (!driverId) {
            console.warn(`⚠️ Piloto não mapeado: ${pilotName}`);
          }

          allGuesses.push({
            userName: userName,
            raceName: raceName,
            gpName: GP_MAPPING[raceName],
            position: position,
            pilotName: pilotName,
            driverId: driverId,
            points: parseFloat(points.replace(',', '.')) || 0,
            guessType: 'QUALIFYING' // Assumindo que são palpites de classificação por padrão
          });
        }
      }
    });
  }

  return {
    users: users,
    guesses: allGuesses,
    stats: {
      totalUsers: users.length,
      totalGuesses: allGuesses.length,
      races: Object.keys(raceColumns).length
    }
  };
}

function generateSQLInserts(data) {
  const { users, guesses } = data;
  
  let sql = '-- SQL para importar palpites do CSV\n\n';
  
  // 1. Inserir usuários (se não existirem)
  sql += '-- 1. Inserir usuários\n';
  const uniqueUsers = [...new Set(users.map(u => u.name))];
  
  uniqueUsers.forEach(userName => {
    sql += `INSERT IGNORE INTO users (name, email, password, role, active) VALUES\n`;
    sql += `('${userName}', '${userName.toLowerCase().replace(/\s+/g, '.')}@palpitef1.com', '$2a$10$encrypted_password', 'USER', true);\n\n`;
  });

  // 2. Agrupar palpites por usuário e corrida
  sql += '-- 2. Inserir palpites\n';
  const groupedGuesses = {};
  
  guesses.forEach(guess => {
    const key = `${guess.userName}_${guess.raceName}_${guess.guessType}`;
    if (!groupedGuesses[key]) {
      groupedGuesses[key] = {
        userName: guess.userName,
        raceName: guess.raceName,
        gpName: guess.gpName,
        guessType: guess.guessType,
        pilots: []
      };
    }
    
    if (guess.driverId) {
      groupedGuesses[key].pilots.push({
        position: guess.position,
        driverId: guess.driverId,
        points: guess.points
      });
    }
  });

  // Gerar SQL para cada palpite completo
  Object.values(groupedGuesses).forEach(group => {
    if (group.pilots.length >= 10) { // Só inserir se tiver pelo menos 10 pilotos
      sql += `-- Palpite: ${group.userName} - ${group.raceName}\n`;
      sql += `INSERT INTO guesses (user_id, grand_prix_id, guess_type, score, calculated, active) \n`;
      sql += `SELECT u.id, gp.id, '${group.guessType}', 0, false, true\n`;
      sql += `FROM users u, grand_prix gp \n`;
      sql += `WHERE u.name = '${group.userName}' AND gp.name = '${group.gpName}' AND gp.season = 2024;\n\n`;
      
      // Inserir pilotos do palpite
      group.pilots.sort((a, b) => a.position - b.position).forEach(pilot => {
        sql += `INSERT INTO guess_pilots (guess_id, pilot_id, position) \n`;
        sql += `SELECT g.id, p.id, ${pilot.position - 1} \n`; // position é 0-indexed na tabela
        sql += `FROM guesses g, users u, grand_prix gp, pilots p \n`;
        sql += `WHERE g.user_id = u.id AND g.grand_prix_id = gp.id \n`;
        sql += `AND u.name = '${group.userName}' AND gp.name = '${group.gpName}' \n`;
        sql += `AND g.guess_type = '${group.guessType}' AND p.driver_id = '${pilot.driverId}';\n\n`;
      });
    }
  });

  return sql;
}

function generateJSONOutput(data) {
  return {
    metadata: {
      processedAt: new Date().toISOString(),
      stats: data.stats
    },
    users: data.users,
    guesses: data.guesses.map(g => ({
      user: g.userName,
      race: g.raceName,
      grandPrix: g.gpName,
      position: g.position,
      pilot: g.pilotName,
      driverId: g.driverId,
      points: g.points,
      type: g.guessType
    }))
  };
}

// Função principal
async function main() {
  try {
    console.log('🚀 Iniciando processamento do CSV de palpites...\n');
    
    const csvPath = path.join(__dirname, '..', 'Palpites-Table 1.csv');
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`Arquivo CSV não encontrado: ${csvPath}`);
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    console.log('📁 Arquivo CSV carregado com sucesso\n');

    const data = extractUserGuesses(csvContent);
    
    console.log('\n📊 Estatísticas:');
    console.log(`   • Usuários: ${data.stats.totalUsers}`);
    console.log(`   • Palpites: ${data.stats.totalGuesses}`);
    console.log(`   • Corridas: ${data.stats.races}\n`);

    // Gerar SQL
    const sqlOutput = generateSQLInserts(data);
    const sqlPath = path.join(__dirname, '..', 'import-palpites.sql');
    fs.writeFileSync(sqlPath, sqlOutput, 'utf-8');
    console.log(`💾 Arquivo SQL gerado: ${sqlPath}`);

    // Gerar JSON para análise
    const jsonOutput = generateJSONOutput(data);
    const jsonPath = path.join(__dirname, '..', 'palpites-processados.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonOutput, null, 2), 'utf-8');
    console.log(`📋 Arquivo JSON gerado: ${jsonPath}`);

    console.log('\n✅ Processamento concluído com sucesso!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Revisar o arquivo SQL gerado');
    console.log('   2. Ajustar mapeamentos se necessário');
    console.log('   3. Executar o SQL no banco de dados');
    console.log('   4. Verificar a integridade dos dados importados');

  } catch (error) {
    console.error('❌ Erro durante o processamento:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  extractUserGuesses,
  generateSQLInserts,
  generateJSONOutput,
  PILOT_MAPPING,
  GP_MAPPING
}; 
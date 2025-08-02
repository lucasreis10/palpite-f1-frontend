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
  'Antonelli': 'antonelli', 
  'Hadjar': 'hadjar',
  'Colapinto': 'colapinto',
  'Bortoleto': 'bortoleto'
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

function identifyRaceColumns(headerLine) {
  const header = parseCSVLine(headerLine);
  const raceColumns = {};
  
  for (let i = 0; i < header.length; i++) {
    const cell = header[i];
    if (cell && GP_MAPPING[cell]) {
      // Estrutura real: cada corrida ocupa 5 colunas
      // [País], [vazio], [vazio], [vazio], [vazio]
      // Nas linhas de dados: [posição], [piloto grid], [pts grid], [piloto race], [pts race]
      raceColumns[cell] = {
        name: cell,
        gpName: GP_MAPPING[cell],
        startCol: i,
        positionCol: i,          // Posição (1º, 2º, etc.)
        gridPilotCol: i + 1,     // Piloto para Grid
        gridPtsCol: i + 2,       // Pontos para Grid  
        racePilotCol: i + 3,     // Piloto para Race
        racePtsCol: i + 4        // Pontos para Race
      };
    }
  }
  
  return raceColumns;
}

function mapPilotName(pilotName) {
  if (!pilotName || pilotName === '-' || pilotName.match(/^\d+[.,]\d+$/)) {
    return null;
  }
  
  // Buscar mapeamento exato primeiro
  for (const [csvName, driverId] of Object.entries(PILOT_MAPPING)) {
    if (pilotName.toLowerCase() === csvName.toLowerCase()) {
      return driverId;
    }
  }
  
  // Buscar por substring
  for (const [csvName, driverId] of Object.entries(PILOT_MAPPING)) {
    if (pilotName.toLowerCase().includes(csvName.toLowerCase()) || 
        csvName.toLowerCase().includes(pilotName.toLowerCase())) {
      return driverId;
    }
  }
  
  return null;
}

function extractUserGuesses(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  if (lines.length < 3) {
    throw new Error('CSV deve ter pelo menos 3 linhas (cabeçalho + dados)');
  }

  const raceColumns = identifyRaceColumns(lines[0]);
  const raceNames = Object.keys(raceColumns);
  
  console.log('🏁 Corridas identificadas:', raceNames.length, 'corridas');
  console.log('🏎️ Corridas:', raceNames.slice(0, 5).join(', '), '...');

  const users = [];
  const allGuesses = [];
  let unmappedPilots = new Set();

  // Processar dados a partir da linha 2 (índice 2) 
  for (let lineIndex = 2; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex].trim();
    if (!line) continue;

    const data = parseCSVLine(line);
    
    // Identificar se é uma nova linha de usuário (nome repetido nas colunas [0] e [1])    
    const userName = data[0];
    const isNewUser = userName && userName !== '' && data[1] === userName;
    
    if (isNewUser) {
      console.log(`👤 Usuário: ${userName}`);
    }
    
    if (!userName) continue;

    // Extrair posição das linhas de dados
    // A posição está em diferentes colunas para cada corrida  
    Object.values(raceColumns).forEach(raceInfo => {
      if (raceInfo.positionCol < data.length) {
        const positionText = data[raceInfo.positionCol] || '';
        const positionMatch = positionText.match(/^(\d+)º$/);
        
        if (positionMatch) {
          const position = parseInt(positionMatch[1]);
          
          // Palpite de Qualifying (Grid)
          if (raceInfo.gridPilotCol < data.length) {
            const gridPilot = data[raceInfo.gridPilotCol];
            const driverId = mapPilotName(gridPilot);
            
            if (driverId) {
              allGuesses.push({
                userName: userName,
                raceName: raceInfo.name,
                gpName: raceInfo.gpName,
                position: position,
                pilotName: gridPilot,
                driverId: driverId,
                guessType: 'QUALIFYING'
              });
            } else if (gridPilot && gridPilot !== '-') {
              unmappedPilots.add(gridPilot);
            }
          }

          // Palpite de Race
          if (raceInfo.racePilotCol < data.length) {
            const racePilot = data[raceInfo.racePilotCol];
            const driverId = mapPilotName(racePilot);
            
            if (driverId) {
              allGuesses.push({
                userName: userName,
                raceName: raceInfo.name,
                gpName: raceInfo.gpName,
                position: position,
                pilotName: racePilot,
                driverId: driverId,
                guessType: 'RACE'
              });
            } else if (racePilot && racePilot !== '-') {
              unmappedPilots.add(racePilot);
            }
          }
        }
      }
    });
  }

  // Identificar usuários únicos
  const uniqueUsers = [...new Set(allGuesses.map(g => g.userName))];
  users.push(...uniqueUsers.map(name => ({
    name,
    qualifyingGuesses: allGuesses.filter(g => g.userName === name && g.guessType === 'QUALIFYING').length,
    raceGuesses: allGuesses.filter(g => g.userName === name && g.guessType === 'RACE').length
  })));

  // Mostrar pilotos não mapeados
  if (unmappedPilots.size > 0) {
    console.log('\n⚠️ Pilotos não mapeados encontrados:');
    [...unmappedPilots].slice(0, 10).forEach(pilot => {
      console.log(`   "${pilot}"`);
    });
    if (unmappedPilots.size > 10) {
      console.log(`   ... e mais ${unmappedPilots.size - 10} pilotos`);
    }
  }

  return {
    users: users,
    guesses: allGuesses,
    races: raceNames,
    stats: {
      totalUsers: users.length,
      totalGuesses: allGuesses.length,
      totalRaces: raceNames.length,
      qualifyingGuesses: allGuesses.filter(g => g.guessType === 'QUALIFYING').length,
      raceGuesses: allGuesses.filter(g => g.guessType === 'RACE').length,
      unmappedPilots: unmappedPilots.size
    }
  };
}

function generateSQLInserts(data) {
  const { users, guesses } = data;
  
  let sql = '-- SQL para importar palpites do CSV (versão final)\n';
  sql += '-- Processado em: ' + new Date().toISOString() + '\n\n';
  
  // 1. Inserir usuários (se não existirem)
  sql += '-- 1. Inserir usuários\n';
  const uniqueUsers = [...new Set(users.map(u => u.name))];
  
  uniqueUsers.forEach(userName => {
    const email = userName.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/\s+/g, '.')
      .replace(/[^a-z0-9.]/g, '') + '@palpitef1.com';
    
    sql += `INSERT IGNORE INTO users (name, email, password, role, active) VALUES\n`;
    sql += `('${userName.replace(/'/g, "''")}', '${email}', '$2a$10$defaultEncryptedPassword', 'USER', true);\n\n`;
  });

  // 2. Agrupar palpites por usuário, corrida e tipo
  sql += '-- 2. Script para inserir palpites\n';
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
    
    groupedGuesses[key].pilots.push({
      position: guess.position,
      driverId: guess.driverId,
      pilotName: guess.pilotName
    });
  });

  // Estatísticas
  sql += `-- Estatísticas:\n`;
  sql += `-- • Usuários: ${data.stats.totalUsers}\n`;
  sql += `-- • Palpites de Qualifying: ${data.stats.qualifyingGuesses}\n`;
  sql += `-- • Palpites de Race: ${data.stats.raceGuesses}\n`;
  sql += `-- • Total de palpites: ${data.stats.totalGuesses}\n`;
  sql += `-- • Corridas: ${data.stats.totalRaces}\n`;
  sql += `-- • Pilotos não mapeados: ${data.stats.unmappedPilots}\n\n`;

  // Gerar SQL para cada palpite completo
  let validGuesses = 0;
  Object.values(groupedGuesses).forEach(group => {
    if (group.pilots.length >= 8) { // Pelo menos 8 pilotos para ser válido
      validGuesses++;
      group.pilots.sort((a, b) => a.position - b.position);
      
      sql += `-- Palpite: ${group.userName} - ${group.raceName} (${group.guessType})\n`;
      sql += `-- Pilotos: ${group.pilots.map(p => `${p.position}º ${p.pilotName}`).join(', ')}\n`;
      
      // Inserir o palpite principal
      sql += `INSERT IGNORE INTO guesses (user_id, grand_prix_id, guess_type, score, calculated, active) \n`;
      sql += `SELECT u.id, gp.id, '${group.guessType}', 0.0, false, true\n`;
      sql += `FROM users u, grand_prix gp \n`;
      sql += `WHERE u.name = '${group.userName.replace(/'/g, "''")}' \n`;
      sql += `  AND gp.name = '${group.gpName}' \n`;
      sql += `  AND gp.season = 2024\n`;
      sql += `  AND NOT EXISTS (\n`;
      sql += `    SELECT 1 FROM guesses g2 \n`;
      sql += `    WHERE g2.user_id = u.id \n`;
      sql += `      AND g2.grand_prix_id = gp.id \n`;
      sql += `      AND g2.guess_type = '${group.guessType}'\n`;
      sql += `  );\n\n`;
      
      // Inserir pilotos do palpite
      group.pilots.forEach(pilot => {
        sql += `INSERT IGNORE INTO guess_pilots (guess_id, pilot_id, position) \n`;
        sql += `SELECT g.id, p.id, ${pilot.position - 1} \n`; // position é 0-indexed
        sql += `FROM guesses g \n`;
        sql += `JOIN users u ON g.user_id = u.id \n`;
        sql += `JOIN grand_prix gp ON g.grand_prix_id = gp.id \n`;
        sql += `JOIN pilots p ON p.driver_id = '${pilot.driverId}' \n`;
        sql += `WHERE u.name = '${group.userName.replace(/'/g, "''")}' \n`;
        sql += `  AND gp.name = '${group.gpName}' \n`;
        sql += `  AND gp.season = 2024 \n`;
        sql += `  AND g.guess_type = '${group.guessType}' \n`;
        sql += `  AND p.active = true;\n\n`;
      });
      
      sql += '\n';
    }
  });

  sql += `-- Total de palpites válidos gerados: ${validGuesses}\n`;

  return sql;
}

function generateJSONOutput(data) {
  return {
    metadata: {
      processedAt: new Date().toISOString(),
      stats: data.stats,
      races: data.races
    },
    users: data.users,
    guesses: data.guesses.map(g => ({
      user: g.userName,
      race: g.raceName,
      grandPrix: g.gpName,
      position: g.position,
      pilot: g.pilotName,
      driverId: g.driverId,
      type: g.guessType
    }))
  };
}

// Função principal
async function main() {
  try {
    console.log('🚀 Iniciando processamento do CSV de palpites (Versão Final)...\n');
    
    const csvPath = path.join(__dirname, '..', 'Palpites-Table 1.csv');
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`Arquivo CSV não encontrado: ${csvPath}`);
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    console.log('📁 Arquivo CSV carregado com sucesso\n');

    const data = extractUserGuesses(csvContent);
    
    console.log('\n📊 Estatísticas finais:');
    console.log(`   • Usuários processados: ${data.stats.totalUsers}`);
    console.log(`   • Palpites de Qualifying: ${data.stats.qualifyingGuesses}`);
    console.log(`   • Palpites de Race: ${data.stats.raceGuesses}`);
    console.log(`   • Total de palpites: ${data.stats.totalGuesses}`);
    console.log(`   • Corridas encontradas: ${data.stats.totalRaces}`);
    console.log(`   • Pilotos não mapeados: ${data.stats.unmappedPilots}\n`);

    // Gerar SQL
    const sqlOutput = generateSQLInserts(data);
    const sqlPath = path.join(__dirname, '..', 'import-palpites-final.sql');
    fs.writeFileSync(sqlPath, sqlOutput, 'utf-8');
    console.log(`💾 Arquivo SQL gerado: ${sqlPath}`);

    // Gerar JSON para análise
    const jsonOutput = generateJSONOutput(data);
    const jsonPath = path.join(__dirname, '..', 'palpites-processados-final.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonOutput, null, 2), 'utf-8');
    console.log(`📋 Arquivo JSON gerado: ${jsonPath}`);

    console.log('\n✅ Processamento concluído com sucesso!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Revisar o arquivo SQL gerado');
    console.log('   2. Verificar se os pilotos foram mapeados corretamente');
    console.log('   3. Executar o SQL no banco de dados do backend Java');
    console.log('   4. Testar os endpoints de palpites para verificar a integridade');
    console.log('   5. Configurar sistema de email de confirmação (opcional)');

  } catch (error) {
    console.error('❌ Erro durante o processamento:', error.message);
    console.error(error.stack);
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
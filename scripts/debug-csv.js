const fs = require('fs');
const path = require('path');

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

function debugCSV() {
  try {
    const csvPath = path.join(__dirname, '..', 'Palpites-Table 1.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    console.log('🔍 Analisando estrutura do CSV...\n');
    console.log(`Total de linhas: ${lines.length}\n`);
    
    // Analisar header
    console.log('📋 LINHA 1 (Header):');
    const header = parseCSVLine(lines[0]);
    console.log(`   Colunas: ${header.length}`);
    for (let i = 0; i < Math.min(20, header.length); i++) {
      console.log(`   [${i}] "${header[i]}"`);
    }
    
    // Analisar sub-header
    console.log('\n📋 LINHA 2 (Sub-header):');
    const subHeader = parseCSVLine(lines[1]);
    console.log(`   Colunas: ${subHeader.length}`);
    for (let i = 0; i < Math.min(20, subHeader.length); i++) {
      console.log(`   [${i}] "${subHeader[i]}"`);
    }
    
    // Analisar primeira linha de dados
    console.log('\n📋 LINHA 3 (Primeira linha de dados):');
    const firstData = parseCSVLine(lines[2]);
    console.log(`   Colunas: ${firstData.length}`);
    for (let i = 0; i < Math.min(30, firstData.length); i++) {
      console.log(`   [${i}] "${firstData[i]}"`);
    }
    
    // Analisar segunda linha de dados
    console.log('\n📋 LINHA 4 (Segunda linha de dados):');
    const secondData = parseCSVLine(lines[3]);
    console.log(`   Colunas: ${secondData.length}`);
    for (let i = 0; i < Math.min(30, secondData.length); i++) {
      console.log(`   [${i}] "${secondData[i]}"`);
    }
    
    // Identificar padrão das corridas
    console.log('\n🏁 PADRÃO DAS CORRIDAS:');
    const gpNames = ['AUSTRÁLIA', 'CHINA', 'JAPÃO'];
    
    gpNames.forEach(gpName => {
      const index = header.indexOf(gpName);
      if (index >= 0) {
        console.log(`\n   ${gpName} (índice ${index}):`);
        console.log(`   [${index}] "${header[index]}"`);
        console.log(`   [${index+1}] "${header[index+1]}"`);
        console.log(`   [${index+2}] "${header[index+2]}"`);
        console.log(`   [${index+3}] "${header[index+3]}"`);
        console.log(`   [${index+4}] "${header[index+4]}"`);
        console.log(`   [${index+5}] "${header[index+5]}"`);
        console.log(`   [${index+6}] "${header[index+6]}"`);
        
        console.log(`   Dados linha 3:`);
        console.log(`   [${index}] "${firstData[index]}"`);
        console.log(`   [${index+1}] "${firstData[index+1]}"`);
        console.log(`   [${index+2}] "${firstData[index+2]}"`);
        console.log(`   [${index+3}] "${firstData[index+3]}"`);
        console.log(`   [${index+4}] "${firstData[index+4]}"`);
        console.log(`   [${index+5}] "${firstData[index+5]}"`);
        console.log(`   [${index+6}] "${firstData[index+6]}"`);
      }
    });
    
    // Analisar como identificar usuários
    console.log('\n👤 IDENTIFICAÇÃO DE USUÁRIOS:');
    for (let i = 2; i < Math.min(15, lines.length); i++) {
      const data = parseCSVLine(lines[i]);
      console.log(`Linha ${i+1}: [0]="${data[0]}" [1]="${data[1]}" [2]="${data[2]}"`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

debugCSV(); 
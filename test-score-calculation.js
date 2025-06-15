// Script de teste para verificar cálculos de pontuação
const { RaceScoreCalculator, QualifyingScoreCalculator } = require('./src/utils/scoreCalculators.ts');

// Teste 1: Cenário perfeito (todas as posições corretas)
console.log('🧪 Teste 1: Cenário perfeito');
const realRace = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];
const guessRace = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];
const realQualifying = [1,2,3,4,5,6,7,8,9,10,11,12];
const guessQualifying = [1,2,3,4,5,6,7,8,9,10,11,12];

const raceCalc = new RaceScoreCalculator(realRace, guessRace);
const qualifyingCalc = new QualifyingScoreCalculator(realQualifying, guessQualifying);

const raceScore = raceCalc.calculate();
const qualifyingScore = qualifyingCalc.calculate();
const totalScore = raceScore + qualifyingScore;

console.log(`Race Score: ${raceScore}`);
console.log(`Qualifying Score: ${qualifyingScore}`);
console.log(`Total Score: ${totalScore}`);

// Teste 2: Cenário com algumas diferenças
console.log('\n🧪 Teste 2: Cenário com diferenças');
const realRace2 = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];
const guessRace2 = [2,1,3,5,4,6,7,8,9,10,11,12,13,14]; // Trocou 1º e 2º, 4º e 5º
const realQualifying2 = [1,2,3,4,5,6,7,8,9,10,11,12];
const guessQualifying2 = [2,1,3,4,5,6,7,8,9,10,11,12]; // Trocou 1º e 2º

const raceCalc2 = new RaceScoreCalculator(realRace2, guessRace2);
const qualifyingCalc2 = new QualifyingScoreCalculator(realQualifying2, guessQualifying2);

const raceScore2 = raceCalc2.calculate();
const qualifyingScore2 = qualifyingCalc2.calculate();
const totalScore2 = raceScore2 + qualifyingScore2;

console.log(`Race Score: ${raceScore2}`);
console.log(`Qualifying Score: ${qualifyingScore2}`);
console.log(`Total Score: ${totalScore2}`); 
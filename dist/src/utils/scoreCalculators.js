"use strict";
// Classes de cálculo de pontuação baseadas no backend
// Traduzidas de Java para TypeScript - VERSÃO CORRIGIDA
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualifyingScoreCalculator = exports.RaceScoreCalculator = void 0;
class RaceScoreCalculator {
    constructor(realRaceResult, guessRace) {
        this.realRaceResult = realRaceResult;
        this.guessRace = guessRace;
        this.diffGrids = this.differencesBetwenGrids();
    }
    differencesBetwenGrids() {
        const guessDrivers = this.normalizeDriverList();
        return this.generateGridDifferences(guessDrivers);
    }
    normalizeDriverList() {
        return [...this.guessRace];
    }
    generateGridDifferences(guessDrivers) {
        const diff = new Map();
        for (let index = 0; index < this.realRaceResult.length; index++) {
            const pilotId = this.realRaceResult[index];
            const guessPosition = guessDrivers.indexOf(pilotId);
            diff.set(index, guessPosition);
        }
        return diff;
    }
    calculate() {
        let totalScore = 0;
        totalScore += this.calculateFirst();
        totalScore += this.calculateSecond();
        totalScore += this.calculateThird();
        totalScore += this.calculateFourth();
        totalScore += this.calculateFifth();
        totalScore += this.calculateSixth();
        totalScore += this.calculateSeventh();
        totalScore += this.calculateEighth();
        totalScore += this.calculateNinth();
        totalScore += this.calculateTenth();
        totalScore += this.calculateEleventh();
        totalScore += this.calculateTwelfth();
        totalScore += this.calculateThirteenth();
        totalScore += this.calculateFourteenth();
        return Math.round(totalScore * 1000) / 1000; // 3 decimal places
    }
    calculateFirst() {
        const scores = [25, 21.25, 18.062, 12.282, 10.44];
        const position = this.diffGrids.get(0);
        if (position !== undefined && position >= 0 && position < scores.length) {
            return scores[position];
        }
        return 0;
    }
    calculateSecond() {
        const scores = [21.25, 25, 21.25, 14.45, 12.282, 10.44];
        const position = this.diffGrids.get(1);
        if (position !== undefined && position >= 0 && position < scores.length) {
            return scores[position];
        }
        return 0;
    }
    calculateThird() {
        const scores = [18.062, 21.25, 25, 17, 14.45, 12.282, 7.83];
        const position = this.diffGrids.get(2);
        if (position !== undefined && position >= 0 && position < scores.length) {
            return scores[position];
        }
        return 0;
    }
    calculateFourth() {
        const scores = [15.353, 18.062, 21.25, 20, 17, 14.45, 9.212, 7.83];
        const position = this.diffGrids.get(3);
        if (position !== undefined && position >= 0 && position < scores.length) {
            return scores[position];
        }
        return 0;
    }
    calculateFifth() {
        const scores = [13.05, 15.353, 18.062, 17, 20, 17, 10.837, 9.212, 7.83];
        const position = this.diffGrids.get(4);
        if (position !== undefined && position >= 0 && position < scores.length) {
            return scores[position];
        }
        return 0;
    }
    calculateSixth() {
        const scores = [0, 13.05, 15.353, 14.45, 17, 20, 12.75, 10.837, 9.212, 7.83];
        const position = this.diffGrids.get(5);
        if (position !== undefined && position >= 0 && position < scores.length) {
            return scores[position];
        }
        return 0;
    }
    calculateSeventh() {
        const scores = [0, 0, 13.05, 12.282, 14.45, 17, 15, 12.75, 10.837, 9.212];
        const position = this.diffGrids.get(6);
        if (position !== undefined && position >= 0 && position < scores.length) {
            return scores[position];
        }
        return 0;
    }
    calculateEighth() {
        const scores = [0, 0, 0, 10.44, 12.282, 14.45, 12.75, 15, 12.75, 10.837];
        const position = this.diffGrids.get(7);
        if (position !== undefined && position >= 0 && position < scores.length) {
            return scores[position];
        }
        return 0;
    }
    calculateNinth() {
        const scores = [0, 0, 0, 0, 10.44, 12.282, 10.837, 12.75, 15, 12.75];
        const position = this.diffGrids.get(8);
        if (position !== undefined && position >= 0 && position < scores.length) {
            return scores[position];
        }
        return 0;
    }
    calculateTenth() {
        const scores = [0, 0, 0, 0, 0, 10.44, 9.212, 10.837, 12.75, 15];
        const position = this.diffGrids.get(9);
        if (position !== undefined && position >= 0 && position < scores.length) {
            return scores[position];
        }
        return 0;
    }
    calculateEleventh() {
        const scores = [0, 0, 0, 0, 0, 0, 7.83, 9.212, 10.837, 12.75];
        const position = this.diffGrids.get(10);
        if (position !== undefined && position >= 0 && position < scores.length) {
            return scores[position];
        }
        return 0;
    }
    calculateTwelfth() {
        const scores = [0, 0, 0, 0, 0, 0, 0, 7.83, 9.212, 10.837];
        const position = this.diffGrids.get(11);
        if (position !== undefined && position >= 0 && position < scores.length) {
            return scores[position];
        }
        return 0;
    }
    calculateThirteenth() {
        const scores = [0, 0, 0, 0, 0, 0, 0, 0, 7.83, 9.212];
        const position = this.diffGrids.get(12);
        if (position !== undefined && position >= 0 && position < scores.length) {
            return scores[position];
        }
        return 0;
    }
    calculateFourteenth() {
        const scores = [0, 0, 0, 0, 0, 0, 0, 0, 0, 7.83];
        const position = this.diffGrids.get(13);
        if (position !== undefined && position >= 0 && position < scores.length) {
            return scores[position];
        }
        return 0;
    }
}
exports.RaceScoreCalculator = RaceScoreCalculator;
class QualifyingScoreCalculator {
    constructor(realGrid, guessGrid) {
        debugger;
        this.realQualifyResult = realGrid;
        this.guessQualify = guessGrid;
        this.diffGrids = this.checkDifferencesWithRealGridAndGuessGrid();
    }
    checkDifferencesWithRealGridAndGuessGrid() {
        const diff = new Map();
        for (let index = 0; index < this.realQualifyResult.length; index++) {
            const pilotId = this.realQualifyResult[index];
            const guessPosition = this.guessQualify.indexOf(pilotId);
            diff.set(index, guessPosition);
        }
        return diff;
    }
    calculate() {
        let totalScore = 0;
        totalScore += this.calculateFirst();
        totalScore += this.calculateSecond();
        totalScore += this.calculateThird();
        totalScore += this.calculateFourth();
        totalScore += this.calculateFifth();
        totalScore += this.calculateSixth();
        totalScore += this.calculateSeventh();
        totalScore += this.calculateEighth();
        totalScore += this.calculateNinth();
        totalScore += this.calculateTenth();
        totalScore += this.calculateEleventh();
        totalScore += this.calculateTwelfth();
        return Math.round(totalScore * 1000) / 1000; // 3 decimal places
    }
    calculateFirst() {
        const scores = [5.0, 4.25, 3.612];
        const position = this.diffGrids.get(0);
        if (position !== undefined && position >= 0 && position < scores.length) {
            return scores[position];
        }
        return 0;
    }
    calculateSecond() {
        const scores = [4.25, 5.0, 4.25, 2.89];
        const position = this.diffGrids.get(1);
        if (position !== undefined && position >= 0 && position < scores.length) {
            return scores[position];
        }
        return 0;
    }
    calculateThird() {
        const scores = [3.612, 4.25, 5.0, 3.4, 2.89];
        const position = this.diffGrids.get(2);
        if (position !== undefined && position >= 0 && position < scores.length) {
            return scores[position];
        }
        return 0;
    }
    calculateFourth() {
        const scores = [0, 3.612, 4.25, 4.0, 3.4, 2.89];
        const position = this.diffGrids.get(3);
        if (position !== undefined && position >= 0 && position < scores.length) {
            return scores[position];
        }
        return 0;
    }
    calculateFifth() {
        const scores = [0, 0, 3.612, 3.4, 4.0, 3.4, 2.167];
        const position = this.diffGrids.get(4);
        if (position !== undefined && position >= 0 && position < scores.length) {
            return scores[position];
        }
        return 0;
    }
    calculateSixth() {
        const scores = [0, 0, 0, 2.89, 3.4, 4.0, 2.55, 2.167];
        const position = this.diffGrids.get(5);
        if (position !== undefined && position >= 0 && position < scores.length) {
            return scores[position];
        }
        return 0;
    }
    calculateSeventh() {
        const scores = [0, 0, 0, 0, 2.89, 3.4, 3.0, 2.55, 2.167];
        const position = this.diffGrids.get(6);
        if (position !== undefined && position >= 0 && position < scores.length) {
            return scores[position];
        }
        return 0;
    }
    calculateEighth() {
        const scores = [0, 0, 0, 0, 0, 2.89, 2.55, 3.0, 2.55];
        const position = this.diffGrids.get(7);
        if (position !== undefined && position >= 0 && position < scores.length) {
            return scores[position];
        }
        return 0;
    }
    calculateNinth() {
        const scores = [0, 0, 0, 0, 0, 0, 2.167, 2.55, 3.0, 2.55];
        const position = this.diffGrids.get(8);
        if (position !== undefined && position >= 0 && position < scores.length) {
            return scores[position];
        }
        return 0;
    }
    calculateTenth() {
        const scores = [0, 0, 0, 0, 0, 0, 0, 2.167, 2.55, 3.0];
        const position = this.diffGrids.get(9);
        if (position !== undefined && position >= 0 && position < scores.length) {
            return scores[position];
        }
        return 0;
    }
    calculateEleventh() {
        const scores = [0, 0, 0, 0, 0, 0, 0, 0, 2.167, 2.55];
        const position = this.diffGrids.get(10);
        if (position !== undefined && position >= 0 && position < scores.length) {
            return scores[position];
        }
        return 0;
    }
    calculateTwelfth() {
        const scores = [0, 0, 0, 0, 0, 0, 0, 0, 0, 2.167];
        const position = this.diffGrids.get(11);
        if (position !== undefined && position >= 0 && position < scores.length) {
            return scores[position];
        }
        return 0;
    }
}
exports.QualifyingScoreCalculator = QualifyingScoreCalculator;

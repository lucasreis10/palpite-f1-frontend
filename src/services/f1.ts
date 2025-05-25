interface F1Result {
  position: number;
  driver: string;
  team: string;
}

const F1_API_BASE_URL = 'http://ergast.com/api/f1';

export const F1Service = {
  async getLatestRaceResults(): Promise<F1Result[]> {
    try {
      const response = await fetch(`${F1_API_BASE_URL}/current/last/results.json`);
      const data = await response.json();
      
      const raceResults = data.MRData.RaceTable.Races[0].Results;
      
      return raceResults.slice(0, 14).map((result: any) => ({
        position: parseInt(result.position),
        driver: `${result.Driver.givenName} ${result.Driver.familyName}`,
        team: result.Constructor.name
      }));
    } catch (error) {
      console.error('Erro ao buscar resultados da F1:', error);
      throw new Error('Não foi possível obter os resultados da última corrida');
    }
  },

  async getLatestQualifyingResults(): Promise<F1Result[]> {
    try {
      const response = await fetch(`${F1_API_BASE_URL}/current/last/qualifying.json`);
      const data = await response.json();
      
      const qualifyingResults = data.MRData.RaceTable.Races[0].QualifyingResults;
      
      return qualifyingResults.slice(0, 14).map((result: any) => ({
        position: parseInt(result.position),
        driver: `${result.Driver.givenName} ${result.Driver.familyName}`,
        team: result.Constructor.name
      }));
    } catch (error) {
      console.error('Erro ao buscar resultados da classificação:', error);
      throw new Error('Não foi possível obter os resultados da última classificação');
    }
  }
}; 
export interface Race {
  round: string;
  raceName: string;
  circuitName: string;
  date: string;
  time?: string;
  country: string;
  firstPractice?: {
    date: string;
    time?: string;
  };
  secondPractice?: {
    date: string;
    time?: string;
  };
  thirdPractice?: {
    date: string;
    time?: string;
  };
  qualifying?: {
    date: string;
    time?: string;
  };
  sprint?: {
    date: string;
    time?: string;
  };
}

export interface F1Calendar {
  year: number;
  races: Race[];
}

export async function getF1Calendar(year: number = new Date().getFullYear()): Promise<F1Calendar> {
  try {
    const response = await fetch(`https://ergast.com/api/f1/${year}.json`);
    const data = await response.json();

    const races: Race[] = data.MRData.RaceTable.Races.map((race: any) => ({
      round: race.round,
      raceName: race.raceName,
      circuitName: race.Circuit.circuitName,
      date: race.date,
      time: race.time,
      country: race.Circuit.Location.country,
      firstPractice: race.FirstPractice,
      secondPractice: race.SecondPractice,
      thirdPractice: race.ThirdPractice,
      qualifying: race.Qualifying,
      sprint: race.Sprint,
    }));

    return {
      year,
      races,
    };
  } catch (error) {
    console.error('Erro ao buscar calendário da F1:', error);
    throw error;
  }
} 
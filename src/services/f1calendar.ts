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

interface F1CalendarResponse {
  MRData: {
    RaceTable: {
      season: string;
      Races: Array<{
        round: string;
        raceName: string;
        Circuit: {
          circuitName: string;
          Location: {
            locality: string;
            country: string;
          }
        };
        date: string;
        time?: string;
        FirstPractice?: {
          date: string;
          time?: string;
        };
        SecondPractice?: {
          date: string;
          time?: string;
        };
        ThirdPractice?: {
          date: string;
          time?: string;
        };
        Qualifying?: {
          date: string;
          time?: string;
        };
        Sprint?: {
          date: string;
          time?: string;
        };
      }>;
    };
  };
}

export async function getF1Calendar(year: number = new Date().getFullYear()): Promise<F1Calendar> {
  try {
    const response = await fetch(`https://api.jolpi.ca/ergast/f1/${year}.json`);
    if (!response.ok) {
      throw new Error('Falha ao buscar calendário da F1');
    }
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
    console.error(`Erro ao buscar calendário da F1 para ${year}:`, error);
    throw error;
  }
}

export async function fetchCalendar(year: number): Promise<F1CalendarResponse> {
  try {
    const response = await fetch(`https://api.jolpi.ca/ergast/f1/${year}.json`);
    if (!response.ok) {
      throw new Error('Falha ao buscar calendário da F1');
    }
    return await response.json();
  } catch (error) {
    console.error(`Erro ao buscar calendário da F1 para ${year}:`, error);
    throw error;
  }
} 
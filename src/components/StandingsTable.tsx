interface Participant {
  id: number;
  name: string;
  team: string;
  points: number;
  lastPosition: number;
  bestResult: number;
  totalPredictions: number;
}

export function StandingsTable({ standings }: { standings: Participant[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-f1-red text-black">
            <th className="py-3 px-4 text-left font-bold">POS</th>
            <th className="py-3 px-4 text-left font-bold">PALPITEIRO</th>
            <th className="py-3 px-4 text-left font-bold">EQUIPE</th>
            <th className="py-3 px-4 text-center font-bold">PONTOS</th>
            <th className="py-3 px-4 text-center font-bold hidden md:table-cell">ÚLTIMA</th>
            <th className="py-3 px-4 text-center font-bold hidden md:table-cell">MELHOR</th>
            <th className="py-3 px-4 text-center font-bold hidden md:table-cell">PALPITES</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((participant, index) => (
            <tr 
              key={participant.id}
              className={`border-b border-gray-200 hover:bg-gray-100 transition-colors ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <td className="py-4 px-4 font-bold">{index + 1}</td>
              <td className="py-4 px-4 font-medium">{participant.name}</td>
              <td className="py-4 px-4 text-gray-600">{participant.team}</td>
              <td className="py-4 px-4 text-center font-bold">{participant.points}</td>
              <td className="py-4 px-4 text-center hidden md:table-cell">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                  participant.lastPosition <= 3 ? 'bg-green-100 text-green-800' : 
                  participant.lastPosition <= 6 ? 'bg-blue-100 text-blue-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {participant.lastPosition}
                </span>
              </td>
              <td className="py-4 px-4 text-center hidden md:table-cell">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                  participant.bestResult <= 3 ? 'bg-green-100 text-green-800' : 
                  participant.bestResult <= 6 ? 'bg-blue-100 text-blue-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {participant.bestResult}
                </span>
              </td>
              <td className="py-4 px-4 text-center hidden md:table-cell">{participant.totalPredictions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 
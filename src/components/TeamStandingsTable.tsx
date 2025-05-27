import { formatScore } from '../utils/formatters';

interface TeamMember {
  id: number;
  name: string;
  points: number;
  bestResult: number;
}

interface Team {
  id: number;
  name: string;
  points: number;
  members: [TeamMember, TeamMember];
  lastPosition: number;
  bestResult: number;
}

export function TeamStandingsTable({ standings }: { standings: Team[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-f1-red text-black">
            <th className="py-3 px-4 text-left font-bold">POS</th>
            <th className="py-3 px-4 text-left font-bold">EQUIPE</th>
            <th className="py-3 px-4 text-left font-bold">PILOTOS</th>
            <th className="py-3 px-4 text-center font-bold">PONTOS</th>
            <th className="py-3 px-4 text-center font-bold hidden md:table-cell">ÚLTIMA</th>
            <th className="py-3 px-4 text-center font-bold hidden md:table-cell">MELHOR</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, index) => (
            <tr 
              key={team.id}
              className={`border-b border-gray-200 hover:bg-gray-100 transition-colors ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <td className="py-4 px-4 font-bold">{index + 1}</td>
              <td className="py-4 px-4">
                <div className="font-bold text-gray-900">{team.name}</div>
              </td>
              <td className="py-4 px-4">
                <div className="space-y-1">
                  {team.members.map(member => (
                    <div key={member.id} className="flex items-center justify-between md:pr-8">
                      <span className="text-gray-600">{member.name}</span>
                      <span className="text-gray-900 font-medium">{formatScore(member.points)} pts</span>
                    </div>
                  ))}
                </div>
              </td>
              <td className="py-4 px-4 text-center font-bold text-xl">{formatScore(team.points)}</td>
              <td className="py-4 px-4 text-center hidden md:table-cell">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                  team.lastPosition <= 3 ? 'bg-green-100 text-green-800' : 
                  team.lastPosition <= 6 ? 'bg-blue-100 text-blue-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {team.lastPosition}
                </span>
              </td>
              <td className="py-4 px-4 text-center hidden md:table-cell">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                  team.bestResult <= 3 ? 'bg-green-100 text-green-800' : 
                  team.bestResult <= 6 ? 'bg-blue-100 text-blue-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {team.bestResult}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 
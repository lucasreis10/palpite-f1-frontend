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
  // Função para cores dos badges de ranking (ouro, prata, bronze)
  const getRankingBadgeColor = (position: number) => {
    if (position === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg'; // Ouro
    if (position === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white shadow-lg'; // Prata
    if (position === 3) return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white shadow-lg'; // Bronze
    return 'bg-blue-500 text-white';
  };

  // Função para cores secundárias (última posição, melhor resultado)
  const getSecondaryBadgeColor = (position: number) => {
    if (position === 1) return 'bg-yellow-100 text-yellow-800 border border-yellow-300'; // Ouro claro
    if (position === 2) return 'bg-gray-100 text-gray-800 border border-gray-300'; // Prata claro
    if (position === 3) return 'bg-amber-100 text-amber-800 border border-amber-300'; // Bronze claro
    if (position <= 6) return 'bg-blue-100 text-blue-800 border border-blue-300';
    return 'bg-gray-100 text-gray-600 border border-gray-200';
  };

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
          {standings.map((team, index) => {
            const currentPosition = index + 1;
            return (
              <tr 
                key={team.id}
                className={`border-b border-gray-200 hover:bg-gray-100 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${getRankingBadgeColor(currentPosition)}`}>
                    {currentPosition}
                  </span>
                </td>
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
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${getSecondaryBadgeColor(team.lastPosition)}`}>
                    {team.lastPosition}
                  </span>
                </td>
                <td className="py-4 px-4 text-center hidden md:table-cell">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${getSecondaryBadgeColor(team.bestResult)}`}>
                    {team.bestResult}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
} 
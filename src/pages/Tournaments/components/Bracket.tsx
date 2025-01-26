import React from "react";

interface Match {
  team1: string;
  team2: string;
  winner: string; // Ganador del partido
}

interface Round {
  name: string;
  matches: Match[];
}

interface BracketProps {
  rounds: Round[];
}

const Bracket: React.FC<BracketProps> = ({ rounds }) => {
  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-5 gap-4 p-4">
        {rounds.map((round, roundIndex) => (
          <div key={roundIndex} className="space-y-6">
            {/* Nombre de la ronda */}
            <h2 className="text-center text-lg font-bold">{round.name}</h2>
            {/* Partidos de la ronda */}
            {round.matches.map((match, matchIndex) => (
              <div
                key={matchIndex}
                className="flex flex-col items-center justify-between p-2 bg-blue-50 border border-gray-300 rounded-lg"
              >
                {/* Equipo 1 */}
                <div
                  className={`w-full text-center p-1 ${
                    match.winner === match.team1 ? "bg-green-200" : ""
                  }`}
                >
                  {match.team1}
                </div>
                {/* Equipo 2 */}
                <div
                  className={`w-full text-center p-1 ${
                    match.winner === match.team2 ? "bg-green-200" : ""
                  }`}
                >
                  {match.team2}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bracket;

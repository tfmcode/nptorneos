import React from "react";
import { TournamentsTable } from "../../../../components/tables";

export interface Match {
  id: number;
  zona: string;
  local: string;
  visitante: string;
  golesLocal: number;
  golesVisitante: number;
  citacion: string;
  partido: string;
  fecha: string;
  sede: string;
  
}

interface TableMatchesProps {
  matches: Match[];
  onSelectMatch?: (idpartido: number) => void;
}

const TableMatches: React.FC<TableMatchesProps> = ({
  matches,
  onSelectMatch,
}) => {
  const zonas = Array.from(new Set(matches.map((m) => m.zona))).sort();

  const data = zonas.map((zona) => {
    const matchesZona = matches.filter((m) => m.zona === zona);

    const rows = matchesZona.map((match) => [
      <span className="font-semibold text-blue-700">{match.local}</span>,
      <span
        className={
          match.golesLocal > match.golesVisitante
            ? "text-blue-600 font-bold"
            : ""
        }
      >
        {match.golesLocal}
      </span>,
      <span className="font-semibold text-blue-700">{match.visitante}</span>,
      <span
        className={
          match.golesVisitante > match.golesLocal
            ? "text-blue-600 font-bold"
            : ""
        }
      >
        {match.golesVisitante}
      </span>,
      match.citacion,
      match.partido,
      match.fecha,
      match.sede,
      <button
        className="px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded text-xs"
        onClick={() => onSelectMatch?.(match.id)}
      >
        Ficha
      </button>,
    ]);

    return {
      zona,
      columns: [
        "Local",
        "Goles",
        "Visitante",
        "Goles",
        "Citación",
        "Partido",
        "Fecha",
        "Sede",
        "Ficha",
      ],
      rows,
    };
  });

  return <TournamentsTable data={data} />;
};

export default TableMatches;

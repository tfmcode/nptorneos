import React, { useState, useMemo } from "react";
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
  nrofecha?: number; // ✅ Agregar campo para fecha
}

interface TableMatchesProps {
  matches: Match[];
  onSelectMatch?: (idpartido: number) => void;
}

const TableMatches: React.FC<TableMatchesProps> = ({
  matches,
  onSelectMatch,
}) => {
  // Obtener todas las fechas únicas y ordenarlas
  const fechasDisponibles = useMemo(() => {
    const fechas = Array.from(
      new Set(
        matches
          .map((m) => m.nrofecha)
          .filter((fecha): fecha is number => fecha !== undefined)
      )
    ).sort((a, b) => a - b);
    return fechas;
  }, [matches]);

  // Estado para la fecha activa (por defecto la primera)
  const [fechaActiva, setFechaActiva] = useState<number>(
    fechasDisponibles[0] || 1
  );

  // Filtrar partidos por fecha seleccionada
  const partidosFecha = useMemo(() => {
    return matches.filter((m) => m.nrofecha === fechaActiva);
  }, [matches, fechaActiva]);

  // Agrupar por zona
  const zonas = Array.from(new Set(partidosFecha.map((m) => m.zona))).sort();

  const data = zonas.map((zona) => {
    const matchesZona = partidosFecha.filter((m) => m.zona === zona);

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

  // Si no hay fechas disponibles, mostrar mensaje
  if (fechasDisponibles.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No hay partidos programados para este torneo.
      </div>
    );
  }

  return (
    <div>
      {/* Tabla de partidos */}
      {partidosFecha.length > 0 ? (
        <TournamentsTable data={data} />
      ) : (
        <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
          No hay partidos programados para la Fecha {fechaActiva}
        </div>
      )}

      {/* Paginado por fechas */}
      <div className="mb-6">
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {fechasDisponibles.map((nroFecha) => (
            <button
              key={nroFecha}
              onClick={() => setFechaActiva(nroFecha)}
              className={`px-4 py-2 rounded font-semibold transition-colors ${
                fechaActiva === nroFecha
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              Fecha {nroFecha}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableMatches;

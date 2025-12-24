// WebApp/src/pages/Public/Tournaments/componentes/TableMatches.tsx

import React, { useState, useMemo } from "react";
import { TournamentsTable } from "../../../../components/tables";
import { getImageUrl } from "../../../../utils/imageUtils";

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
  nrofecha?: number;
  codtipo?: number;
  // ✅ NUEVO: URLs de los logos
  fotoLocal?: string | null;
  fotoVisitante?: string | null;
}

interface TableMatchesProps {
  matches: Match[];
  onSelectMatch?: (idpartido: number) => void;
}

// Función helper para obtener la etiqueta del tipo de partido
const getTipoPartidoLabel = (codtipo?: number): string => {
  const tiposPartido: Record<number, string> = {
    1: "32vos De Final",
    2: "16vos De Final",
    3: "Octavos De Final",
    4: "Cuartos De Final",
    5: "Semifinal",
    6: "Final",
    7: "Tercer Puesto",
    8: "Repechaje",
    9: "Zona",
  };
  return tiposPartido[codtipo ?? 9] || `Tipo ${codtipo}`;
};

// ✅ Componente para mostrar equipo con logo
const EquipoConLogo: React.FC<{
  nombre: string;
  foto?: string | null;
}> = ({ nombre, foto }) => {
  const logoUrl = foto ? getImageUrl(foto, "equipo-escudo") : null;

  return (
    <div className="flex items-center gap-2">
      {/* Logo del equipo */}
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={nombre}
          className="w-8 h-8 object-cover rounded-full border border-gray-200"
          onError={(e) => {
            // Si falla la carga, ocultar la imagen
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        // Placeholder si no hay logo
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500 font-bold border border-gray-300">
          {nombre.substring(0, 2).toUpperCase()}
        </div>
      )}
      {/* Nombre del equipo */}
      <span className="font-semibold text-blue-700">{nombre}</span>
    </div>
  );
};

const TableMatches: React.FC<TableMatchesProps> = ({
  matches,
  onSelectMatch,
}) => {
  // Determinar si usar codtipo o nrofecha
  const usarCodtipo = useMemo(() => {
    // Si al menos un partido tiene codtipo definido y diferente de 9 (zona), usar codtipo
    return matches.some((m) => m.codtipo !== undefined && m.codtipo !== 9);
  }, [matches]);

  // Obtener todas las fechas/tipos únicos y ordenarlos
  const fechasDisponibles = useMemo(() => {
    if (usarCodtipo) {
      const tipos = Array.from(
        new Set(
          matches
            .map((m) => m.codtipo)
            .filter((tipo): tipo is number => tipo !== undefined)
        )
      ).sort((a, b) => a - b);
      return tipos;
    } else {
      const fechas = Array.from(
        new Set(
          matches
            .map((m) => m.nrofecha)
            .filter((fecha): fecha is number => fecha !== undefined)
        )
      ).sort((a, b) => a - b);
      return fechas;
    }
  }, [matches, usarCodtipo]);

  // Estado para la fecha activa (por defecto la primera)
  const [fechaActiva, setFechaActiva] = useState<number>(
    fechasDisponibles[0] || 1
  );

  // Filtrar partidos por fecha/tipo seleccionado
  const partidosFecha = useMemo(() => {
    if (usarCodtipo) {
      return matches.filter((m) => m.codtipo === fechaActiva);
    } else {
      return matches.filter((m) => m.nrofecha === fechaActiva);
    }
  }, [matches, fechaActiva, usarCodtipo]);

  // Agrupar por zona
  const zonas = Array.from(new Set(partidosFecha.map((m) => m.zona))).sort();

  const data = zonas.map((zona) => {
    const matchesZona = partidosFecha.filter((m) => m.zona === zona);

    const rows = matchesZona.map((match) => [
      // ✅ MODIFICADO: Ahora muestra logo + nombre
      <EquipoConLogo nombre={match.local} foto={match.fotoLocal} />,
      <span
        className={
          match.golesLocal > match.golesVisitante
            ? "text-blue-600 font-bold"
            : ""
        }
      >
        {match.golesLocal}
      </span>,
      // ✅ MODIFICADO: Ahora muestra logo + nombre
      <EquipoConLogo nombre={match.visitante} foto={match.fotoVisitante} />,
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
      {/* Paginado por fechas - Ahora ARRIBA */}
      <div className="mb-6">
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {fechasDisponibles.map((valor) => (
            <button
              key={valor}
              onClick={() => setFechaActiva(valor)}
              className={`px-4 py-2 rounded font-semibold transition-colors ${
                fechaActiva === valor
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              {usarCodtipo ? getTipoPartidoLabel(valor) : `Fecha ${valor}`}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de partidos */}
      {partidosFecha.length > 0 ? (
        <TournamentsTable data={data} />
      ) : (
        <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
          No hay partidos programados para{" "}
          {usarCodtipo ? getTipoPartidoLabel(fechaActiva) : `la Fecha ${fechaActiva}`}
        </div>
      )}
    </div>
  );
};

export default TableMatches;

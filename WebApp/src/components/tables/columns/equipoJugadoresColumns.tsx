import { EquipoJugador } from "../../../types/equiposJugadores";

interface ColumnProps {
  onToggleCapitan?: (jugador: EquipoJugador) => void;
  onToggleSubcapitan?: (jugador: EquipoJugador) => void;
  onToggleCodTipo?: (jugador: EquipoJugador) => void;
}

export const createEquipoJugadoresColumns = ({
  onToggleCapitan,
  onToggleSubcapitan,
  onToggleCodTipo,
}: ColumnProps = {}) => [
  {
    header: "Nombre",
    accessor: "nombres" as keyof EquipoJugador,
    sortable: true,
    render: (jugador: EquipoJugador) =>
      `${jugador.nombres || ""} ${jugador.apellido || ""}`.trim() || "—",
  },
  {
    header: "DNI",
    accessor: "docnro" as keyof EquipoJugador,
    sortable: true,
    render: (jugador: EquipoJugador) =>
      jugador.docnro ? jugador.docnro.toString() : "—",
  },
  {
    header: "N° Camiseta",
    accessor: "camiseta" as keyof EquipoJugador,
    sortable: true,
    render: (jugador: EquipoJugador) =>
      jugador.camiseta !== null && jugador.camiseta !== undefined
        ? jugador.camiseta.toString()
        : "—",
  },
  {
    header: "Tipo",
    accessor: "codtipo" as keyof EquipoJugador,
    sortable: true,
    render: (jugador: EquipoJugador) => {
      const esOficial = jugador.codtipo === 1;
      return onToggleCodTipo ? (
        <button
          onClick={() => onToggleCodTipo(jugador)}
          className={`px-2 py-1 rounded text-xs font-medium ${
            esOficial
              ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
              : "bg-purple-100 text-purple-800 hover:bg-purple-200"
          }`}
          title="Click para cambiar tipo"
        >
          {esOficial ? "OFICIAL" : "INVITADO"}
        </button>
      ) : (
        <span
          className={`px-2 py-1 rounded text-xs ${
            esOficial
              ? "bg-blue-100 text-blue-800"
              : "bg-purple-100 text-purple-800"
          }`}
        >
          {esOficial ? "OFICIAL" : "INVITADO"}
        </span>
      );
    },
  },
  {
    header: "Capitán",
    accessor: "capitan" as keyof EquipoJugador,
    sortable: true,
    render: (jugador: EquipoJugador) => {
      const esCapitan = jugador.capitan === 1;
      return onToggleCapitan ? (
        <button
          onClick={() => onToggleCapitan(jugador)}
          className={`px-2 py-1 rounded text-xs font-medium ${
            esCapitan
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          title={
            esCapitan ? "Click para quitar capitán" : "Click para hacer capitán"
          }
        >
          {esCapitan ? "✅ SÍ" : "NO"}
        </button>
      ) : esCapitan ? (
        "✅"
      ) : (
        "—"
      );
    },
  },
  {
    header: "Subcapitán",
    accessor: "subcapitan" as keyof EquipoJugador,
    sortable: true,
    render: (jugador: EquipoJugador) => {
      const esSubcapitan = jugador.subcapitan === 1;
      return onToggleSubcapitan ? (
        <button
          onClick={() => onToggleSubcapitan(jugador)}
          className={`px-2 py-1 rounded text-xs font-medium ${
            esSubcapitan
              ? "bg-orange-500 text-white hover:bg-orange-600"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          title={
            esSubcapitan
              ? "Click para quitar subcapitán"
              : "Click para hacer subcapitán"
          }
        >
          {esSubcapitan ? "✅ SÍ" : "NO"}
        </button>
      ) : esSubcapitan ? (
        "✅"
      ) : (
        "—"
      );
    },
  },
];

// Export de compatibilidad (sin funcionalidad de botones)
export const equipoJugadoresColumns = createEquipoJugadoresColumns();

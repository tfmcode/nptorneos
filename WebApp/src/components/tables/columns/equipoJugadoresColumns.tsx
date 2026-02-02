import { EquipoJugador } from "../../../types/equiposJugadores";

interface ColumnProps {
  onToggleCapitan?: (jugador: EquipoJugador) => void;
  onToggleSubcapitan?: (jugador: EquipoJugador) => void;
  onToggleCodTipo?: (jugador: EquipoJugador) => void;
  onToggleCodEstado?: (jugador: EquipoJugador) => void;
}

// Helper para verificar si el jugador está de baja global
const isJugadorDeBajaGlobal = (jugador: EquipoJugador): boolean => {
  return jugador.jugador_codestado === 0;
};

export const createEquipoJugadoresColumns = ({
  onToggleCapitan,
  onToggleSubcapitan,
  onToggleCodTipo,
  onToggleCodEstado,
}: ColumnProps = {}) => [
  {
    header: "Nombre",
    accessor: "nombres" as keyof EquipoJugador,
    sortable: true,
    render: (jugador: EquipoJugador) => {
      const nombre = `${jugador.nombres || ""} ${jugador.apellido || ""}`.trim() || "—";
      const deBajaGlobal = isJugadorDeBajaGlobal(jugador);

      return (
        <span className={deBajaGlobal ? "text-gray-400 line-through" : ""}>
          {nombre}
          {deBajaGlobal && (
            <span className="ml-2 text-xs text-red-500 font-normal" title="Jugador dado de baja globalmente">
              (BAJA)
            </span>
          )}
        </span>
      );
    },
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
      const deBajaGlobal = isJugadorDeBajaGlobal(jugador);

      if (deBajaGlobal) {
        return (
          <span className="px-2 py-1 rounded text-xs bg-gray-200 text-gray-400">
            {esOficial ? "OFICIAL" : "INVITADO"}
          </span>
        );
      }

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
      const deBajaGlobal = isJugadorDeBajaGlobal(jugador);

      if (deBajaGlobal) {
        return <span className="text-gray-400">—</span>;
      }

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
      const deBajaGlobal = isJugadorDeBajaGlobal(jugador);

      if (deBajaGlobal) {
        return <span className="text-gray-400">—</span>;
      }

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
  {
    header: "Resultados",
    accessor: "codestado" as keyof EquipoJugador,
    sortable: true,
    render: (jugador: EquipoJugador) => {
      const habilitado = jugador.codestado === 1;
      const deBajaGlobal = isJugadorDeBajaGlobal(jugador);

      // Si está de baja global, mostrar bloqueado
      if (deBajaGlobal) {
        return (
          <span
            className="px-2 py-1 rounded text-xs bg-gray-200 text-gray-400 cursor-not-allowed"
            title="Jugador dado de baja globalmente - no puede participar en resultados"
          >
            BLOQUEADO
          </span>
        );
      }

      return onToggleCodEstado ? (
        <button
          onClick={() => onToggleCodEstado(jugador)}
          className={`px-2 py-1 rounded text-xs font-medium ${
            habilitado
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-red-100 text-red-800 hover:bg-red-200"
          }`}
          title={
            habilitado
              ? "Habilitado para resultados - Click para deshabilitar"
              : "Deshabilitado para resultados - Click para habilitar"
          }
        >
          {habilitado ? "HABILITADO" : "DESHABILITADO"}
        </button>
      ) : (
        <span
          className={`px-2 py-1 rounded text-xs ${
            habilitado
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {habilitado ? "HABILITADO" : "DESHABILITADO"}
        </span>
      );
    },
  },
];

// Export de compatibilidad (sin funcionalidad de botones)
export const equipoJugadoresColumns = createEquipoJugadoresColumns();

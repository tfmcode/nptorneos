import { EquipoJugador } from "../../../types/equiposJugadores";
import { Jugador } from "../../../types/jugadores";

export const equipoJugadoresColumns = [
  {
    header: "Nombre",
    render: (jugador: Jugador) => `${jugador.nombres} ${jugador.apellido}`,
  },
  {
    header: "DNI",
    accessor: "docnro" as keyof Jugador,
  },
  {
    header: "N° Camiseta",
    accessor: "camiseta" as keyof EquipoJugador,
    render: (jugador: EquipoJugador) =>
      jugador.camiseta !== null && jugador.camiseta !== undefined
        ? jugador.camiseta
        : "—",
  },
  {
    header: "Tipo",
    accessor: "codtipo" as keyof EquipoJugador,
    render: (jugador: EquipoJugador) => {
      if (jugador.codtipo === 1) return "OFICIAL";
      if (jugador.codtipo === 2) return "INVITADO";
      return "—";
    },
  },
  {
    header: "Capitán",
    accessor: "capitan" as keyof EquipoJugador,
    render: (jugador: EquipoJugador) => (jugador.capitan ? "✅" : "—"),
  },
  {
    header: "Subcapitán",
    accessor: "subcapitan" as keyof EquipoJugador,
    render: (jugador: EquipoJugador) => (jugador.subcapitan ? "✅" : "—"),
  },
];

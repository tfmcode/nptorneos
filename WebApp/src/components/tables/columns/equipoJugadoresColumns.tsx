import { EquipoJugador } from "../../../types/equiposJugadores";

export const equipoJugadoresColumns = [
  {
    header: "Código",
    accessor: "id" as keyof EquipoJugador,
  },
  {
    header: "Apellido",
    accessor: "apellido" as keyof EquipoJugador,
  },
  {
    header: "Nombre",
    accessor: "nombres" as keyof EquipoJugador,
  },
  {
    header: "Documento",
    accessor: "docnro" as keyof EquipoJugador,
  },
  {
    header: "N° Camiseta",
    accessor: "camiseta" as keyof EquipoJugador,
  },
  {
    header: "Capitán",
    accessor: "capitan" as keyof EquipoJugador,
    render: (jugador: EquipoJugador) => (jugador.capitan ? "✅" : "-"),
  },
  {
    header: "Subcapitán",
    accessor: "subcapitan" as keyof EquipoJugador,
    render: (jugador: EquipoJugador) => (jugador.subcapitan ? "✅" : "-"),
  },
  {
    header: "Tipo",
    accessor: "tipo_desc" as keyof EquipoJugador,
    render: (jugador: EquipoJugador) => jugador.tipo_desc ? "OFICIAL" : "INVITADO"
  },
];

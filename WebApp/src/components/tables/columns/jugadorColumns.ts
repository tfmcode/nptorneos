import { Jugador } from "../../../types/jugadores";

export const jugadorColumns = [
  {
    header: "Nombre",
    render: (jugador: Jugador) => `${jugador.nombres} ${jugador.apellido}`,
  },
  {
    header: "Documento",
    accessor: "docnro" as keyof Jugador,
  },
];

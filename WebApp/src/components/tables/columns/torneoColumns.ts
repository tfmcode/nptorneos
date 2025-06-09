import { Torneo } from "../../../types/torneos";

export const torneoColumns = [
  {
    header: "Nombre",
    accessor: "nombre" as keyof Torneo,
  },
  {
    header: "Tipo",
    render: (torneo: Torneo) =>
      torneo.codmodelo === 1
        ? "REGULAR"
        : torneo.codmodelo === 2
        ? "PLAYOFF"
        : "Sin Tipo"
  },
];

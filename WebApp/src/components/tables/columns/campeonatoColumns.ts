import { Campeonato } from "../../../types/campeonato";

export const campeonatoColumns = [
  {
    header: "Nombre",
    accessor: "nombre" as keyof Campeonato,
  },
];

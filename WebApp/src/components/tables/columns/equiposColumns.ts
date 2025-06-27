import { Equipo } from "../../../types/equipos";

export const equipoColumns = [
  {
    header: "Nombre",
    accessor: "nombre" as keyof Equipo,
  }
];

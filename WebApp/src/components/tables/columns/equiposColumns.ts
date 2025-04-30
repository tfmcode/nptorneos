import { Equipo } from "../../../types/equipos";

export const equipoColumns = [
  {
    header: "Nombre",
    accessor: "nombre" as keyof Equipo,
  },
  {
    header: "Abreviatura",
    accessor: "abrev" as keyof Equipo,
  },
  {
    header: "Sede",
    render: (equipo: Equipo) => equipo.sede_nombre || "Sin sede",
  },
];

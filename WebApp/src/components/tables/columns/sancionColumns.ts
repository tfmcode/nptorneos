import { Sancion } from "../../../types/sanciones";

export const sancionColumns = [
  {
    header: "Código",
    accessor: "id" as keyof Sancion,
  },
  {
    header: "Fecha Inicio",
    accessor: "fecha" as keyof Sancion,
    render: (sancion: Sancion) =>
      sancion.fecha ? new Date(sancion.fecha).toLocaleDateString() : "",
  },
  {
    header: "Fecha Fin",
    accessor: "fechafin" as keyof Sancion,
    render: (sancion: Sancion) =>
      sancion.fechafin ? new Date(sancion.fechafin).toLocaleDateString() : "",
  },
  {
    header: "Jugador",
    accessor: "jugador" as keyof Sancion,
    render: (sancion: Sancion) => sancion.jugador ?? "",
  },
  {
    header: "Equipo",
    accessor: "equipo" as keyof Sancion,
    render: (sancion: Sancion) => sancion.equipo ?? "",
  },
  {
    header: "Torneo",
    accessor: "torneo" as keyof Sancion,
    render: (sancion: Sancion) => sancion.torneo ?? "",
  },
];

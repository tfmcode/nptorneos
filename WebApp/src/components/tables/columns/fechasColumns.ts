import { FechaResumen } from "../../../types";

export const fechasColumns = [
  {
    header: "Fecha",
    accessor: "txfecha" as keyof FechaResumen,
  },
  {
    header: "Torneo",
    accessor: "torneo" as keyof FechaResumen,
  },
  {
    header: "Formato",
    accessor: "ftorneo" as keyof FechaResumen,
  },
  {
    header: "Sede",
    accessor: "sede" as keyof FechaResumen,
  },
  {
    header: "SubSede",
    accessor: "subsede" as keyof FechaResumen,
  },
  {
    header: "Turno",
    accessor: "turno" as keyof FechaResumen,
  },
  {
    header: "Cierre",
    accessor: "cierre" as keyof FechaResumen,
  },
  {
    header: "Cierre Caja",
    accessor: "cierrecaja" as keyof FechaResumen,
  },
  {
    header: "Fh Cierre Caja",
    accessor: "txfhcierrecaja" as keyof FechaResumen,
  },
];

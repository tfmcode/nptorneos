import { Partido } from "../../../types";

export const resultadoColumns = [
  {
    header: "Eq. Local",
    accessor: "nombre1" as keyof Partido,
    render: (partido: Partido) => partido.nombre1 ?? "",
  },
  {
    header: "Goles",
    accessor: "goles1" as keyof Partido,
    render: (partido: Partido) => partido.goles1 ?? "",
  },
  {
    header: "P.Bonus",
    accessor: "puntobonus1" as keyof Partido,
    render: (partido: Partido) => partido.puntobonus1 ?? "",
  },
  {
    header: "Eq. Visitante",
    accessor: "nombre2" as keyof Partido,
    render: (partido: Partido) => partido.nombre2 ?? "",
  },
  {
    header: "Goles",
    accessor: "goles2" as keyof Partido,
    render: (partido: Partido) => partido.goles2 ?? "",
  },
  {
    header: "P.Bonus",
    accessor: "puntobonus2" as keyof Partido,
    render: (partido: Partido) => partido.puntobonus2 ?? "",
  },
  {
    header: "Estado",
    accessor: "codestado" as keyof Partido,
    render: (partido: Partido) => partido.codestado ?? "",
  },
  {
    header: "Fecha",
    accessor: "fhcarga" as keyof Partido,
    render: (partido: Partido) =>
      partido.fhcarga ? new Date(partido.fhcarga).toLocaleDateString() : "",
  },
  {
    header: "Sede",
    accessor: "sede" as keyof Partido,
    render: (partido: Partido) => partido.sede ?? "",
  },
  {
    header: "Tipo",
    accessor: "codtipo" as keyof Partido,
    render: (partido: Partido) => partido.codtipo ?? "",
  },
];

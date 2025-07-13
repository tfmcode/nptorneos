import { Inscripcion } from "../../../types/inscripciones";

export const inscripcionColumns = [
  {
    header: "Código",
    accessor: "id" as keyof Inscripcion,
  },
  {
    header: "Equipo",
    accessor: "equipo" as keyof Inscripcion,
    render: (inscripcion: Inscripcion) => inscripcion.equipo ?? "",
  },
  {
    header: "Torneo",
    accessor: "torneo" as keyof Inscripcion,
    render: (inscripcion: Inscripcion) => inscripcion.torneo ?? "",
  },
  {
    header: "Fecha",
    accessor: "fhcarga" as keyof Inscripcion,
    render: (inscripcion: Inscripcion) =>
      inscripcion.fhcarga
        ? new Date(inscripcion.fhcarga).toLocaleDateString()
        : "",
  },
];

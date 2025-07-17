import { InscripcionJugador } from "../../../types/inscripcionesJugadores";

export const inscripcionJugadorColumns = [
  {
    header: "Apellido",
    accessor: "apellido" as keyof InscripcionJugador,
  },
  {
    header: "Nombres",
    accessor: "nombres" as keyof InscripcionJugador,
  },
  {
    header: "N°",
    accessor: "posicion" as keyof InscripcionJugador,
  },
  {
    header: "DNI",
    accessor: "docnro" as keyof InscripcionJugador,
  },
  {
    header: "F. Nacim.",
    accessor: "fhnacimiento" as keyof InscripcionJugador,
    render: (inscripcion: InscripcionJugador) =>
      inscripcion.fhnacimiento
        ? new Date(inscripcion.fhnacimiento).toISOString().split("T")[0]
        : "",
  },
  {
    header: "Teléfono",
    accessor: "telefono" as keyof InscripcionJugador,
  },
  {
    header: "Email",
    accessor: "email" as keyof InscripcionJugador,
  },
  {
    header: "Facebook",
    accessor: "facebook" as keyof InscripcionJugador,
  },
];

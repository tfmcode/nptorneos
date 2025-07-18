import { Partido } from "../../../types/partidos";

export const partidosColumns = [
  {
    header: "Equipo Local",
    accessor: "nombre1" as keyof Partido,
  },
  {
    header: "Goles Local",
    accessor: "goles1" as keyof Partido,
  },
  {
    header: "Equipo Visitante",
    accessor: "nombre2" as keyof Partido,
  },
  {
    header: "Goles Visitante",
    accessor: "goles2" as keyof Partido,
  },
  {
    header: "Estado",
    accessor: "codestado" as keyof Partido,
    render: (partido: Partido) => {
      switch (partido.codestado) {
        case 1:
          return "Pendiente";
        case 2:
          return "En curso";
        case 3:
          return "Finalizado";
      }
    },
  },
  {
    header: "Fecha y Hora",
    accessor: "fecha" as keyof Partido,
    render: (partido: Partido) => {
      if (!partido.fecha) return "";

      try {
        const date = new Date(partido.fecha);
        if (isNaN(date.getTime())) return "";

        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");

        return `${day}/${month}/${year} ${hours}:${minutes} hs`;
      } catch {
        return "";
      }
    },
  },
  {
    header: "Sede",
    accessor: "sede" as keyof Partido,
  },
];

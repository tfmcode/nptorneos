import { Zona } from "../../../types/zonas";

export const zonaColumns = [
  {
    header: "Código",
    accessor: "id" as keyof Zona,
  },
  {
    header: "Nombre",
    accessor: "nombre" as keyof Zona,
  },
  {
    header: "Fechas",
    accessor: "codcantfechas" as keyof Zona,
    render: (zona: Zona) => zona.codcantfechas ?? "",
  },
  {
    header: "Actual",
    accessor: "codfechaactual" as keyof Zona,
    render: (zona: Zona) => zona.codfechaactual ?? "",
  },
];

import { ZonaEquipo } from "../../../types/zonasEquipos";

export const zonasEquiposColumns = [
  {
    header: "Código",
    accessor: "id" as keyof ZonaEquipo,
  },
  {
    header: "Nombre",
    accessor: "nombre" as keyof ZonaEquipo,
  },
  {
    header: "Iniciales",
    accessor: "abrev" as keyof ZonaEquipo,
  },
  {
    header: "Valor Inscripción",
    accessor: "valor_insc" as keyof ZonaEquipo,
    render: (zonaEquipo: ZonaEquipo) => zonaEquipo.valor_insc ?? "",
  },
  {
    header: "Valor Fecha",
    accessor: "valor_fecha" as keyof ZonaEquipo,
    render: (zonaEquipo: ZonaEquipo) => zonaEquipo.valor_fecha ?? "",
  },
];

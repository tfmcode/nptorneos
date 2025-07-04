import { Consentimiento } from "../../../types/consentimientos";

export const consentimientoColumns = [
  {
    header: "Apellido",
    accessor: "apellido" as keyof Consentimiento,
  },
  {
    header: "Nombre",
    accessor: "nombres" as keyof Consentimiento,
  },
  {
    header: "DNI",
    accessor: "docnro" as keyof Consentimiento,
  },
  {
    header: "Fecha",
    render: (consentimiento: Consentimiento) =>
      consentimiento.fhcarga ? consentimiento.fhcarga.substring(0, 10) : "-",
  },
];

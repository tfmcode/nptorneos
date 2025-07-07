import { Proveedor } from "../../../types/proveedores";

export const proveedorColumns = [
  {
    header: "Nombre",
    accessor: "nombre" as keyof Proveedor,
  },
  {
    header: "Tipo",
    render: (proveedor: Proveedor) => {
      switch (proveedor.codtipo) {
        case 1:
          return "ÁRBITRO";
        case 2:
          return "PROFESOR";
        case 3:
          return "SERV. MÉDICO";
        case 4:
          return "OTROS";
        default:
          return "Sin Tipo";
      }
    },
  },
];

import { ListaNegra } from "../../../types/listaNegra";

export const listaNegraColumns = [
  {
    header: "Fecha Sanción",
    accessor: "fecha" as keyof ListaNegra,
  },
  {
    header: "Jugador",
    render: (registro: ListaNegra) =>
      `${registro.nombres ?? "?"} ${registro.apellido ?? "?"}`,
  },
];

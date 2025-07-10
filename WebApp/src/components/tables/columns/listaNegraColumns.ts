import { ListaNegra } from "../../../types/listaNegra";

export const listaNegraColumns = [
  {
    header: "Fecha Sanción",
    render: (registro: ListaNegra) => {
      const fecha = new Date(registro.fecha ?? "");
      return isNaN(fecha.getTime()) ? "-" : fecha.toLocaleDateString("es-AR");
    },
  },
  {
    header: "Jugador",
    render: (registro: ListaNegra) =>
      `${registro.nombres ?? "?"} ${registro.apellido ?? "?"}`,
  },
];

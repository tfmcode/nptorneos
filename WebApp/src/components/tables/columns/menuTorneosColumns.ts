import { MenuTorneo } from "../../../types/menuTorneos";

export const menuTorneosColumns = (
  torneos: { id: number; nombre: string }[]
) => [
  {
    header: "Orden",
    accessor: "orden" as keyof MenuTorneo, 
  },
  {
    header: "Torneo",
    render: (row: MenuTorneo) => {
      const torneo = torneos.find((t) => t.id === row.idtorneo);
      return torneo ? torneo.nombre : "No asignado";
    },
  },
  {
    header: "Descripción",
    accessor: "descripcion" as keyof MenuTorneo, 
  },
];

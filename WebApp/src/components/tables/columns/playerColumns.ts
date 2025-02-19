import { Player } from "../../../types/player";

export const playerColumns = [
  {
    header: "Nombre",
    render: (player: Player) => `${player.firstName} ${player.lastName}`,
  },
  {
    header: "Documento",
    accessor: "document" as keyof Player,
  },
];

import { Championship } from "../../../types/championship";

export const championshipColumns = [
  {
    header: "Nombre",
    accessor: "name" as keyof Championship,
  },
  {
    header: "Deporte",
    accessor: "sport" as keyof Championship,
  },
];

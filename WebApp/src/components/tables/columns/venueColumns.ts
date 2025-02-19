import { Venue } from "../../../types/venue";

export const venueColumns = [
  {
    header: "Nombre",
    accessor: "name" as keyof Venue,
  }
];

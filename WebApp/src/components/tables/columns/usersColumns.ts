import { User } from "../../../types/user";

export const userColumns = [
  { header: "Nombre", accessor: "firstName" as keyof User },
  { header: "Apellido", accessor: "lastName" as keyof User },
  { header: "Email", accessor: "email" as keyof User },
  { header: "Rol", accessor: "role" as keyof User },
  {
    header: "Habilitado",
    accessor: "enabled" as keyof User,
    render: (value: boolean) => (value ? "Sí" : "No"),
  },
];

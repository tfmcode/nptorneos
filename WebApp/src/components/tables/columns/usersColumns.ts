import { User } from "../../../types/user";

export const userColumns = [
  {
    header: "Nombre Completo",
    render: (user: User) => `${user.firstName} ${user.lastName}`,
  },
  { header: "Email", accessor: "email" as keyof User },
];

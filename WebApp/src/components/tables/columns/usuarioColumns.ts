import { Usuario } from "../../../types/usuario"; // 🔹 Cambiado de User a Usuario

export const usuarioColumns = [
  {
    header: "Nombre",
    render: (usuario: Usuario) => `${usuario.nombre} ${usuario.apellido}`, // 🔹 Cambiado de firstName y lastName a nombre y apellido
  },
  { header: "Email", accessor: "email" as keyof Usuario },
];

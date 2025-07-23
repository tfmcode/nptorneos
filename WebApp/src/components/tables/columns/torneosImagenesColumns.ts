import { TorneosImagen } from "../../../types/torneosImagenes";

export const torneosImagenesColumns = [
  {
    header: "Nombre Archivo",
    accessor: "nombre" as keyof TorneosImagen,
  },
  {
    header: "Descripción",
    accessor: "descripcion" as keyof TorneosImagen,
  },
  {
    header: "Imagen",
    accessor: "idimagen" as keyof TorneosImagen,
    render: (imagen: TorneosImagen) =>
      imagen.ubicacion && imagen.nombre ? imagen.ubicacion + imagen.nombre : "",
  },
  {
    header: "Home",
    accessor: "home" as keyof TorneosImagen,
    render: (imagen: TorneosImagen) => (imagen.home === 1 ? "Si" : "No"),
  },
];

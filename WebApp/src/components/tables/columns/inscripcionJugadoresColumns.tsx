// WebApp/src/components/tables/columns/jugadoresColumns.ts
export const inscripcionJugadorColumns = [
  {
    header: "Apellido",
    accessor: "apellido" as const,
    sortable: true,
    width: "150px"
  },
  {
    header: "Nombres", 
    accessor: "nombres" as const,
    sortable: true,
    width: "150px"
  },
  {
    header: "DNI",
    accessor: "docnro" as const,
    sortable: true,
    width: "200px"
  },
  {
    header: "F. Nacim.",
    accessor: "fhnacimiento" as const,
    render: (row: { fhnacimiento?: string | Date | null }) => {
      if (!row.fhnacimiento) return "";
      const fecha = new Date(row.fhnacimiento);
      return fecha.toLocaleDateString('es-AR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    },
    width: "100px"
  },
  {
    header: "Teléfono",
    accessor: "telefono" as const,
    width: "120px"
  },
  {
    header: "N°",
    accessor: "posicion" as const,
    width: "100px"
  }
];
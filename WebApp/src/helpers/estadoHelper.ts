export const getEstadoTexto = (codestado: number): string => {
  const estados: Record<number, string> = {
    10: "No Comenzado",
    20: "Iniciado",
    21: "Primer Tiempo",
    22: "Segundo Tiempo",
    23: "1er Suplementario",
    24: "2do Suplementario",
    25: "Penales",
    30: "Entretiempo",
    40: "Finalizado",
    50: "Suspendido",
    60: "Demorado",
    70: "No Computa",
  };
  return estados[codestado] ?? "-";
};

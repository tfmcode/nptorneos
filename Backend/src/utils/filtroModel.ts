interface FiltroCondicion {
  campo: string;
  operador: string;
  valor: any;
  valorExtra?: any;
}

export function FiltroCondicion(filtros: FiltroCondicion[]) {
  const condiciones: string[] = [];
  const values: any[] = [];

  filtros.forEach((filtro) => {
    if (filtro.valor !== null && filtro.valor !== undefined && filtro.valor !== "") {
      if (filtro.operador.toUpperCase() === "BETWEEN" && filtro.valorExtra !== undefined) {
        values.push(filtro.valor);
        values.push(filtro.valorExtra);
        condiciones.push(`${filtro.campo} BETWEEN $${values.length - 1} AND $${values.length}`);
      } else {
        values.push(filtro.valor);
        condiciones.push(`${filtro.campo} ${filtro.operador} $${values.length}`);
      }
    }
  });

  const where = condiciones.length > 0 ? `WHERE ${condiciones.join(" AND ")}` : "";

  return { where, values };
}

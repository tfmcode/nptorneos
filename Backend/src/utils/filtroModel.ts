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
      const isText = typeof filtro.valor === "string";
      if (filtro.operador.toUpperCase() === "BETWEEN" && filtro.valorExtra !== undefined) {
        values.push(filtro.valor);
        values.push(filtro.valorExtra);
        condiciones.push(`${filtro.campo} BETWEEN $${values.length - 1} AND $${values.length}`);
      } else {
        if (isText) {
          if (filtro.operador.toUpperCase() === "LIKE") {
            condiciones.push(`LOWER(${filtro.campo}) LIKE LOWER($${values.length + 1})`);
            values.push(`%${filtro.valor}%`);
          } else {
            condiciones.push(`LOWER(${filtro.campo}) ${filtro.operador} LOWER($${values.length + 1})`);
            values.push(filtro.valor);
          }
        } else {
          condiciones.push(`${filtro.campo} ${filtro.operador} $${values.length + 1}`);
          values.push(filtro.valor);
        }
      }
    }
  });

  const where = condiciones.length > 0 ? `WHERE ${condiciones.join(" AND ")}` : "";

  return { where, values };
}

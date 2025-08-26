import { pool } from "../config/db";
import { FiltroCondicion } from "../utils/filtroModel";

export interface IComprobante {
  codigo: number;
  descripcion: string;
  dc: number;
  visible: number;
  modulo: number;
}

export enum Modulo {
  Facturacion = 1,
  CajaMovimiento = 2,
}

const crComprobante = `codigo, descripcion, dc, visible, modulo`;


export const getAllComprobantes = async (): Promise<IComprobante[]> => {
  const { rows } = await pool.query(
    `SELECT ${crComprobante} FROM comprobante ORDER BY descripcion;`
  );
  return rows;
};

export const getComprobanteByModulo = async (modulo: Modulo): Promise<IComprobante[] | null> => {
  const { rows } = await pool.query(
    `SELECT ${crComprobante} FROM comprobante WHERE modulo = $1 And visible = 1;`,
    [modulo]
  );
  return rows.length > 0 ? rows : null;
};

export const getComprobanteByCodigo = async (codigo: string): Promise<IComprobante | null> => {
  const { rows } = await pool.query(
    `SELECT ${crComprobante} FROM comprobante WHERE codigo = $1;`,
    [codigo]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const getComprobanteVisible = async (visible: number): Promise<IComprobante | null> => {

    let query: string;
    const filtros = 
        [
        { campo: "visible", operador: "=", valor: visible }
        ];
   const { where, values } = FiltroCondicion(filtros);

    query = `SELECT ${crComprobante} FROM comprobante
        ${where}
        ORDER BY descripcion
        `;

    console.log("Filtros: ", "visible: ", visible);
    console.log("Query: ", query);
    console.log("values: ", values);

    const { rows } = await pool.query(query, values);
    return rows.length > 0 ? rows[0] : null;
};

export const getComprobantes = async ({
  page,
  limit,
  searchTerm
}: {
  page: number;
  limit: number;
  searchTerm: string;
}): Promise<{ comprobantes: IComprobante[]; total: number }> => {
  const offset = (page - 1) * limit;

  let totalQuery: string;
  let query: string;
  const filtros = 
    [
      { campo: "descripcion", operador: "LIKE", valor: searchTerm }
    ];
  const { where, values } = FiltroCondicion(filtros);
  const totalValues = values.slice();

  totalQuery = `SELECT COUNT(0) FROM comprobante ${where}`
  query = `
    SELECT ${crComprobante} FROM comprobante
    ${where}
    ORDER BY descripcion
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `;

  // limit y offset al final
  values.push(limit);
  values.push(offset);

  
  console.log("Filtros: ", "searchTerm: ", searchTerm, "limit: ", limit, "page: ", page, "offset: ", offset);
  console.log("Query: ", query);
  console.log("values: ", values);
  console.log("Total Query: ", totalQuery);
  console.log("Total values: ", totalValues);

  const totalResult = await pool.query(totalQuery, totalValues);
  const { rows } = await pool.query(query, values);

  console.log("total result:" , totalResult.rows[0].count);
  console.log("rows: ", rows);

  return {
    comprobantes: rows,
    total: parseInt(totalResult.rows[0].count, 10),
  };
};

export const createComprobante = async (comprobante: IComprobante): Promise<IComprobante> => {

  const { rows } = await pool.query(
    `INSERT INTO comprobante (${crComprobante}) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *;`,
    [
      comprobante.codigo,
      comprobante.descripcion,
      comprobante.dc,
      comprobante.visible
    ]
  );
  return rows[0];
};

export const updateComprobante = async (
  codigo: string,
  comprobante: Partial<IComprobante>
): Promise<IComprobante | null> => {
  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  for (const key in comprobante) {
    if (comprobante[key as keyof IComprobante] !== undefined) {
      updates.push(`${key} = $${index}`);
      values.push(comprobante[key as keyof IComprobante]);
      index++;
    }
  }

  if (updates.length === 0) {
    throw new Error("No hay datos para actualizar.");
  }

  values.push(codigo);
  const query = `UPDATE comprobante SET ${updates.join(
    ", "
  )} WHERE codigo = $${index} RETURNING *;`;

  const { rows } = await pool.query(query, values);
  return rows.length > 0 ? rows[0] : null;
};

export const deleteComprobante = async (codigo: string): Promise<boolean> => {
  try {
    const result = await pool.query(
      "DELETE FROM comprobante WHERE codigo = $1;",
      [codigo]
    );

    return (result.rowCount ?? 0) > 0; 
  } catch (error) {
    console.error("❌ Error al eliminar Comprobante:", error);
    throw new Error("Error al eliminar la Comprobante.");
  }
};

import { pool } from "../config/db";
import { dateToSqlValue } from "../helpers/dateHelpers";
import { FiltroCondicion } from "../utils/filtroModel";

export interface IFactura {
  id: number;
  fechaorigen: Date;
  proveedor: string;
  comprobante: string;
  tipo: string;
  nrocomprobante: number;
  fechavencimiento: Date;
  formapago?: string;
  pagoautomatico: boolean;
  importesubtotal: number;
  importeingrbru: number;
  importeiva: number;
  alicuotaingrbru: number;
  alicuotaiva: number;
  importetotal: number;
  estado: string;
  importependafectar: number;
  afecta: number;
}

const crFactura = `id, fechaorigen, proveedor, comprobante, tipo, nrocomprobante, fechavencimiento, formapago, pagoautomatico, 
                  importesubtotal, importeingrbru, importeiva, alicuotaingrbru, alicuotaiva, importetotal, estado, importependafectar, afecta`;


export const getAllFacturas = async (): Promise<IFactura[]> => {
  const { rows } = await pool.query(
    `SELECT ${crFactura} FROM wFactura ORDER BY id DESC;`
  );
  return rows;
};

export const getFacturaById = async (id: number): Promise<IFactura | null> => {
  const { rows } = await pool.query(
    `SELECT ${crFactura} FROM wFactura WHERE id = $1;`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const getFacturas = async ({
  page,
  limit,
  searchTerm,
  fechaDesde,
  fechaHasta,
}: {
  page: number;
  limit: number;
  searchTerm: string;
  fechaDesde: Date;
  fechaHasta: Date;
}): Promise<{ facturas: IFactura[]; total: number }> => {
  const offset = (page - 1) * limit;

  let totalQuery: string;
  let query: string;
  const filtros = 
    [
      { campo: "nrocomprobante", operador: "=", valor: searchTerm },
      { campo: "fechaorigen", operador: "BETWEEN", valor: dateToSqlValue(fechaDesde), valorExtra: dateToSqlValue(fechaHasta) },
    ];
  const { where, values } = FiltroCondicion(filtros);
  const totalValues = values.slice();

  totalQuery = `SELECT COUNT(0) FROM wfactura ${where}`
  query = `
    SELECT ${crFactura} FROM wFactura
    ${where}
    ORDER BY fechaorigen
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `;

  // limit y offset al final
  values.push(limit);
  values.push(offset);

  
  console.log("Filtros: ", "searchTerm: ", searchTerm, "fechaDesde: ", fechaDesde, "fechaHasta: ", fechaHasta, "limit: ", limit, "page: ", page, "offset: ", offset);
  console.log("Query: ", query);
  console.log("values: ", values);
  console.log("Total Query: ", totalQuery);
  console.log("Total values: ", totalValues);

  const totalResult = await pool.query(totalQuery, totalValues);
  const { rows } = await pool.query(query, values);

  console.log("total result:" , totalResult.rows[0].count);
  console.log("rows: ", rows);

  return {
    facturas: rows,
    total: parseInt(totalResult.rows[0].count, 10),
  };
};

export const createFactura = async (factura: IFactura): Promise<IFactura> => {
  const camposFactura = `fechaorigen, proveedor, comprobante, tipo, nrocomprobante, fechavencimiento, formapago, pagoautomatico, 
                        importesubtotal, importeingrbru, importeiva, alicuotaingrbru, alicuotaiva, importetotal, estado, importependafectar, afecta`

  const { rows } = await pool.query(
    `INSERT INTO wFactura (${camposFactura}) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) 
     RETURNING *;`,
    [
      factura.fechaorigen,
      factura.proveedor,
      factura.comprobante,
      factura.tipo,
      factura.nrocomprobante,
      factura.fechavencimiento,
      factura.formapago,
      factura.pagoautomatico,
      factura.importesubtotal,
      factura.importeingrbru,
      factura.importeiva,
      factura.alicuotaingrbru,
      factura.alicuotaiva,
      factura.importetotal,
      factura.estado,
      factura.importetotal, // Importe Pend. afectar (al insertar es el total)
      1 // Afecta = 1
    ]
  );
  return rows[0];
};

export const updateFactura = async (
  id: number,
  factura: Partial<IFactura>
): Promise<IFactura | null> => {
  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  for (const key in factura) {
    if (factura[key as keyof IFactura] !== undefined) {
      updates.push(`${key} = $${index}`);
      values.push(factura[key as keyof IFactura]);
      index++;
    }
  }

  if (updates.length === 0) {
    throw new Error("No hay datos para actualizar.");
  }

  values.push(id);
  const query = `UPDATE wFactura SET ${updates.join(
    ", "
  )} WHERE id = $${index} RETURNING *;`;

  const { rows } = await pool.query(query, values);
  return rows.length > 0 ? rows[0] : null;
};

export const deleteFactura = async (id: number): Promise<boolean> => {
  try {
    const result = await pool.query(
      "UPDATE wFactura SET estado = 'AN' WHERE id = $1;",
      [id]
    );

    return (result.rowCount ?? 0) > 0; 
  } catch (error) {
    console.error("❌ Error al eliminar Factura:", error);
    throw new Error("Error al eliminar la Factura.");
  }
};

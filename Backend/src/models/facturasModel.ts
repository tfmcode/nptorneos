import { pool } from "../config/db";
import { FiltroCondicion } from "../utils/filtroModel";

export interface IFactura {
  id: number;
  fechaOrigen: Date;
  proveedor: string;
  comprobante: string;
  tipo: string;
  nroComprobante: number;
  fechaVencimiento: Date;
  formaPago?: string;
  pagoAutomatico: boolean;
  importeSubtotal: number;
  importeIngrBru: number;
  importeIva: number;
  alicuotaIngrBru: number;
  alicuotaIVA: number;
  importeTotal: number;
  estado: string;
}

const crFactura = `id, fechaOrigen, proveedor, comprobante, tipo, nroComprobante, fechaVencimiento, formaPago, pagoAutomatico, importeSubtotal, importeIngrBru, importeIva, alicuotaIngrBru, alicuotaIVA, importeTotal, estado`;


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
      { campo: "nroComprobante", operador: "=", valor: searchTerm },
      { campo: "fechaOrigen", operador: "BETWEEN", valor: fechaDesde, valorExtra: fechaHasta },
    ];
  const { where, values } = FiltroCondicion(filtros);
  const totalValues = values.slice();

  totalQuery = `SELECT COUNT(0) FROM wfactura ${where}`
  query = `
    SELECT ${crFactura} FROM wFactura
    ${where}
    ORDER BY fechaOrigen
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `;

  // limit y offset al final
  values.push(limit);
  values.push(offset);

  
  console.log("Filtros: ", "searchTerm: ", searchTerm, "fechaDesde: ", fechaDesde, "fechaHasta: ", fechaHasta, "limit: ", limit, "page: ", page);
  console.log("Query: ", query);
  console.log("values: ", values);
  console.log("Total Query: ", totalQuery);
  console.log("Total values: ", totalValues);

  const totalResult = await pool.query(totalQuery, totalValues);
  const { rows } = await pool.query(query, values);

  return {
    facturas: rows,
    total: parseInt(totalResult.rows[0].count, 10),
  };
};

export const createFactura = async (factura: IFactura): Promise<IFactura> => {
  const camposFactura = `fechaOrigen, proveedor, comprobante, tipo, nroComprobante, fechaVencimiento, formaPago, pagoAutomatico, importeSubtotal, importeIngrBru, importeIva, alicuotaIngrBru, alicuotaIVA, importeTotal, estado`

  const { rows } = await pool.query(
    `INSERT INTO wFactura (${camposFactura}) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
     RETURNING *;`,
    [
      factura.fechaOrigen,
      factura.proveedor,
      factura.comprobante,
      factura.tipo,
      factura.nroComprobante,
      factura.fechaVencimiento,
      factura.formaPago,
      factura.pagoAutomatico,
      factura.importeSubtotal,
      factura.importeIngrBru,
      factura.importeIva,
      factura.alicuotaIngrBru,
      factura.alicuotaIVA,
      factura.importeTotal,
      factura.estado
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

import { pool } from "../config/db";
import { dateToSqlValue } from "../helpers/dateHelpers";
import { FiltroCondicion } from "../utils/filtroModel";

export interface IFactura {
  id: number;
  fechaorigen: Date;
  proveedor: number;
  proveedornombre?: string;
  comprobante: string;
  desccomprobante?: string;
  tipo: string;
  nrocomprobante: number;
  fechavencimiento: Date;
  formapago?: number;
  pagoautomatico: boolean;
  importesubtotal: number;
  importeingrbru: number;
  importeiva: number;
  alicuotaingrbru: number;
  alicuotaiva: number;
  importetotal: number;
  dc?: number;
  estado: string;
  importependafectar: number;
  afecta: number;
}

export const crFactura = `F.id, F.fechaorigen, F.proveedor, F.comprobante, F.tipo, F.nrocomprobante, F.fechavencimiento, F.formapago, F.pagoautomatico, 
                          F.importesubtotal, F.importeingrbru, F.importeiva, F.alicuotaingrbru, F.alicuotaiva, F.importetotal, F.dc, F.estado, F.importependafectar, F.afecta`;

export const getAllFacturas = async (): Promise<IFactura[]> => {
  const { rows } = await pool.query(
    `SELECT ${crFactura}, C.descripcion AS desccomprobante, P.nombre AS proveedornombre
     FROM wFactura F
     LEFT OUTER JOIN comprobante C ON C.codigo = F.comprobante
     LEFT OUTER JOIN proveedores P ON P.id = F.proveedor
     ORDER BY F.id DESC;`
  );
  return rows;
};

export const getFacturaById = async (id: number): Promise<IFactura | null> => {
  const { rows } = await pool.query(
    `SELECT ${crFactura}, C.descripcion AS desccomprobante, P.nombre AS proveedornombre
     FROM wFactura F
     LEFT OUTER JOIN comprobante C ON C.codigo = F.comprobante
     LEFT OUTER JOIN proveedores P ON P.id = F.proveedor
     WHERE F.id = $1;`,
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
  const filtros = [
    {
      campo: "F.nrocomprobante",
      operador: "=",
      valor: searchTerm != "" ? parseInt(searchTerm) : searchTerm,
    },
    {
      campo: "F.fechaorigen",
      operador: "BETWEEN",
      valor: dateToSqlValue(fechaDesde),
      valorExtra: dateToSqlValue(fechaHasta),
    },
  ];
  const { where, values } = FiltroCondicion(filtros);
  const totalValues = values.slice();

  totalQuery = `SELECT COUNT(0) FROM wfactura F ${where}`;
  query = `
    SELECT ${crFactura}, C.descripcion AS desccomprobante, P.nombre AS proveedornombre
    FROM wFactura AS F
    LEFT OUTER JOIN comprobante AS C ON C.codigo = F.comprobante
    LEFT OUTER JOIN proveedores AS P ON P.id = F.proveedor
    ${where}
    ORDER BY F.fechaorigen DESC
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `;

  values.push(limit);
  values.push(offset);

  console.log(
    "Filtros: ",
    "searchTerm: ",
    searchTerm,
    "fechaDesde: ",
    fechaDesde,
    "fechaHasta: ",
    fechaHasta,
    "limit: ",
    limit,
    "page: ",
    page,
    "offset: ",
    offset
  );
  console.log("Query: ", query);
  console.log("values: ", values);

  const totalResult = await pool.query(totalQuery, totalValues);
  const { rows } = await pool.query(query, values);

  return {
    facturas: rows,
    total: parseInt(totalResult.rows[0].count, 10),
  };
};

export const createFactura = async (factura: IFactura): Promise<IFactura> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows: compRows } = await client.query(
      `SELECT dc FROM comprobante WHERE codigo = $1`,
      [factura.comprobante]
    );

    if (compRows.length === 0) {
      throw new Error("Comprobante no encontrado");
    }

    const dc = compRows[0].dc;

    const importeTotalConDC = factura.importetotal * dc;
    const importePendAfectar = importeTotalConDC;

    const camposFactura = `fechaorigen, proveedor, comprobante, tipo, nrocomprobante, fechavencimiento, formapago, pagoautomatico, 
                          importesubtotal, importeingrbru, importeiva, alicuotaingrbru, alicuotaiva, importetotal, dc, estado, importependafectar, afecta`;

    const { rows } = await client.query(
      `INSERT INTO wFactura (${camposFactura}) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) 
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
        importeTotalConDC,
        dc,
        factura.estado || "PE",
        importePendAfectar,
        1,
      ]
    );

    await client.query("COMMIT");
    return rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error al crear factura:", error);
    throw error;
  } finally {
    client.release();
  }
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

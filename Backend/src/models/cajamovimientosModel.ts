import { pool } from "../config/db";
import { dateToSqlValue } from "../helpers/dateHelpers";
import { FiltroCondicion } from "../utils/filtroModel";
import { IFactura, crFactura } from "./facturasModel"; // o el path correcto si está en otra carpeta

export interface ICajaMovimiento {
  id: number;
  fechaorigen: Date;
  proveedor: string;
  comprobante: string;
  desccomprobante?: string;
  nrocomprobante: number;
  fechavencimiento: Date;
  importeefectivo: number;
  importecheque: number;
  importeafectado: number;
  importeneto: number;
  estado: string;
  cajaafectacion: ICajaAfectacion[];
}

export interface ICajaAfectacion {
  id: number;
  cajamovimiento: number;
  factura: number;
  importeafectado: number;
  afenrocomprobante: number;
  afedesccomprobante: string;
}

const crCajaMovimiento = `id, fechaorigen, proveedor, comprobante, nrocomprobante, fechavencimiento, importeefectivo, 
                        importecheque, importeafectado, importeneto, estado`;


export const getAllCajaMovimiento = async (): Promise<ICajaMovimiento[]> => {
  const { rows } = await pool.query(
    `SELECT ${crCajaMovimiento} FROM CajaMovimiento ORDER BY id DESC;`
  );

  for (const row of rows) {
    const { rows: afectaciones } = await pool.query(
      `SELECT id, cajamovimiento, factura, importeafectado FROM CajaAfectacion WHERE cajamovimiento = $1`,
      [row.id]
    );
    row.cajaafectacion = afectaciones;
  }
  return rows;
};

export const getCajaMovimientoById = async (id: number): Promise<ICajaMovimiento | null> => {
  const { rows } = await pool.query(
    `SELECT ${crCajaMovimiento} FROM CajaMovimiento WHERE id = $1;`,
    [id]
  );

  if (rows.length === 0) return null;

  const movimiento = rows[0];

  const { rows: afectaciones } = await pool.query(
    `SELECT CA.id, CA.cajamovimiento, CA.factura, CA.importeafectado, C.descripcion AS afedesccomprobante, F.nrocomprobante AS afenrocomprobante
      FROM CajaAfectacion AS CA
      LEFT OUTER JOIN WFACTURA  AS F ON F.id = CA.factura
      LEFT OUTER JOIN COMPROBANTE AS C ON C.codigo = F.Comprobante
    WHERE cajamovimiento = $1`,
    [id]
  );

  movimiento.cajaafectacion = afectaciones;

  return movimiento;
};

export const getCajaMovimientos = async ({
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
}): Promise<{ cajamovimientos: ICajaMovimiento[]; total: number }> => {
  const offset = (page - 1) * limit;

  let totalQuery: string;
  let query: string;
  const filtros = 
    [
      { campo: "nrocomprobante", operador: "=", valor: searchTerm != "" ? parseInt(searchTerm) : searchTerm  },
      { campo: "fechaorigen", operador: "BETWEEN", valor: dateToSqlValue(fechaDesde), valorExtra: dateToSqlValue(fechaHasta) },
    ];
  const { where, values } = FiltroCondicion(filtros);
  const totalValues = values.slice();

  totalQuery = `SELECT COUNT(0) FROM CajaMovimiento ${where}`
  query = `
    SELECT ${crCajaMovimiento}, C.Descripcion AS desccomprobante
    FROM CajaMovimiento AS F
    LEFT OUTER JOIN comprobante AS C ON C.codigo = F.comprobante
    ${where}
    ORDER BY fechaorigen
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `;

  // limit y offset al final
  values.push(limit);
  values.push(offset);

  
  // console.log("Filtros: ", "searchTerm: ", searchTerm, "fechaDesde: ", fechaDesde, "fechaHasta: ", fechaHasta, "limit: ", limit, "page: ", page, "offset: ", offset);
  // console.log("Query: ", query);
  // console.log("values: ", values);
  // console.log("Total Query: ", totalQuery);
  // console.log("Total values: ", totalValues);

  const totalResult = await pool.query(totalQuery, totalValues);
  const { rows } = await pool.query(query, values);

  for (const row of rows) {
    const { rows: afectaciones } = await pool.query(
      `SELECT CA.id, CA.cajamovimiento, CA.factura, CA.importeafectado, C.descripcion AS afedesccomprobante, F.nrocomprobante AS afenrocomprobante
      FROM CajaAfectacion AS CA
      LEFT OUTER JOIN WFACTURA  AS F ON F.id = CA.factura
      LEFT OUTER JOIN COMPROBANTE AS C ON C.codigo = F.Comprobante
      WHERE cajamovimiento = $1`,
      [row.id]
    );
    row.cajaafectacion = afectaciones;
  }

  // console.log("total result:" , totalResult.rows[0].count);
  // console.log("rows: ", rows);

  return {
    cajamovimientos: rows,
    total: parseInt(totalResult.rows[0].count, 10),
  };
};

export const createCajaMovimiento = async (cajamovimiento: ICajaMovimiento): Promise<ICajaMovimiento> => {
  const camposCajaMovimiento = `fechaorigen, proveedor, comprobante, nrocomprobante, fechavencimiento, importeefectivo,
                        importecheque, importeafectado, importeneto, estado`

  const client = await pool.connect();

  try
  {
    console.log("Caja movimiento front: ", cajamovimiento);


    await client.query("BEGIN");

    const { rows } = await pool.query(
      `INSERT INTO CajaMovimiento (${camposCajaMovimiento}) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *;`,
      [
        cajamovimiento.fechaorigen,
        cajamovimiento.proveedor,
        cajamovimiento.comprobante,
        cajamovimiento.nrocomprobante,
        cajamovimiento.fechavencimiento,
        cajamovimiento.importeefectivo,
        cajamovimiento.importecheque,
        cajamovimiento.importeafectado,
        cajamovimiento.importeneto,
        cajamovimiento.estado
      ]
    );

    const NewCajaMovimientoID = rows[0].id;
    console.log("id nuevo:", NewCajaMovimientoID);

    // Insertar en CajaAfectacion si existe
    if (Array.isArray(cajamovimiento.cajaafectacion)) {
      for (const afectacion of cajamovimiento.cajaafectacion) {
        await client.query(
          `INSERT INTO CajaAfectacion (cajamovimiento, factura, importeafectado) 
           VALUES ($1, $2, $3);`,
          [
            NewCajaMovimientoID,
            afectacion.factura,
            afectacion.importeafectado ?? 0,
          ]
        );
        
        console.log("Importe  pend afectar - importeafectado:", afectacion.importeafectado);

        await client.query(
          `UPDATE wFactura
          SET importependafectar = importependafectar - $2,
              afecta = CASE WHEN importependafectar - $2 = 0 THEN 2 ELSE 1 END
          WHERE id = $1;`,
          [afectacion.factura, afectacion.importeafectado ?? 0]
        );
      }
    }

    await client.query("COMMIT");
    return rows[0];
  }
  catch (error) 
  {
    await client.query("ROLLBACK");
    console.error("Error en createCajaMovimiento:", error);
    throw error;
  }
  finally
  {
    client.release();
  }
};

export const updateCajaMovimiento = async (
  id: number,
  cajamovimiento: Partial<ICajaMovimiento>
): Promise<ICajaMovimiento | null> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const updates: string[] = [];
    const values: any[] = [];
    let index = 1;

    for (const key in cajamovimiento) {
      if (
        key !== "cajaafectacion" &&
        cajamovimiento[key as keyof ICajaMovimiento] !== undefined
      ) {
        updates.push(`${key} = $${index}`);
        values.push(cajamovimiento[key as keyof ICajaMovimiento]);
        index++;
      }
    }

    if (updates.length === 0) {
      throw new Error("No hay datos para actualizar.");
    }

    values.push(id);
    const query = `UPDATE CajaMovimiento SET ${updates.join(
      ", "
    )} WHERE id = $${index} RETURNING *;`;

    const { rows } = await client.query(query, values);

    // 2. Eliminar afectaciones anteriores
    await client.query(`DELETE FROM CajaAfectacion WHERE cajamovimiento = $1`, [id]);

    // 3. Insertar nuevas afectaciones si las hay
    if (
      Array.isArray(cajamovimiento.cajaafectacion) &&
      cajamovimiento.cajaafectacion.length > 0
    ) {
      for (const afectacion of cajamovimiento.cajaafectacion) {
        await client.query(
          `INSERT INTO CajaAfectacion (cajamovimiento, factura, importeafectado)
           VALUES ($1, $2, $3)`,
          [
            id,
            afectacion.factura,
            afectacion.importeafectado ?? 0,
          ]
        );
      }
    }

    await client.query("COMMIT");
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error en updateCajaMovimiento:", error);
    throw new Error("Error al actualizar el movimiento de caja.");
  } finally {
    client.release();
  }
};

export const deleteCajaMovimiento = async (id: number): Promise<boolean> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(`DELETE FROM CajaAfectacion WHERE cajamovimiento = $1`, [id]);

    const result = await client.query(
      "DELETE FROM CajaMovimiento WHERE id = $1;",
      [id]
    );

    // Marcar el movimiento como anulado
    // const result = await client.query(
    //   "UPDATE CajaMovimiento SET estado = 'AN' WHERE id = $1;",
    //   [id]
    // );
    await client.query("COMMIT");

    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error al eliminar movimiento de caja:", error);
    throw new Error("Error al eliminar el movimiento de caja.");
  } finally {
    client.release();
  }
};


export const getCajaMovimientoFacturasPendientes = async (
  proveedor: string,
  dc?: number
): Promise<IFactura[]> => {
  try {
    let query = `
      SELECT ${crFactura}, C.Descripcion AS desccomprobante
      FROM wFactura AS F
      LEFT OUTER JOIN COMPROBANTE AS C ON C.Codigo = F.Comprobante
      WHERE proveedor = $1
        AND afecta = 1
        AND importependafectar <> 0
    `;

    const values: any[] = [proveedor];

    if (dc !== undefined) {
      query += ` AND dc = $2`;
      values.push(dc);
    }

    query += ` ORDER BY fechaorigen`;

    const { rows } = await pool.query(query, values);
    return rows;
  } catch (error) {
    console.error("❌ Error al obtener facturas pendientes:", error);
    throw new Error("Error al obtener facturas pendientes.");
  }
};
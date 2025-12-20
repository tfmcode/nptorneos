import { pool } from "../config/db";
import { dateToSqlValue } from "../helpers/dateHelpers";
import { FiltroCondicion } from "../utils/filtroModel";
import { IFactura, crFactura } from "./facturasModel";

export interface ICajaMovimiento {
  id: number;
  fechaorigen: Date;
  proveedor: number;
  proveedornombre?: string;
  comprobante: string;
  desccomprobante?: string;
  nrocomprobante: number;
  fechavencimiento: Date;
  importeefectivo: number;
  importecheque: number;
  importeafectado: number;
  importeneto: number;
  dc?: number;
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

const crCajaMovimiento = `CM.id, CM.fechaorigen, CM.proveedor, CM.comprobante, CM.nrocomprobante, CM.fechavencimiento, CM.importeefectivo, 
                        CM.importecheque, CM.importeafectado, CM.importeneto, CM.dc, CM.estado`;

export const getAllCajaMovimiento = async (): Promise<ICajaMovimiento[]> => {
  const { rows } = await pool.query(
    `SELECT ${crCajaMovimiento}, C.descripcion AS desccomprobante, P.nombre AS proveedornombre
     FROM CajaMovimiento CM
     LEFT OUTER JOIN comprobante C ON C.codigo = CM.comprobante
     LEFT OUTER JOIN proveedores P ON P.id = CM.proveedor
     ORDER BY CM.id DESC;`
  );

  for (const row of rows) {
    const { rows: afectaciones } = await pool.query(
      `SELECT CA.id, CA.cajamovimiento, CA.factura, CA.importeafectado, C.descripcion AS afedesccomprobante, F.nrocomprobante AS afenrocomprobante
       FROM CajaAfectacion AS CA
       LEFT OUTER JOIN WFACTURA AS F ON F.id = CA.factura
       LEFT OUTER JOIN COMPROBANTE AS C ON C.codigo = F.Comprobante
       WHERE cajamovimiento = $1`,
      [row.id]
    );
    row.cajaafectacion = afectaciones;
  }
  return rows;
};

export const getCajaMovimientoById = async (
  id: number
): Promise<ICajaMovimiento | null> => {
  const { rows } = await pool.query(
    `SELECT ${crCajaMovimiento}, C.descripcion AS desccomprobante, P.nombre AS proveedornombre
     FROM CajaMovimiento CM
     LEFT OUTER JOIN comprobante C ON C.codigo = CM.comprobante
     LEFT OUTER JOIN proveedores P ON P.id = CM.proveedor
     WHERE CM.id = $1;`,
    [id]
  );

  if (rows.length === 0) return null;

  const movimiento = rows[0];

  const { rows: afectaciones } = await pool.query(
    `SELECT CA.id, CA.cajamovimiento, CA.factura, CA.importeafectado, C.descripcion AS afedesccomprobante, F.nrocomprobante AS afenrocomprobante
     FROM CajaAfectacion AS CA
     LEFT OUTER JOIN WFACTURA AS F ON F.id = CA.factura
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
  const filtros = [
    {
      campo: "CM.nrocomprobante",
      operador: "=",
      valor: searchTerm != "" ? parseInt(searchTerm) : searchTerm,
    },
    {
      campo: "CM.fechaorigen",
      operador: "BETWEEN",
      valor: dateToSqlValue(fechaDesde),
      valorExtra: dateToSqlValue(fechaHasta),
    },
  ];
  const { where, values } = FiltroCondicion(filtros);
  const totalValues = values.slice();

  totalQuery = `SELECT COUNT(0) FROM CajaMovimiento CM ${where}`;
  query = `
    SELECT ${crCajaMovimiento}, C.descripcion AS desccomprobante, P.nombre AS proveedornombre
    FROM CajaMovimiento AS CM
    LEFT OUTER JOIN comprobante AS C ON C.codigo = CM.comprobante
    LEFT OUTER JOIN proveedores AS P ON P.id = CM.proveedor
    ${where}
    ORDER BY CM.fechaorigen DESC
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `;

  values.push(limit);
  values.push(offset);

  const totalResult = await pool.query(totalQuery, totalValues);
  const { rows } = await pool.query(query, values);

  for (const row of rows) {
    const { rows: afectaciones } = await pool.query(
      `SELECT CA.id, CA.cajamovimiento, CA.factura, CA.importeafectado, C.descripcion AS afedesccomprobante, F.nrocomprobante AS afenrocomprobante
       FROM CajaAfectacion AS CA
       LEFT OUTER JOIN WFACTURA AS F ON F.id = CA.factura
       LEFT OUTER JOIN COMPROBANTE AS C ON C.codigo = F.Comprobante
       WHERE cajamovimiento = $1`,
      [row.id]
    );
    row.cajaafectacion = afectaciones;
  }

  return {
    cajamovimientos: rows,
    total: parseInt(totalResult.rows[0].count, 10),
  };
};

export const createCajaMovimiento = async (
  cajamovimiento: ICajaMovimiento
): Promise<ICajaMovimiento> => {
  const client = await pool.connect();

  try {
    console.log("Caja movimiento front: ", cajamovimiento);

    await client.query("BEGIN");

    const { rows: compRows } = await client.query(
      `SELECT dc FROM comprobante WHERE codigo = $1`,
      [cajamovimiento.comprobante]
    );

    if (compRows.length === 0) {
      throw new Error("Comprobante no encontrado");
    }

    const dc = compRows[0].dc;

    const importeEfectivoConDC = (cajamovimiento.importeefectivo || 0) * dc;
    const importeChequeConDC = (cajamovimiento.importecheque || 0) * dc;
    const importeAfectadoConDC = (cajamovimiento.importeafectado || 0) * dc;
    const importeNetoConDC = (cajamovimiento.importeneto || 0) * dc;

    const camposCajaMovimiento = `fechaorigen, proveedor, comprobante, nrocomprobante, fechavencimiento, importeefectivo,
                                  importecheque, importeafectado, importeneto, dc, estado`;

    const { rows } = await client.query(
      `INSERT INTO CajaMovimiento (${camposCajaMovimiento}) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *;`,
      [
        cajamovimiento.fechaorigen,
        cajamovimiento.proveedor,
        cajamovimiento.comprobante,
        cajamovimiento.nrocomprobante,
        cajamovimiento.fechavencimiento,
        importeEfectivoConDC,
        importeChequeConDC,
        importeAfectadoConDC,
        importeNetoConDC,
        dc,
        cajamovimiento.estado || "PE",
      ]
    );

    const NewCajaMovimientoID = rows[0].id;
    console.log("id nuevo:", NewCajaMovimientoID);

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

        await client.query(
          `UPDATE wFactura
           SET importependafectar = importependafectar - ($2 * $3),
               afecta = CASE 
                 WHEN ABS(importependafectar - ($2 * $3)) < 0.01 THEN 2 
                 ELSE 1 
               END,
               estado = CASE 
                 WHEN ABS(importependafectar - ($2 * $3)) < 0.01 THEN 'PA' 
                 ELSE estado 
               END
           WHERE id = $1;`,
          [afectacion.factura, afectacion.importeafectado ?? 0, dc]
        );
      }
    }

    await client.query("COMMIT");
    return rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en createCajaMovimiento:", error);
    throw error;
  } finally {
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

    const { rows: oldAfectaciones } = await client.query(
      `SELECT factura, importeafectado FROM CajaAfectacion WHERE cajamovimiento = $1`,
      [id]
    );

    const { rows: oldMovRows } = await client.query(
      `SELECT dc FROM CajaMovimiento WHERE id = $1`,
      [id]
    );

    if (oldMovRows.length > 0) {
      const oldDc = oldMovRows[0].dc;

      for (const afectacion of oldAfectaciones) {
        await client.query(
          `UPDATE wFactura
           SET importependafectar = importependafectar + ($2 * $3),
               afecta = CASE 
                 WHEN ABS(importependafectar + ($2 * $3)) < 0.01 THEN 2 
                 ELSE 1 
               END,
               estado = CASE 
                 WHEN ABS(importependafectar + ($2 * $3)) < 0.01 THEN 'PA' 
                 ELSE 'PE' 
               END
           WHERE id = $1;`,
          [afectacion.factura, afectacion.importeafectado, oldDc]
        );
      }
    }

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

    if (updates.length > 0) {
      values.push(id);
      const query = `UPDATE CajaMovimiento SET ${updates.join(
        ", "
      )} WHERE id = $${index} RETURNING *;`;
      await client.query(query, values);
    }

    await client.query(`DELETE FROM CajaAfectacion WHERE cajamovimiento = $1`, [
      id,
    ]);

    if (
      Array.isArray(cajamovimiento.cajaafectacion) &&
      cajamovimiento.cajaafectacion.length > 0
    ) {
      const { rows: compRows } = await client.query(
        `SELECT dc FROM CajaMovimiento WHERE id = $1`,
        [id]
      );

      const dc = compRows[0]?.dc || 1;

      for (const afectacion of cajamovimiento.cajaafectacion) {
        await client.query(
          `INSERT INTO CajaAfectacion (cajamovimiento, factura, importeafectado)
           VALUES ($1, $2, $3)`,
          [id, afectacion.factura, afectacion.importeafectado ?? 0]
        );

        await client.query(
          `UPDATE wFactura
           SET importependafectar = importependafectar - ($2 * $3),
               afecta = CASE 
                 WHEN ABS(importependafectar - ($2 * $3)) < 0.01 THEN 2 
                 ELSE 1 
               END,
               estado = CASE 
                 WHEN ABS(importependafectar - ($2 * $3)) < 0.01 THEN 'PA' 
                 ELSE estado 
               END
           WHERE id = $1;`,
          [afectacion.factura, afectacion.importeafectado ?? 0, dc]
        );
      }
    }

    await client.query("COMMIT");

    const result = await getCajaMovimientoById(id);
    return result;
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

    const { rows: afectaciones } = await client.query(
      `SELECT factura, importeafectado FROM CajaAfectacion WHERE cajamovimiento = $1`,
      [id]
    );

    const { rows: movRows } = await client.query(
      `SELECT dc FROM CajaMovimiento WHERE id = $1`,
      [id]
    );

    if (movRows.length > 0) {
      const dc = movRows[0].dc;

      for (const afectacion of afectaciones) {
        await client.query(
          `UPDATE wFactura
           SET importependafectar = importependafectar + ($2 * $3),
               afecta = CASE 
                 WHEN ABS(importependafectar) < 0.01 THEN 2 
                 ELSE 1 
               END,
               estado = CASE 
                 WHEN ABS(importependafectar) < 0.01 THEN 'PA' 
                 ELSE 'PE' 
               END
           WHERE id = $1;`,
          [afectacion.factura, afectacion.importeafectado, dc]
        );
      }
    }

    await client.query(`DELETE FROM CajaAfectacion WHERE cajamovimiento = $1`, [
      id,
    ]);

    const result = await client.query(
      "DELETE FROM CajaMovimiento WHERE id = $1;",
      [id]
    );

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
      SELECT ${crFactura}, C.descripcion AS desccomprobante, P.nombre AS proveedornombre
      FROM wFactura AS F
      LEFT OUTER JOIN COMPROBANTE AS C ON C.Codigo = F.Comprobante
      LEFT OUTER JOIN proveedores AS P ON P.id = F.proveedor
      WHERE F.proveedor = $1
        AND F.afecta = 1
        AND ABS(F.importependafectar) > 0.01
    `;

    const values: any[] = [proveedor];

    if (dc !== undefined) {
      query += ` AND F.dc = $2`;
      values.push(dc);
    }

    query += ` ORDER BY F.fechaorigen`;

    const { rows } = await pool.query(query, values);
    return rows;
  } catch (error) {
    console.error("❌ Error al obtener facturas pendientes:", error);
    throw new Error("Error al obtener facturas pendientes.");
  }
};

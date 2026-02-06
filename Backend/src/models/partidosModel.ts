// Backend/src/models/partidosModel.ts

import { pool } from "../config/db";
import {
  findOrCreateCaja,
  shouldUpdateCaja,
  createCargosFechaPartido,
} from "../services/cajasService";

export interface IPartido {
  id?: number;
  codtipo: number;
  idequipo1: number;
  nombre1?: string;
  idequipo2: number;
  nombre2?: string;
  idzona: number;
  goles1?: number;
  goles2?: number;
  codestado: number;
  fecha?: string;
  nrofecha?: number;
  observaciones?: string;
  estadio?: string;
  incidencias?: string;
  arbitro?: string;
  puntobonus1?: number;
  puntobonus2?: number;
  formacion1?: string;
  formacion2?: string;
  cambios1?: string;
  cambios2?: string;
  dt1?: string;
  dt2?: string;
  suplentes1?: string;
  suplentes2?: string;
  idsede?: number;
  sede?: string;
  fhcarga?: string;
  fhbaja?: string;
  idusuario?: number;
  idprofesor?: number;
  ausente1?: string;
  ausente2?: string;
  idfecha?: number;
}

export const getPartidoById = async (id: number): Promise<IPartido | null> => {
  const { rows } = await pool.query(
    `SELECT p.*, e1.nombre as nombre1, e2.nombre as nombre2, s.nombre as sede 
     FROM partidos p
     LEFT JOIN wequipos e1 ON p.idequipo1 = e1.id
     LEFT JOIN wequipos e2 ON p.idequipo2 = e2.id
     LEFT JOIN wsedes s ON p.idsede = s.id
     WHERE p.id = $1 AND p.fhbaja IS NULL;`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const getPartidosByZona = async (
  idzona: number
): Promise<IPartido[]> => {
  const { rows } = await pool.query(
    `SELECT p.*, e1.nombre as nombre1, e2.nombre as nombre2, s.nombre as sede 
     FROM partidos p
     LEFT JOIN wequipos e1 ON p.idequipo1 = e1.id
     LEFT JOIN wequipos e2 ON p.idequipo2 = e2.id
     LEFT JOIN wsedes s ON p.idsede = s.id
     WHERE p.idzona = $1 AND p.fhbaja IS NULL 
     ORDER BY id ASC;`,
    [idzona]
  );
  return rows;
};

export const createPartido = async (partido: IPartido): Promise<IPartido> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Insertar el partido SIN crear caja
    // La caja se crea cuando se edita el partido en el módulo Resultados
    // (cuando se asigna día + profesor + sede)
    const columns = [
      "codtipo",
      "idequipo1",
      "idequipo2",
      "idzona",
      "codestado",
      "fecha",
      "nrofecha",
      "observaciones",
      "estadio",
      "incidencias",
      "arbitro",
      "puntobonus1",
      "puntobonus2",
      "formacion1",
      "formacion2",
      "cambios1",
      "cambios2",
      "dt1",
      "dt2",
      "suplentes1",
      "suplentes2",
      "idsede",
      "idusuario",
      "idprofesor",
      "ausente1",
      "ausente2",
      "goles1",
      "goles2",
    ];

    const values = columns.map((col) => partido[col as keyof IPartido]);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");

    const insertQuery = `
      INSERT INTO partidos (${columns.join(", ")}, fhcarga)
      VALUES (${placeholders}, NOW())
      RETURNING *
    `;

    const insertResult = await client.query(insertQuery, values);
    const newPartido = insertResult.rows[0];

    // NO crear caja automáticamente al crear partido (fixture)
    // La caja y los cargos de fecha se generan SOLO cuando se edita
    // el partido en Resultados con los 3 campos clave completos
    console.log(
      `📋 Partido ${newPartido.id} creado (fixture) - sin caja ni cargos de fecha`
    );

    await client.query("COMMIT");
    return newPartido;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error al crear partido:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const updatePartido = async (
  id: number,
  partido: Partial<IPartido>
): Promise<IPartido | null> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Campos que NO deben incluirse en el UPDATE
    const camposExcluidos = ["id", "nombre1", "nombre2", "sede", "fhcarga"];

    // 1. Leer datos actuales ANTES del update (misma transacción, misma conexión)
    const oldDataResult = await client.query(
      `SELECT idprofesor, fecha, idsede, idfecha, nrofecha FROM partidos WHERE id = $1`,
      [id]
    );
    const oldData = oldDataResult.rows[0];

    // 2. Construir el UPDATE
    const updates: string[] = [];
    const values: any[] = [];
    let index = 1;

    for (const key in partido) {
      if (camposExcluidos.includes(key)) continue;
      if (partido[key as keyof IPartido] !== undefined) {
        updates.push(`${key} = $${index}`);
        values.push(partido[key as keyof IPartido]);
        index++;
      }
    }

    if (updates.length === 0) {
      client.release();
      return oldData ? (await getPartidoById(id)) : null;
    }

    values.push(id);
    const query = `
      UPDATE partidos
      SET ${updates.join(", ")}
      WHERE id = $${index}
      RETURNING *
    `;

    const result = await client.query(query, values);
    let updatedPartido = result.rows[0];

    if (!updatedPartido) {
      await client.query("ROLLBACK");
      return null;
    }

    // 3. Verificar si cambió algún campo clave de la caja (comparando old vs new)
    const profesorChanged =
      partido.idprofesor !== undefined &&
      oldData &&
      Number(partido.idprofesor) !== Number(oldData.idprofesor);
    const fechaChanged =
      partido.fecha !== undefined &&
      oldData &&
      partido.fecha !== oldData.fecha;
    const sedeChanged =
      partido.idsede !== undefined &&
      oldData &&
      Number(partido.idsede) !== Number(oldData.idsede);

    const needsNewCaja = profesorChanged || fechaChanged || sedeChanged;

    if (needsNewCaja) {
      console.log(`⚠️ Partido ${id} necesita cambio de caja:`, {
        profesorChanged,
        fechaChanged,
        sedeChanged,
      });
    }

    // 4. Si cambió algún campo clave Y tiene los 3 campos completos, actualizar caja
    const tieneIdProfesor =
      updatedPartido.idprofesor && updatedPartido.idprofesor !== 0;
    const tieneNroFecha =
      updatedPartido.nrofecha && updatedPartido.nrofecha !== 0;
    const tieneIdsede = updatedPartido.idsede && updatedPartido.idsede !== 0;

    const deberiaProcesarCaja =
      (needsNewCaja || !updatedPartido.idfecha) &&
      tieneIdProfesor &&
      tieneNroFecha &&
      tieneIdsede;

    if (deberiaProcesarCaja) {
      console.log(
        `🔄 Partido ${id} - procesando caja (cambió=${needsNewCaja}, sinCaja=${!updatedPartido.idfecha})...`
      );

      const zonaQuery = `SELECT idtorneo FROM zonas WHERE id = $1`;
      const zonaResult = await client.query(zonaQuery, [updatedPartido.idzona]);
      const idtorneo = zonaResult.rows[0]?.idtorneo;

      // Usar el MISMO client para findOrCreateCaja (misma transacción, sin conexión extra)
      const idfecha = await findOrCreateCaja(
        {
          idprofesor: updatedPartido.idprofesor,
          codfecha: updatedPartido.nrofecha,
          idsede: updatedPartido.idsede,
          fecha: updatedPartido.fecha,
          idtorneo,
          idequipo1: updatedPartido.idequipo1,
          idequipo2: updatedPartido.idequipo2,
        },
        client
      );

      console.log(`✅ Caja asignada: idfecha=${idfecha}`);

      const updateCajaQuery = `
        UPDATE partidos
        SET idfecha = $1
        WHERE id = $2
        RETURNING *
      `;
      const finalResult = await client.query(updateCajaQuery, [idfecha, id]);
      updatedPartido = finalResult.rows[0];

      // Usar el MISMO client para createCargosFechaPartido (misma transacción)
      await createCargosFechaPartido(
        {
          idpartido: id,
          idfecha,
          idequipo1: updatedPartido.idequipo1,
          idequipo2: updatedPartido.idequipo2,
          idzona: updatedPartido.idzona,
          nrofecha: updatedPartido.nrofecha,
        },
        client
      );
    }

    await client.query("COMMIT");
    return updatedPartido;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error al actualizar partido:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const deletePartido = async (id: number): Promise<boolean> => {
  try {
    const result = await pool.query(
      "UPDATE partidos SET fhbaja = NOW() WHERE id = $1 AND fhbaja IS NULL;",
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("❌ Error al eliminar partido:", error);
    throw new Error("Error al eliminar el partido.");
  }
};

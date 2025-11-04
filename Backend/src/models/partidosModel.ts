// Backend/src/models/partidosModel.ts

import { pool } from "../config/db";
import { findOrCreateCaja, shouldUpdateCaja } from "../services/cajasService";

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

    // 1. Insertar el partido (sin idfecha aún)
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
    let newPartido = insertResult.rows[0];

    // 2. Verificar si tiene los 3 campos clave para gestionar caja
    const tieneIdProfesor =
      newPartido.idprofesor && newPartido.idprofesor !== 0;
    const tieneNroFecha = newPartido.nrofecha && newPartido.nrofecha !== 0;
    const tieneIdsede = newPartido.idsede && newPartido.idsede !== 0;

    if (tieneIdProfesor && tieneNroFecha && tieneIdsede) {
      console.log(
        `✅ Partido ${newPartido.id} con datos completos - generando/buscando caja...`
      );

      // Obtener idtorneo desde la zona
      const zonaQuery = `SELECT idtorneo FROM zonas WHERE id = $1`;
      const zonaResult = await client.query(zonaQuery, [newPartido.idzona]);
      const idtorneo = zonaResult.rows[0]?.idtorneo;

      // Buscar o crear caja
      const idfecha = await findOrCreateCaja({
        idprofesor: newPartido.idprofesor,
        codfecha: newPartido.nrofecha,
        idsede: newPartido.idsede,
        fecha: newPartido.fecha,
        idtorneo,
        idequipo1: newPartido.idequipo1,
        idequipo2: newPartido.idequipo2,
      });

      console.log(`✅ Caja asignada: idfecha=${idfecha}`);

      // 3. Actualizar el partido con el idfecha
      const updateQuery = `
        UPDATE partidos 
        SET idfecha = $1 
        WHERE id = $2 
        RETURNING *
      `;
      const updateResult = await client.query(updateQuery, [
        idfecha,
        newPartido.id,
      ]);
      newPartido = updateResult.rows[0];
    } else {
      console.log(
        `⚠️ Partido ${newPartido.id} sin datos completos para caja - no se genera planilla aún`
      );
    }

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

    // 1. Construir el UPDATE
    const updates: string[] = [];
    const values: any[] = [];
    let index = 1;

    for (const key in partido) {
      if (partido[key as keyof IPartido] !== undefined) {
        updates.push(`${key} = $${index}`);
        values.push(partido[key as keyof IPartido]);
        index++;
      }
    }

    if (updates.length === 0) {
      throw new Error("No hay datos para actualizar.");
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

    // 2. Verificar si cambió algún campo clave de la caja
    const needsNewCaja = await shouldUpdateCaja(id, {
      idprofesor: partido.idprofesor,
      codfecha: partido.nrofecha,
      idsede: partido.idsede,
    });

    // 3. Si cambió algún campo clave Y tiene los 3 campos completos, actualizar caja
    const tieneIdProfesor =
      updatedPartido.idprofesor && updatedPartido.idprofesor !== 0;
    const tieneNroFecha =
      updatedPartido.nrofecha && updatedPartido.nrofecha !== 0;
    const tieneIdsede = updatedPartido.idsede && updatedPartido.idsede !== 0;

    if (needsNewCaja && tieneIdProfesor && tieneNroFecha && tieneIdsede) {
      console.log(
        `🔄 Partido ${id} cambió campos clave - buscando/creando nueva caja...`
      );

      // Obtener idtorneo desde la zona
      const zonaQuery = `SELECT idtorneo FROM zonas WHERE id = $1`;
      const zonaResult = await client.query(zonaQuery, [updatedPartido.idzona]);
      const idtorneo = zonaResult.rows[0]?.idtorneo;

      // Buscar o crear caja con la nueva configuración
      const idfecha = await findOrCreateCaja({
        idprofesor: updatedPartido.idprofesor,
        codfecha: updatedPartido.nrofecha,
        idsede: updatedPartido.idsede,
        fecha: updatedPartido.fecha,
        idtorneo,
        idequipo1: updatedPartido.idequipo1,
        idequipo2: updatedPartido.idequipo2,
      });

      console.log(`✅ Nueva caja asignada: idfecha=${idfecha}`);

      // Actualizar el idfecha del partido
      const updateCajaQuery = `
        UPDATE partidos 
        SET idfecha = $1 
        WHERE id = $2 
        RETURNING *
      `;
      const finalResult = await client.query(updateCajaQuery, [idfecha, id]);
      updatedPartido = finalResult.rows[0];
    } else if (
      !updatedPartido.idfecha &&
      tieneIdProfesor &&
      tieneNroFecha &&
      tieneIdsede
    ) {
      // Caso especial: el partido no tenía caja pero ahora tiene los 3 campos completos
      console.log(
        `✅ Partido ${id} completó datos - generando caja por primera vez...`
      );

      const zonaQuery = `SELECT idtorneo FROM zonas WHERE id = $1`;
      const zonaResult = await client.query(zonaQuery, [updatedPartido.idzona]);
      const idtorneo = zonaResult.rows[0]?.idtorneo;

      const idfecha = await findOrCreateCaja({
        idprofesor: updatedPartido.idprofesor,
        codfecha: updatedPartido.nrofecha,
        idsede: updatedPartido.idsede,
        fecha: updatedPartido.fecha,
        idtorneo,
        idequipo1: updatedPartido.idequipo1,
        idequipo2: updatedPartido.idequipo2,
      });

      const updateCajaQuery = `
        UPDATE partidos 
        SET idfecha = $1 
        WHERE id = $2 
        RETURNING *
      `;
      const finalResult = await client.query(updateCajaQuery, [idfecha, id]);
      updatedPartido = finalResult.rows[0];
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

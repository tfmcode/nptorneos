import { pool } from "../config/db";

export interface PartidoJugadorExtendido {
  idjugador: number;
  nombre: string;
  docnro: number;
  marca: number;
  sancion: number;
  listanegra: number;
  camiseta: string;
  goles: number;
  amarillo: number;
  azul: number;
  rojo: number;
  tipo: number;
  foto: string;
  jugo: boolean; // ✅ Agregado campo jugo
  codtipo: number; // ✅ Agregado para tipos de jugador
}

// ✅ CORREGIDO: Interface actualizada
export interface PartidoJugadorInput {
  idjugador: number;
  jugo: boolean; // ✅ Agregado
  goles: number;
  camiseta: string;
  amarilla: number; // ✅ Corregido nombre del campo
  azul: number;
  roja: number; // ✅ Corregido nombre del campo
  fhcarga?: string;
  idusuario?: number;
}

// ✅ SOLUCIÓN FINAL - Reemplaza solo la función getJugadoresDeEquipoEnPartido

export const getJugadoresDeEquipoEnPartido = async (
  idpartido: number,
  idequipo: number
): Promise<PartidoJugadorExtendido[]> => {
  const client = await pool.connect();
  try {
    console.log("🔍 Model - Parámetros recibidos:", { idpartido, idequipo });

    await client.query("BEGIN");

    // ✅ CONSULTA SIMPLIFICADA: Solo jugadores que ESTÁN en el partido
    console.log("🔍 Consultando SOLO jugadores que están en el partido...");
    const result = await client.query(
      `
      SELECT 
        q.idjugador,
        CONCAT(j.apellido, ' ', j.nombres) AS nombre,
        j.docnro,
        1 as marca, -- Siempre 1 porque están en el partido
        q.codtipo,
        j.foto,
        -- Datos del partido
        COALESCE(p.goles, 0) as goles,
        COALESCE(p.amarillas, 0) as amarillo,
        COALESCE(p.azules, 0) as azul, 
        COALESCE(p.rojas, 0) as rojo,
        COALESCE(p.camiseta, '') as camiseta,
        COALESCE(p.jugo, false) as jugo,
        
        -- Verificar sanciones
        CASE WHEN EXISTS (
          SELECT 1 FROM sanciones s 
          WHERE s.idjugador = q.idjugador 
            AND s.codestado = 1 
            AND s.fhbaja IS NULL 
            AND (SELECT fecha FROM partidos WHERE id = $1)::timestamp 
                BETWEEN s.fecha AND s.fechafin
        ) THEN 1 ELSE 0 END as sancion,
        
        -- Verificar lista negra  
        CASE WHEN EXISTS (
          SELECT 1 FROM listanegra l 
          WHERE l.idjugador = q.idjugador 
            AND l.fhbaja IS NULL 
            AND l.codestado = 1
        ) THEN 1 ELSE 0 END as listanegra,
        
        q.codtipo as tipo -- Para compatibilidad
        
      FROM wequipos_jugadores q
      INNER JOIN jugadores j ON q.idjugador = j.id  
      INNER JOIN partidos_jugadores p ON q.idjugador = p.idjugador AND p.idpartido = $1
      WHERE q.idequipo = $2
        AND q.fhbaja IS NULL
        AND j.fhbaja IS NULL 
        AND q.codestado = 1
        AND j.codestado = 1
      ORDER BY j.apellido, j.nombres
    `,
      [idpartido, idequipo]
    );

    console.log(
      "✅ Resultado final obtenido:",
      result.rows.length,
      "jugadores EN EL PARTIDO"
    );

    await client.query("ROLLBACK");
    return result.rows;
  } catch (error) {
    console.error("❌ Error en getJugadoresDeEquipoEnPartido:", error);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// ✅ CORREGIDO: Función upsertPartidoJugador con validaciones habilitadas
export const upsertPartidoJugador = async (
  idpartido: number,
  idequipo: number,
  data: PartidoJugadorInput
) => {
  const { idjugador, jugo, goles, camiseta, amarilla, azul, roja } = data;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ✅ HABILITADO: Verificar que el jugador pertenece al equipo
    const jugadorEnEquipo = await client.query(
      `SELECT 1 FROM wequipos_jugadores wej
       WHERE wej.idequipo = $1 AND wej.idjugador = $2 AND wej.fhbaja IS NULL AND wej.codestado = 1`,
      [idequipo, idjugador]
    );

    if (jugadorEnEquipo.rows.length === 0) {
      throw new Error("El jugador no pertenece a este equipo o está inactivo");
    }

    // Verificar si ya existe el registro
    const exists = await client.query(
      "SELECT 1 FROM partidos_jugadores WHERE idpartido = $1 AND idjugador = $2",
      [idpartido, idjugador]
    );

    if ((exists?.rowCount ?? 0) > 0) {
      // ✅ CORREGIDO: Actualizar registro existente incluyendo campo jugo
      await client.query(
        `UPDATE partidos_jugadores
         SET goles = $1, camiseta = $2, amarillas = $3, azules = $4, rojas = $5, jugo = $6, fhultmod = CURRENT_TIMESTAMP
         WHERE idpartido = $7 AND idjugador = $8`,
        [goles, camiseta, amarilla, azul, roja, jugo, idpartido, idjugador]
      );
      console.log("✅ Jugador actualizado:", idjugador);
    } else {
      // ✅ CORREGIDO: Crear nuevo registro incluyendo campo jugo
      await client.query(
        `INSERT INTO partidos_jugadores
         (idpartido, idequipo, idjugador, goles, camiseta, amarillas, azules, rojas, jugo, fhcarga, idusuario)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, $10)`,
        [
          idpartido,
          idequipo,
          idjugador,
          goles,
          camiseta,
          amarilla,
          azul,
          roja,
          jugo,
          data.idusuario || 1,
        ]
      );
      console.log("✅ Jugador creado:", idjugador);
    }

    await client.query("COMMIT");
    return { success: true, message: "Jugador guardado correctamente" };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en upsertPartidoJugador:", error);
    throw error;
  } finally {
    client.release();
  }
};

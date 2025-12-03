import { pool } from "../config/db";

export interface ITorneoEquipo {
  torneo_id: number;
  torneo_nombre: string;
  torneo_abrev: string;
  torneo_anio: number;
  torneo_estado: number;
  zona_id: number;
  zona_nombre: string;
  zona_abrev: string;
  primer_partido: string | null;
  total_partidos: number;
}

export const getTorneosByEquipoFromPartidos = async (
  idequipo: number
): Promise<ITorneoEquipo[]> => {
  const { rows } = await pool.query(
    `SELECT DISTINCT 
      t.id as torneo_id,
      t.nombre as torneo_nombre,
      t.abrev as torneo_abrev,
      t.anio as torneo_anio,
      t.codestado as torneo_estado,
      z.id as zona_id,
      z.nombre as zona_nombre,
      z.abrev as zona_abrev,
      (SELECT MIN(p2.fecha) FROM partidos p2 
       WHERE (p2.idequipo1 = $1 OR p2.idequipo2 = $1) 
       AND p2.idzona = z.id AND p2.fhbaja IS NULL) as primer_partido,
      (SELECT COUNT(*) FROM partidos p2 
       WHERE (p2.idequipo1 = $1 OR p2.idequipo2 = $1) 
       AND p2.idzona = z.id AND p2.fhbaja IS NULL) as total_partidos
    FROM partidos p
    INNER JOIN zonas z ON p.idzona = z.id
    INNER JOIN wtorneos t ON z.idtorneo = t.id
    WHERE (p.idequipo1 = $1 OR p.idequipo2 = $1)
      AND p.fhbaja IS NULL
      AND t.fhbaja IS NULL
    ORDER BY t.anio DESC, t.nombre;`,
    [idequipo]
  );
  return rows;
};

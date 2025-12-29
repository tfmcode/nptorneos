// Backend/src/models/planillas/equiposService.ts
// ✅ VERSIÓN CORREGIDA - Lee valores desde zonas_equipos

import { pool } from "../../config/db";
import { PlanillaEquipo } from "../../types/planillasPago";

export const getEquiposByPlanilla = async (
  idfecha: number
): Promise<PlanillaEquipo[]> => {
  try {
    // 1️⃣ Obtener TODOS los partidos de la caja con valores económicos ESPECÍFICOS de cada equipo
    const partidosQuery = `
      SELECT
        p.id as partido_id,
        p.idequipo1,
        p.idequipo2,
        p.idzona,
        e1.nombre as nombre_equipo1,
        e2.nombre as nombre_equipo2,
        z.idtorneo,
        
        -- ✅ VALORES ESPECÍFICOS DEL EQUIPO 1
        COALESCE(ze1.valor_insc, t.valor_insc, 0) as valor_insc_eq1,
        COALESCE(ze1.valor_fecha, t.valor_fecha, 0) as valor_fecha_eq1,
        
        -- ✅ VALORES ESPECÍFICOS DEL EQUIPO 2
        COALESCE(ze2.valor_insc, t.valor_insc, 0) as valor_insc_eq2,
        COALESCE(ze2.valor_fecha, t.valor_fecha, 0) as valor_fecha_eq2
        
      FROM partidos p
      LEFT JOIN wequipos e1 ON p.idequipo1 = e1.id
      LEFT JOIN wequipos e2 ON p.idequipo2 = e2.id
      LEFT JOIN zonas z ON p.idzona = z.id
      LEFT JOIN wtorneos t ON z.idtorneo = t.id
      
      -- ✅ JOIN CRÍTICO: Traer valores específicos de zonas_equipos
      LEFT JOIN zonas_equipos ze1 
        ON ze1.idzona = p.idzona 
        AND ze1.idequipo = p.idequipo1
        AND ze1.fhbaja IS NULL
        
      LEFT JOIN zonas_equipos ze2 
        ON ze2.idzona = p.idzona 
        AND ze2.idequipo = p.idequipo2
        AND ze2.fhbaja IS NULL
        
      WHERE p.idfecha = $1 AND p.fhbaja IS NULL
      ORDER BY p.id
    `;

    const partidosResult = await pool.query(partidosQuery, [idfecha]);

    if (partidosResult.rows.length === 0) {
      return [];
    }

    // Verificar que existe la planilla
    const planillaQuery = `SELECT id FROM wtorneos_fechas WHERE id = $1`;
    const planillaResult = await pool.query(planillaQuery, [idfecha]);
    if (planillaResult.rows.length === 0) {
      return [];
    }

    // 2️⃣ Crear mapa de equipos únicos con sus valores ESPECÍFICOS
    const equiposMap = new Map<
      number,
      {
        nombre: string;
        idtorneo: number;
        valor_insc: number;
        valor_fecha: number;
        cantidad_partidos: number;
      }
    >();

    partidosResult.rows.forEach((partido: any) => {
      // ✅ Equipo 1 con SUS valores específicos
      if (partido.idequipo1) {
        const existing = equiposMap.get(partido.idequipo1);
        equiposMap.set(partido.idequipo1, {
          nombre: partido.nombre_equipo1 || `Equipo ${partido.idequipo1}`,
          idtorneo: partido.idtorneo,
          valor_insc: parseFloat(partido.valor_insc_eq1 || "0"), // ✅ Valor específico eq1
          valor_fecha: parseFloat(partido.valor_fecha_eq1 || "0"), // ✅ Valor específico eq1
          cantidad_partidos: (existing?.cantidad_partidos || 0) + 1,
        });
      }

      // ✅ Equipo 2 con SUS valores específicos
      if (partido.idequipo2) {
        const existing = equiposMap.get(partido.idequipo2);
        equiposMap.set(partido.idequipo2, {
          nombre: partido.nombre_equipo2 || `Equipo ${partido.idequipo2}`,
          idtorneo: partido.idtorneo,
          valor_insc: parseFloat(partido.valor_insc_eq2 || "0"), // ✅ Valor específico eq2
          valor_fecha: parseFloat(partido.valor_fecha_eq2 || "0"), // ✅ Valor específico eq2
          cantidad_partidos: (existing?.cantidad_partidos || 0) + 1,
        });
      }
    });

    // 3️⃣ Obtener ausencias
    const ausenciasQuery = `
      SELECT idequipo FROM wfechas_equipos_aus
      WHERE idfecha = $1
    `;
    const ausenciasResult = await pool.query(ausenciasQuery, [idfecha]);
    const equiposAusentes = new Set(
      ausenciasResult.rows.map((r: any) => r.idequipo)
    );

    // 4️⃣ Obtener depósitos por equipo
    const idsEquipos = Array.from(equiposMap.keys());
    const depositosQuery = `
      SELECT idequipo, SUM(importe) as total_depositos
      FROM wdepositos
      WHERE idequipo = ANY($1) AND fhbaja IS NULL
      GROUP BY idequipo
    `;
    const depositosResult = await pool.query(depositosQuery, [idsEquipos]);
    const depositosMap = new Map(
      depositosResult.rows.map((r: any) => [
        r.idequipo,
        parseFloat(r.total_depositos || "0"),
      ])
    );

    // 5️⃣ Obtener pagos existentes desde wfechas_equipos
    const pagosQuery = `
      SELECT
        idequipo,
        tipopago,
        SUM(importe) as total_pago
      FROM wfechas_equipos
      WHERE idfecha = $1
      GROUP BY idequipo, tipopago
    `;
    const pagosResult = await pool.query(pagosQuery, [idfecha]);

    const pagosMap = new Map<
      number,
      { pago_ins: number; pago_dep: number; pago_fecha: number }
    >();
    pagosResult.rows.forEach((r: any) => {
      const idequipo = r.idequipo;
      const existing = pagosMap.get(idequipo) || {
        pago_ins: 0,
        pago_dep: 0,
        pago_fecha: 0,
      };

      if (r.tipopago === 1) existing.pago_ins = parseFloat(r.total_pago || "0");
      if (r.tipopago === 2) existing.pago_dep = parseFloat(r.total_pago || "0");
      if (r.tipopago === 3)
        existing.pago_fecha = parseFloat(r.total_pago || "0");

      pagosMap.set(idequipo, existing);
    });

    // 6️⃣ Construir resultado final con valores CORRECTOS
    const equipos: PlanillaEquipo[] = [];
    let orden = 1;

    equiposMap.forEach((data, idequipo) => {
      const ausente = equiposAusentes.has(idequipo);
      const depositos = depositosMap.get(idequipo) || 0;
      const pagos = pagosMap.get(idequipo) || {
        pago_ins: 0,
        pago_dep: 0,
        pago_fecha: 0,
      };

      // ✅ Calcular deudas con valores ESPECÍFICOS del equipo
      const deuda_insc = data.valor_insc;
      const deuda_dep = depositos;
      const deuda_fecha = data.valor_fecha * data.cantidad_partidos;
      const total_pagar = deuda_insc + deuda_dep + deuda_fecha;
      const deuda_total =
        total_pagar - (pagos.pago_ins + pagos.pago_dep + pagos.pago_fecha);

      equipos.push({
        idfecha,
        orden: orden++,
        idequipo,
        nombre_equipo: data.nombre,
        ausente: ausente ? 1 : 0,
        cantidad_partidos: data.cantidad_partidos,

        // Deudas con valores correctos
        deuda_insc,
        deuda_dep,
        deuda_fecha,
        total_pagar,

        // Pagos
        pago_ins: pagos.pago_ins,
        pago_dep: pagos.pago_dep,
        pago_fecha: pagos.pago_fecha,

        // Total
        deuda_total,

        // Legacy (mantener por compatibilidad)
        tipopago: 0,
        importe: 0,
      });
    });

    return equipos.sort((a, b) => a.orden - b.orden);
  } catch (error) {
    console.error("Error en getEquiposByPlanilla:", error);
    throw error;
  }
};

// Marcar/desmarcar ausencia
export const toggleAusencia = async (
  idfecha: number,
  idequipo: number,
  ausente: boolean
): Promise<void> => {
  try {
    if (ausente) {
      await pool.query(
        `INSERT INTO wfechas_equipos_aus (idfecha, idequipo, fhcarga)
         VALUES ($1, $2, NOW())
         ON CONFLICT DO NOTHING`,
        [idfecha, idequipo]
      );
    } else {
      await pool.query(
        `DELETE FROM wfechas_equipos_aus
         WHERE idfecha = $1 AND idequipo = $2`,
        [idfecha, idequipo]
      );
    }
  } catch (error) {
    console.error("Error en toggleAusencia:", error);
    throw error;
  }
};

// Actualizar pago de fecha (único campo editable)
export const updatePagoFecha = async (
  idfecha: number,
  idequipo: number,
  importe: number
): Promise<void> => {
  try {
    await pool.query(
      `DELETE FROM wfechas_equipos
       WHERE idfecha = $1 AND idequipo = $2 AND tipopago = 3`,
      [idfecha, idequipo]
    );

    if (importe > 0) {
      await pool.query(
        `INSERT INTO wfechas_equipos (idfecha, orden, idequipo, tipopago, importe, fhcarga)
         VALUES ($1, 1, $2, 3, $3, NOW())`,
        [idfecha, idequipo, importe]
      );
    }
  } catch (error) {
    console.error("Error en updatePagoFecha:", error);
    throw error;
  }
};

// Mantener las funciones legacy para compatibilidad
export const addEquipo = async (equipo: any): Promise<any> => {
  throw new Error("addEquipo deprecated - use updatePagoFecha instead");
};

export const updateEquipo = async (
  idfecha: number,
  orden: number,
  equipo: any
): Promise<any> => {
  throw new Error("updateEquipo deprecated - use updatePagoFecha instead");
};

export const deleteEquipo = async (
  idfecha: number,
  orden: number
): Promise<boolean> => {
  throw new Error("deleteEquipo deprecated");
};

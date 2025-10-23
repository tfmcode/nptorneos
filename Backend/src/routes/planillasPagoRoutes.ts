import express from "express";
import { body, param, query } from "express-validator";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validateRequest } from "../middlewares/validationMiddleware";
import {
  getPlanillasController,
  getPlanillaCompletaController,
  createPlanillaController,
  updatePlanillaController,
  cerrarPlanillaController,
  contabilizarPlanillaController,
  deletePlanillaController,
  saveEquipoController,
  deleteEquipoController,
  saveArbitroController,
  deleteArbitroController,
  saveCanchaController,
  deleteCanchaController,
  saveProfesorController,
  deleteProfesorController,
  saveMedicoController,
  deleteMedicoController,
  saveOtroGastoController,
  deleteOtroGastoController,
} from "../controllers/planillasPagoController";

const router = express.Router();

// ========================================
// RUTAS PRINCIPALES DE PLANILLAS
// ========================================

// GET /api/planillas-pago - Listado con filtros
router.get(
  "/",
  authMiddleware,
  [
    query("idtorneo").optional().isInt().withMessage("ID de torneo inválido"),
    query("fecha_desde").optional().isISO8601().withMessage("Fecha inválida"),
    query("fecha_hasta").optional().isISO8601().withMessage("Fecha inválida"),
    query("idsede").optional().isInt().withMessage("ID de sede inválido"),
    query("estado")
      .optional()
      .isIn(["abierta", "cerrada", "contabilizada"])
      .withMessage("Estado inválido"),
  ],
  validateRequest,
  asyncHandler(getPlanillasController)
);

// GET /api/planillas-pago/:idfecha - Obtener planilla completa
router.get(
  "/:idfecha",
  authMiddleware,
  [param("idfecha").isInt().withMessage("ID de fecha inválido")],
  validateRequest,
  asyncHandler(getPlanillaCompletaController)
);

// POST /api/planillas-pago - Crear planilla
router.post(
  "/",
  authMiddleware,
  [
    body("idfecha")
      .isInt()
      .withMessage("El ID de fecha es obligatorio y debe ser un número"),
    body("fecha")
      .notEmpty()
      .withMessage("La fecha es obligatoria")
      .isISO8601()
      .withMessage("Formato de fecha inválido"),
    body("idsede")
      .isInt()
      .withMessage("El ID de sede es obligatorio y debe ser un número"),
    body("idtorneo")
      .isInt()
      .withMessage("El ID de torneo es obligatorio y debe ser un número"),
    body("idsubsede").optional().isInt().withMessage("ID de subsede inválido"),
    body("codfecha").optional().isInt().withMessage("Código de fecha inválido"),
    body("idprofesor")
      .optional()
      .isInt()
      .withMessage("ID de profesor inválido"),
    body("idturno").optional().isInt().withMessage("ID de turno inválido"),
    body("observ").optional().isString().withMessage("Observaciones inválidas"),
  ],
  validateRequest,
  asyncHandler(createPlanillaController)
);

// PUT /api/planillas-pago/:id - Actualizar planilla
router.put(
  "/:id",
  authMiddleware,
  [
    param("id").isInt().withMessage("ID de planilla inválido"),
    body("fecha")
      .optional()
      .isISO8601()
      .withMessage("Formato de fecha inválido"),
    body("idsede").optional().isInt().withMessage("ID de sede inválido"),
    body("idsubsede").optional().isInt().withMessage("ID de subsede inválido"),
    body("idtorneo").optional().isInt().withMessage("ID de torneo inválido"),
    body("codfecha").optional().isInt().withMessage("Código de fecha inválido"),
    body("idprofesor")
      .optional()
      .isInt()
      .withMessage("ID de profesor inválido"),
    body("idturno").optional().isInt().withMessage("ID de turno inválido"),
    body("observ").optional().isString(),
    body("observ_caja").optional().isString(),
    body("totcierre").optional().isNumeric(),
    body("totefectivo").optional().isNumeric(),
    body("idprofesor_cierre").optional().isInt(),
  ],
  validateRequest,
  asyncHandler(updatePlanillaController)
);

// POST /api/planillas-pago/:id/cerrar - Cerrar planilla
router.post(
  "/:id/cerrar",
  authMiddleware,
  [param("id").isInt().withMessage("ID de planilla inválido")],
  validateRequest,
  asyncHandler(cerrarPlanillaController)
);

// POST /api/planillas-pago/:id/contabilizar - Contabilizar planilla
router.post(
  "/:id/contabilizar",
  authMiddleware,
  [
    param("id").isInt().withMessage("ID de planilla inválido"),
    body("idusuario").isInt().withMessage("ID de usuario inválido"),
  ],
  validateRequest,
  asyncHandler(contabilizarPlanillaController)
);

// DELETE /api/planillas-pago/:id - Eliminar planilla
router.delete(
  "/:id",
  authMiddleware,
  [param("id").isInt().withMessage("ID de planilla inválido")],
  validateRequest,
  asyncHandler(deletePlanillaController)
);

// ========================================
// RUTAS DE EQUIPOS
// ========================================

// POST /api/planillas-pago/equipos - Guardar equipo
router.post(
  "/equipos",
  authMiddleware,
  [
    body("idfecha").isInt().withMessage("ID de fecha inválido"),
    body("orden").isInt().withMessage("El orden es obligatorio"),
    body("idequipo").isInt().withMessage("ID de equipo inválido"),
    body("tipopago").isInt().withMessage("Tipo de pago inválido"),
    body("importe").isNumeric().withMessage("Importe inválido"),
    body("iddeposito").optional().isInt(),
  ],
  validateRequest,
  asyncHandler(saveEquipoController)
);

// DELETE /api/planillas-pago/equipos/:idfecha/:orden
router.delete(
  "/equipos/:idfecha/:orden",
  authMiddleware,
  [
    param("idfecha").isInt().withMessage("ID de fecha inválido"),
    param("orden").isInt().withMessage("Orden inválido"),
  ],
  validateRequest,
  asyncHandler(deleteEquipoController)
);

// ========================================
// RUTAS DE ÁRBITROS
// ========================================

router.post(
  "/arbitros",
  authMiddleware,
  [
    body("idfecha").isInt().withMessage("ID de fecha inválido"),
    body("orden").isInt().withMessage("El orden es obligatorio"),
    body("idarbitro").isInt().withMessage("ID de árbitro inválido"),
    body("partidos").isNumeric().withMessage("Cantidad de partidos inválida"),
    body("valor_partido").isNumeric().withMessage("Valor por partido inválido"),
    body("idprofesor").optional().isInt(),
  ],
  validateRequest,
  asyncHandler(saveArbitroController)
);

router.delete(
  "/arbitros/:idfecha/:orden",
  authMiddleware,
  [
    param("idfecha").isInt().withMessage("ID de fecha inválido"),
    param("orden").isInt().withMessage("Orden inválido"),
  ],
  validateRequest,
  asyncHandler(deleteArbitroController)
);

// ========================================
// RUTAS DE CANCHAS
// ========================================

router.post(
  "/canchas",
  authMiddleware,
  [
    body("idfecha").isInt().withMessage("ID de fecha inválido"),
    body("orden").isInt().withMessage("El orden es obligatorio"),
    body("horas").isNumeric().withMessage("Cantidad de horas inválida"),
    body("valor_hora").isNumeric().withMessage("Valor por hora inválido"),
  ],
  validateRequest,
  asyncHandler(saveCanchaController)
);

router.delete(
  "/canchas/:idfecha/:orden",
  authMiddleware,
  [
    param("idfecha").isInt().withMessage("ID de fecha inválido"),
    param("orden").isInt().withMessage("Orden inválido"),
  ],
  validateRequest,
  asyncHandler(deleteCanchaController)
);

// ========================================
// RUTAS DE PROFESORES
// ========================================

router.post(
  "/profesores",
  authMiddleware,
  [
    body("idfecha").isInt().withMessage("ID de fecha inválido"),
    body("orden").isInt().withMessage("El orden es obligatorio"),
    body("idprofesor").isInt().withMessage("ID de profesor inválido"),
    body("horas").isNumeric().withMessage("Cantidad de horas inválida"),
    body("valor_hora").isNumeric().withMessage("Valor por hora inválido"),
  ],
  validateRequest,
  asyncHandler(saveProfesorController)
);

router.delete(
  "/profesores/:idfecha/:orden",
  authMiddleware,
  [
    param("idfecha").isInt().withMessage("ID de fecha inválido"),
    param("orden").isInt().withMessage("Orden inválido"),
  ],
  validateRequest,
  asyncHandler(deleteProfesorController)
);

// ========================================
// RUTAS DE SERVICIO MÉDICO
// ========================================

router.post(
  "/medico",
  authMiddleware,
  [
    body("idfecha").isInt().withMessage("ID de fecha inválido"),
    body("orden").isInt().withMessage("El orden es obligatorio"),
    body("idmedico").isInt().withMessage("ID de médico inválido"),
    body("horas").isNumeric().withMessage("Cantidad de horas inválida"),
    body("valor_hora").isNumeric().withMessage("Valor por hora inválido"),
  ],
  validateRequest,
  asyncHandler(saveMedicoController)
);

router.delete(
  "/medico/:idfecha/:orden",
  authMiddleware,
  [
    param("idfecha").isInt().withMessage("ID de fecha inválido"),
    param("orden").isInt().withMessage("Orden inválido"),
  ],
  validateRequest,
  asyncHandler(deleteMedicoController)
);

// ========================================
// RUTAS DE OTROS GASTOS
// ========================================

router.post(
  "/otros-gastos",
  authMiddleware,
  [
    body("idfecha").isInt().withMessage("ID de fecha inválido"),
    body("orden").isInt().withMessage("El orden es obligatorio"),
    body("codgasto").isInt().withMessage("Código de gasto inválido"),
    body("cantidad").isNumeric().withMessage("Cantidad inválida"),
    body("valor_unidad").isNumeric().withMessage("Valor unitario inválido"),
    body("idprofesor").optional().isInt(),
  ],
  validateRequest,
  asyncHandler(saveOtroGastoController)
);

router.delete(
  "/otros-gastos/:idfecha/:orden",
  authMiddleware,
  [
    param("idfecha").isInt().withMessage("ID de fecha inválido"),
    param("orden").isInt().withMessage("Orden inválido"),
  ],
  validateRequest,
  asyncHandler(deleteOtroGastoController)
);

export default router;

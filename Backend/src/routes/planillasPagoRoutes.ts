import express from "express";
import { body, param, query } from "express-validator";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validateRequest } from "../middlewares/validationMiddleware";
import {
  getPlanillasController,
  getPlanillaCompletaController,
  createPlanillaController,
  cerrarPlanillaController,
  cerrarCajaController,
  addEquipoController,
  updateEquipoController,
  deleteEquipoController,
  addArbitroController,
  updateArbitroController,
  deleteArbitroController,
  addCanchaController,
  updateCanchaController,
  deleteCanchaController,
  addProfesorController,
  updateProfesorController,
  deleteProfesorController,
  addMedicoController,
  updateMedicoController,
  deleteMedicoController,
  addOtroGastoController,
  updateOtroGastoController,
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
  ],
  validateRequest,
  asyncHandler(createPlanillaController)
);

// POST /api/planillas-pago/:idfecha/cerrar - Cerrar planilla
router.post(
  "/:idfecha/cerrar",
  authMiddleware,
  [
    param("idfecha").isInt().withMessage("ID de fecha inválido"),
    body("idprofesor")
      .isInt()
      .withMessage("ID de profesor es obligatorio para cerrar la planilla"),
  ],
  validateRequest,
  asyncHandler(cerrarPlanillaController)
);

// POST /api/planillas-pago/:idfecha/cerrar-caja - Cerrar caja (contabilizar)
router.post(
  "/:idfecha/cerrar-caja",
  authMiddleware,
  [
    param("idfecha").isInt().withMessage("ID de fecha inválido"),
    body("idusuario").isInt().withMessage("ID de usuario inválido"),
  ],
  validateRequest,
  asyncHandler(cerrarCajaController)
);

// ========================================
// RUTAS DE EQUIPOS
// ========================================

// POST /api/planillas-pago/equipos - Agregar equipo
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
  asyncHandler(addEquipoController)
);

// PUT /api/planillas-pago/equipos/:id - Actualizar equipo
router.put(
  "/equipos/:id",
  authMiddleware,
  [
    param("id").isInt().withMessage("ID de equipo inválido"),
    body("tipopago").optional().isInt().withMessage("Tipo de pago inválido"),
    body("importe").optional().isNumeric().withMessage("Importe inválido"),
    body("iddeposito").optional().isInt(),
  ],
  validateRequest,
  asyncHandler(updateEquipoController)
);

// DELETE /api/planillas-pago/equipos/:id - Eliminar equipo
router.delete(
  "/equipos/:id",
  authMiddleware,
  [param("id").isInt().withMessage("ID de equipo inválido")],
  validateRequest,
  asyncHandler(deleteEquipoController)
);

// ========================================
// RUTAS DE ÁRBITROS
// ========================================

// POST /api/planillas-pago/arbitros - Agregar árbitro
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
  asyncHandler(addArbitroController)
);

// PUT /api/planillas-pago/arbitros/:idfecha/:orden - Actualizar árbitro
router.put(
  "/arbitros/:idfecha/:orden",
  authMiddleware,
  [
    param("idfecha").isInt().withMessage("ID de fecha inválido"),
    param("orden").isInt().withMessage("Orden inválido"),
    body("idarbitro").optional().isInt().withMessage("ID de árbitro inválido"),
    body("partidos")
      .optional()
      .isNumeric()
      .withMessage("Cantidad de partidos inválida"),
    body("valor_partido")
      .optional()
      .isNumeric()
      .withMessage("Valor por partido inválido"),
    body("idprofesor").optional().isInt(),
  ],
  validateRequest,
  asyncHandler(updateArbitroController)
);

// DELETE /api/planillas-pago/arbitros/:idfecha/:orden - Eliminar árbitro
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

// POST /api/planillas-pago/canchas - Agregar cancha
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
  asyncHandler(addCanchaController)
);

// PUT /api/planillas-pago/canchas/:idfecha/:orden - Actualizar cancha
router.put(
  "/canchas/:idfecha/:orden",
  authMiddleware,
  [
    param("idfecha").isInt().withMessage("ID de fecha inválido"),
    param("orden").isInt().withMessage("Orden inválido"),
    body("horas")
      .optional()
      .isNumeric()
      .withMessage("Cantidad de horas inválida"),
    body("valor_hora")
      .optional()
      .isNumeric()
      .withMessage("Valor por hora inválido"),
  ],
  validateRequest,
  asyncHandler(updateCanchaController)
);

// DELETE /api/planillas-pago/canchas/:idfecha/:orden - Eliminar cancha
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

// POST /api/planillas-pago/profesores - Agregar profesor
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
  asyncHandler(addProfesorController)
);

// PUT /api/planillas-pago/profesores/:idfecha/:orden - Actualizar profesor
router.put(
  "/profesores/:idfecha/:orden",
  authMiddleware,
  [
    param("idfecha").isInt().withMessage("ID de fecha inválido"),
    param("orden").isInt().withMessage("Orden inválido"),
    body("idprofesor")
      .optional()
      .isInt()
      .withMessage("ID de profesor inválido"),
    body("horas")
      .optional()
      .isNumeric()
      .withMessage("Cantidad de horas inválida"),
    body("valor_hora")
      .optional()
      .isNumeric()
      .withMessage("Valor por hora inválido"),
  ],
  validateRequest,
  asyncHandler(updateProfesorController)
);

// DELETE /api/planillas-pago/profesores/:idfecha/:orden - Eliminar profesor
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

// POST /api/planillas-pago/medico - Agregar médico
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
  asyncHandler(addMedicoController)
);

// PUT /api/planillas-pago/medico/:idfecha/:orden - Actualizar médico
router.put(
  "/medico/:idfecha/:orden",
  authMiddleware,
  [
    param("idfecha").isInt().withMessage("ID de fecha inválido"),
    param("orden").isInt().withMessage("Orden inválido"),
    body("idmedico").optional().isInt().withMessage("ID de médico inválido"),
    body("horas")
      .optional()
      .isNumeric()
      .withMessage("Cantidad de horas inválida"),
    body("valor_hora")
      .optional()
      .isNumeric()
      .withMessage("Valor por hora inválido"),
  ],
  validateRequest,
  asyncHandler(updateMedicoController)
);

// DELETE /api/planillas-pago/medico/:idfecha/:orden - Eliminar médico
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

// POST /api/planillas-pago/otros-gastos - Agregar gasto
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
  asyncHandler(addOtroGastoController)
);

// PUT /api/planillas-pago/otros-gastos/:idfecha/:orden - Actualizar gasto
router.put(
  "/otros-gastos/:idfecha/:orden",
  authMiddleware,
  [
    param("idfecha").isInt().withMessage("ID de fecha inválido"),
    param("orden").isInt().withMessage("Orden inválido"),
    body("codgasto").optional().isInt().withMessage("Código de gasto inválido"),
    body("cantidad").optional().isNumeric().withMessage("Cantidad inválida"),
    body("valor_unidad")
      .optional()
      .isNumeric()
      .withMessage("Valor unitario inválido"),
    body("idprofesor").optional().isInt(),
  ],
  validateRequest,
  asyncHandler(updateOtroGastoController)
);

// DELETE /api/planillas-pago/otros-gastos/:idfecha/:orden - Eliminar gasto
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

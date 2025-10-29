// WebApp/src/pages/Privado/PlanillaPagos.tsx
// ✅ ACTUALIZADO: Ahora muestra el nombre del profesor en la tabla

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import {
  PageHeader,
  StatusMessage,
  Modal,
  DateRangePicker,
  PopupNotificacion,
} from "../../components/common";

import {
  getPlanillasByFiltros,
  getPlanillaCompleta,
} from "../../store/slices/planillasPagosSlice";

import { fetchTorneos } from "../../store/slices/torneoSlice";
import { fetchSedes } from "../../store/slices/sedeSlice";
import { PlanillaPago, PlanillasFiltros } from "../../types/planillasPago";

import { DocumentTextIcon } from "@heroicons/react/24/outline";
import PlanillaDetalleTabs from "../../components/planillasPago/PlanillaDetalleTabs";

const PlanillaPagos: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { planillas, planillaActual, loading, error } = useSelector(
    (state: RootState) => state.planillasPagos
  );
  const { torneos } = useSelector((state: RootState) => state.torneos);
  const { sedes } = useSelector((state: RootState) => state.sedes);

  const [filtros, setFiltros] = useState<PlanillasFiltros>({
    idtorneo: 0,
    fecha_desde: "",
    fecha_hasta: "",
    idsede: 0,
    estado: undefined,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanilla, setSelectedPlanilla] = useState<PlanillaPago | null>(
    null
  );

  const [popup, setPopup] = useState<{
    open: boolean;
    type: "success" | "error" | "warning";
    message: string;
  }>({
    open: false,
    type: "success",
    message: "",
  });

  // Cargar torneos y sedes al montar
  useEffect(() => {
    dispatch(fetchTorneos({ page: 1, limit: 1000, searchTerm: "" }));
    dispatch(fetchSedes());
  }, [dispatch]);

  const handleFiltrar = () => {
    dispatch(getPlanillasByFiltros(filtros));
  };

  const handleVerDetalle = async (planilla: PlanillaPago) => {
    if (planilla.idfecha) {
      await dispatch(getPlanillaCompleta(planilla.idfecha));
      setSelectedPlanilla(planilla);
      setIsModalOpen(true);
    }
  };

  const getEstadoTexto = (planilla: PlanillaPago): string => {
    if (planilla.fhcierrecaja) return "Contabilizada";
    if (planilla.fhcierre) return "Cerrada";
    return "Abierta";
  };

  const getEstadoColor = (
    planilla: PlanillaPago
  ):
    | "bg-green-100 text-green-800"
    | "bg-yellow-100 text-yellow-800"
    | "bg-gray-100 text-gray-800" => {
    if (planilla.fhcierrecaja) return "bg-green-100 text-green-800";
    if (planilla.fhcierre) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  // Filtrar torneos activos
  const torneosActivos = torneos.filter((t) => t.codestado === 1);

  return (
    <div className="flex justify-center items-center">
      <PopupNotificacion
        open={popup.open}
        type={popup.type}
        message={popup.message}
        onClose={() => setPopup({ ...popup, open: false })}
      />

      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-7xl">
        <PageHeader
          title="Planillas de Pago"
          subtitle="Gestión de ingresos y egresos por caja (agrupación de fecha/profesor/sede)"
        />

        {/* Filtros */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Torneo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Torneo
              </label>
              <select
                value={filtros.idtorneo || 0}
                onChange={(e) => {
                  setFiltros({ ...filtros, idtorneo: Number(e.target.value) });
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value={0}>Todos los torneos</option>
                {torneosActivos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Sede */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sede
              </label>
              <select
                value={filtros.idsede || 0}
                onChange={(e) =>
                  setFiltros({ ...filtros, idsede: Number(e.target.value) })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value={0}>Todas las sedes</option>
                {sedes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filtros.estado || ""}
                onChange={(e) =>
                  setFiltros({
                    ...filtros,
                    estado: e.target.value as
                      | "abierta"
                      | "cerrada"
                      | "contabilizada"
                      | undefined,
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">Todos los estados</option>
                <option value="abierta">Abierta</option>
                <option value="cerrada">Cerrada</option>
                <option value="contabilizada">Contabilizada</option>
              </select>
            </div>
          </div>

          {/* Rango de fechas */}
          <DateRangePicker
            startDate={filtros.fecha_desde || ""}
            endDate={filtros.fecha_hasta || ""}
            setStartDate={(date) =>
              setFiltros({ ...filtros, fecha_desde: date })
            }
            setEndDate={(date) => setFiltros({ ...filtros, fecha_hasta: date })}
          />

          {/* Botón Filtrar */}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setFiltros({
                  idtorneo: 0,
                  fecha_desde: "",
                  fecha_hasta: "",
                  idsede: 0,
                  estado: undefined,
                });
              }}
              className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition"
            >
              Limpiar
            </button>
            <button
              onClick={handleFiltrar}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Filtrar
            </button>
          </div>
        </div>

        <StatusMessage loading={loading} error={error} />

        {/* Tabla de Planillas con SCROLL */}
        {!loading && planillas.length > 0 && (
          <div className="overflow-auto max-h-[600px] border border-gray-300 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-left">Fecha</th>
                  <th className="px-4 py-2 text-left">Nro. Fecha</th>
                  <th className="px-4 py-2 text-left">Sede</th>
                  <th className="px-4 py-2 text-left">Torneo</th>
                  <th className="px-4 py-2 text-left">Profesor</th>
                  <th className="px-4 py-2 text-center">Estado</th>
                  <th className="px-4 py-2 text-right">Total Caja</th>
                  <th className="px-4 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {planillas.map((planilla: PlanillaPago) => (
                  <tr
                    key={`planilla-${planilla.idfecha}`}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleVerDetalle(planilla)}
                  >
                    <td className="px-4 py-2">
                      {new Date(planilla.fecha).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {planilla.codfecha || "-"}
                    </td>
                    <td className="px-4 py-2">{planilla.sede_nombre || "-"}</td>
                    <td className="px-4 py-2">
                      {planilla.torneo_nombre || planilla.torneo || "-"}
                    </td>
                    {/* ✅ ACTUALIZADO: Ahora muestra el nombre del profesor */}
                    <td className="px-4 py-2">
                      {planilla.profesor_nombre ||
                        (planilla.idprofesor
                          ? `ID: ${planilla.idprofesor}`
                          : "-")}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {planilla.cantidad_partidos ? (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-700 bg-blue-100 rounded-full">
                          {planilla.cantidad_partidos}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${getEstadoColor(
                          planilla
                        )}`}
                      >
                        {getEstadoTexto(planilla)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-semibold">
                      ${planilla.total_caja?.toLocaleString() || "0"}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerDetalle(planilla);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Ver detalle"
                        >
                          <DocumentTextIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && planillas.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron planillas con los filtros seleccionados
          </div>
        )}

        {/* Estadísticas */}
        {planillas.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            <div className="flex flex-wrap gap-4">
              <div>
                <strong>Total cajas:</strong> {planillas.length}
              </div>
              <div>
                <strong>Abiertas:</strong>{" "}
                {planillas.filter((p) => !p.fhcierre && !p.fhcierrecaja).length}
              </div>
              <div>
                <strong>Cerradas:</strong>{" "}
                {planillas.filter((p) => p.fhcierre && !p.fhcierrecaja).length}
              </div>
              <div>
                <strong>Contabilizadas:</strong>{" "}
                {planillas.filter((p) => p.fhcierrecaja).length}
              </div>
              {/* ✅ NUEVO: Total de partidos */}
              <div>
                <strong>Total partidos:</strong>{" "}
                {planillas.reduce(
                  (sum, p) => sum + (p.cantidad_partidos || 0),
                  0
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Detalle */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPlanilla(null);
          }}
          title={
            selectedPlanilla
              ? `Caja - ${new Date(selectedPlanilla.fecha).toLocaleDateString(
                  "es-AR"
                )} - Fecha ${selectedPlanilla.codfecha || ""}`
              : "Detalle de Caja"
          }
        >
          {planillaActual && (
            <PlanillaDetalleTabs
              planillaCompleta={planillaActual}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedPlanilla(null);
                handleFiltrar();
              }}
            />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default PlanillaPagos;

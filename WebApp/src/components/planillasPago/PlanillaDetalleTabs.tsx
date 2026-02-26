import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { PlanillaCompleta } from "../../types/planillasPago";
import { PlanillaHeader } from "./shared/PlanillaHeader";
import { TabNavigation, Tab } from "./shared/TabNavigation";
import { DatosTab } from "./tabs/DatosTab";
import { TotalesTab } from "./tabs/TotalesTab";
import { EquiposTab } from "./tabs/EquiposTab";
import { ArbitrosTab } from "./tabs/ArbitrosTab";
import { CanchasTab } from "./tabs/CanchasTab";
import { ProfesoresTab } from "./tabs/ProfesoresTab";
import { MedicoTab } from "./tabs/MedicoTab";
import { OtrosGastosTab } from "./tabs/OtrosGastosTab";
import {
  updateTurnoPlanilla,
  updateEfectivoRealPlanilla,
  updateObservPlanilla,
  updateObservCajaPlanilla,
  cerrarPlanilla,
  cerrarCaja,
  reabrirPlanilla,
  exportarPlanillaCSV,
  getPlanillaCompleta,
} from "../../api/planillasPagosService";

type Props = {
  planillaCompleta: PlanillaCompleta;
  onClose: () => void;
  onUpdate?: () => void;
};

const PlanillaDetalleTabs: React.FC<Props> = ({
  planillaCompleta: initialPlanillaCompleta,
  onClose,
  onUpdate,
}) => {
  const [planillaCompleta, setPlanillaCompleta] = useState(
    initialPlanillaCompleta
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    planilla,
    arbitros,
    canchas,
    profesores,
    medico,
    otros_gastos,
    totales,
  } = planillaCompleta;

  const { user } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState<string>("equipos");
  const [observCaja, setObservCaja] = useState(planilla.observ_caja || "");
  const [efectivoReal, setEfectivoReal] = useState(planilla.totefectivo || 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const observDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const observCajaDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPlanillaCompleta(initialPlanillaCompleta);
  }, [initialPlanillaCompleta]);

  useEffect(() => {
    setEfectivoReal(planilla.totefectivo || 0);
    setObservCaja(planilla.observ_caja || "");
  }, [planilla]);

  // Auto-limpiar notificaciones después de 4 segundos
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  const refreshData = useCallback(async () => {
    if (!planilla.idfecha) return;

    setIsRefreshing(true);
    try {
      const updatedPlanilla = await getPlanillaCompleta(planilla.idfecha);
      if (updatedPlanilla) {
        setPlanillaCompleta(updatedPlanilla);
      }
    } catch (error) {
      console.error("Error al refrescar datos:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [planilla.idfecha]);

  const getEstado = (): string => {
    if (planilla.fhcierrecaja) return "Contabilizada";
    if (planilla.fhcierre) return "Cerrada";
    return "Abierta";
  };

  const getEstadoColor = (): "green" | "yellow" | "gray" => {
    if (planilla.fhcierrecaja) return "green";
    if (planilla.fhcierre) return "yellow";
    return "gray";
  };

  const tabs: Tab[] = [
    { id: "datos", label: "Datos", icon: "📋" },
    { id: "equipos", label: "Equipos", icon: "👥" },
    { id: "arbitros", label: "Árbitros", icon: "👨‍⚖️" },
    { id: "canchas", label: "Canchas", icon: "🏟️" },
    { id: "profesores", label: "Profesores", icon: "👨‍🏫" },
    { id: "medico", label: "Serv.Médico", icon: "⚕️" },
    { id: "otros", label: "Otros Gastos", icon: "📦" },
    { id: "totales", label: "Totales", icon: "💵" },
  ];

  const handleSuccess = useCallback(async () => {
    console.log("✅ Operación exitosa - Refrescando datos...");
    await refreshData();
    onUpdate?.();
  }, [refreshData, onUpdate]);

  const handleError = (error: string) => {
    console.error("❌ Error:", error);
    setNotification({ type: "error", message: error });
  };

  const handleUpdateObserv = (value: string) => {
    if (observDebounceRef.current) clearTimeout(observDebounceRef.current);
    observDebounceRef.current = setTimeout(async () => {
      try {
        await updateObservPlanilla(planilla.idfecha, value || null);
      } catch (error) {
        console.error("Error al guardar observación:", error);
      }
    }, 800);
  };

  const handleUpdateObservCaja = (value: string) => {
    setObservCaja(value);
    if (observCajaDebounceRef.current) clearTimeout(observCajaDebounceRef.current);
    observCajaDebounceRef.current = setTimeout(async () => {
      try {
        await updateObservCajaPlanilla(planilla.idfecha, value || null);
      } catch (error) {
        console.error("Error al guardar observación de caja:", error);
      }
    }, 800);
  };

  const handleUpdateTurno = async (idturno: number) => {
    try {
      await updateTurnoPlanilla(planilla.idfecha, idturno);
      await handleSuccess();
    } catch (error) {
      handleError(
        error instanceof Error ? error.message : "Error al actualizar turno"
      );
    }
  };

  const handleUpdateEfectivoReal = async (efectivo: number) => {
    setEfectivoReal(efectivo);
    try {
      await updateEfectivoRealPlanilla(planilla.idfecha, efectivo);
    } catch (error) {
      handleError(
        error instanceof Error
          ? error.message
          : "Error al actualizar efectivo real"
      );
    }
  };

  const handleCerrarPlanilla = async () => {
    if (!planilla.idprofesor) {
      handleError("Debe asignar un profesor antes de cerrar la planilla");
      return;
    }

    setIsProcessing(true);
    try {
      await cerrarPlanilla(planilla.idfecha, planilla.idprofesor);
      setNotification({ type: "success", message: "Planilla cerrada exitosamente" });
      await refreshData();
      onUpdate?.();
      setShowConfirmDialog(null);
    } catch (error) {
      handleError(
        error instanceof Error ? error.message : "Error al cerrar planilla"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCerrarCaja = async () => {
    setIsProcessing(true);
    try {
      await cerrarCaja(planilla.idfecha, Number(user?.id) || 1);
      setNotification({ type: "success", message: "Caja contabilizada exitosamente" });
      await refreshData();
      onUpdate?.();
      setShowConfirmDialog(null);
    } catch (error) {
      handleError(
        error instanceof Error ? error.message : "Error al cerrar caja"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReabrirPlanilla = async () => {
    setIsProcessing(true);
    try {
      await reabrirPlanilla(planilla.idfecha);
      setNotification({ type: "success", message: "Planilla reabierta exitosamente" });
      await refreshData();
      onUpdate?.();
      setShowConfirmDialog(null);
    } catch (error) {
      handleError(
        error instanceof Error ? error.message : "Error al reabrir planilla"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportar = async () => {
    setIsProcessing(true);
    try {
      await exportarPlanillaCSV(planilla.idfecha);
    } catch (error) {
      handleError(error instanceof Error ? error.message : "Error al exportar");
    } finally {
      setIsProcessing(false);
    }
  };

  const isEditable = !planilla.fhcierre && !planilla.fhcierrecaja;
  const isClosed = !!planilla.fhcierre && !planilla.fhcierrecaja;
  const isContabilizada = !!planilla.fhcierrecaja;

  return (
    <div className="flex flex-col h-full">
      {isRefreshing && (
        <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-1 text-sm z-50">
          Actualizando datos...
        </div>
      )}

      {notification && (
        <div
          className={`absolute top-0 left-0 right-0 text-white text-center py-2 text-sm z-50 ${
            notification.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {notification.type === "success" ? "✅ " : "❌ "}
          {notification.message}
        </div>
      )}

      <PlanillaHeader
        planilla={planilla}
        estado={getEstado()}
        estadoColor={getEstadoColor()}
      />

      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "datos" && (
          <DatosTab
            planilla={planilla}
            isEditable={isEditable}
            onUpdateObserv={handleUpdateObserv}
            onUpdateTurno={handleUpdateTurno}
          />
        )}

        {activeTab === "equipos" && (
          <EquiposTab
            idfecha={planilla.idfecha}
            isEditable={isEditable}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        )}

        {activeTab === "arbitros" && (
          <ArbitrosTab
            arbitros={arbitros}
            idfecha={planilla.idfecha}
            isEditable={isEditable}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        )}

        {activeTab === "canchas" && (
          <CanchasTab
            canchas={canchas}
            idfecha={planilla.idfecha}
            isEditable={isEditable}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        )}

        {activeTab === "profesores" && (
          <ProfesoresTab
            profesores={profesores}
            idfecha={planilla.idfecha}
            isEditable={isEditable}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        )}

        {activeTab === "medico" && (
          <MedicoTab
            medico={medico}
            idfecha={planilla.idfecha}
            isEditable={isEditable}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        )}

        {activeTab === "otros" && (
          <OtrosGastosTab
            otros_gastos={otros_gastos}
            idfecha={planilla.idfecha}
            isEditable={isEditable}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        )}

        {activeTab === "totales" && (
          <TotalesTab
            totales={totales}
            efectivo_real={efectivoReal}
            observ_caja={observCaja}
            onUpdateEfectivoReal={handleUpdateEfectivoReal}
            onUpdateObservCaja={handleUpdateObservCaja}
          />
        )}
      </div>

      <div className="border-t p-4">
        <div className="flex flex-wrap justify-between gap-3">
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
            >
              Cerrar
            </button>
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="px-4 py-2 border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50 transition disabled:opacity-50"
              title="Refrescar datos"
            >
              🔄 Refrescar
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportar}
              disabled={isProcessing}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition disabled:opacity-50"
            >
              📄 Exportar CSV
            </button>

            {isEditable && (
              <button
                onClick={() => setShowConfirmDialog("cerrar")}
                disabled={isProcessing || !planilla.idprofesor}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition disabled:opacity-50"
                title={
                  !planilla.idprofesor
                    ? "Debe asignar un profesor primero"
                    : "Cerrar planilla"
                }
              >
                🔒 Cerrar Planilla
              </button>
            )}

            {isClosed && (
              <>
                <button
                  onClick={() => setShowConfirmDialog("contabilizar")}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50"
                >
                  ✅ Contabilizar Caja
                </button>
                <button
                  onClick={() => setShowConfirmDialog("reabrir")}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition disabled:opacity-50"
                >
                  🔓 Reabrir
                </button>
              </>
            )}

            {isContabilizada && (
              <button
                onClick={() => setShowConfirmDialog("reabrir")}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition disabled:opacity-50"
              >
                🔓 Reabrir (Admin)
              </button>
            )}
          </div>
        </div>

        {!planilla.idprofesor && isEditable && (
          <div className="mt-3 text-sm text-yellow-700 bg-yellow-50 p-2 rounded border border-yellow-200">
            ⚠️ Debe asignar un profesor en la pestaña "Datos" antes de cerrar la
            planilla.
          </div>
        )}
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold mb-4">
              {showConfirmDialog === "cerrar" && "¿Cerrar Planilla?"}
              {showConfirmDialog === "contabilizar" && "¿Contabilizar Caja?"}
              {showConfirmDialog === "reabrir" && "¿Reabrir Planilla?"}
            </h3>

            <div className="mb-4 text-sm text-gray-600">
              {showConfirmDialog === "cerrar" && (
                <>
                  <p>
                    Esta acción cerrará la planilla de la fecha{" "}
                    <strong>{planilla.codfecha}</strong>.
                  </p>
                  <p className="mt-2">
                    Profesor que cierra:{" "}
                    <strong>{planilla.profesor_nombre || "N/A"}</strong>
                  </p>
                  <p className="mt-2">
                    Una vez cerrada, no se podrán editar los equipos ni pagos.
                  </p>
                </>
              )}
              {showConfirmDialog === "contabilizar" && (
                <>
                  <p>
                    Esta acción contabilizará la caja de la fecha{" "}
                    <strong>{planilla.codfecha}</strong>.
                  </p>
                  <p className="mt-2">
                    Total Caja:{" "}
                    <strong>${totales.total_caja.toLocaleString()}</strong>
                  </p>
                  <p className="mt-2">
                    Una vez contabilizada, la caja quedará bloqueada.
                  </p>
                </>
              )}
              {showConfirmDialog === "reabrir" && (
                <p>
                  Esta acción reabrirá la planilla para permitir ediciones.
                  ¿Está seguro?
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(null)}
                disabled={isProcessing}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (showConfirmDialog === "cerrar") handleCerrarPlanilla();
                  if (showConfirmDialog === "contabilizar") handleCerrarCaja();
                  if (showConfirmDialog === "reabrir") handleReabrirPlanilla();
                }}
                disabled={isProcessing}
                className={`px-4 py-2 text-white rounded-md transition disabled:opacity-50 ${
                  showConfirmDialog === "reabrir"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : showConfirmDialog === "contabilizar"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-yellow-500 hover:bg-yellow-600"
                }`}
              >
                {isProcessing ? "Procesando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanillaDetalleTabs;

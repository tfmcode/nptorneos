import React, { useState } from "react";
import { PlanillaCompleta } from "../../types/planillasPago";
import { PlanillaHeader } from "./shared/PlanillaHeader";
import { TabNavigation, Tab } from "./shared/TabNavigation";
import { DatosTab, TotalesTab } from "./tabs/DatosTab";
import { EquiposTab } from "./tabs/EquiposTab";
import { ArbitrosTab } from "./tabs/ArbitrosTab";
import { CanchasTab } from "./tabs/CanchasTab";
import { ProfesoresTab } from "./tabs/ProfesoresTab";
import { MedicoTab } from "./tabs/MedicoTab";
import { OtrosGastosTab } from "./tabs/OtrosGastosTab";
import { updateTurnoPlanilla } from "../../api/planillasPagosService";

type Props = {
  planillaCompleta: PlanillaCompleta;
  onClose: () => void;
  onUpdate?: () => void;
};

const PlanillaDetalleTabs: React.FC<Props> = ({
  planillaCompleta,
  onClose,
  onUpdate,
}) => {
  const {
    planilla,
    arbitros,
    canchas,
    profesores,
    medico,
    otros_gastos,
    totales,
  } = planillaCompleta;

  const [activeTab, setActiveTab] = useState<string>("datos");
  const [, setObserv] = useState(planilla.observ || "");
  const [observCaja, setObservCaja] = useState(planilla.observ_caja || "");

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

  const handleSuccess = () => {
    console.log("✅ Operación exitosa");
    onUpdate?.();
  };

  const handleError = (error: string) => {
    console.error("❌ Error:", error);
    alert(`Error: ${error}`);
  };

  const handleUpdateTurno = async (idturno: number) => {
    try {
      await updateTurnoPlanilla(planilla.idfecha, idturno);
      handleSuccess();
    } catch (error) {
      handleError(
        error instanceof Error ? error.message : "Error al actualizar turno"
      );
    }
  };
  const isEditable = !planilla.fhcierre && !planilla.fhcierrecaja;

  return (
    <div className="flex flex-col h-full">
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
            onUpdateObserv={setObserv}
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
            onSuccess={handleSuccess}
            onError={handleError}
          />
        )}

        {activeTab === "canchas" && (
          <CanchasTab
            canchas={canchas}
            idfecha={planilla.idfecha}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        )}

        {activeTab === "profesores" && (
          <ProfesoresTab
            profesores={profesores}
            idfecha={planilla.idfecha}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        )}

        {activeTab === "medico" && (
          <MedicoTab
            medico={medico}
            idfecha={planilla.idfecha}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        )}

        {activeTab === "otros" && (
          <OtrosGastosTab
            otros_gastos={otros_gastos}
            idfecha={planilla.idfecha}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        )}

        {activeTab === "totales" && (
          <TotalesTab
            totales={totales}
            observ_caja={observCaja}
            onUpdateObservCaja={setObservCaja}
          />
        )}
      </div>

      <div className="border-t p-4 flex justify-between gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
        >
          Cerrar
        </button>

        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            📄 Exportar
          </button>

          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
            📊 Resumen
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanillaDetalleTabs;

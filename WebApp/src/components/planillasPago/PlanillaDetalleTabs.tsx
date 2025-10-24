// Ubicación: WebApp/src/components/planillasPago/PlanillaDetalleTabs.tsx

import React, { useState } from "react";
import {
  PlanillaCompleta,
  PlanillaEquipo,
  PlanillaArbitro,
  PlanillaCancha,
  PlanillaProfesor,
  PlanillaMedico,
  PlanillaOtroGasto,
} from "../../types/planillasPago";

type Props = {
  planillaCompleta: PlanillaCompleta;
  onClose: () => void;
  onUpdate?: () => void;
};

const currency = (n: number | undefined | null) =>
  typeof n === "number"
    ? n.toLocaleString("es-AR", { style: "currency", currency: "ARS" })
    : "-";

const PlanillaDetalleTabs: React.FC<Props> = ({
  planillaCompleta,
  onClose,
  onUpdate,
}) => {
  const {
    planilla,
    equipos,
    arbitros,
    canchas,
    profesores,
    medico,
    otros_gastos,
    totales,
  } = planillaCompleta;

  const [activeTab, setActiveTab] = useState<string>("datos");

  // Estados para edición inline
  const [editingEquipos, setEditingEquipos] = useState<PlanillaEquipo[]>(
    equipos || []
  );
  const [editingArbitros, setEditingArbitros] = useState<PlanillaArbitro[]>(
    arbitros || []
  );
  const [editingCanchas, setEditingCanchas] = useState<PlanillaCancha[]>(
    canchas || []
  );
  const [editingProfesores, setEditingProfesores] = useState<
    PlanillaProfesor[]
  >(profesores || []);
  const [editingMedico, setEditingMedico] = useState<PlanillaMedico[]>(
    medico || []
  );
  const [editingOtrosGastos, setEditingOtrosGastos] = useState<
    PlanillaOtroGasto[]
  >(otros_gastos || []);

  const tabs = [
    { id: "datos", label: "Datos", icon: "📋" },
    { id: "equipos", label: "Equipos", icon: "👥" },
    { id: "arbitros", label: "Árbitros", icon: "👨‍⚖️" },
    { id: "canchas", label: "Canchas", icon: "🏟️" },
    { id: "profesores", label: "Profesores", icon: "👨‍🏫" },
    { id: "medico", label: "Serv.Médico", icon: "⚕️" },
    { id: "otros", label: "Otros Gastos", icon: "📦" },
    { id: "totales", label: "Totales", icon: "💵" },
  ];

  const handleAgregarEquipo = () => {
    const nuevoOrden = editingEquipos.length + 1;
    setEditingEquipos([
      ...editingEquipos,
      {
        idfecha: planilla.idfecha,
        orden: nuevoOrden,
        idequipo: 0,
        tipopago: 1,
        importe: 0,
      },
    ]);
  };

  const handleActualizarEquipo = (
    index: number,
    field: keyof PlanillaEquipo,
    value: PlanillaEquipo[keyof PlanillaEquipo]
  ) => {
    const updated = [...editingEquipos];
    updated[index] = { ...updated[index], [field]: value };
    setEditingEquipos(updated);
  };

  const handleEliminarEquipo = (index: number) => {
    setEditingEquipos(editingEquipos.filter((_, i) => i !== index));
  };

  const handleAgregarArbitro = () => {
    const nuevoOrden = editingArbitros.length + 1;
    setEditingArbitros([
      ...editingArbitros,
      {
        idfecha: planilla.idfecha,
        orden: nuevoOrden,
        idarbitro: 0,
        partidos: 0,
        valor_partido: 0,
        total: 0,
      },
    ]);
  };

  const handleActualizarArbitro = (
    index: number,
    field: keyof PlanillaArbitro,
    value: PlanillaArbitro[keyof PlanillaArbitro]
  ) => {
    const updated = [...editingArbitros];
    updated[index] = { ...updated[index], [field]: value };

    // Recalcular total si cambian partidos o valor_partido
    if (field === "partidos" || field === "valor_partido") {
      const partidos =
        field === "partidos" ? Number(value) : updated[index].partidos;
      const valorPartido =
        field === "valor_partido"
          ? Number(value)
          : updated[index].valor_partido;
      updated[index].total = partidos * valorPartido;
    }

    setEditingArbitros(updated);
  };

  const handleEliminarArbitro = (index: number) => {
    setEditingArbitros(editingArbitros.filter((_, i) => i !== index));
  };

  const handleAgregarCancha = () => {
    const nuevoOrden = editingCanchas.length + 1;
    setEditingCanchas([
      ...editingCanchas,
      {
        idfecha: planilla.idfecha,
        orden: nuevoOrden,
        horas: 0,
        valor_hora: 0,
        total: 0,
      },
    ]);
  };

  const handleActualizarCancha = (
    index: number,
    field: keyof PlanillaCancha,
    value: PlanillaCancha[keyof PlanillaCancha]
  ) => {
    const updated = [...editingCanchas];
    updated[index] = { ...updated[index], [field]: value };

    // Recalcular total
    if (field === "horas" || field === "valor_hora") {
      const horas = field === "horas" ? Number(value) : updated[index].horas;
      const valorHora =
        field === "valor_hora" ? Number(value) : updated[index].valor_hora;
      updated[index].total = horas * valorHora;
    }

    setEditingCanchas(updated);
  };

  const handleEliminarCancha = (index: number) => {
    setEditingCanchas(editingCanchas.filter((_, i) => i !== index));
  };

  const handleAgregarProfesor = () => {
    const nuevoOrden = editingProfesores.length + 1;
    setEditingProfesores([
      ...editingProfesores,
      {
        idfecha: planilla.idfecha,
        orden: nuevoOrden,
        idprofesor: 0,
        horas: 0,
        valor_hora: 0,
        total: 0,
      },
    ]);
  };

  const handleActualizarProfesor = (
    index: number,
    field: keyof PlanillaProfesor,
    value: PlanillaProfesor[keyof PlanillaProfesor]
  ) => {
    const updated = [...editingProfesores];
    updated[index] = { ...updated[index], [field]: value };

    // Recalcular total
    if (field === "horas" || field === "valor_hora") {
      const horas = field === "horas" ? Number(value) : updated[index].horas;
      const valorHora =
        field === "valor_hora" ? Number(value) : updated[index].valor_hora;
      updated[index].total = horas * valorHora;
    }

    setEditingProfesores(updated);
  };

  const handleEliminarProfesor = (index: number) => {
    setEditingProfesores(editingProfesores.filter((_, i) => i !== index));
  };

  const handleAgregarMedico = () => {
    const nuevoOrden = editingMedico.length + 1;
    setEditingMedico([
      ...editingMedico,
      {
        idfecha: planilla.idfecha,
        orden: nuevoOrden,
        idmedico: 0,
        horas: 0,
        valor_hora: 0,
        total: 0,
      },
    ]);
  };

  const handleActualizarMedico = (
    index: number,
    field: keyof PlanillaMedico,
    value: PlanillaMedico[keyof PlanillaMedico]
  ) => {
    const updated = [...editingMedico];
    updated[index] = { ...updated[index], [field]: value };

    // Recalcular total
    if (field === "horas" || field === "valor_hora") {
      const horas = field === "horas" ? Number(value) : updated[index].horas;
      const valorHora =
        field === "valor_hora" ? Number(value) : updated[index].valor_hora;
      updated[index].total = horas * valorHora;
    }

    setEditingMedico(updated);
  };

  const handleEliminarMedico = (index: number) => {
    setEditingMedico(editingMedico.filter((_, i) => i !== index));
  };

  const handleAgregarOtroGasto = () => {
    const nuevoOrden = editingOtrosGastos.length + 1;
    setEditingOtrosGastos([
      ...editingOtrosGastos,
      {
        idfecha: planilla.idfecha,
        orden: nuevoOrden,
        codgasto: 0,
        cantidad: 0,
        valor_unidad: 0,
        total: 0,
      },
    ]);
  };

  const handleActualizarOtroGasto = (
    index: number,
    field: keyof PlanillaOtroGasto,
    value: PlanillaOtroGasto[keyof PlanillaOtroGasto]
  ) => {
    const updated = [...editingOtrosGastos];
    updated[index] = { ...updated[index], [field]: value };

    // Recalcular total
    if (field === "cantidad" || field === "valor_unidad") {
      const cantidad =
        field === "cantidad" ? Number(value) : updated[index].cantidad;
      const valorUnidad =
        field === "valor_unidad" ? Number(value) : updated[index].valor_unidad;
      updated[index].total = cantidad * valorUnidad;
    }

    setEditingOtrosGastos(updated);
  };

  const handleEliminarOtroGasto = (index: number) => {
    setEditingOtrosGastos(editingOtrosGastos.filter((_, i) => i !== index));
  };

  const handleGuardar = async () => {
    // Aquí implementarías el guardado de todos los cambios
    console.log("Guardando cambios...", {
      equipos: editingEquipos,
      arbitros: editingArbitros,
      canchas: editingCanchas,
      profesores: editingProfesores,
      medico: editingMedico,
      otros_gastos: editingOtrosGastos,
    });

    if (onUpdate) {
      onUpdate();
    }
  };

  const partidoInfo = planilla.partido_info;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Planilla de Pago
          </h2>
          <p className="text-sm text-gray-500">
            {planilla.fecha &&
              new Date(planilla.fecha).toLocaleDateString("es-AR")}{" "}
            · Sede: <strong>{planilla.sede_nombre || "-"}</strong> · Torneo:{" "}
            <strong>{planilla.torneo_nombre || planilla.torneo || "-"}</strong>
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto border-b mt-4 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-yellow-500 text-white border-b-2 border-yellow-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* TAB: DATOS */}
        {activeTab === "datos" && (
          <div className="space-y-4">
            <h3 className="text-md font-semibold">Información General</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fecha
                </label>
                <input
                  type="date"
                  value={
                    planilla.fecha
                      ? new Date(planilla.fecha).toISOString().split("T")[0]
                      : ""
                  }
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sede
                </label>
                <input
                  type="text"
                  value={planilla.sede_nombre || "-"}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Torneo
                </label>
                <input
                  type="text"
                  value={planilla.torneo_nombre || planilla.torneo || "-"}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Zona
                </label>
                <input
                  type="text"
                  value={planilla.zona_nombre || planilla.zona || "-"}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  disabled
                />
              </div>
            </div>

            {partidoInfo && (
              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <h4 className="text-md font-semibold mb-3">
                  Información del Partido
                </h4>
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div className="text-lg font-bold">
                      {partidoInfo.nombre1 || "Equipo Local"}
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mt-2">
                      {partidoInfo.goles1 ?? 0}
                    </div>
                  </div>

                  <div className="px-4 text-2xl font-bold text-gray-400">
                    VS
                  </div>

                  <div className="text-center flex-1">
                    <div className="text-lg font-bold">
                      {partidoInfo.nombre2 || "Equipo Visitante"}
                    </div>
                    <div className="text-3xl font-bold text-indigo-600 mt-2">
                      {partidoInfo.goles2 ?? 0}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Observaciones
              </label>
              <textarea
                rows={3}
                value={planilla.observ || ""}
                className="mt-1 w-full px-3 py-2 border rounded-md"
                placeholder="Transferencias, Tiburón $35.000..."
              />
            </div>
          </div>
        )}

        {/* TAB: EQUIPOS */}
        {activeTab === "equipos" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-semibold">Ingresos por Equipos</h3>
              <button
                onClick={handleAgregarEquipo}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
              >
                + Agregar
              </button>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left">Orden</th>
                  <th className="px-3 py-2 text-left">Equipo</th>
                  <th className="px-3 py-2 text-left">Tipo Pago</th>
                  <th className="px-3 py-2 text-left">Importe</th>
                  <th className="px-3 py-2 text-left">Depósito</th>
                  <th className="px-3 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {editingEquipos.map((equipo, index) => (
                  <tr key={`eq-${index}`} className="border-t">
                    <td className="px-3 py-2">{equipo.orden}</td>
                    <td className="px-3 py-2">
                      {partidoInfo && index === 0
                        ? partidoInfo.nombre1
                        : partidoInfo && index === 1
                        ? partidoInfo.nombre2
                        : equipo.nombre_equipo || equipo.idequipo}
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={equipo.tipopago}
                        onChange={(e) =>
                          handleActualizarEquipo(
                            index,
                            "tipopago",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 border rounded"
                      >
                        <option value={1}>Efectivo</option>
                        <option value={2}>Transferencia</option>
                        <option value={3}>Débito Automático</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={equipo.importe}
                        onChange={(e) =>
                          handleActualizarEquipo(
                            index,
                            "importe",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={equipo.iddeposito || ""}
                        onChange={(e) =>
                          handleActualizarEquipo(
                            index,
                            "iddeposito",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleEliminarEquipo(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: ÁRBITROS */}
        {activeTab === "arbitros" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-semibold">Egresos - Árbitros</h3>
              <button
                onClick={handleAgregarArbitro}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
              >
                + Agregar
              </button>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left">Orden</th>
                  <th className="px-3 py-2 text-left">Árbitro</th>
                  <th className="px-3 py-2 text-left">Partidos</th>
                  <th className="px-3 py-2 text-left">Valor Partido</th>
                  <th className="px-3 py-2 text-left">Total</th>
                  <th className="px-3 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {editingArbitros.map((arbitro, index) => (
                  <tr key={`ar-${index}`} className="border-t">
                    <td className="px-3 py-2">{arbitro.orden}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={arbitro.idarbitro}
                        onChange={(e) =>
                          handleActualizarArbitro(
                            index,
                            "idarbitro",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 border rounded"
                        placeholder="ID Árbitro"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.5"
                        value={arbitro.partidos}
                        onChange={(e) =>
                          handleActualizarArbitro(
                            index,
                            "partidos",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={arbitro.valor_partido}
                        onChange={(e) =>
                          handleActualizarArbitro(
                            index,
                            "valor_partido",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-3 py-2 font-medium">
                      {currency(arbitro.total)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleEliminarArbitro(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: CANCHAS */}
        {activeTab === "canchas" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-semibold">Egresos - Canchas</h3>
              <button
                onClick={handleAgregarCancha}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
              >
                + Agregar
              </button>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left">Orden</th>
                  <th className="px-3 py-2 text-left">Horas</th>
                  <th className="px-3 py-2 text-left">Valor Hora</th>
                  <th className="px-3 py-2 text-left">Total</th>
                  <th className="px-3 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {editingCanchas.map((cancha, index) => (
                  <tr key={`ca-${index}`} className="border-t">
                    <td className="px-3 py-2">{cancha.orden}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.5"
                        value={cancha.horas}
                        onChange={(e) =>
                          handleActualizarCancha(
                            index,
                            "horas",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={cancha.valor_hora}
                        onChange={(e) =>
                          handleActualizarCancha(
                            index,
                            "valor_hora",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-3 py-2 font-medium">
                      {currency(cancha.total)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleEliminarCancha(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: PROFESORES */}
        {activeTab === "profesores" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-semibold">Egresos - Profesores</h3>
              <button
                onClick={handleAgregarProfesor}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
              >
                + Agregar
              </button>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left">Orden</th>
                  <th className="px-3 py-2 text-left">Profesor</th>
                  <th className="px-3 py-2 text-left">Horas</th>
                  <th className="px-3 py-2 text-left">Valor Hora</th>
                  <th className="px-3 py-2 text-left">Total</th>
                  <th className="px-3 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {editingProfesores.map((profesor, index) => (
                  <tr key={`pr-${index}`} className="border-t">
                    <td className="px-3 py-2">{profesor.orden}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={profesor.idprofesor}
                        onChange={(e) =>
                          handleActualizarProfesor(
                            index,
                            "idprofesor",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 border rounded"
                        placeholder="ID Profesor"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.5"
                        value={profesor.horas}
                        onChange={(e) =>
                          handleActualizarProfesor(
                            index,
                            "horas",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={profesor.valor_hora}
                        onChange={(e) =>
                          handleActualizarProfesor(
                            index,
                            "valor_hora",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-3 py-2 font-medium">
                      {currency(profesor.total)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleEliminarProfesor(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: MÉDICO */}
        {activeTab === "medico" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-semibold">
                Egresos - Servicio Médico
              </h3>
              <button
                onClick={handleAgregarMedico}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
              >
                + Agregar
              </button>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left">Orden</th>
                  <th className="px-3 py-2 text-left">Médico</th>
                  <th className="px-3 py-2 text-left">Horas</th>
                  <th className="px-3 py-2 text-left">Valor Hora</th>
                  <th className="px-3 py-2 text-left">Total</th>
                  <th className="px-3 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {editingMedico.map((medico, index) => (
                  <tr key={`me-${index}`} className="border-t">
                    <td className="px-3 py-2">{medico.orden}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={medico.idmedico}
                        onChange={(e) =>
                          handleActualizarMedico(
                            index,
                            "idmedico",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 border rounded"
                        placeholder="ID Médico"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.5"
                        value={medico.horas}
                        onChange={(e) =>
                          handleActualizarMedico(
                            index,
                            "horas",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={medico.valor_hora}
                        onChange={(e) =>
                          handleActualizarMedico(
                            index,
                            "valor_hora",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-3 py-2 font-medium">
                      {currency(medico.total)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleEliminarMedico(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: OTROS GASTOS */}
        {activeTab === "otros" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-semibold">Egresos - Otros Gastos</h3>
              <button
                onClick={handleAgregarOtroGasto}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
              >
                + Agregar
              </button>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left">Orden</th>
                  <th className="px-3 py-2 text-left">Tipo Gasto</th>
                  <th className="px-3 py-2 text-left">Cantidad</th>
                  <th className="px-3 py-2 text-left">Valor Unidad</th>
                  <th className="px-3 py-2 text-left">Total</th>
                  <th className="px-3 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {editingOtrosGastos.map((gasto, index) => (
                  <tr key={`og-${index}`} className="border-t">
                    <td className="px-3 py-2">{gasto.orden}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={gasto.codgasto}
                        onChange={(e) =>
                          handleActualizarOtroGasto(
                            index,
                            "codgasto",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 border rounded"
                        placeholder="Código Gasto"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.1"
                        value={gasto.cantidad}
                        onChange={(e) =>
                          handleActualizarOtroGasto(
                            index,
                            "cantidad",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={gasto.valor_unidad}
                        onChange={(e) =>
                          handleActualizarOtroGasto(
                            index,
                            "valor_unidad",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-3 py-2 font-medium">
                      {currency(gasto.total)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleEliminarOtroGasto(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: TOTALES */}
        {activeTab === "totales" && (
          <div>
            <h3 className="text-md font-semibold mb-4">Resumen Financiero</h3>

            <div className="grid grid-cols-2 gap-6">
              {/* Ingresos */}
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  INGRESOS
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Inscripciones</span>
                    <span className="font-medium">
                      {currency(totales?.ingreso_inscripciones)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Depósitos</span>
                    <span className="font-medium">
                      {currency(totales?.ingreso_depositos)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fecha</span>
                    <span className="font-medium">
                      {currency(totales?.ingreso_fecha)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold text-green-600">
                    <span>TOTAL INGRESOS</span>
                    <span>{currency(totales?.total_ingresos)}</span>
                  </div>
                </div>
              </div>

              {/* Egresos */}
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  EGRESOS
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Árbitros</span>
                    <span className="font-medium">
                      {currency(totales?.egreso_arbitros)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Canchas</span>
                    <span className="font-medium">
                      {currency(totales?.egreso_canchas)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profesores</span>
                    <span className="font-medium">
                      {currency(totales?.egreso_profesores)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Serv. Médico</span>
                    <span className="font-medium">
                      {currency(totales?.egreso_medico)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Otros Gastos</span>
                    <span className="font-medium">
                      {currency(totales?.egreso_otros)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold text-red-600">
                    <span>TOTAL EGRESOS</span>
                    <span>{currency(totales?.total_egresos)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resultados */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-600">Total Caja</div>
                <div className="text-2xl font-bold text-blue-600">
                  {currency(totales?.total_caja)}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-600">Total Efectivo</div>
                <div className="text-2xl font-bold text-green-600">
                  {currency(totales?.total_efectivo)}
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-600">Diferencia de Caja</div>
                <div
                  className={`text-2xl font-bold ${
                    (totales?.diferencia_caja ?? 0) === 0
                      ? "text-gray-600"
                      : (totales?.diferencia_caja ?? 0) > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {currency(totales?.diferencia_caja)}
                </div>
              </div>
            </div>

            {/* Observación de Caja */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">
                Observación de Cierre de Caja
              </label>
              <textarea
                rows={2}
                value={planilla.observ_caja || ""}
                className="mt-1 w-full px-3 py-2 border rounded-md"
                placeholder="1 power"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t p-4 flex justify-between gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancelar
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleGuardar}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            💾 Grabar
          </button>

          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            📄 Planilla
          </button>

          <button className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
            🔓 Abrir Fecha
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanillaDetalleTabs;

import React, { useState } from "react";
import { PlanillaCancha } from "../../../types/planillasPago";
import { usePlanillaEdition } from "../../../hooks/usePlanillaEdition";
import { SeccionPlanilla } from "../shared/SeccionPlanilla";
import { CampoFormulario } from "../shared/FormularioEntrada";
import { ColumnaTabla } from "../shared/TablaGenerica";
import {
  formatearMoneda,
  resetearFormulario,
  validarFormulario,
  calcularTotalMultiplicado,
} from "../../../utils/utilidadesPlanilla";

interface CanchasTabProps {
  canchas: PlanillaCancha[];
  idfecha: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface FormularioCancha {
  horas: number;
  valor_hora: number;
  [key: string]: unknown; // Signatura de índice para compatibilidad
}

export const CanchasTab: React.FC<CanchasTabProps> = ({
  canchas,
  idfecha,
  onSuccess,
  onError,
}) => {
  const { data, isEditing, handleAdd, handleDelete, handleSave } =
    usePlanillaEdition({
      entityType: "cancha",
      initialData: canchas,
      idfecha,
      onSuccess,
      onError,
    });

  const [formData, setFormData] = useState<FormularioCancha>({
    horas: 0,
    valor_hora: 0,
  });

  const campos: CampoFormulario<FormularioCancha>[] = [
    {
      name: "horas",
      label: "Horas",
      type: "decimal",
      placeholder: "0.00",
      required: true,
      min: 0,
      step: 0.01,
    },
    {
      name: "valor_hora",
      label: "Valor Hora",
      type: "decimal",
      placeholder: "$ 0.00",
      min: 0,
      step: 0.01,
    },
  ];

  const columnas: ColumnaTabla<PlanillaCancha>[] = [
    {
      header: "Horas",
      accessor: "horas",
      align: "center",
    },
    {
      header: "Valor Hora",
      render: (cancha) => formatearMoneda(cancha.valor_hora),
      align: "center",
    },
    {
      header: "Total",
      render: (cancha) => formatearMoneda(cancha.horas * cancha.valor_hora),
      align: "center",
      className: "font-semibold",
    },
  ];

  const handleFormChange = (name: keyof FormularioCancha, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAgregar = () => {
    const validacion = validarFormulario(formData, [
      { campo: "horas", mensaje: "Debe ingresar las horas" },
    ]);

    if (!validacion.valido) {
      alert(validacion.mensaje);
      return;
    }

    handleAdd();
    setFormData(resetearFormulario(formData));
  };

  const calcularTotal = () => {
    const total = calcularTotalMultiplicado(data, "horas", "valor_hora");
    return formatearMoneda(total);
  };

  return (
    <SeccionPlanilla
      titulo="Egresos - Canchas"
      datos={data}
      formData={formData}
      campos={campos}
      columnas={columnas}
      onFormChange={handleFormChange}
      onAgregar={handleAgregar}
      onEliminar={handleDelete}
      onGuardar={handleSave}
      campoCalculado={{
        label: "Total",
        valor: formatearMoneda(formData.horas * formData.valor_hora),
      }}
      mensajeVacio="No hay canchas registradas"
      mostrarTotal={true}
      calcularTotal={calcularTotal}
      columnasTotal={2}
      isEditing={isEditing}
    />
  );
};

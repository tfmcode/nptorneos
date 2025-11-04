import React, { useState } from "react";
import { PlanillaProfesor } from "../../../types/planillasPago";
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

interface ProfesoresTabProps {
  profesores: PlanillaProfesor[];
  idfecha: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface FormularioProfesor {
  idprofesor: number;
  horas: number;
  valor_hora: number;
  [key: string]: unknown; // Signatura de índice para compatibilidad
}

export const ProfesoresTab: React.FC<ProfesoresTabProps> = ({
  profesores,
  idfecha,
  onSuccess,
  onError,
}) => {
  const { data, isEditing, handleAdd, handleDelete, handleSave } =
    usePlanillaEdition({
      entityType: "profesor",
      initialData: profesores,
      idfecha,
      onSuccess,
      onError,
    });

  const [formData, setFormData] = useState<FormularioProfesor>({
    idprofesor: 0,
    horas: 0,
    valor_hora: 0,
  });

  const campos: CampoFormulario<FormularioProfesor>[] = [
    {
      name: "idprofesor",
      label: "Profesor",
      type: "select",
      required: true,
      options: [
        { label: "Profesor 1", value: 1 },
        { label: "Profesor 2", value: 2 },
        // TODO: Cargar desde API
      ],
    },
    {
      name: "horas",
      label: "Horas",
      type: "decimal",
      placeholder: "0.00",
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

  const columnas: ColumnaTabla<PlanillaProfesor>[] = [
    {
      header: "Profesor",
      render: (profesor) =>
        profesor.nombre_profesor || `ID: ${profesor.idprofesor}`,
      align: "center",
    },
    {
      header: "Horas",
      accessor: "horas",
      align: "center",
    },
    {
      header: "Valor Hora",
      render: (profesor) => formatearMoneda(profesor.valor_hora),
      align: "center",
    },
    {
      header: "Total",
      render: (profesor) =>
        formatearMoneda(profesor.horas * profesor.valor_hora),
      align: "center",
      className: "font-semibold",
    },
  ];

  const handleFormChange = (name: keyof FormularioProfesor, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAgregar = () => {
    const validacion = validarFormulario(formData, [
      { campo: "idprofesor", mensaje: "Debe seleccionar un profesor" },
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
      titulo="Egresos - Profesores"
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
      mensajeVacio="No hay profesores registrados"
      textoBotonAgregar="Grabar"
      mostrarTotal={true}
      calcularTotal={calcularTotal}
      columnasTotal={3}
      isEditing={isEditing}
    />
  );
};

import React, { useState } from "react";
import { PlanillaOtroGasto } from "../../../types/planillasPago";
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

interface OtrosGastosTabProps {
  otros_gastos: PlanillaOtroGasto[];
  idfecha: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface FormularioOtroGasto {
  codgasto: number;
  idprofesor: number;
  cantidad: number;
  valor_unidad: number;
  [key: string]: unknown; // Signatura de índice para compatibilidad
}

export const OtrosGastosTab: React.FC<OtrosGastosTabProps> = ({
  otros_gastos,
  idfecha,
  onSuccess,
  onError,
}) => {
  const { data, isEditing, handleAdd, handleDelete, handleSave } =
    usePlanillaEdition({
      entityType: "otro_gasto",
      initialData: otros_gastos,
      idfecha,
      onSuccess,
      onError,
    });

  const [formData, setFormData] = useState<FormularioOtroGasto>({
    codgasto: 0,
    idprofesor: 0,
    cantidad: 0,
    valor_unidad: 0,
  });

  const campos: CampoFormulario<FormularioOtroGasto>[] = [
    {
      name: "codgasto",
      label: "Gasto",
      type: "select",
      required: true,
      options: [
        { label: "Gasto 1", value: 1 },
        { label: "Gasto 2", value: 2 },
        // TODO: Cargar desde API
      ],
    },
    {
      name: "idprofesor",
      label: "Profesor",
      type: "select",
      options: [
        { label: "Profesor 1", value: 1 },
        { label: "Profesor 2", value: 2 },
        // TODO: Cargar desde API
      ],
    },
    {
      name: "cantidad",
      label: "Cantidad",
      type: "decimal",
      placeholder: "0.00",
      min: 0,
      step: 0.01,
    },
    {
      name: "valor_unidad",
      label: "Valor Unidad",
      type: "decimal",
      placeholder: "$ 0.00",
      min: 0,
      step: 0.01,
    },
  ];

  const columnas: ColumnaTabla<PlanillaOtroGasto>[] = [
    {
      header: "Gasto",
      render: (g) => g.descripcion_gasto || `Código: ${g.codgasto}`,
      align: "center",
    },
    {
      header: "Profesor",
      render: (g) => (g.nombre_profesor ? String(g.nombre_profesor) : "-"),
      align: "center",
    },
    {
      header: "Cantidad",
      accessor: "cantidad",
      align: "center",
    },
    {
      header: "Valor Unidad",
      render: (g) => formatearMoneda(g.valor_unidad),
      align: "center",
    },
    {
      header: "Total $",
      render: (g) => formatearMoneda(g.cantidad * g.valor_unidad),
      align: "center",
      className: "font-semibold",
    },
  ];

  const handleFormChange = (
    name: keyof FormularioOtroGasto,
    value: unknown
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAgregar = () => {
    const validacion = validarFormulario(formData, [
      { campo: "codgasto", mensaje: "Debe seleccionar un tipo de gasto" },
    ]);

    if (!validacion.valido) {
      alert(validacion.mensaje);
      return;
    }

    handleAdd();
    setFormData(resetearFormulario(formData));
  };

  const calcularTotal = () =>
    formatearMoneda(
      calcularTotalMultiplicado(data, "cantidad", "valor_unidad")
    );

  return (
    <SeccionPlanilla
      titulo="Egresos - Otros Gastos"
      datos={data}
      formData={formData}
      campos={campos}
      columnas={columnas}
      onFormChange={handleFormChange}
      onAgregar={handleAgregar}
      onEliminar={handleDelete}
      onGuardar={handleSave}
      campoCalculado={{
        label: "Total $",
        valor: formatearMoneda(formData.cantidad * formData.valor_unidad),
      }}
      mensajeVacio="No hay otros gastos registrados"
      textoBotonAgregar="Agregar"
      colorBotonAgregar="blue"
      mostrarTotal={true}
      calcularTotal={calcularTotal}
      columnasTotal={4}
      isEditing={isEditing}
    />
  );
};
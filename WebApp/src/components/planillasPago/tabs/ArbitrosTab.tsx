import React, { useState } from "react";
import { PlanillaArbitro } from "../../../types/planillasPago";
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

interface ArbitrosTabProps {
  arbitros: PlanillaArbitro[];
  idfecha: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface FormularioArbitro {
  idarbitro: number;
  partidos: number;
  valor_partido: number;
  [key: string]: unknown; // Signatura de índice para compatibilidad
}

export const ArbitrosTab: React.FC<ArbitrosTabProps> = ({
  arbitros,
  idfecha,
  onSuccess,
  onError,
}) => {
  const { data, isEditing, handleAdd, handleDelete, handleSave } =
    usePlanillaEdition({
      entityType: "arbitro",
      initialData: arbitros,
      idfecha,
      onSuccess,
      onError,
    });

  const [formData, setFormData] = useState<FormularioArbitro>({
    idarbitro: 0,
    partidos: 0,
    valor_partido: 0,
  });

  // Configuración de campos del formulario
  const campos: CampoFormulario<FormularioArbitro>[] = [
    {
      name: "idarbitro",
      label: "Árbitro",
      type: "select",
      required: true,
      options: [
        { label: "Árbitro 1", value: 1 },
        { label: "Árbitro 2", value: 2 },
        // TODO: Cargar desde API
      ],
    },
    {
      name: "partidos",
      label: "Partidos",
      type: "number",
      placeholder: "0",
      min: 0,
    },
    {
      name: "valor_partido",
      label: "Valor Partido",
      type: "decimal",
      placeholder: "$ 0.00",
      min: 0,
    },
  ];

  // Configuración de columnas de la tabla
  const columnas: ColumnaTabla<PlanillaArbitro>[] = [
    {
      header: "Árbitro",
      render: (arbitro) => arbitro.nombre_arbitro || `ID: ${arbitro.idarbitro}`,
      align: "center",
    },
    {
      header: "Partidos",
      accessor: "partidos",
      align: "center",
    },
    {
      header: "Valor Partido",
      render: (arbitro) => formatearMoneda(arbitro.valor_partido),
      align: "center",
    },
    {
      header: "Total $",
      render: (arbitro) =>
        formatearMoneda(arbitro.partidos * arbitro.valor_partido),
      align: "center",
      className: "font-semibold",
    },
  ];

  const handleFormChange = (name: keyof FormularioArbitro, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAgregar = () => {
    const validacion = validarFormulario(formData, [
      { campo: "idarbitro", mensaje: "Debe seleccionar un árbitro" },
    ]);

    if (!validacion.valido) {
      alert(validacion.mensaje);
      return;
    }

    handleAdd();
    setFormData(resetearFormulario(formData));
  };

  const calcularTotal = () => {
    const total = calcularTotalMultiplicado(data, "partidos", "valor_partido");
    return formatearMoneda(total);
  };

  const calcularTotalFormulario = () => {
    return formData.partidos * formData.valor_partido;
  };

  return (
    <SeccionPlanilla
      titulo="Egresos - Árbitros"
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
        valor: formatearMoneda(calcularTotalFormulario()),
      }}
      mensajeVacio="No hay árbitros registrados"
      textoBotonAgregar="Agregar"
      colorBotonAgregar="green"
      mostrarTotal={true}
      calcularTotal={calcularTotal}
      columnasTotal={3}
      isEditing={isEditing}
    />
  );
};

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../store";
import { fetchProveedores } from "../../../store/slices/proveedoresSlice";
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
  [key: string]: unknown;
}

export const ArbitrosTab: React.FC<ArbitrosTabProps> = ({
  arbitros,
  idfecha,
  onSuccess,
  onError,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { proveedores } = useSelector((state: RootState) => state.proveedores);

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

  // ✅ Cargar proveedores al montar el componente
  useEffect(() => {
    dispatch(fetchProveedores({ page: 1, limit: 1000, searchTerm: "" }));
  }, [dispatch]);

  // ✅ Filtrar solo árbitros (codtipo = 1 generalmente, ajustar según tu BD)
  // ⚠️ IMPORTANTE: Verificá en tu base de datos qué codtipo corresponde a árbitros
  const arbitrosDisponibles = Array.isArray(proveedores)
    ? proveedores
        .filter((p) => p.codtipo === 1) // Ajustar codtipo según tu base de datos
        .map((p) => ({
          label: p.nombre,
          value: p.id || 0,
        }))
    : [];

  // Configuración de campos del formulario
  const campos: CampoFormulario<FormularioArbitro>[] = [
    {
      name: "idarbitro",
      label: "Árbitro",
      type: "select",
      required: true,
      options: arbitrosDisponibles,
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

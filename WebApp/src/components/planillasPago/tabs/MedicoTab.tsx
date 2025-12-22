import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../store";
import { fetchProveedores } from "../../../store/slices/proveedoresSlice";
import { PlanillaMedico } from "../../../types/planillasPago";
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

interface MedicoTabProps {
  medico: PlanillaMedico[];
  idfecha: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface FormularioMedico {
  idmedico: number;
  horas: number;
  valor_hora: number;
  [key: string]: unknown;
}

export const MedicoTab: React.FC<MedicoTabProps> = ({
  medico,
  idfecha,
  onSuccess,
  onError,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { proveedores } = useSelector((state: RootState) => state.proveedores);

  const { data, isEditing, handleAdd, handleDelete, handleSave } =
    usePlanillaEdition({
      entityType: "medico",
      initialData: medico,
      idfecha,
      onSuccess,
      onError,
    });

  const [formData, setFormData] = useState<FormularioMedico>({
    idmedico: 0,
    horas: 0,
    valor_hora: 0,
  });

  // ✅ Cargar proveedores al montar el componente
  useEffect(() => {
    dispatch(fetchProveedores({ page: 1, limit: 1000, searchTerm: "" }));
  }, [dispatch]);

  // ✅ Filtrar solo médicos (codtipo = 3 generalmente, ajustar según tu BD)
  // ⚠️ IMPORTANTE: Verificá en tu base de datos qué codtipo corresponde a médicos
  const medicosDisponibles = Array.isArray(proveedores)
    ? proveedores
        .filter((p) => p.codtipo === 3) // Ajustar codtipo según tu base de datos
        .map((p) => ({
          label: p.nombre,
          value: p.id || 0,
        }))
    : [];

  const campos: CampoFormulario<FormularioMedico>[] = [
    {
      name: "idmedico",
      label: "Servicio Médico",
      type: "select",
      required: true,
      options: medicosDisponibles,
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

  const columnas: ColumnaTabla<PlanillaMedico>[] = [
    {
      header: "Servicio Médico",
      render: (m) => m.nombre_medico || `ID: ${m.idmedico}`,
      align: "center",
    },
    {
      header: "Horas",
      accessor: "horas",
      align: "center",
    },
    {
      header: "Valor Hora",
      render: (m) => formatearMoneda(m.valor_hora),
      align: "center",
    },
    {
      header: "Total",
      render: (m) => formatearMoneda(m.horas * m.valor_hora),
      align: "center",
      className: "font-semibold",
    },
  ];

  const handleFormChange = (name: keyof FormularioMedico, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAgregar = () => {
    const validacion = validarFormulario(formData, [
      { campo: "idmedico", mensaje: "Debe seleccionar un servicio médico" },
    ]);

    if (!validacion.valido) {
      alert(validacion.mensaje);
      return;
    }

    // ✅ CORREGIDO: Pasar los datos del formulario al agregar
    handleAdd(formData);
    setFormData(resetearFormulario(formData));
  };

  const calcularTotal = () =>
    formatearMoneda(calcularTotalMultiplicado(data, "horas", "valor_hora"));

  return (
    <SeccionPlanilla
      titulo="Egresos - Servicio Médico"
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
      mensajeVacio="No hay servicios médicos registrados"
      textoBotonAgregar="Grabar"
      mostrarTotal={true}
      calcularTotal={calcularTotal}
      columnasTotal={3}
      isEditing={isEditing}
    />
  );
};

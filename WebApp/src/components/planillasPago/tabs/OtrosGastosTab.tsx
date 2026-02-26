import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../store";
import { fetchCodificadores } from "../../../store/slices/codificadorSlice";
import { fetchProveedores } from "../../../store/slices/proveedoresSlice";
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
  isEditable?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface FormularioOtroGasto {
  codgasto: number;
  idprofesor: number;
  cantidad: number;
  valor_unidad: number;
  [key: string]: unknown;
}

export const OtrosGastosTab: React.FC<OtrosGastosTabProps> = ({
  otros_gastos,
  idfecha,
  isEditable = true,
  onSuccess,
  onError,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { codificadores } = useSelector((state: RootState) => state.codificadores);
  const { proveedores } = useSelector((state: RootState) => state.proveedores);

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

  // Cargar codificadores y proveedores al montar
  useEffect(() => {
    dispatch(fetchCodificadores());
    dispatch(fetchProveedores({ page: 1, limit: 1000, searchTerm: "" }));
  }, [dispatch]);

  // Gastos Varios = idcodificador 4, activos
  const gastosDisponibles = Array.isArray(codificadores)
    ? codificadores
        .filter((c) => c.idcodificador === 4 && c.codestado === "1")
        .map((c) => ({
          label: c.descripcion || `Código: ${c.id}`,
          value: c.id,
        }))
    : [];

  // Profesores = codtipo 2
  const profesoresDisponibles = Array.isArray(proveedores)
    ? proveedores
        .filter((p) => p.codtipo === 2)
        .map((p) => ({
          label: p.nombre,
          value: p.id || 0,
        }))
    : [];

  const campos: CampoFormulario<FormularioOtroGasto>[] = [
    {
      name: "codgasto",
      label: "Gasto",
      type: "select",
      required: true,
      options: gastosDisponibles,
    },
    {
      name: "idprofesor",
      label: "Profesor",
      type: "select",
      options: profesoresDisponibles,
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
      onError?.(validacion.mensaje || "Validación fallida");
      return;
    }

    handleAdd(formData);
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
      disabled={!isEditable}
    />
  );
};

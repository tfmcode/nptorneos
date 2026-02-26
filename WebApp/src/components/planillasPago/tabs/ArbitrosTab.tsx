import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../store";
import { fetchProveedores } from "../../../store/slices/proveedoresSlice";
import { PlanillaArbitro } from "../../../types/planillasPago";
import { CampoFormulario, FormularioEntrada } from "../shared/FormularioEntrada";
import { ColumnaTabla, TablaGenerica } from "../shared/TablaGenerica";
import {
  formatearMoneda,
  resetearFormulario,
  validarFormulario,
  calcularTotalMultiplicado,
} from "../../../utils/utilidadesPlanilla";
import {
  addArbitroPlanilla,
  deleteArbitroPlanilla,
} from "../../../api/planillasPagosService";

interface ArbitrosTabProps {
  arbitros: PlanillaArbitro[];
  idfecha: number;
  isEditable?: boolean;
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
  isEditable = true,
  onSuccess,
  onError,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { proveedores } = useSelector((state: RootState) => state.proveedores);

  const [data, setData] = useState<PlanillaArbitro[]>(arbitros);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<FormularioArbitro>({
    idarbitro: 0,
    partidos: 0,
    valor_partido: 0,
  });

  // Sincronizar con props cuando cambian
  useEffect(() => {
    setData(arbitros);
  }, [arbitros]);

  // Cargar proveedores al montar el componente
  useEffect(() => {
    dispatch(fetchProveedores({ page: 1, limit: 1000, searchTerm: "" }));
  }, [dispatch]);

  // Filtrar solo árbitros (codtipo = 1)
  const arbitrosDisponibles = Array.isArray(proveedores)
    ? proveedores
        .filter((p) => p.codtipo === 1)
        .map((p) => ({
          label: p.nombre,
          value: p.id || 0,
        }))
    : [];

  // Calcular próximo orden disponible
  const getNextOrden = useCallback((): number => {
    if (data.length === 0) return 1;
    const maxOrden = Math.max(...data.map((item) => item.orden));
    return maxOrden + 1;
  }, [data]);

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

  // Agregar árbitro - GUARDA INMEDIATAMENTE EN LA BD
  const handleAgregar = async () => {
    const validacion = validarFormulario(formData, [
      { campo: "idarbitro", mensaje: "Debe seleccionar un árbitro" },
    ]);

    if (!validacion.valido) {
      onError?.(validacion.mensaje || "Validación fallida");
      return;
    }

    // Verificar si el árbitro ya está agregado
    const yaExiste = data.some((a) => a.idarbitro === formData.idarbitro);
    if (yaExiste) {
      onError?.("Este árbitro ya está agregado en esta fecha");
      return;
    }

    setIsLoading(true);
    try {
      const nuevoOrden = getNextOrden();
      const nuevoArbitro = {
        idfecha,
        orden: nuevoOrden,
        idarbitro: formData.idarbitro,
        partidos: formData.partidos,
        valor_partido: formData.valor_partido,
      };

      const resultado = await addArbitroPlanilla(nuevoArbitro);

      if (resultado) {
        // Buscar el nombre del árbitro para mostrarlo
        const nombreArbitro = arbitrosDisponibles.find(
          (a) => a.value === formData.idarbitro
        )?.label;

        // Agregar al estado local con el nombre
        setData((prev) => [
          ...prev,
          {
            ...resultado,
            nombre_arbitro: nombreArbitro,
          },
        ]);

        // Limpiar formulario
        setFormData(resetearFormulario(formData));
        onSuccess?.();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al agregar árbitro";
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar árbitro - ELIMINA INMEDIATAMENTE DE LA BD
  const handleEliminar = async (index: number) => {
    const arbitro = data[index];
    if (!arbitro) return;

    setIsLoading(true);
    try {
      await deleteArbitroPlanilla(arbitro.idfecha, arbitro.orden);

      // Eliminar del estado local
      setData((prev) => prev.filter((_, i) => i !== index));
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al eliminar árbitro";
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const calcularTotal = () => {
    const total = calcularTotalMultiplicado(data, "partidos", "valor_partido");
    return formatearMoneda(total);
  };

  const calcularTotalFormulario = () => {
    return formData.partidos * formData.valor_partido;
  };

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex justify-between items-center pb-3 border-b-2 border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Egresos - Árbitros
        </h3>
        {isLoading && (
          <span className="text-sm text-blue-600">Guardando...</span>
        )}
      </div>

      {/* Formulario de Entrada */}
      {isEditable && (
        <FormularioEntrada
          campos={campos}
          valores={formData}
          onChange={handleFormChange}
          onSubmit={handleAgregar}
          campoCalculado={{
            label: "Total",
            valor: formatearMoneda(calcularTotalFormulario()),
          }}
          textoBoton="Agregar"
          colorBoton="green"
          disabled={isLoading}
        />
      )}

      {/* Tabla de Registros */}
      <TablaGenerica
        columnas={columnas}
        datos={data}
        onDelete={isEditable ? handleEliminar : undefined}
        mensajeVacio="No hay árbitros registrados"
        mostrarTotal={true}
        calcularTotal={calcularTotal}
        columnasTotal={3}
        disabled={isLoading}
      />

      {/* Nota informativa */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        Los cambios se guardan automáticamente al agregar o eliminar.
      </div>
    </div>
  );
};

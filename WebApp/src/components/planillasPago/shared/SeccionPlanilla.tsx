import React from "react";
import { FormularioEntrada, CampoFormulario } from "./FormularioEntrada";
import { TablaGenerica, ColumnaTabla } from "./TablaGenerica";

// Tipo base que permite indexación dinámica
export type FormularioBase = Record<string, unknown>;

interface SeccionPlanillaProps<T, F extends FormularioBase> {
  // Datos
  datos: T[];
  formData: F;

  // Configuración
  titulo: string;
  campos: CampoFormulario<F>[];
  columnas: ColumnaTabla<T>[];

  // Acciones
  onFormChange: (name: keyof F, value: unknown) => void;
  onAgregar: () => void;
  onEliminar: (index: number) => void;
  onGuardar: () => void;

  // Opcionales
  campoCalculado?: {
    label: string;
    valor: string | number;
  };
  mensajeVacio?: string;
  textoBotonAgregar?: string;
  colorBotonAgregar?: "green" | "blue" | "indigo";
  mostrarTotal?: boolean;
  calcularTotal?: () => string;
  columnasTotal?: number;
  filaTotal?: React.ReactNode;

  // Estados
  isEditing?: boolean;
  disabled?: boolean;
}

export function SeccionPlanilla<
  T extends Record<string, unknown>,
  F extends FormularioBase
>({
  datos,
  formData,
  titulo,
  campos,
  columnas,
  onFormChange,
  onAgregar,
  onEliminar,
  onGuardar,
  campoCalculado,
  mensajeVacio,
  textoBotonAgregar = "Agregar",
  colorBotonAgregar = "green",
  mostrarTotal = false,
  calcularTotal,
  columnasTotal = 3,
  filaTotal,
  isEditing = false,
  disabled = false,
}: SeccionPlanillaProps<T, F>) {
  return (
    <div className="space-y-5">
      {/* Encabezado con Título y Botón Guardar */}
      <div className="flex justify-between items-center pb-3 border-b-2 border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          {titulo}
        </h3>
        <button
          onClick={onGuardar}
          disabled={isEditing || disabled}
          className="
            px-5 py-2.5 bg-blue-600 text-white rounded-lg 
            hover:bg-blue-700 disabled:opacity-50 text-sm font-semibold
            shadow-md hover:shadow-lg transition-all
            disabled:cursor-not-allowed
          "
        >
          💾 Guardar Cambios
        </button>
      </div>

      {/* Formulario de Entrada */}
      <FormularioEntrada
        campos={campos}
        valores={formData}
        onChange={onFormChange}
        onSubmit={onAgregar}
        campoCalculado={campoCalculado}
        textoBoton={textoBotonAgregar}
        colorBoton={colorBotonAgregar}
        disabled={isEditing || disabled}
      />

      {/* Tabla de Registros */}
      <TablaGenerica
        columnas={columnas}
        datos={datos}
        onDelete={onEliminar}
        mensajeVacio={mensajeVacio}
        mostrarTotal={mostrarTotal}
        calcularTotal={calcularTotal}
        columnasTotal={columnasTotal}
        filaTotal={filaTotal}
        disabled={isEditing || disabled}
      />
    </div>
  );
}

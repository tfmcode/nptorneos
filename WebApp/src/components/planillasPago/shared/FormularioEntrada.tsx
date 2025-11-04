export type TipoCampo = "text" | "number" | "select" | "decimal";

export interface CampoFormulario<T> {
  name: keyof T;
  label: string;
  type: TipoCampo;
  placeholder?: string;
  required?: boolean;
  min?: number;
  step?: number;
  options?: Array<{ label: string; value: string | number }>;
  disabled?: boolean;
}

interface FormularioEntradaProps<T> {
  campos: CampoFormulario<T>[];
  valores: T;
  onChange: (name: keyof T, value: unknown) => void;
  onSubmit: () => void;
  campoCalculado?: {
    label: string;
    valor: string | number;
  };
  textoBoton?: string;
  colorBoton?: "green" | "blue" | "indigo";
  disabled?: boolean;
}

const coloresBoton = {
  green: "bg-green-500 hover:bg-green-600",
  blue: "bg-blue-500 hover:bg-blue-600",
  indigo: "bg-indigo-500 hover:bg-indigo-600",
};

export function FormularioEntrada<T extends Record<string, unknown>>({
  campos,
  valores,
  onChange,
  onSubmit,
  campoCalculado,
  textoBoton = "Agregar",
  colorBoton = "green",
  disabled = false,
}: FormularioEntradaProps<T>) {
  const renderCampo = (campo: CampoFormulario<T>) => {
    const valor = valores[campo.name];

    const claseInput = `
      w-full px-3 py-2 border border-gray-300 rounded-md text-sm 
      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
      shadow-sm transition-all
      disabled:bg-gray-100 disabled:cursor-not-allowed
    `;

    switch (campo.type) {
      case "select":
        return (
          <select
            value={String(valor ?? "")}
            onChange={(e) => {
              const nuevoValor =
                e.target.value === ""
                  ? 0
                  : isNaN(Number(e.target.value))
                  ? e.target.value
                  : Number(e.target.value);
              onChange(campo.name, nuevoValor);
            }}
            className={claseInput}
            disabled={disabled || campo.disabled}
          >
            <option value="">Seleccionar...</option>
            {campo.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case "number":
      case "decimal":
        return (
          <input
            type="number"
            value={Number(valor ?? 0)}
            onChange={(e) => onChange(campo.name, Number(e.target.value))}
            className={claseInput}
            disabled={disabled || campo.disabled}
            placeholder={campo.placeholder || "0"}
            min={campo.min ?? 0}
            step={campo.step ?? (campo.type === "decimal" ? 0.01 : 1)}
          />
        );

      case "text":
      default:
        return (
          <input
            type="text"
            value={String(valor ?? "")}
            onChange={(e) => onChange(campo.name, e.target.value)}
            className={claseInput}
            disabled={disabled || campo.disabled}
            placeholder={campo.placeholder}
          />
        );
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-5 shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4">
        {/* Columna de Labels */}
        <div className="flex flex-col gap-4">
          {campos.map((campo) => (
            <label
              key={String(campo.name)}
              className="font-semibold text-gray-700 h-10 flex items-center"
            >
              {campo.label}
              {campo.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          ))}
          {campoCalculado && (
            <label className="font-semibold text-gray-700 h-10 flex items-center">
              {campoCalculado.label}
            </label>
          )}
        </div>

        {/* Columna de Inputs */}
        <div className="flex flex-col gap-4">
          {campos.map((campo) => (
            <div key={String(campo.name)}>{renderCampo(campo)}</div>
          ))}
          {campoCalculado && (
            <input
              type="text"
              value={campoCalculado.valor}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-md text-sm bg-gray-200 font-bold text-gray-700"
              disabled
            />
          )}
        </div>
      </div>

      {/* Botón de Acción */}
      <div className="mt-5 flex justify-end">
        <button
          onClick={onSubmit}
          disabled={disabled}
          className={`
            px-6 py-2.5 text-white rounded-md text-sm font-semibold 
            transition-all shadow-md hover:shadow-lg
            disabled:opacity-50 disabled:cursor-not-allowed
            ${coloresBoton[colorBoton]}
          `}
        >
          {textoBoton}
        </button>
      </div>
    </div>
  );
}

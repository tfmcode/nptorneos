import React from "react";
import InputField from "../common/InputField";

interface FieldOption {
  label: string;
  value: string | number;
}

interface FieldConfig {
  name: string;
  type:
    | "text"
    | "email"
    | "password"
    | "select"
    | "checkbox"
    | "date"
    | "number"
    | "textarea";
  placeholder?: string;
  value: string | number | boolean; // ✅ Manejo de tipos mejorado
  options?: FieldOption[];
  label?: string;
}

interface DynamicFormProps {
  fields: FieldConfig[];
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  onChange,
  onSubmit,
  submitLabel,
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="grid grid-cols-2 gap-4">
        {fields.map((field, index) => (
          <div
            key={index}
            className={`mb-2 ${field.type === "textarea" ? "col-span-2" : ""}`}
          >
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              {field.placeholder}
            </label>
            {field.type === "select" && field.options ? (
              <select
                name={field.name}
                value={String(field.value)} // ✅ Asegura que los valores sean strings para evitar errores en `option`
                onChange={onChange}
                className="border p-2 rounded w-full text-sm"
              >
                {field.options.map((option, i) => (
                  <option key={i} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === "checkbox" ? (
              <label className="flex items-center text-sm">
                <input
                  name={field.name}
                  type="checkbox"
                  checked={Boolean(field.value)} // ✅ Convierte correctamente `0 | 1` a booleano
                  onChange={onChange}
                  className="mr-2"
                />
                {field.label}
              </label>
            ) : field.type === "textarea" ? (
              <textarea
                name={field.name}
                placeholder={field.placeholder || ""}
                value={String(field.value)}
                onChange={onChange}
                className="border p-2 rounded w-full resize-none text-sm"
                rows={4}
              />
            ) : (
              <InputField
                name={field.name}
                type={field.type}
                placeholder={field.placeholder || ""}
                value={String(field.value)}
                onChange={onChange}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-4">
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default DynamicForm;

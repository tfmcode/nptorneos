import React from "react";
import InputField from "../common/InputField";

interface FieldOption {
  label: string;
  value: string | number; // Ajustamos a `string | number` para evitar conflictos con `select`.
}

interface FieldConfig {
  name: string;
  type: "text" | "email" | "password" | "select" | "checkbox";
  placeholder?: string;
  value: string | boolean; // Los inputs y checkboxes pueden usar boolean.
  options?: FieldOption[]; // Opciones solo aplican a selects.
  label?: string; // Solo aplica a checkboxes.
}

interface DynamicFormProps {
  fields: FieldConfig[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
      {fields.map((field, index) => (
        <div key={index} className="mb-4">
          {field.type === "select" && field.options ? (
            <select
              name={field.name}
              value={field.value as string} // Aseguramos que sea string.
              onChange={onChange}
              className="border p-2 rounded w-full"
            >
              {field.options.map((option, i) => (
                <option key={i} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : field.type === "checkbox" ? (
            <label className="flex items-center">
              <input
                name={field.name}
                type="checkbox"
                checked={field.value as boolean} // Para checkbox usamos boolean.
                onChange={onChange}
                className="mr-2"
              />
              {field.label}
            </label>
          ) : (
            <InputField
              name={field.name}
              type={field.type}
              placeholder={field.placeholder || ""}
              value={field.value as string}
              onChange={onChange}
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        className="bg-blue-600 text-white mt-4 p-2 rounded hover:bg-blue-700 w-full"
      >
        {submitLabel}
      </button>
    </form>
  );
};

export default DynamicForm;

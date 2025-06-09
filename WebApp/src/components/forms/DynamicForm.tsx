import React from "react";
import InputField from "../common/InputField";
import MoneyInputField from "../common/MoneyInputField";

interface FieldOption {
  label: string;
  value: string | number;
}

export interface FieldConfig {
  name: string;
  type:
    | "text"
    | "email"
    | "password"
    | "select"
    | "checkbox"
    | "date"
    | "number"
    | "textarea"
    | "money"
  placeholder?: string;
  value: string | number | boolean;
  options?: FieldOption[];
  label?: string;
  colSpan?: number;
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
            className={`mb-2 ${
              field.type === "textarea"
                ? "col-span-2"
                : field.colSpan
                ? `col-span-${field.colSpan}`
                : ""
            } ${field.type === "checkbox" ? "flex items-center" : ""}`}
          >
            {field.type !== "checkbox" && (
              <label
                htmlFor={field.name}
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                {field.label || field.placeholder || field.name}
              </label>
            )}

            {field.type === "select" && field.options ? (
              <select
                name={field.name}
                id={field.name}
                value={String(field.value)}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
              >
                <option value="0" disabled>
                  Seleccionar...
                </option>
                {field.options.map((option, i) => (
                  <option key={i} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === "checkbox" ? (
              <label className="flex items-center text-sm mt-2">
                <input
                  name={field.name}
                  id={field.name}
                  type="checkbox"
                  checked={Boolean(field.value)}
                  onChange={onChange}
                  className="mr-2"
                />
                {field.label || field.placeholder || field.name}
              </label>
            ) : field.type === "textarea" ? (
              <textarea
                name={field.name}
                id={field.name}
                placeholder={field.placeholder || ""}
                value={String(field.value)}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 resize-none"
                rows={4}
              />
            ) : field.type === "money" ? (
              <MoneyInputField
                name={field.name}
                type={field.type === "money" ? "number" : field.type}
                placeholder={field.placeholder || "0.00"}
                value={String(field.value)}
                onChange={onChange}
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

import React from "react";
import InputField from "../common/InputField";
import MoneyInputField from "../common/MoneyInputField";
import RichTextEditor from "../common/RichTextEditor";

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
    | "textarea"
    | "money"
    | "file"
    | "time"
    | "richtext";
  placeholder?: string;
  value: string | number | boolean;
  options?: FieldOption[];
  label?: string;
  colSpan?: number;
  onChange?: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
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
  disabled?: boolean;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  onChange,
  onSubmit,
  submitLabel,
  disabled = false,
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={disabled}
              >
                <option value="" disabled>
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
                  className="mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={disabled}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                rows={4}
                disabled={disabled}
              />
            ) : field.type === "money" ? (
              <MoneyInputField
                name={field.name}
                type={field.type === "money" ? "number" : field.type}
                placeholder={field.placeholder || "0.00"}
                value={String(field.value)}
                onChange={onChange}
                disabled={disabled}
              />
            ) : field.type === "file" ? (
              <input
                name={field.name}
                type="file"
                onChange={field.onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            ) : field.type === "time" ? (
              <input
                name={field.name}
                type="time"
                value={String(field.value)}
                onChange={field.onChange}
                className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={disabled}
              />
            ) : field.type === "richtext" ? (
              <RichTextEditor
                content={String(field.value)}
                onChange={(content) =>
                  field.onChange?.({
                    target: {
                      name: field.name,
                      value: content,
                    },
                  } as React.ChangeEvent<HTMLTextAreaElement>) ?? onChange
                }
                className="w-full min-h-[120px] border border-gray-300 rounded-md text-sm text-gray-700 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition duration-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
            ) : (
              <InputField
                name={field.name}
                type={field.type}
                placeholder={field.placeholder || ""}
                value={String(field.value)}
                onChange={onChange}
                disabled={disabled}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-4">
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default DynamicForm;

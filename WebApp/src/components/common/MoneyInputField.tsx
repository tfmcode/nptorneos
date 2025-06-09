import React from "react";

interface InputFieldProps {
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const MoneyInputField: React.FC<InputFieldProps> = ({
  name,
  type,
  placeholder,
  value,
  onChange,
}) => {
  return (
    <div className="w-full flex">
      <span className="inline-flex items-center justify-center rounded-s-lg border border-input bg-background text-sm text-muted-foreground rounded-r-none px-3 py-2 h-10">
        $
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        data-type="money"
        className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-e-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 h-10"
      />
    </div>
  );
};

export default MoneyInputField;

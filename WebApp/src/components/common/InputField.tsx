import React from "react";

interface InputFieldProps {
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({
  name,
  type,
  placeholder,
  value,
  onChange,
}) => {
  return (
    <div className="mb-4 w-full">
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none rounded-lg p-3 w-full bg-gray-50 text-gray-700 placeholder-gray-400 transition duration-300"
      />
    </div>
  );
};

export default InputField;

import React from "react";

interface SearchFieldProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchField: React.FC<SearchFieldProps> = ({
  placeholder = "Buscar...",
  value,
  onChange,
}) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className="mb-4 p-2 border rounded w-full"
  />
);

export default SearchField;

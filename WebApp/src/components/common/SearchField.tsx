import React from "react";
import { MagnifyingGlassCircleIcon } from "@heroicons/react/20/solid";

interface SearchFieldProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void; // 🔥 Función que se ejecuta al hacer clic en el botón
}

const SearchField: React.FC<SearchFieldProps> = ({
  placeholder = "Buscar...",
  value,
  onChange,
  onSearch,
}) => (
  <div className="flex gap-2">
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="p-2 border rounded w-full"
    />
    <button
      onClick={onSearch}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
    >
      <MagnifyingGlassCircleIcon className="h-5 w-5 mr-1" />
    </button>
  </div>
);

export default SearchField;

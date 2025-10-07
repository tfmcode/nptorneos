import React from "react";
import { MagnifyingGlassCircleIcon } from "@heroicons/react/20/solid";

interface SearchFieldProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
}

const SearchField: React.FC<SearchFieldProps> = ({
  placeholder = "Buscar...",
  value,
  onChange,
  onSearch,
}) => (
  <div className="flex flex-col sm:flex-row gap-2 w-full">
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="p-2 border rounded w-full text-sm sm:text-base"
    />
    <button
      onClick={onSearch}
      className="flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      <MagnifyingGlassCircleIcon className="h-5 w-5 sm:mr-1" />
      <span className="hidden sm:inline">Buscar</span>
    </button>
  </div>
);

export default SearchField;

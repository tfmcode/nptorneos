import React, { useState, useEffect, useRef } from "react";
import { getProveedores } from "../../api/proveedoresService";
import { Proveedor } from "../../types/proveedores";

interface ProveedorAutocompleteProps {
  value: number;
  onChange: (proveedor: Proveedor | null) => void;
}

const ProveedorAutocomplete: React.FC<ProveedorAutocompleteProps> = ({
  value,
  onChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(
    null
  );
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value && !selectedProveedor) {
      getProveedores(1, 100, "")
        .then((data) => {
          const proveedor = data.proveedores.find((p) => p.id === value);
          if (proveedor) {
            setSelectedProveedor(proveedor);
            setSearchTerm(proveedor.nombre);
          }
        })
        .catch((err) => console.error("Error cargando proveedor:", err));
    }
  }, [value, selectedProveedor]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length >= 2) {
      try {
        const data = await getProveedores(1, 10, term);
        setProveedores(data.proveedores);
        setShowDropdown(true);
      } catch (err) {
        console.error("Error buscando proveedores:", err);
      }
    } else {
      setProveedores([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (proveedor: Proveedor) => {
    setSelectedProveedor(proveedor);
    setSearchTerm(proveedor.nombre);
    setShowDropdown(false);
    onChange(proveedor);
  };

  const handleClear = () => {
    setSelectedProveedor(null);
    setSearchTerm("");
    onChange(null);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar proveedor..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700"
        />
        {selectedProveedor && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
          >
            ✕
          </button>
        )}
      </div>

      {showDropdown && proveedores.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {proveedores.map((proveedor) => (
            <div
              key={proveedor.id}
              onClick={() => handleSelect(proveedor)}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              <div className="font-medium">{proveedor.nombre}</div>
              {proveedor.documento && (
                <div className="text-xs text-gray-500">
                  CUIT: {proveedor.documento}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProveedorAutocomplete;

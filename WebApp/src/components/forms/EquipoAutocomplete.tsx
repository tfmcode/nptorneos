import React, { useState, useEffect } from "react";
import { TorneosEquiposInsc } from "../../types/torneosEquiposInsc";
import {
  getTorneosEquiposInsc,
  getTorneosEquiposInscByEquipo,
} from "../../api/torneosEquiposInscService";

interface Props {
  value: number;
  onChange: (inscripcion: TorneosEquiposInsc) => void;
  disabled?: boolean;
}

const EquipoAutocomplete: React.FC<Props> = ({ value, onChange, disabled }) => {
  const [inputValue, setInputValue] = useState("");
  const [sugerencias, setSugerencias] = useState<TorneosEquiposInsc[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (value !== 0) {
      getTorneosEquiposInscByEquipo(value).then((res) => {
        if (res.length > 0) {
          setInputValue(`${res[0].equipo_nombre} - ${res[0].torneo_nombre}`);
        }
      });
    }
  }, [value]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (inputValue.length >= 2) {
        getTorneosEquiposInsc(1, 10, inputValue).then((res) => {
          setSugerencias(res.inscripciones);
          setShowDropdown(true);
        });
      } else {
        setSugerencias([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [inputValue]);

  const handleSelect = (inscripcion: TorneosEquiposInsc) => {
    setInputValue(
      `${inscripcion.equipo_nombre} - ${inscripcion.torneo_nombre}`
    );
    onChange(inscripcion); // Devuelve el objeto completo
    setShowDropdown(false);
  };

  const handleClear = () => {
    setInputValue("");
    onChange({
      id: 0,
      idtorneo: 0,
      idequipo: 0,
      equipo_nombre: "",
      torneo_nombre: "",
    } as TorneosEquiposInsc);
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          placeholder="Buscar equipo por nombre de equipo o torneo"
          onChange={(e) => setInputValue(e.target.value)}
          className="border rounded px-3 py-2 w-full"
          onFocus={() => inputValue.length >= 2 && setShowDropdown(true)}
          disabled={disabled}
        />
        {value !== 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-sm text-red-500 hover:underline"
            disabled={disabled}
          >
            Quitar
          </button>
        )}
      </div>

      {showDropdown && sugerencias.length > 0 && (
        <ul
          className="absolute top-full left-0 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto z-[99999]"
          style={{
            marginTop: "2px",
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          }}
        >
          {sugerencias.map((inscripcion) => (
            <li
              key={inscripcion.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => !disabled && handleSelect(inscripcion)}
            >
              <div className="font-medium">{inscripcion.equipo_nombre}</div>
              <div className="text-sm text-gray-600">
                {inscripcion.torneo_nombre}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EquipoAutocomplete;

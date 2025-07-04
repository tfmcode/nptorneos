import React, { useState, useEffect } from "react";
import { Jugador } from "../../types/jugadores";
import { getJugadores } from "../../api/jugadoresService";

interface Props {
  value: number;
  onChange: (jugador: Jugador) => void;
}

const JugadorAutocomplete: React.FC<Props> = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState("");
  const [sugerencias, setSugerencias] = useState<Jugador[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (inputValue.length >= 2) {
        getJugadores(1, 10, inputValue).then((res) => {
          setSugerencias(res.jugadores);
          setShowDropdown(true);
        });
      } else {
        setSugerencias([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [inputValue]);

  const handleSelect = (jugador: Jugador) => {
    setInputValue(`${jugador.nombres} ${jugador.apellido} - ${jugador.docnro}`);
    onChange(jugador); // Devuelve el objeto completo
    setShowDropdown(false);
  };

  const handleClear = () => {
    setInputValue("");
    onChange({
      id: 0,
      nombres: "",
      apellido: "",
      docnro: "",
    } as Jugador);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          placeholder="Buscar jugador por nombre o documento"
          onChange={(e) => setInputValue(e.target.value)}
          className="border rounded px-3 py-2 w-full"
          onFocus={() => inputValue.length >= 2 && setShowDropdown(true)}
        />
        {value !== 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-sm text-red-500 hover:underline"
          >
            Quitar
          </button>
        )}
      </div>

      {showDropdown && sugerencias.length > 0 && (
        <ul className="absolute z-10 bg-white border rounded w-full shadow max-h-60 overflow-y-auto">
          {sugerencias.map((jugador) => (
            <li
              key={jugador.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(jugador)}
            >
              {jugador.nombres} {jugador.apellido} - {jugador.docnro}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JugadorAutocomplete;

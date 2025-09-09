import React, { useState, useEffect } from "react";
import { Jugador } from "../../types/jugadores";
import { getJugadores } from "../../api/jugadoresService";

interface Props {
  value: number;
  onChange: (jugador: Jugador | { id?: number } | null) => void;
  excludeIds?: number[]; // Opcional: IDs de jugadores a excluir
}

const JugadorAutocomplete: React.FC<Props> = ({
  value,
  onChange,
  excludeIds = [],
}) => {
  const [inputValue, setInputValue] = useState("");
  const [sugerencias, setSugerencias] = useState<Jugador[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (inputValue.length >= 2) {
        getJugadores(1, 10, inputValue).then((res) => {
          // Filtrar jugadores que ya están en el equipo si se proporcionan excludeIds
          const jugadoresFiltrados = res.jugadores.filter(
            (j) => !excludeIds.includes(j.id!)
          );
          setSugerencias(jugadoresFiltrados);
          setShowDropdown(true);
        });
      } else {
        setSugerencias([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [inputValue, excludeIds]);

  // Cargar el nombre del jugador seleccionado cuando cambia el value
  useEffect(() => {
    if (value && value !== 0) {
      // Buscar el jugador por ID para mostrar su nombre
      getJugadores(1, 100, "").then((res) => {
        const jugadorSeleccionado = res.jugadores.find((j) => j.id === value);
        if (jugadorSeleccionado) {
          setInputValue(
            `${jugadorSeleccionado.nombres} ${jugadorSeleccionado.apellido} - ${jugadorSeleccionado.docnro}`
          );
        }
      });
    } else {
      setInputValue("");
    }
  }, [value]);

  const handleSelect = (jugador: Jugador) => {
    setInputValue(`${jugador.nombres} ${jugador.apellido} - ${jugador.docnro}`);
    onChange(jugador); // Devuelve el objeto completo
    setShowDropdown(false);
  };

  const handleClear = () => {
    setInputValue("");
    onChange(null); // Enviar null en lugar de un objeto vacío
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    // Si el usuario borra el texto, limpiar la selección
    if (e.target.value === "") {
      onChange(null);
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          placeholder="Buscar jugador por nombre o documento"
          onChange={handleInputChange}
          className="border rounded px-3 py-2 w-full"
          onFocus={() => inputValue.length >= 2 && setShowDropdown(true)}
          onBlur={() => {
            // Delay para permitir click en dropdown
            setTimeout(() => setShowDropdown(false), 200);
          }}
        />
        {value !== 0 && inputValue && (
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
        <ul
          className="absolute top-full left-0 w-full bg-white border rounded shadow max-h-60 overflow-y-auto z-[9999]"
          style={{ marginTop: "2px" }}
        >
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

      {showDropdown && sugerencias.length === 0 && inputValue.length >= 2 && (
        <div
          className="absolute top-full left-0 w-full bg-white border rounded shadow p-3 text-gray-500 text-sm"
          style={{ marginTop: "2px" }}
        >
          No se encontraron jugadores
        </div>
      )}
    </div>
  );
};

export default JugadorAutocomplete;

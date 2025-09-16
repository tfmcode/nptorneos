import React, { useState, useEffect, useCallback } from "react";
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

const EquipoInscAutocomplete: React.FC<Props> = ({
  value,
  onChange,
  disabled,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [sugerencias, setSugerencias] = useState<TorneosEquiposInsc[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función de búsqueda mejorada
  const searchFunction = useCallback(
    async (searchTerm: string): Promise<TorneosEquiposInsc[]> => {
      setIsSearching(true);
      setError(null);

      try {
        const normalizedTerm = searchTerm.trim().replace(/\s+/g, " ");
        const res = await getTorneosEquiposInsc(1, 50, normalizedTerm);

        // Agrupar por equipo y tomar solo el torneo más reciente
        const equiposUnicos = new Map<number, TorneosEquiposInsc>();

        // Ordenar por ID más alto como proxy de más reciente
        const equiposOrdenados = res.inscripciones.sort((a, b) => {
          return (b.id || 0) - (a.id || 0);
        });

        // Agrupar por idequipo y mantener solo el más reciente
        equiposOrdenados.forEach((equipo) => {
          const equipoId = equipo.idequipo ?? 0;
          if (!equiposUnicos.has(equipoId) && equipoId !== 0) {
            equiposUnicos.set(equipoId, equipo);
          }
        });

        return Array.from(equiposUnicos.values());
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error en la búsqueda";
        setError(errorMessage);
        throw err;
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  // Efecto para cargar datos iniciales basado en el valor
  useEffect(() => {
    if (value !== 0) {
      getTorneosEquiposInscByEquipo(value)
        .then((res) => {
          if (res.length > 0) {
            setInputValue(`${res[0].equipo_nombre} - ${res[0].torneo_nombre}`);
          }
        })
        .catch((err) => {
          console.error("Error cargando equipo inicial:", err);
        });
    }
  }, [value]);

  // Efecto para búsqueda con debounce
  useEffect(() => {
    const normalizedTerm = inputValue.trim().replace(/\s+/g, " ");

    if (normalizedTerm.length < 2) {
      setSugerencias([]);
      setShowDropdown(false);
      setError(null);
      setIsSearching(false);
      return;
    }

    setError(null);
    setIsSearching(true);

    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchFunction(normalizedTerm);
        setSugerencias(results);
        setShowDropdown(true);
      } catch (error) {
        console.error("Error en búsqueda:", error);
        setSugerencias([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      setIsSearching(false);
    };
  }, [inputValue, searchFunction]);

  const handleSelect = (inscripcion: TorneosEquiposInsc) => {
    setInputValue(
      `${inscripcion.equipo_nombre} - ${inscripcion.torneo_nombre}`
    );
    onChange(inscripcion);
    setShowDropdown(false);
    setError(null);
  };

  const handleClear = () => {
    setInputValue("");
    setSugerencias([]);
    setShowDropdown(false);
    setError(null);
    onChange({
      id: 0,
      idtorneo: 0,
      idequipo: 0,
      equipo_nombre: "",
      torneo_nombre: "",
    } as TorneosEquiposInsc);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Si el campo se vacía, limpiar las sugerencias
    if (newValue.trim().length === 0) {
      setSugerencias([]);
      setShowDropdown(false);
      setError(null);
    }
  };

  const handleFocus = () => {
    if (inputValue.trim().length >= 2 && sugerencias.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleBlur = () => {
    // Retrasar el cierre para permitir clicks en las sugerencias
    setTimeout(() => {
      setShowDropdown(false);
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            placeholder="Buscar equipo por nombre de equipo o torneo"
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`border rounded px-3 py-2 pr-8 w-full disabled:opacity-50 disabled:cursor-not-allowed focus:border-blue-500 focus:outline-none transition-colors ${
              error ? "border-red-300 focus:border-red-500" : "border-gray-300"
            }`}
            disabled={disabled}
          />

          {/* Indicador de carga */}
          {isSearching && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        {value !== 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded transition-colors"
            disabled={disabled}
          >
            Quitar
          </button>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="absolute top-full left-0 w-full mt-1 px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded z-[99999]">
          {error}
        </div>
      )}

      {/* Dropdown con sugerencias */}
      {showDropdown && !error && (
        <>
          {sugerencias.length > 0 ? (
            <ul
              className="absolute top-full left-0 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto z-[99999] mt-1"
              style={{
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
            >
              {sugerencias.map((inscripcion) => (
                <li
                  key={`${inscripcion.idequipo}-${inscripcion.id}`}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                  onClick={() => !disabled && handleSelect(inscripcion)}
                >
                  <div className="font-medium text-gray-900">
                    {inscripcion.equipo_nombre}
                  </div>
                  <div
                    className={`text-sm ${
                      inscripcion.torneo_nombre === "Sin torneos registrados"
                        ? "text-gray-400 italic"
                        : "text-gray-600"
                    }`}
                  >
                    {inscripcion.torneo_nombre === "Sin torneos registrados"
                      ? "Sin torneos registrados"
                      : `Último torneo: ${inscripcion.torneo_nombre}`}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            inputValue.trim().length >= 2 &&
            !isSearching && (
              <div className="absolute top-full left-0 w-full bg-white border rounded shadow-lg z-[99999] px-4 py-3 text-gray-500 text-sm mt-1">
                No se encontraron equipos que coincidan con "{inputValue.trim()}
                "
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default EquipoInscAutocomplete;

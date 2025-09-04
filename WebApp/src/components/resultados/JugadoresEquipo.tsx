import React, { useEffect, useState } from "react";
import {
  getJugadoresPorEquipo,
  savePartidoJugador,
} from "../../api/partidosJugadoresService";
import { StatusMessage } from "../common";
import {
  PartidoJugadorExtendido,
  PartidoJugadorInput,
} from "../../types/partidosJugadores";
import JugadorAutocomplete from "../forms/JugadorAutocomplete";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface JugadoresEquipoProps {
  idpartido: number;
  idequipo: number;
  nombreEquipo?: string;
}

const JugadoresEquipo: React.FC<JugadoresEquipoProps> = ({
  idpartido,
  idequipo,
  nombreEquipo,
}) => {
  const [jugadoresPartido, setJugadoresPartido] = useState<
    PartidoJugadorExtendido[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddPlayer, setShowAddPlayer] = useState<boolean>(false);
  const [selectedJugadorId, setSelectedJugadorId] = useState<number>(0);

  // Estados para sorting
  const [sortConfig, setSortConfig] = useState<{
    key: keyof PartidoJugadorExtendido;
    direction: "asc" | "desc";
  } | null>(null);

  useEffect(() => {
    const fetchJugadores = async () => {
      try {
        setLoading(true);
        // Cargar jugadores del partido
        const partidoData = await getJugadoresPorEquipo(idpartido, idequipo);
        setJugadoresPartido(partidoData);
      } catch {
        setError("Error al cargar los jugadores.");
      } finally {
        setLoading(false);
      }
    };

    fetchJugadores();
  }, [idpartido, idequipo]);

  const handleUpdate = async (
    jugador: PartidoJugadorExtendido,
    campo: keyof PartidoJugadorInput,
    valor: string | number | boolean
  ) => {
    const input: PartidoJugadorInput = {
      idjugador: jugador.idjugador,
      jugo: campo === "jugo" ? Boolean(valor) : jugador.jugo,
      camiseta: campo === "camiseta" ? String(valor) : jugador.camiseta,
      goles: campo === "goles" ? Number(valor) : jugador.goles,
      amarilla: campo === "amarilla" ? Number(valor) : jugador.amarilla,
      azul: campo === "azul" ? Number(valor) : jugador.azul,
      roja: campo === "roja" ? Number(valor) : jugador.roja,
    };

    await savePartidoJugador(idpartido, idequipo, input);

    setJugadoresPartido((prev) =>
      prev.map((j) =>
        j.idjugador === jugador.idjugador ? { ...j, ...input } : j
      )
    );
  };

  const handleCheckboxChange = (jugador: PartidoJugadorExtendido) => {
    // No permitir cambios si está en lista negra
    if (jugador.listanegra === 1) return;
    handleUpdate(jugador, "jugo", !jugador.jugo);
  };

  const handleInputChange = (
    jugador: PartidoJugadorExtendido,
    campo: keyof PartidoJugadorInput,
    valor: string
  ) => {
    // No permitir cambios si está en lista negra
    if (jugador.listanegra === 1) return;

    const parsed =
      campo === "camiseta" ? valor : valor === "" ? 0 : Number(valor);
    handleUpdate(jugador, campo, parsed);
  };

  const handleAddJugador = async () => {
    if (!selectedJugadorId) return;

    try {
      // Agregar el jugador al partido
      const input: PartidoJugadorInput = {
        idjugador: selectedJugadorId,
        jugo: false,
        camiseta: "",
        goles: 0,
        amarilla: 0,
        azul: 0,
        roja: 0,
      };

      await savePartidoJugador(idpartido, idequipo, input);

      // Recargar la lista
      const updatedData = await getJugadoresPorEquipo(idpartido, idequipo);
      setJugadoresPartido(updatedData);

      // Reset
      setSelectedJugadorId(0);
      setShowAddPlayer(false);
    } catch (err) {
      console.error("Error al agregar jugador:", err);
    }
  };

  const handleSort = (key: keyof PartidoJugadorExtendido) => {
    setSortConfig((prev) =>
      prev?.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const sortedJugadores = [...jugadoresPartido].sort((a, b) => {
    if (!sortConfig || !sortConfig.key) return 0;

    const { key, direction } = sortConfig;
    const aValue = a[key] ?? "";
    const bValue = b[key] ?? "";

    const compare = String(aValue).localeCompare(String(bValue), undefined, {
      numeric: true,
      sensitivity: "base",
    });

    return direction === "asc" ? compare : -compare;
  });

  const renderColorDot = (jugador: PartidoJugadorExtendido) => {
    if (jugador.sancion === 1)
      return (
        <span
          className="inline-block w-2 h-2 rounded-full bg-red-600 mr-1"
          title="Sancionado"
        />
      );
    if (jugador.listanegra === 1)
      return (
        <span
          className="inline-block w-2 h-2 rounded-full bg-black mr-1"
          title="Lista Negra"
        />
      );
    if (jugador.tipo === 2)
      return (
        <span
          className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-1"
          title="Invitado"
        />
      );
    return null;
  };

  const SortButton = ({
    column,
  }: {
    column: keyof PartidoJugadorExtendido;
  }) => (
    <button
      onClick={() => handleSort(column)}
      className="ml-1 text-gray-600 hover:text-gray-800"
    >
      {sortConfig?.key === column && sortConfig?.direction === "asc" ? (
        <ChevronUpIcon className="h-3 w-3" />
      ) : (
        <ChevronDownIcon className="h-3 w-3" />
      )}
    </button>
  );

  return (
    <div>
      {/* Header con nombre del equipo y botón agregar */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {nombreEquipo || `Equipo ${idequipo}`}
        </h3>
        <button
          onClick={() => setShowAddPlayer(!showAddPlayer)}
          className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
        >
          <PlusIcon className="h-4 w-4" />
          Agregar Jugador
        </button>
      </div>

      {/* Formulario para agregar jugador */}
      {showAddPlayer && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <JugadorAutocomplete
                value={selectedJugadorId}
                onChange={(jugador) => setSelectedJugadorId(jugador.id ?? 0)}
              />
            </div>
            <button
              onClick={handleAddJugador}
              disabled={!selectedJugadorId}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Agregar
            </button>
            <button
              onClick={() => {
                setShowAddPlayer(false);
                setSelectedJugadorId(0);
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <StatusMessage loading={loading} error={error} />

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-300">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-2 py-2">
                  <div className="flex items-center">Jugó</div>
                </th>
                <th className="px-2 py-2">
                  <div className="flex items-center">Foto</div>
                </th>
                <th className="px-2 py-2">
                  <div className="flex items-center">
                    Nombre
                    <SortButton column="nombre" />
                  </div>
                </th>
                <th className="px-2 py-2">
                  <div className="flex items-center">
                    Documento
                    <SortButton column="docnro" />
                  </div>
                </th>
                <th className="px-2 py-2">
                  <div className="flex items-center">
                    N°
                    <SortButton column="camiseta" />
                  </div>
                </th>
                <th className="px-2 py-2">
                  <div className="flex items-center">
                    Tipo
                    <SortButton column="tipo" />
                  </div>
                </th>
                <th className="px-2 py-2">Consentimiento</th>
                <th className="px-2 py-2">
                  <div className="flex items-center">
                    Goles
                    <SortButton column="goles" />
                  </div>
                </th>
                <th className="px-2 py-2">Amarilla</th>
                <th className="px-2 py-2">Azul</th>
                <th className="px-2 py-2">Roja</th>
                <th className="px-2 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {sortedJugadores.map((j) => {
                const isDisabled = j.listanegra === 1;

                return (
                  <tr
                    key={j.idjugador}
                    className={`border-t ${
                      isDisabled
                        ? "bg-gray-600 text-white opacity-75"
                        : j.sancion === 1
                        ? "bg-red-100"
                        : j.tipo === 2
                        ? "bg-purple-100"
                        : ""
                    }`}
                  >
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={j.jugo && !isDisabled}
                        onChange={() => handleCheckboxChange(j)}
                        disabled={isDisabled}
                        className={`${isDisabled ? "cursor-not-allowed" : ""}`}
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                        📷
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1">
                        {renderColorDot(j)}
                        <span className={isDisabled ? "line-through" : ""}>
                          {j.nombre}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-2">{j.docnro}</td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={j.camiseta || ""}
                        onChange={(e) =>
                          handleInputChange(j, "camiseta", e.target.value)
                        }
                        disabled={isDisabled}
                        className={`w-12 border rounded px-1 ${
                          isDisabled ? "bg-gray-300 cursor-not-allowed" : ""
                        }`}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          j.tipo === 2
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {j.tipo === 2 ? "INVITADO" : "OFICIAL"}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        disabled={isDisabled}
                        className={`${isDisabled ? "cursor-not-allowed" : ""}`}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={j.goles}
                        onChange={(e) =>
                          handleInputChange(j, "goles", e.target.value)
                        }
                        disabled={isDisabled}
                        className={`w-12 border rounded px-1 ${
                          isDisabled ? "bg-gray-300 cursor-not-allowed" : ""
                        }`}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={j.amarilla}
                        onChange={(e) =>
                          handleInputChange(j, "amarilla", e.target.value)
                        }
                        disabled={isDisabled}
                        className={`w-12 border rounded px-1 ${
                          isDisabled ? "bg-gray-300 cursor-not-allowed" : ""
                        }`}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={j.azul}
                        onChange={(e) =>
                          handleInputChange(j, "azul", e.target.value)
                        }
                        disabled={isDisabled}
                        className={`w-12 border rounded px-1 ${
                          isDisabled ? "bg-gray-300 cursor-not-allowed" : ""
                        }`}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={j.roja}
                        onChange={(e) =>
                          handleInputChange(j, "roja", e.target.value)
                        }
                        disabled={isDisabled}
                        className={`w-12 border rounded px-1 ${
                          isDisabled ? "bg-gray-300 cursor-not-allowed" : ""
                        }`}
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        className={`hover:text-red-600 ${
                          isDisabled
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-500"
                        }`}
                        disabled={isDisabled}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Estadísticas */}
      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Total:</strong> {jugadoresPartido.length} jugadores |{" "}
          <strong>Jugaron:</strong>{" "}
          {jugadoresPartido.filter((j) => j.jugo).length} |{" "}
          <strong>Lista negra:</strong>{" "}
          {jugadoresPartido.filter((j) => j.listanegra === 1).length}
        </p>
      </div>
    </div>
  );
};

export default JugadoresEquipo;

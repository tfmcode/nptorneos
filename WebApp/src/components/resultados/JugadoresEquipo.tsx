import React, { useEffect, useState, useCallback } from "react";
import {
  getJugadoresPorEquipo,
  savePartidoJugador,
  deletePartidoJugador,
} from "../../api/partidosJugadoresService";
import { StatusMessage, PopupNotificacion } from "../common";
import {
  PartidoJugadorExtendido,
  PartidoJugadorInput,
} from "../../types/partidosJugadores";
import JugadorAutocomplete from "../forms/JugadorAutocomplete";
import { Jugador } from "../../types/jugadores";
import { createJugador } from "../../api/jugadoresService";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  PlusIcon,
  TrashIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import API from "../../api/httpClient";

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
  const [showCreatePlayer, setShowCreatePlayer] = useState<boolean>(false);
  const [selectedJugadorId, setSelectedJugadorId] = useState<number>(0);

  const [nuevoJugador, setNuevoJugador] = useState({
    nombres: "",
    apellido: "",
    docnro: "",
    fhnacimiento: "",
    telefono: "",
    email: "",
  });

  const [sortConfig, setSortConfig] = useState<{
    key: keyof PartidoJugadorExtendido;
    direction: "asc" | "desc";
  } | null>(null);

  // Estado para el popup de notificación
  const [popup, setPopup] = useState<{
    open: boolean;
    type: "success" | "error" | "warning";
    message: string;
  }>({
    open: false,
    type: "success",
    message: "",
  });

  const showPopup = (
    type: "success" | "error" | "warning",
    message: string
  ) => {
    setPopup({ open: true, type, message });
  };

  const closePopup = () => {
    setPopup({ ...popup, open: false });
  };

  const fetchJugadores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const partidoData = await getJugadoresPorEquipo(idpartido, idequipo);
      setJugadoresPartido(partidoData);
    } catch (err) {
      console.error("Error al cargar jugadores:", err);
      setError("Error al cargar los jugadores.");
    } finally {
      setLoading(false);
    }
  }, [idpartido, idequipo]);

  useEffect(() => {
    fetchJugadores();
  }, [fetchJugadores]);

  const addJugadorToEquipo = async (idjugador: number) => {
    try {
      await API.post("/api/equipos-jugadores", {
        idjugador,
        idequipo,
        codtipo: 1,
        codestado: 1,
        capitan: 0,
        subcapitan: 0,
        idusuario: 1,
      });
    } catch (error) {
      console.warn("No se pudo agregar al equipo automáticamente:", error);
    }
  };

  const handleUpdate = async (
    jugador: PartidoJugadorExtendido,
    campo: keyof PartidoJugadorInput,
    valor: string | number | boolean
  ) => {
    try {
      setError(null);

      const input: PartidoJugadorInput = {
        idjugador: jugador.idjugador,
        jugo: campo === "jugo" ? Boolean(valor) : jugador.jugo,
        camiseta: campo === "camiseta" ? String(valor) : jugador.camiseta,
        goles: campo === "goles" ? Number(valor) : jugador.goles,
        amarilla: campo === "amarilla" ? Number(valor) : jugador.amarilla,
        azul: campo === "azul" ? Number(valor) : jugador.azul,
        roja: campo === "roja" ? Number(valor) : jugador.roja,
        fhcarga: new Date().toISOString(),
        idusuario: 1,
      };

      await savePartidoJugador(idpartido, idequipo, input);

      setJugadoresPartido((prev) =>
        prev.map((j) =>
          j.idjugador === jugador.idjugador ? { ...j, ...input } : j
        )
      );
    } catch (err) {
      console.error("Error al actualizar jugador:", err);
      setError(
        `Error al actualizar jugador: ${
          err instanceof Error ? err.message : "Error desconocido"
        }`
      );
    }
  };

  const handleCheckboxChange = (jugador: PartidoJugadorExtendido) => {
    if (jugador.listanegra === 1) return;

    // Si intenta marcar como "jugó"
    if (!jugador.jugo) {
      // Validar que tenga número de camiseta
      if (!jugador.camiseta || jugador.camiseta.trim() === "") {
        showPopup(
          "warning",
          "Debe asignar un número de camiseta antes de marcar que jugó"
        );
        return;
      }

      // Verificar si hay camisetas duplicadas
      const jugadoresConMismaCamiseta = jugadoresPartido.filter(
        (j) =>
          j.camiseta === jugador.camiseta &&
          j.idjugador !== jugador.idjugador &&
          j.camiseta.trim() !== ""
      );

      if (jugadoresConMismaCamiseta.length > 0) {
        const nombres = jugadoresConMismaCamiseta
          .map((j) => j.nombre)
          .join(", ");
        showPopup(
          "warning",
          `⚠️ El número ${jugador.camiseta} ya está asignado a: <strong>${nombres}</strong>. Verifique antes de continuar.`
        );
        // Permitir que continúe pero con advertencia
      }
    }

    handleUpdate(jugador, "jugo", !jugador.jugo);
  };

  const handleInputChange = (
    jugador: PartidoJugadorExtendido,
    campo: keyof PartidoJugadorInput,
    valor: string
  ) => {
    if (jugador.listanegra === 1) return;
    const parsed =
      campo === "camiseta" ? valor : valor === "" ? 0 : Number(valor);
    handleUpdate(jugador, campo, parsed);
  };

  const handleDeleteJugador = async (jugador: PartidoJugadorExtendido) => {
    if (!confirm(`¿Está seguro de eliminar a ${jugador.nombre} del partido?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await deletePartidoJugador(idpartido, idequipo, jugador.idjugador);

      setJugadoresPartido((prev) =>
        prev.filter((j) => j.idjugador !== jugador.idjugador)
      );

      setTimeout(async () => {
        try {
          const nuevosdatos = await getJugadoresPorEquipo(idpartido, idequipo);
          setJugadoresPartido(nuevosdatos);
        } catch (reloadError) {
          console.warn("Error al recargar datos:", reloadError);
        }
      }, 500);
    } catch (err: unknown) {
      console.error("Error al eliminar jugador:", err);

      let errorMessage = "Error desconocido al eliminar jugador";

      if (err instanceof Error) {
        if (err.message.includes("404")) {
          errorMessage = "El jugador no se encuentra en este partido";
        } else if (err.message.includes("400")) {
          errorMessage = "Parámetros inválidos para la eliminación";
        } else if (err.message.includes("500")) {
          errorMessage = "Error interno del servidor";
        } else {
          errorMessage = err.message;
        }
      }

      setError(`Error al eliminar jugador: ${errorMessage}`);

      try {
        await fetchJugadores();
      } catch (reloadError) {
        console.error("Error al recargar datos:", reloadError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddJugador = async () => {
    if (!selectedJugadorId) {
      setError("Debe seleccionar un jugador");
      return;
    }

    const jugadorExistente = jugadoresPartido.find(
      (j) => j.idjugador === selectedJugadorId
    );

    if (jugadorExistente) {
      setError("Este jugador ya está en el partido");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await addJugadorToEquipo(selectedJugadorId);

      const input: PartidoJugadorInput = {
        idjugador: selectedJugadorId,
        jugo: false,
        camiseta: "",
        goles: 0,
        amarilla: 0,
        azul: 0,
        roja: 0,
        fhcarga: new Date().toISOString(),
        idusuario: 1,
      };

      await savePartidoJugador(idpartido, idequipo, input);

      setSelectedJugadorId(0);
      setShowAddPlayer(false);

      await fetchJugadores();
    } catch (err: unknown) {
      console.error("Error al agregar jugador:", err);

      if (err instanceof Error) {
        if (err.message.includes("no pertenece")) {
          setError(
            "El jugador no está en este equipo. Debe agregarlo al equipo primero desde la gestión de equipos."
          );
        } else if (err.message.includes("equipo contrario")) {
          setError(
            "El jugador ya está registrado en el equipo contrario de este partido."
          );
        } else {
          setError(`Error al agregar jugador: ${err.message}`);
        }
      } else {
        setError("Error al agregar jugador al partido");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewPlayer = async () => {
    if (
      !nuevoJugador.nombres ||
      !nuevoJugador.apellido ||
      !nuevoJugador.docnro
    ) {
      setError("Nombre, apellido y documento son obligatorios");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const jugadorCreado = await createJugador({
        ...nuevoJugador,
        codestado: 1,
      });

      if (!jugadorCreado || !jugadorCreado.id) {
        throw new Error("No se pudo crear el jugador");
      }

      await addJugadorToEquipo(jugadorCreado.id);

      const input: PartidoJugadorInput = {
        idjugador: jugadorCreado.id,
        jugo: false,
        camiseta: "",
        goles: 0,
        amarilla: 0,
        azul: 0,
        roja: 0,
        fhcarga: new Date().toISOString(),
        idusuario: 1,
      };

      await savePartidoJugador(idpartido, idequipo, input);

      setNuevoJugador({
        nombres: "",
        apellido: "",
        docnro: "",
        fhnacimiento: "",
        telefono: "",
        email: "",
      });
      setShowCreatePlayer(false);

      await fetchJugadores();
    } catch (err: unknown) {
      console.error("Error al crear jugador:", err);

      if (err instanceof Error) {
        if (err.message.includes("documento")) {
          setError("El documento ya existe en el sistema");
        } else if (err.message.includes("no pertenece")) {
          setError(
            "El jugador fue creado pero hay un problema agregándolo al equipo. Recargue la página e intente desde 'Agregar Existente'."
          );
        } else {
          setError(`Error: ${err.message}`);
        }
      } else {
        setError("Error al crear el jugador");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJugadorSelect = (jugador: Jugador | null) => {
    setSelectedJugadorId(jugador?.id ?? 0);
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
    if (jugador.codtipo === 2)
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

  // Función para verificar si una camiseta está duplicada
  const isCamisetaDuplicada = (
    camiseta: string,
    idJugadorActual: number
  ): boolean => {
    if (!camiseta || camiseta.trim() === "") return false;
    return jugadoresPartido.some(
      (j) =>
        j.camiseta === camiseta &&
        j.idjugador !== idJugadorActual &&
        j.camiseta.trim() !== ""
    );
  };

  return (
    <div className="w-full">
      {/* Popup de notificaciones */}
      <PopupNotificacion
        open={popup.open}
        type={popup.type}
        message={popup.message}
        onClose={closePopup}
      />

      {/* Header con nombre del equipo y botones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h3 className="text-lg font-semibold text-gray-800">
          {nombreEquipo || `Equipo ${idequipo}`}
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setShowAddPlayer(!showAddPlayer);
              setShowCreatePlayer(false);
              setError(null);
            }}
            className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 whitespace-nowrap"
            disabled={loading}
          >
            <PlusIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Agregar Existente</span>
            <span className="sm:hidden">Existente</span>
          </button>
          <button
            onClick={() => {
              setShowCreatePlayer(!showCreatePlayer);
              setShowAddPlayer(false);
              setError(null);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 whitespace-nowrap"
            disabled={loading}
          >
            <UserPlusIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Crear Nuevo</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>
      </div>

      {/* Formulario para agregar jugador existente */}
      {showAddPlayer && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold mb-2">Agregar Jugador Existente</h4>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 min-w-0">
              <JugadorAutocomplete
                value={selectedJugadorId}
                onChange={handleJugadorSelect}
                excludeIds={jugadoresPartido.map((j) => j.idjugador)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddJugador}
                disabled={!selectedJugadorId || loading}
                className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Agregando..." : "Agregar"}
              </button>
              <button
                onClick={() => {
                  setShowAddPlayer(false);
                  setSelectedJugadorId(0);
                  setError(null);
                }}
                className="flex-1 sm:flex-none bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600"
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulario para crear nuevo jugador */}
      {showCreatePlayer && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold mb-3">Crear Nuevo Jugador</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nombres *"
              value={nuevoJugador.nombres}
              onChange={(e) =>
                setNuevoJugador({ ...nuevoJugador, nombres: e.target.value })
              }
              className="px-3 py-2 border rounded text-sm"
              disabled={loading}
            />
            <input
              type="text"
              placeholder="Apellido *"
              value={nuevoJugador.apellido}
              onChange={(e) =>
                setNuevoJugador({ ...nuevoJugador, apellido: e.target.value })
              }
              className="px-3 py-2 border rounded text-sm"
              disabled={loading}
            />
            <input
              type="text"
              placeholder="Documento *"
              value={nuevoJugador.docnro}
              onChange={(e) =>
                setNuevoJugador({ ...nuevoJugador, docnro: e.target.value })
              }
              className="px-3 py-2 border rounded text-sm"
              disabled={loading}
            />
            <input
              type="date"
              placeholder="Fecha Nacimiento"
              value={nuevoJugador.fhnacimiento}
              onChange={(e) =>
                setNuevoJugador({
                  ...nuevoJugador,
                  fhnacimiento: e.target.value,
                })
              }
              className="px-3 py-2 border rounded text-sm"
              disabled={loading}
            />
            <input
              type="text"
              placeholder="Teléfono"
              value={nuevoJugador.telefono}
              onChange={(e) =>
                setNuevoJugador({ ...nuevoJugador, telefono: e.target.value })
              }
              className="px-3 py-2 border rounded text-sm"
              disabled={loading}
            />
            <input
              type="email"
              placeholder="Email"
              value={nuevoJugador.email}
              onChange={(e) =>
                setNuevoJugador({ ...nuevoJugador, email: e.target.value })
              }
              className="px-3 py-2 border rounded text-sm"
              disabled={loading}
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCreateNewPlayer}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creando..." : "Crear y Agregar"}
            </button>
            <button
              onClick={() => {
                setShowCreatePlayer(false);
                setNuevoJugador({
                  nombres: "",
                  apellido: "",
                  docnro: "",
                  fhnacimiento: "",
                  telefono: "",
                  email: "",
                });
                setError(null);
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600"
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <StatusMessage loading={loading} error={error} />

      {!loading && (
        <>
          {/* ✅ VISTA DESKTOP - Tabla con scroll horizontal Y vertical */}
          <div className="hidden lg:block overflow-auto max-h-[60vh] border border-gray-300 rounded-lg">
            <div className="min-w-max">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-left sticky top-0">
                  <tr>
                    <th className="px-2 py-2 whitespace-nowrap">Jugó</th>
                    <th className="px-2 py-2 whitespace-nowrap">C</th>
                    <th className="px-2 py-2 whitespace-nowrap">Foto</th>
                    <th className="px-2 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        Nombre
                        <SortButton column="nombre" />
                      </div>
                    </th>
                    <th className="px-2 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        Documento
                        <SortButton column="docnro" />
                      </div>
                    </th>
                    <th className="px-2 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        N°
                        <SortButton column="camiseta" />
                      </div>
                    </th>
                    <th className="px-2 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        Tipo
                        <SortButton column="codtipo" />
                      </div>
                    </th>
                    <th className="px-2 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        Goles
                        <SortButton column="goles" />
                      </div>
                    </th>
                    <th className="px-2 py-2 whitespace-nowrap">Amarilla</th>
                    <th className="px-2 py-2 whitespace-nowrap">Azul</th>
                    <th className="px-2 py-2 whitespace-nowrap">Roja</th>
                    <th className="px-2 py-2 whitespace-nowrap"></th>
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
                            : j.codtipo === 2
                            ? "bg-purple-100"
                            : ""
                        }`}
                      >
                        <td className="px-2 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={j.jugo && !isDisabled}
                            onChange={() => handleCheckboxChange(j)}
                            disabled={isDisabled || loading}
                            className={`${
                              isDisabled ? "cursor-not-allowed" : ""
                            }`}
                          />
                        </td>
                        <td className="px-2 py-2 text-center">
                          <input
                            type="checkbox"
                            disabled={isDisabled || loading}
                            className={`${
                              isDisabled ? "cursor-not-allowed" : ""
                            }`}
                            title="Consentimiento"
                          />
                        </td>
                        <td className="px-2 py-2 text-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                            📷
                          </div>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            {renderColorDot(j)}
                            <span className={isDisabled ? "line-through" : ""}>
                              {j.nombre}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          {j.docnro}
                        </td>
                        <td className="px-2 py-2">
                          <select
                            value={j.camiseta || ""}
                            onChange={(e) =>
                              handleInputChange(j, "camiseta", e.target.value)
                            }
                            disabled={isDisabled || loading}
                            className={`w-16 border rounded px-1 text-xs ${
                              isDisabled
                                ? "bg-gray-300 cursor-not-allowed"
                                : isCamisetaDuplicada(j.camiseta, j.idjugador)
                                ? "border-yellow-500 bg-yellow-50"
                                : ""
                            }`}
                            title={
                              isCamisetaDuplicada(j.camiseta, j.idjugador)
                                ? "⚠️ Número duplicado"
                                : ""
                            }
                          >
                            <option value="">-</option>
                            {Array.from({ length: 100 }, (_, i) => (
                              <option key={i} value={i.toString()}>
                                {i}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-2">
                          <span
                            className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                              j.codtipo === 2
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {j.codtipo === 2 ? "INVITADO" : "OFICIAL"}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={j.goles}
                            onChange={(e) =>
                              handleInputChange(j, "goles", e.target.value)
                            }
                            disabled={isDisabled || loading}
                            className={`w-14 border rounded px-1 ${
                              isDisabled ? "bg-gray-300 cursor-not-allowed" : ""
                            }`}
                            min="0"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={j.amarilla}
                            onChange={(e) =>
                              handleInputChange(j, "amarilla", e.target.value)
                            }
                            disabled={isDisabled || loading}
                            className={`w-14 border rounded px-1 ${
                              isDisabled ? "bg-gray-300 cursor-not-allowed" : ""
                            }`}
                            min="0"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={j.azul}
                            onChange={(e) =>
                              handleInputChange(j, "azul", e.target.value)
                            }
                            disabled={isDisabled || loading}
                            className={`w-14 border rounded px-1 ${
                              isDisabled ? "bg-gray-300 cursor-not-allowed" : ""
                            }`}
                            min="0"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={j.roja}
                            onChange={(e) =>
                              handleInputChange(j, "roja", e.target.value)
                            }
                            disabled={isDisabled || loading}
                            className={`w-14 border rounded px-1 ${
                              isDisabled ? "bg-gray-300 cursor-not-allowed" : ""
                            }`}
                            min="0"
                          />
                        </td>
                        <td className="px-2 py-2 text-center">
                          <button
                            onClick={() => handleDeleteJugador(j)}
                            className={`hover:text-red-600 ${
                              isDisabled
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-gray-500"
                            }`}
                            disabled={isDisabled || loading}
                            title="Eliminar del partido"
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
          </div>

          {/* ✅ VISTA MOBILE - Cards con scroll vertical */}
          <div className="lg:hidden space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {sortedJugadores.map((j) => {
              const isDisabled = j.listanegra === 1;

              return (
                <div
                  key={j.idjugador}
                  className={`border rounded-lg p-4 ${
                    isDisabled
                      ? "bg-gray-600 text-white opacity-75"
                      : j.sancion === 1
                      ? "bg-red-50 border-red-200"
                      : j.codtipo === 2
                      ? "bg-purple-50 border-purple-200"
                      : "bg-white"
                  }`}
                >
                  {/* Header del Card */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        📷
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 flex-wrap">
                          {renderColorDot(j)}
                          <span
                            className={`font-semibold text-sm ${
                              isDisabled ? "line-through" : ""
                            }`}
                          >
                            {j.nombre}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">{j.docnro}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteJugador(j)}
                      className={`ml-2 flex-shrink-0 ${
                        isDisabled
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-500 hover:text-red-600"
                      }`}
                      disabled={isDisabled || loading}
                      title="Eliminar"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Info del Card */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <label className="text-xs font-medium block mb-1">
                        Tipo
                      </label>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs ${
                          j.codtipo === 2
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {j.codtipo === 2 ? "INVITADO" : "OFICIAL"}
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-medium block mb-1">
                        N° Camiseta
                      </label>
                      <select
                        value={j.camiseta || ""}
                        onChange={(e) =>
                          handleInputChange(j, "camiseta", e.target.value)
                        }
                        disabled={isDisabled || loading}
                        className={`w-full border rounded px-2 py-1 text-sm ${
                          isDisabled
                            ? "bg-gray-300 cursor-not-allowed"
                            : isCamisetaDuplicada(j.camiseta, j.idjugador)
                            ? "border-yellow-500 bg-yellow-50"
                            : ""
                        }`}
                        title={
                          isCamisetaDuplicada(j.camiseta, j.idjugador)
                            ? "⚠️ Número duplicado"
                            : ""
                        }
                      >
                        <option value="">-</option>
                        {Array.from({ length: 100 }, (_, i) => (
                          <option key={i} value={i.toString()}>
                            {i}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2 flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={j.jugo && !isDisabled}
                          onChange={() => handleCheckboxChange(j)}
                          disabled={isDisabled || loading}
                          className={isDisabled ? "cursor-not-allowed" : ""}
                        />
                        <span className="text-xs font-medium">Jugó</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          disabled={isDisabled || loading}
                          className={isDisabled ? "cursor-not-allowed" : ""}
                        />
                        <span className="text-xs font-medium">
                          Consentimiento
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="text-xs font-medium block mb-1">
                        Goles
                      </label>
                      <input
                        type="number"
                        value={j.goles}
                        onChange={(e) =>
                          handleInputChange(j, "goles", e.target.value)
                        }
                        disabled={isDisabled || loading}
                        className={`w-full border rounded px-2 py-1 ${
                          isDisabled ? "bg-gray-300 cursor-not-allowed" : ""
                        }`}
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium block mb-1">
                        Amarilla
                      </label>
                      <input
                        type="number"
                        value={j.amarilla}
                        onChange={(e) =>
                          handleInputChange(j, "amarilla", e.target.value)
                        }
                        disabled={isDisabled || loading}
                        className={`w-full border rounded px-2 py-1 ${
                          isDisabled ? "bg-gray-300 cursor-not-allowed" : ""
                        }`}
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium block mb-1">
                        Azul
                      </label>
                      <input
                        type="number"
                        value={j.azul}
                        onChange={(e) =>
                          handleInputChange(j, "azul", e.target.value)
                        }
                        disabled={isDisabled || loading}
                        className={`w-full border rounded px-2 py-1 ${
                          isDisabled ? "bg-gray-300 cursor-not-allowed" : ""
                        }`}
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium block mb-1">
                        Roja
                      </label>
                      <input
                        type="number"
                        value={j.roja}
                        onChange={(e) =>
                          handleInputChange(j, "roja", e.target.value)
                        }
                        disabled={isDisabled || loading}
                        className={`w-full border rounded px-2 py-1 ${
                          isDisabled ? "bg-gray-300 cursor-not-allowed" : ""
                        }`}
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Estadísticas */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
        <div className="flex flex-wrap gap-4">
          <div>
            <strong>Total:</strong> {jugadoresPartido.length}
          </div>
          <div>
            <strong>Jugaron:</strong>{" "}
            {jugadoresPartido.filter((j) => j.jugo).length}
          </div>
          <div>
            <strong>Lista negra:</strong>{" "}
            {jugadoresPartido.filter((j) => j.listanegra === 1).length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JugadoresEquipo;

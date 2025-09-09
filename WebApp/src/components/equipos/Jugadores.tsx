import { useEffect, useState } from "react";
import JugadorAutocomplete from "../forms/JugadorAutocomplete";
import { StatusMessage } from "../common";
import DataTable from "../tables/DataTable";
import { createEquipoJugadoresColumns } from "../tables/columns/equipoJugadoresColumns";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { EquipoJugador } from "../../types/equiposJugadores";
import {
  fetchEquipoJugadoresByEquipo,
  removeEquipoJugador,
  saveEquipoJugadorThunk,
  setEquiposJugadoresError,
} from "../../store/slices/equiposJugadoresSlice";

interface EquiposJugadoresProps {
  idequipo: number;
}

const EquiposJugadores = ({ idequipo }: EquiposJugadoresProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { equiposJugadores, loading, error } = useSelector(
    (state: RootState) => state.equiposJugadores
  );

  const [selectedJugadorId, setSelectedJugadorId] = useState<number>(0);
  const [selectedCodTipo, setSelectedCodTipo] = useState<number>(1); // Por defecto OFICIAL

  useEffect(() => {
    if (idequipo) {
      dispatch(fetchEquipoJugadoresByEquipo(idequipo));
    }
  }, [dispatch, idequipo]);

  const handleAddJugador = async () => {
    if (!selectedJugadorId) {
      dispatch(setEquiposJugadoresError("Debe seleccionar un jugador válido."));
      return;
    }

    // Verificar si el jugador ya está en el equipo
    const jugadorExistente = equiposJugadores.find(
      (j) => j.idjugador === selectedJugadorId
    );

    if (jugadorExistente) {
      dispatch(setEquiposJugadoresError("Este jugador ya está en el equipo."));
      return;
    }

    try {
      await dispatch(
        saveEquipoJugadorThunk({
          idjugador: selectedJugadorId,
          idequipo,
          capitan: 0, // Inicialmente no es capitán
          subcapitan: 0, // Inicialmente no es subcapitán
          codtipo: selectedCodTipo, // OFICIAL o INVITADO
          codestado: 1,
          idusuario: user?.idusuario ?? 0,
        })
      ).unwrap();

      dispatch(fetchEquipoJugadoresByEquipo(idequipo));
      setSelectedJugadorId(0);
      setSelectedCodTipo(1); // Reset a OFICIAL
    } catch (error) {
      console.error("Error al agregar jugador:", error);
    }
  };

  const handleDelete = async (jugador: EquipoJugador) => {
    if (!jugador.id) {
      dispatch(
        setEquiposJugadoresError(
          "No se puede eliminar este jugador porque no tiene ID válido."
        )
      );
      return;
    }

    try {
      await dispatch(removeEquipoJugador(jugador.id)).unwrap();
      dispatch(fetchEquipoJugadoresByEquipo(idequipo));
    } catch (error) {
      console.error("Error al eliminar jugador:", error);
    }
  };

  const handleToggleCapitan = async (jugador: EquipoJugador) => {
    if (!jugador.id) {
      dispatch(
        setEquiposJugadoresError(
          "No se puede modificar este jugador porque no tiene ID válido."
        )
      );
      return;
    }

    try {
      const esCapitanActual = jugador.capitan === 1;

      if (esCapitanActual) {
        // Si ya es capitán, lo quitamos
        await dispatch(
          saveEquipoJugadorThunk({
            id: jugador.id,
            idjugador: jugador.idjugador,
            idequipo,
            capitan: 0,
            subcapitan: jugador.subcapitan ?? 0,
            codtipo: jugador.codtipo ?? 1,
            codestado: jugador.codestado ?? 1,
            idusuario: user?.idusuario ?? 0,
          })
        ).unwrap();
      } else {
        // Lo hacemos capitán: primero quitar capitán actual (si hay) y después asignar

        // 1. Quitar capitán actual
        const capitanActual = equiposJugadores.find((j) => j.capitan === 1);
        if (capitanActual && capitanActual.id) {
          await dispatch(
            saveEquipoJugadorThunk({
              id: capitanActual.id,
              idjugador: capitanActual.idjugador,
              idequipo,
              capitan: 0,
              subcapitan: capitanActual.subcapitan ?? 0,
              codtipo: capitanActual.codtipo ?? 1,
              codestado: capitanActual.codestado ?? 1,
              idusuario: user?.idusuario ?? 0,
            })
          ).unwrap();
        }

        // 2. Asignar nuevo capitán (y asegurar que no sea subcapitán)
        await dispatch(
          saveEquipoJugadorThunk({
            id: jugador.id,
            idjugador: jugador.idjugador,
            idequipo,
            capitan: 1,
            subcapitan: 0, // Un capitán no puede ser subcapitán
            codtipo: jugador.codtipo ?? 1,
            codestado: jugador.codestado ?? 1,
            idusuario: user?.idusuario ?? 0,
          })
        ).unwrap();
      }

      dispatch(fetchEquipoJugadoresByEquipo(idequipo));
    } catch (error) {
      console.error("Error al cambiar capitán:", error);
    }
  };

  const handleToggleSubcapitan = async (jugador: EquipoJugador) => {
    if (!jugador.id) {
      dispatch(
        setEquiposJugadoresError(
          "No se puede modificar este jugador porque no tiene ID válido."
        )
      );
      return;
    }

    try {
      const esSubcapitanActual = jugador.subcapitan === 1;

      if (esSubcapitanActual) {
        // Si ya es subcapitán, lo quitamos
        await dispatch(
          saveEquipoJugadorThunk({
            id: jugador.id,
            idjugador: jugador.idjugador,
            idequipo,
            capitan: jugador.capitan ?? 0,
            subcapitan: 0,
            codtipo: jugador.codtipo ?? 1,
            codestado: jugador.codestado ?? 1,
            idusuario: user?.idusuario ?? 0,
          })
        ).unwrap();
      } else {
        // Lo hacemos subcapitán: primero quitar subcapitán actual (si hay) y después asignar

        // 1. Quitar subcapitán actual
        const subcapitanActual = equiposJugadores.find(
          (j) => j.subcapitan === 1
        );
        if (subcapitanActual && subcapitanActual.id) {
          await dispatch(
            saveEquipoJugadorThunk({
              id: subcapitanActual.id,
              idjugador: subcapitanActual.idjugador,
              idequipo,
              capitan: subcapitanActual.capitan ?? 0,
              subcapitan: 0,
              codtipo: subcapitanActual.codtipo ?? 1,
              codestado: subcapitanActual.codestado ?? 1,
              idusuario: user?.idusuario ?? 0,
            })
          ).unwrap();
        }

        // 2. Asignar nuevo subcapitán (y asegurar que no sea capitán)
        await dispatch(
          saveEquipoJugadorThunk({
            id: jugador.id,
            idjugador: jugador.idjugador,
            idequipo,
            capitan: 0, // Un subcapitán no puede ser capitán
            subcapitan: 1,
            codtipo: jugador.codtipo ?? 1,
            codestado: jugador.codestado ?? 1,
            idusuario: user?.idusuario ?? 0,
          })
        ).unwrap();
      }

      dispatch(fetchEquipoJugadoresByEquipo(idequipo));
    } catch (error) {
      console.error("Error al cambiar subcapitán:", error);
    }
  };

  const handleToggleCodTipo = async (jugador: EquipoJugador) => {
    if (!jugador.id) {
      dispatch(
        setEquiposJugadoresError(
          "No se puede modificar este jugador porque no tiene ID válido."
        )
      );
      return;
    }

    try {
      const nuevoCodTipo = jugador.codtipo === 1 ? 2 : 1; // Toggle OFICIAL/INVITADO

      await dispatch(
        saveEquipoJugadorThunk({
          id: jugador.id, // IMPORTANTE: Incluir el ID para actualizar, no crear
          idjugador: jugador.idjugador,
          idequipo,
          capitan: jugador.capitan ?? 0,
          subcapitan: jugador.subcapitan ?? 0,
          codtipo: nuevoCodTipo,
          codestado: jugador.codestado ?? 1,
          idusuario: user?.idusuario ?? 0,
        })
      ).unwrap();

      dispatch(fetchEquipoJugadoresByEquipo(idequipo));
    } catch (error) {
      console.error("Error al cambiar tipo de jugador:", error);
    }
  };

  // Filtrar jugadores que no estén ya en el equipo para el autocomplete
  const handleJugadorChange = (jugador: { id?: number } | null) => {
    setSelectedJugadorId(jugador?.id ?? 0);
  };

  // Crear las columnas con las funciones de callback
  const columnsWithActions = createEquipoJugadoresColumns({
    onToggleCapitan: handleToggleCapitan,
    onToggleSubcapitan: handleToggleSubcapitan,
    onToggleCodTipo: handleToggleCodTipo,
  });

  // Ordenar jugadores alfabéticamente por nombre
  const jugadoresOrdenados = [...equiposJugadores].sort((a, b) => {
    const nombreA = (a.nombres || "").toLowerCase();
    const nombreB = (b.nombres || "").toLowerCase();
    return nombreA.localeCompare(nombreB);
  });

  return (
    <div className="space-y-4">
      {/* Formulario para agregar jugador */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <JugadorAutocomplete
            value={selectedJugadorId}
            onChange={handleJugadorChange}
            excludeIds={equiposJugadores.map((j) => j.idjugador)} // Agregar esta línea
          />
        </div>
        <div className="flex-shrink-0">
          <select
            value={selectedCodTipo}
            onChange={(e) => setSelectedCodTipo(Number(e.target.value))}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value={1}>OFICIAL</option>
            <option value={2}>INVITADO</option>
          </select>
        </div>
        <button
          type="button"
          onClick={handleAddJugador}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
        >
          Agregar
        </button>
      </div>

      <StatusMessage loading={loading} error={error} />

      {/* Verificar que solo mostramos jugadores con ID válido */}
      <DataTable<EquipoJugador>
        columns={columnsWithActions}
        data={jugadoresOrdenados.filter(
          (j) => j.id !== null && j.id !== undefined
        )}
        onDelete={handleDelete}
      />

      {/* INFO: Resumen del equipo */}
      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Total jugadores:</strong>{" "}
          {equiposJugadores.filter((j) => j.id).length} |{" "}
          <strong>Oficiales:</strong>{" "}
          {equiposJugadores.filter((j) => j.codtipo === 1 && j.id).length} |{" "}
          <strong>Invitados:</strong>{" "}
          {equiposJugadores.filter((j) => j.codtipo === 2 && j.id).length}
        </p>
        {equiposJugadores.find((j) => j.capitan === 1 && j.id) && (
          <p>
            <strong>Capitán:</strong>{" "}
            {`${equiposJugadores.find((j) => j.capitan === 1)?.nombres || ""} ${
              equiposJugadores.find((j) => j.capitan === 1)?.apellido || ""
            }`.trim()}
          </p>
        )}
        {equiposJugadores.find((j) => j.subcapitan === 1 && j.id) && (
          <p>
            <strong>Subcapitán:</strong>{" "}
            {`${
              equiposJugadores.find((j) => j.subcapitan === 1)?.nombres || ""
            } ${
              equiposJugadores.find((j) => j.subcapitan === 1)?.apellido || ""
            }`.trim()}
          </p>
        )}
        {/* Advertencia si hay registros sin ID */}
        {equiposJugadores.some((j) => !j.id) && (
          <p className="text-red-600 font-bold mt-2">
            ⚠️ Hay jugadores sin ID válido en la base de datos. Ejecute el
            script SQL de limpieza.
          </p>
        )}
      </div>
    </div>
  );
};

export default EquiposJugadores;

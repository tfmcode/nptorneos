import { useEffect, useState } from "react";
import JugadorAutocomplete from "../forms/JugadorAutocomplete";
import { StatusMessage } from "../common";
import { DataTable, equipoJugadoresColumns } from "..";
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

function EquiposJugadores({ idequipo }: EquiposJugadoresProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { equiposJugadores, loading, error } = useSelector(
    (state: RootState) => state.equiposJugadores
  );

  const [selectedJugadorId, setSelectedJugadorId] = useState<number>(0);

  useEffect(() => {
    dispatch(fetchEquipoJugadoresByEquipo(idequipo));
  }, [dispatch, idequipo]);

  const handleAddJugador = async () => {
    if (!selectedJugadorId) {
      dispatch(setEquiposJugadoresError("Debe seleccionar un jugador válido."));
      return;
    }

    try {
      await dispatch(
        saveEquipoJugadorThunk({
          idjugador: selectedJugadorId,
          idequipo,
          capitan: false,
          subcapitan: false,
          codestado: 1,
          idusuario: user?.idusuario ?? 0,
        })
      ).unwrap();
      dispatch(fetchEquipoJugadoresByEquipo(idequipo));
      setSelectedJugadorId(0);
    } catch (error) {
      console.error("Error al agregar jugador:", error);
    }
  };

  const handleDelete = async (jugador: EquipoJugador) => {
    await dispatch(removeEquipoJugador(jugador.id!)).unwrap();
    dispatch(fetchEquipoJugadoresByEquipo(idequipo));
  };

  const handleToggleCapitan = async (jugador: EquipoJugador) => {
    try {
      await dispatch(
        saveEquipoJugadorThunk({
          id: jugador.id,
          idjugador: jugador.idjugador,
          idequipo,
          capitan: !jugador.capitan,
          subcapitan: false,
          codestado: jugador.codestado ?? 1,
          idusuario: user?.idusuario ?? 0,
        })
      ).unwrap();
      dispatch(fetchEquipoJugadoresByEquipo(idequipo));
    } catch (error) {
      console.error("Error al cambiar capitán:", error);
    }
  };

  const handleToggleSubcapitan = async (jugador: EquipoJugador) => {
    try {
      await dispatch(
        saveEquipoJugadorThunk({
          id: jugador.id,
          idjugador: jugador.idjugador,
          idequipo,
          capitan: false,
          subcapitan: !jugador.subcapitan,
          codestado: jugador.codestado ?? 1,
          idusuario: user?.idusuario ?? 0,
        })
      ).unwrap();
      dispatch(fetchEquipoJugadoresByEquipo(idequipo));
    } catch (error) {
      console.error("Error al cambiar subcapitán:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* ✅ Componente JugadorAutocomplete reemplazando el select */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <JugadorAutocomplete
            value={selectedJugadorId}
            onChange={(jugador) => setSelectedJugadorId(jugador.id ?? 0)}
          />
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

      <DataTable<EquipoJugador>
        columns={equipoJugadoresColumns}
        data={equiposJugadores}
        onEdit={(jugador) =>
          jugador.capitan
            ? handleToggleCapitan(jugador)
            : handleToggleSubcapitan(jugador)
        }
        onDelete={handleDelete}
      />
    </div>
  );
}

export default EquiposJugadores;

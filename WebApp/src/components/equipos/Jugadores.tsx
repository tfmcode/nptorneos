import React, { useEffect, useState } from "react";
import DynamicForm from "../forms/DynamicForm";
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
import { fetchJugadores } from "../../store/slices/jugadoresSlice";

interface EquiposJugadoresProps {
  idequipo: number;
}

function EquiposJugadores({ idequipo }: EquiposJugadoresProps) {
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);
  const { jugadores } = useSelector((state: RootState) => state.jugadores);
  const { equiposJugadores, loading, error } = useSelector(
    (state: RootState) => state.equiposJugadores
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJugadorId, setSelectedJugadorId] = useState<number>(0);

  useEffect(() => {
    dispatch(fetchJugadores({ page: 1, limit: 1000, searchTerm: "" }));
    dispatch(fetchEquipoJugadoresByEquipo(idequipo));
  }, [dispatch, idequipo]);

  const handleAddJugador = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedJugadorId) {
      dispatch(
        setEquiposJugadoresError(
          "Debe ingresar y seleccionar un jugador válido."
        )
      );
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
      setSearchTerm("");
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
          subcapitan: false, // al marcar capitán, quitamos subcapitán
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
          capitan: false, // al marcar subcapitán, quitamos capitán
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
    <div>
      <DynamicForm
        fields={[
          {
            name: "idjugador",
            type: "select",
            value: selectedJugadorId,
            label: "Jugador",
            options: jugadores
              .filter((j) =>
                `${j.apellido} ${j.nombres} ${j.docnro}`
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              )
              .map((j) => ({
                value: j.id ?? 0,
                label: `${j.apellido} ${j.nombres} - ${j.docnro}`,
              })),
          },
        ]}
        onChange={(e) => {
          if (e.target.name === "idjugador") {
            const selectedId = parseInt(e.target.value);
            setSelectedJugadorId(isNaN(selectedId) ? 0 : selectedId);
          } else {
            setSearchTerm(e.target.value);
          }
        }}
        onSubmit={handleAddJugador}
        submitLabel="Agregar"
      />

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

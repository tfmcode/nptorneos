import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  fetchInscripcionesJugadoresByInscripcion,
  removeInscripcionJugador,
  saveInscripcionJugadorThunk,
} from "../../store/slices/inscripcionesJugadoresSlice";
import JugadoresDataTable from "./JugadoresDataTable";
import { inscripcionJugadorColumns } from "../tables/columns";
import EquipoInscAutocomplete from "../forms/EquipoInscAutocomplete";
import { Inscripcion } from "../../types/inscripciones";
import { TorneosEquiposInsc } from "../../types/torneosEquiposInsc";
import { InscripcionJugador } from "../../types/inscripcionesJugadores";
import { updateEquipoAsocThunk } from "../../store/slices/inscripcionSlice";

function ProcesarEquipo({
  inscripcion,
  setFormData,
}: {
  inscripcion: Inscripcion;
  setFormData: (inscripcion: Inscripcion) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();

  const { inscripcionesJugadores } = useSelector(
    (state: RootState) => state.inscripcionesJugadores
  );

  const [data, setData] = useState<InscripcionJugador[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchJugadores = async () => {
      try {
        const updated = await dispatch(
          fetchInscripcionesJugadoresByInscripcion(inscripcion.id!)
        ).unwrap();
        if (isMounted) {
          setData(updated);
        }
      } catch (error) {
        console.error("Error al obtener inscripciones jugadores:", error);
      }
    };
    fetchJugadores();
    return () => {
      isMounted = false;
    };
  }, [inscripcion.id, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await dispatch(
        updateEquipoAsocThunk({
          id: inscripcion.id!,
          idequipo: inscripcion.idequipoasoc!,
        })
      );

      // Save or update existing jugadores
      await Promise.all(
        data.map(async (jugador) => {
          dispatch(saveInscripcionJugadorThunk(jugador));
        })
      );

      // Find jugadores that exist in inscripcionesJugadores but not in data (to delete)
      const jugadoresToDelete = inscripcionesJugadores.filter(
        (originalJugador) =>
          !data.some(
            (currentJugador) => currentJugador.id === originalJugador.id
          )
      );

      // Delete the jugadores that are no longer in data
      await Promise.all(
        jugadoresToDelete.map(async (jugador) => {
          await dispatch(removeInscripcionJugador(jugador.id!)).unwrap();
        })
      );

      // Refresh the data
      const updated = await dispatch(
        fetchInscripcionesJugadoresByInscripcion(inscripcion.id!)
      ).unwrap();
      setData(updated);
    } catch (error) {
      console.error("Error al procesar equipo:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEquipoChange = (equipo: TorneosEquiposInsc) => {
    setFormData({ ...inscripcion, idequipoasoc: equipo.idequipo });
  };

  return (
    <div>
      <div className="flex justify-center items-center gap-2 mt-4 mx-4">
        <div className="w-[25%]">
          <span>Asociar Equipo</span>
        </div>
        <EquipoInscAutocomplete
          value={inscripcion.idequipoasoc ?? 0}
          onChange={(e) => handleEquipoChange(e)}
          disabled={loading}
        />
      </div>
      <JugadoresDataTable
        columns={inscripcionJugadorColumns}
        data={data}
        setData={setData}
        disabled={loading}
      />
      <div className="flex justify-end">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm mt-4"
          onClick={(e) => handleSubmit(e)}
          disabled={loading}
        >
          {loading ? "Procesando..." : "Procesar"}
        </button>
      </div>
    </div>
  );
}

export default ProcesarEquipo;

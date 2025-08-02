import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchInscripcionesJugadoresByInscripcion } from "../../store/slices/inscripcionesJugadoresSlice";
import JugadoresDataTable from "./JugadoresDataTable";
import { inscripcionJugadorColumns } from "../tables/columns";
import EquipoInscAutocomplete from "../forms/EquipoInscAutocomplete";
import { Inscripcion } from "../../types/inscripciones";
import { TorneosEquiposInsc } from "../../types/torneosEquiposInsc";
import { InscripcionJugador } from "../../types/inscripcionesJugadores";
import { procesarEquipo } from "../../api/inscripcionesService";
import { fetchInscripciones } from "../../store/slices/inscripcionSlice";

function ProcesarEquipo({
  inscripcion,
  setFormData,
}: {
  inscripcion: Inscripcion;
  setFormData: (inscripcion: Inscripcion) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();

  const { page, limit } = useSelector(
    (state: RootState) => state.inscripciones
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

      const { inscripcion: inscripcionResult, jugadores: jugadoresResult } =
        await procesarEquipo(inscripcion, data);

      if (inscripcionResult) {
        setFormData(inscripcionResult);
      }

      if (jugadoresResult) {
        setData(jugadoresResult);
      }

      await dispatch(
        fetchInscripciones({ page, limit, searchTerm: "" })
      ).unwrap();

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
          disabled={loading || inscripcion.codestado === 1}
        />
      </div>
      <JugadoresDataTable
        columns={inscripcionJugadorColumns}
        data={data}
        setData={setData}
        disabled={loading || inscripcion.codestado === 1}
      />
      <div className="flex justify-end">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={(e) => handleSubmit(e)}
          disabled={loading || inscripcion.codestado === 1}
        >
          {loading ? "Procesando..." : "Procesar"}
        </button>
      </div>
    </div>
  );
}

export default ProcesarEquipo;

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
  const [error, setError] = useState<string | null>(null);

  // Verificar si ya está procesado
  const isProcessed = inscripcion.codestado === 1;

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
        if (isMounted) {
          setError("Error al cargar los jugadores");
        }
      }
    };

    if (inscripcion.id) {
      fetchJugadores();
    }

    return () => {
      isMounted = false;
    };
  }, [inscripcion.id, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones antes de procesar
    if (!inscripcion.id) {
      setError("No se puede procesar: ID de inscripción no válido");
      return;
    }

    if (isProcessed) {
      setError("Esta inscripción ya fue procesada anteriormente");
      return;
    }

    if (data.length === 0) {
      setError("No se puede procesar un equipo sin jugadores");
      return;
    }

    // Validar que hay al menos un capitán
    const hasCaptain = data.some((jugador) => jugador.capitan === 1);
    if (!hasCaptain) {
      setError("Debe asignar al menos un capitán antes de procesar");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { inscripcion: inscripcionResult, jugadores: jugadoresResult } =
        await procesarEquipo(inscripcion, data);

      if (inscripcionResult) {
        setFormData(inscripcionResult);
      }

      if (jugadoresResult) {
        setData(jugadoresResult);
      }

      // Refresh the inscripciones list
      await dispatch(
        fetchInscripciones({ page, limit, searchTerm: "" })
      ).unwrap();

      // Refresh the players data
      const updated = await dispatch(
        fetchInscripcionesJugadoresByInscripcion(inscripcion.id!)
      ).unwrap();
      setData(updated);
    } catch (error) {
      console.error("Error al procesar equipo:", error);
      setError(
        error instanceof Error ? error.message : "Error al procesar equipo"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEquipoChange = (equipo: TorneosEquiposInsc) => {
    setFormData({ ...inscripcion, idequipoasoc: equipo.idequipo });
  };

  return (
    <div>
      {/* Mostrar estado de procesamiento */}
      {isProcessed && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          ✅ Esta inscripción ya fue procesada y confirmada
        </div>
      )}

      {/* Mostrar errores */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          ❌ {error}
        </div>
      )}

      <div className="flex justify-center items-center gap-2 mt-4 mx-4">
        <div className="w-[25%]">
          <span>Asociar Equipo</span>
        </div>
        <EquipoInscAutocomplete
          value={inscripcion.idequipoasoc ?? 0}
          onChange={(e) => handleEquipoChange(e)}
          disabled={loading || isProcessed}
        />
      </div>

      <JugadoresDataTable
        columns={inscripcionJugadorColumns}
        data={data}
        setData={setData}
        disabled={loading || isProcessed}
      />

      <div className="flex justify-end">
        <button
          className={`px-4 py-2 rounded text-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed ${
            isProcessed
              ? "bg-green-600 text-white"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
          onClick={(e) => handleSubmit(e)}
          disabled={loading || isProcessed || data.length === 0}
        >
          {loading
            ? "Procesando..."
            : isProcessed
            ? "Ya Procesado"
            : "Procesar"}
        </button>
      </div>
    </div>
  );
}

export default ProcesarEquipo;

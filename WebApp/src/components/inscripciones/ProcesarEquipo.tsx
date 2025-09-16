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
  const [processingStatus, setProcessingStatus] = useState<string>("");

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

  const validateJugadores = (jugadores: InscripcionJugador[]) => {
    const errors: string[] = [];
    const documentNumbers = new Set<number>();
    let capitanCount = 0;

    jugadores.forEach((jugador, index) => {
      // Validar campos obligatorios
      if (!jugador.apellido?.trim()) {
        errors.push(`Jugador ${index + 1}: Apellido es obligatorio`);
      }
      if (!jugador.nombres?.trim()) {
        errors.push(`Jugador ${index + 1}: Nombres es obligatorio`);
      }
      if (!jugador.docnro) {
        errors.push(`Jugador ${index + 1}: DNI es obligatorio`);
      }
      if (!jugador.fhnacimiento) {
        errors.push(`Jugador ${index + 1}: Fecha de nacimiento es obligatoria`);
      }
      if (!jugador.telefono?.trim()) {
        errors.push(`Jugador ${index + 1}: Teléfono es obligatorio`);
      }

      // Validar DNI único dentro del equipo
      if (jugador.docnro) {
        if (documentNumbers.has(jugador.docnro)) {
          errors.push(`Jugador ${index + 1}: DNI duplicado en el equipo`);
        } else {
          documentNumbers.add(jugador.docnro);
        }
      }

      // Contar capitanes
      if (jugador.capitan === 1) {
        capitanCount++;
      }
    });

    // Validar que hay al menos un capitán
    if (capitanCount === 0) {
      errors.push("Debe asignar al menos un capitán");
    }

    // Validar que no hay más de un capitán
    if (capitanCount > 1) {
      errors.push("Solo puede haber un capitán por equipo");
    }

    return errors;
  };

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

    // Validar jugadores
    const validationErrors = validateJugadores(data);
    if (validationErrors.length > 0) {
      setError(validationErrors.join(". "));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setProcessingStatus("Validando jugadores existentes...");

      // Aquí es donde procesamos los jugadores y verificamos duplicados por DNI
      const { inscripcion: inscripcionResult, jugadores: jugadoresResult } =
        await procesarEquipo(inscripcion, data);

      if (inscripcionResult) {
        setFormData(inscripcionResult);
        setProcessingStatus("Inscripción procesada exitosamente");
      }

      if (jugadoresResult) {
        setData(jugadoresResult);
        setProcessingStatus("Jugadores actualizados con información existente");
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

      setProcessingStatus("Procesamiento completado exitosamente");

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setProcessingStatus("");
      }, 3000);
    } catch (error) {
      console.error("Error al procesar equipo:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error al procesar equipo";
      setError(errorMessage);
      setProcessingStatus("");
    } finally {
      setLoading(false);
    }
  };

  const handleEquipoChange = (equipo: TorneosEquiposInsc) => {
    setFormData({ ...inscripcion, idequipoasoc: equipo.idequipo });
  };

  return (
    <div>
      {/* Mostrar estado de procesamiento exitoso */}
      {processingStatus && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          ℹ️ {processingStatus}
        </div>
      )}

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
          <span className="font-medium">Asociar Equipo</span>
        </div>
        <EquipoInscAutocomplete
          value={inscripcion.idequipoasoc ?? 0}
          onChange={(e) => handleEquipoChange(e)}
          disabled={loading || isProcessed}
        />
      </div>

      <div className="mt-4">
        <JugadoresDataTable
          columns={inscripcionJugadorColumns}
          data={data}
          setData={setData}
          disabled={loading || isProcessed}
          showActions={!isProcessed}
        />
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          className={`px-6 py-2 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
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
            : "Procesar Equipo"}
        </button>
      </div>

      {/* Información adicional para el usuario */}
      {!isProcessed && data.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
          <strong>Nota:</strong> Al procesar el equipo se verificarán
          automáticamente los jugadores existentes por DNI. Los datos personales
          se mantendrán del registro original, pero la información de contacto
          se actualizará.
        </div>
      )}
    </div>
  );
}

export default ProcesarEquipo;

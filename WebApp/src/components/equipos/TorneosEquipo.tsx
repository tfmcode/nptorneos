import { useEffect, useState } from "react";
import {
  getTorneosByEquipo,
  TorneoDelEquipo,
} from "../../api/equipoTorneosService";
import { StatusMessage } from "../common";
import { TrophyIcon } from "@heroicons/react/24/outline";

interface TorneosEquipoProps {
  idequipo: number;
}

const TorneosEquipo = ({ idequipo }: TorneosEquipoProps) => {
  const [torneos, setTorneos] = useState<TorneoDelEquipo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTorneos = async () => {
      if (!idequipo) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getTorneosByEquipo(idequipo);
        setTorneos(data);
      } catch (err) {
        console.error("Error al obtener torneos:", err);
        setTorneos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTorneos();
  }, [idequipo]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <StatusMessage loading={loading} error={error} />

      {!loading && torneos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <TrophyIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg">Este equipo no participó en ningún torneo</p>
          <p className="text-sm mt-2">
            Los torneos aparecerán cuando el equipo tenga partidos programados
          </p>
        </div>
      )}

      {!loading && torneos.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm text-gray-600 mb-4">
            <strong>Total de torneos:</strong> {torneos.length}
          </div>

          <div className="space-y-3">
            {torneos.map((torneo) => (
              <div
                key={`${torneo.torneo_id}-${torneo.zona_id}`}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Icono de trofeo */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    torneo.torneo_estado === 1 ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  <TrophyIcon
                    className={`h-6 w-6 ${
                      torneo.torneo_estado === 1
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                </div>

                {/* Info del torneo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {torneo.torneo_nombre || "Torneo sin nombre"}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        torneo.torneo_estado === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {torneo.torneo_estado === 1 ? "Activo" : "Finalizado"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                    <span className="font-medium">
                      Año: {torneo.torneo_anio || "—"}
                    </span>
                    {torneo.zona_nombre && (
                      <>
                        <span>•</span>
                        <span>Zona: {torneo.zona_nombre}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Stats de partidos */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm">
                    <span className="text-gray-500">Partidos jugados:</span>{" "}
                    <span className="font-bold text-gray-900">
                      {torneo.total_partidos}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Desde: {formatDate(torneo.primer_partido)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">
                  Total Partidos:
                </span>{" "}
                <span className="text-blue-900 font-bold">
                  {torneos.reduce((acc, t) => acc + t.total_partidos, 0)}
                </span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">
                  Torneos Activos:
                </span>{" "}
                <span className="text-blue-900 font-bold">
                  {torneos.filter((t) => t.torneo_estado === 1).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TorneosEquipo;

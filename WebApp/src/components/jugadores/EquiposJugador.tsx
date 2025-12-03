import { useEffect, useState } from "react";
import { getEquiposByJugador } from "../../api/equiposService";
import { Equipo } from "../../types/equipos";
import { StatusMessage } from "../common";
import { getImageUrl } from "../../utils/imageUtils";

interface EquiposJugadorProps {
  idjugador: number;
}

const EquiposJugador = ({ idjugador }: EquiposJugadorProps) => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEquipos = async () => {
      if (!idjugador) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getEquiposByJugador(idjugador);
        setEquipos(data);
      } catch (err) {
        console.error("Error al obtener equipos:", err);
        setError("Error al cargar los equipos del jugador");
      } finally {
        setLoading(false);
      }
    };

    fetchEquipos();
  }, [idjugador]);

  const renderEquipoLogo = (equipo: Equipo) => {
    const logoUrl = equipo.foto
      ? getImageUrl(equipo.foto, "equipo-escudo")
      : null;

    return (
      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 flex items-center justify-center bg-gray-100">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={equipo.nombre}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <span className="text-xl font-bold text-gray-400">
            {equipo.iniciales || equipo.nombre?.substring(0, 2).toUpperCase()}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <StatusMessage loading={loading} error={error} />

      {!loading && equipos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">
            Este jugador no está asociado a ningún equipo
          </p>
          <p className="text-sm mt-2">
            Puede agregarlo desde la gestión de equipos
          </p>
        </div>
      )}

      {!loading && equipos.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm text-gray-600 mb-4">
            <strong>Total de equipos:</strong> {equipos.length}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {equipos.map((equipo) => (
              <div
                key={equipo.id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {renderEquipoLogo(equipo)}

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {equipo.nombre}
                  </h4>
                  {equipo.abrev && (
                    <p className="text-sm text-gray-500">({equipo.abrev})</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        equipo.codestado === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {equipo.codestado === 1 ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EquiposJugador;

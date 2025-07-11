import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPublicTorneoById } from "../../../api/torneosPublicService";
import { Torneo } from "../../../types/torneos";
import { Zona } from "../../../types/zonas";
import { Partido } from "../../../types/partidos";
import { Sancion } from "../../../types/sanciones";
import { StatusMessage } from "../../../components";
import TableMatches, { Match } from "./components/TableMatches";
import Sanctions from "./components/Sanctions";

const TorneoPublic: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [sanciones, setSanciones] = useState<Sancion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTorneo = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getPublicTorneoById(Number(id));
        setTorneo(data.torneo);
        setZonas(data.zonas);
        setPartidos(data.partidos);
        setSanciones(data.sanciones);
      } catch (error) {
        console.error(error);
        setError("Error al cargar el torneo.");
      } finally {
        setLoading(false);
      }
    };

    fetchTorneo();
  }, [id]);

  const matchesFormateados: Match[] = partidos.map((p) => {
    const fechaObj = p.fecha ? new Date(p.fecha) : null;
    const dia = fechaObj ? String(fechaObj.getDate()).padStart(2, "0") : "-";
    const mes = fechaObj
      ? String(fechaObj.getMonth() + 1).padStart(2, "0")
      : "-";

    return {
      id: p.id ?? 0,
      zona: zonas.find((z) => z.id === p.idzona)?.abrev ?? "SIN ZONA",
      local:
        typeof p.nombre_equipo1 === "string" && p.nombre_equipo1.trim() !== ""
          ? p.nombre_equipo1
          : `Equipo ${p.idequipo1}`,
      visitante:
        typeof p.nombre_equipo2 === "string" && p.nombre_equipo2.trim() !== ""
          ? p.nombre_equipo2
          : `Equipo ${p.idequipo2}`,
      golesLocal: p.goles1 ?? 0,
      golesVisitante: p.goles2 ?? 0,
      citacion:
        typeof p.fechacitacion === "string" && p.fechacitacion
          ? new Date(p.fechacitacion).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "-",
      partido:
        typeof p.fecha === "string" && p.fecha
          ? new Date(p.fecha).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "-",
      fecha: fechaObj ? `${dia}/${mes}` : "-",
      sede:
        typeof p.nombre_sede === "string" && p.nombre_sede.trim() !== ""
          ? p.nombre_sede
          : "SIN SEDE",
    };
  });

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Título */}
      <h1 className="text-2xl font-bold text-center mb-6">
        {typeof torneo?.nombre === "string"
          ? torneo.nombre.toUpperCase()
          : "DETALLE DEL TORNEO"}
      </h1>

      <StatusMessage loading={loading} error={error} />


      {/* Fixture de Partidos */}
      {matchesFormateados.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold text-center mb-4">
            Fixture de Partidos
          </h2>
          <TableMatches matches={matchesFormateados} itemsPerPage={3} />
        </div>
      )}

      <div className="flex flex-wrap lg:flex-nowrap space-y-6 lg:space-y-0 lg:space-x-6 mb-10">
        <div className="w-full lg:w-1/2 p-4 bg-white shadow-md rounded-lg">
          <h2 className="text-xl font-bold text-center mb-4">Posiciones</h2>
          <div className="text-center text-gray-500">Próximamente...</div>
        </div>
        <div className="w-full lg:w-1/2 p-4 bg-white shadow-md rounded-lg">
          <h2 className="text-xl font-bold text-center mb-4">Goleadores</h2>
          <div className="text-center text-gray-500">Próximamente...</div>
        </div>
      </div>

      {/* Sanciones */}
      {sanciones.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold text-center mb-4">Sanciones</h2>
          {sanciones.map((s) => (
            <Sanctions
              key={s.id}
              jugador={
                typeof s.nombrejugador === "string"
                  ? s.nombrejugador
                  : String(s.idjugador ?? "-")
              }
              equipo={
                typeof s.nombreequipo === "string"
                  ? s.nombreequipo
                  : String(s.idequipo ?? "-")
              }
              fecha={
                s.fecha
                  ? new Date(s.fecha).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "Sin fecha"
              }
              detalles={s.descripcion ?? "Sin descripción"}
            />
          ))}
        </div>
      )}

      {/* Mapa */}
      {torneo?.latitud && torneo?.longitud && (
        <div className="border border-gray-300 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">
            SEDE:{" "}
            {typeof torneo?.sede_nombre === "string" ? torneo.sede_nombre : ""}
          </h2>
          <p>
            {typeof torneo?.domicilio === "string" ? torneo.domicilio : ""},{" "}
            {typeof torneo?.localidad === "string" ? torneo.localidad : ""},{" "}
            {typeof torneo?.provincia === "string" ? torneo.provincia : ""}
          </p>
          <iframe
            src={`https://www.google.com/maps?q=${torneo.latitud},${torneo.longitud}&z=15&output=embed`}
            width="100%"
            height="300"
            className="border rounded-md mt-4"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default TorneoPublic;

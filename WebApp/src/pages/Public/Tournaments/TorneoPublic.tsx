import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getPublicTorneoById,
  getPosicionesByTorneoId,
  getGoleadoresByZonaId,
  getSancionesPorZona,
  getFichaPartido,
  getSancionesByTorneoId,
  PublicTorneo,
} from "../../../api/torneosPublicService";
import {
  Zona,
  Partido,
  Posicion,
  Goleador,
  FichaPartido,
  Sancion,
} from "../../../types";
import {
  ModalFichaPartido,
  TableCards,
  TableMatches,
  TablePosition,
  TableScorers,
  Sanctions,
} from "./componentes";
import { Match } from "./componentes/TableMatches";
import { Card } from "./componentes/TableCards";
import { StatusMessage } from "../../../components";

const preferZone = (zones: string[]) =>
  zones.find((k) => /(^|\s)(zona|grupo)\s*a($|\s)/i.test(k)) || zones[0] || "";

interface TorneoData {
  torneo: PublicTorneo;
  zonas: Zona[];
  partidos: Partido[];
  positions: Record<string, Posicion[]>;
  scorers: Record<string, Goleador[]>;
  cards: Record<string, Card[]>;
  sanciones: Sancion[];
  activeZone: string;
}

const TorneoSection = ({
  data,
  esHijo = false,
  onSelectMatch,
}: {
  data: TorneoData;
  esHijo?: boolean;
  onSelectMatch: (id: number) => void;
}) => {
  const { torneo, zonas, partidos, positions, scorers, cards, sanciones, activeZone } = data;

  const matchesFormateados: Match[] = partidos.map((p) => {
    const fechaObj = p.fecha ? new Date(p.fecha) : null;
    const dia = fechaObj ? String(fechaObj.getDate()).padStart(2, "0") : "-";
    const mes = fechaObj ? String(fechaObj.getMonth() + 1).padStart(2, "0") : "-";

    return {
      id: p.id ?? 0,
      zona: zonas.find((z) => z.id === p.idzona)?.nombre ?? "SIN ZONA",
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
      nrofecha: p.nrofecha,
      fotoLocal: p.foto_equipo1 ?? null,
      fotoVisitante: p.foto_equipo2 ?? null,
    };
  });

  return (
    <div className={esHijo ? "mt-16 border-t-4 border-blue-500 pt-8" : ""}>
      {esHijo && (
        <div className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide opacity-90">
                Torneo Asociado - Playoff/Fase Final
              </p>
              <h2 className="text-2xl font-bold">
                {typeof torneo?.nombre === "string"
                  ? torneo.nombre.toUpperCase()
                  : "TORNEO HIJO"}
              </h2>
            </div>
          </div>
        </div>
      )}

      {!esHijo && (
        <h1 className="text-2xl font-bold text-center mb-6">
          {typeof torneo?.nombre === "string"
            ? torneo.nombre.toUpperCase()
            : "DETALLE DEL TORNEO"}
        </h1>
      )}

      {Object.keys(positions).length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-4 text-center">POSICIONES</h2>
          <TablePosition positions={positions} initialZone={activeZone} />
        </div>
      )}

      {matchesFormateados.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold text-center mb-4">
            FIXTURE DE PARTIDOS
          </h2>
          <TableMatches
            matches={matchesFormateados}
            onSelectMatch={onSelectMatch}
          />
        </div>
      )}

      {(Object.keys(cards).length > 0 || Object.keys(scorers).length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {Object.keys(cards).length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-4">TARJETAS</h2>
              <TableCards
                cards={cards}
                tabs={Object.keys(cards).sort()}
                initialZone={activeZone}
              />
            </div>
          )}
          {Object.keys(scorers).length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-4">GOLEADORES</h2>
              <TableScorers scorersByZona={scorers} initialZone={activeZone} />
            </div>
          )}
        </div>
      )}

      <Sanctions sanciones={sanciones} />

      {!esHijo && torneo?.latitud && torneo?.longitud && (
        <div className="border border-gray-300 p-6 rounded-lg shadow-md mt-10">
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
            title="Mapa de ubicación"
          ></iframe>
        </div>
      )}
    </div>
  );
};

const TorneoPublic: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [torneoData, setTorneoData] = useState<TorneoData | null>(null);
  const [torneosHijos, setTorneosHijos] = useState<TorneoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [fichaPartido, setFichaPartido] = useState<FichaPartido | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);

        const data = await getPublicTorneoById(Number(id));
        const posicionesData = await getPosicionesByTorneoId(Number(id));
        const sancionesData = await getSancionesByTorneoId(Number(id));

        const procesarTorneoData = async (
          torneoInfo: {
            torneo: PublicTorneo;
            zonas: Zona[];
            partidos: Partido[];
          },
          esPadre: boolean = true
        ): Promise<TorneoData> => {
          const allZonas: Zona[] = torneoInfo.zonas ?? [];
          const partidosInfo = torneoInfo.partidos ?? [];
          const torneoObj = torneoInfo.torneo;

          const posicionesByZona: Record<string, Posicion[]> = {};
          
          if (esPadre) {
            posicionesData.forEach((pos) => {
              const zonaNombre = pos.zona_nombre ?? "SIN ZONA";
              if (!posicionesByZona[zonaNombre])
                posicionesByZona[zonaNombre] = [];
              posicionesByZona[zonaNombre].push(pos);
            });
          } else {
            if (torneoObj.id) {
              const posHijo = await getPosicionesByTorneoId(torneoObj.id);
              posHijo.forEach((pos) => {
                const zonaNombre = pos.zona_nombre ?? "SIN ZONA";
                if (!posicionesByZona[zonaNombre])
                  posicionesByZona[zonaNombre] = [];
                posicionesByZona[zonaNombre].push(pos);
              });
            }
          }

          const goleadoresByZona: Record<string, Goleador[]> = {};
          for (const zona of allZonas) {
            if (typeof zona.id === "number") {
              const goleadores = await getGoleadoresByZonaId(zona.id);
              const key = zona.nombre ?? "SIN ZONA";
              goleadoresByZona[key] = goleadores.map((g, idx) => ({
                ...g,
                pos: idx + 1,
              }));
            }
          }

          const tarjetasByZona: Record<string, Card[]> = {};
          for (const zona of allZonas) {
            if (typeof zona.id === "number") {
              const sancionesTarjetas = await getSancionesPorZona(zona.id);
              const key = zona.nombre ?? "SIN ZONA";
              tarjetasByZona[key] = sancionesTarjetas.map((s, idx) => ({
                pos: idx + 1,
                jugador: s.jugador,
                equipo: s.equipo,
                amarillas: s.namarillas,
                azules: s.nazules,
                rojas: s.nrojas,
              }));
            }
          }

          const posKeys = Object.keys(posicionesByZona).sort();
          const scKeys = Object.keys(goleadoresByZona).sort();
          const crKeys = Object.keys(tarjetasByZona).sort();
          const all = Array.from(
            new Set([...posKeys, ...scKeys, ...crKeys])
          ).sort();
          const chosen = preferZone(all);

          return {
            torneo: torneoObj,
            zonas: allZonas,
            partidos: partidosInfo,
            positions: posicionesByZona,
            scorers: goleadoresByZona,
            cards: tarjetasByZona,
            sanciones: esPadre ? sancionesData : (torneoObj.id ? await getSancionesByTorneoId(torneoObj.id) : []),
            activeZone: chosen,
          };
        };

        const dataPadre = await procesarTorneoData(data, true);
        setTorneoData(dataPadre);

        if (data.torneos_hijos && data.torneos_hijos.length > 0) {
          const hijosProcessed = await Promise.all(
            data.torneos_hijos.map((hijo) => procesarTorneoData(hijo, false))
          );
          setTorneosHijos(hijosProcessed);
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar el torneo.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const fetchFicha = async (idpartido: number) => {
    try {
      const ficha = await getFichaPartido(idpartido);
      setFichaPartido(ficha);
      setModalOpen(true);
    } catch (err) {
      console.error("Error al obtener la ficha del partido:", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <StatusMessage loading={loading} error={error} />

      {torneoData && (
        <TorneoSection data={torneoData} onSelectMatch={fetchFicha} />
      )}

      {torneosHijos.map((hijoData, idx) => (
        <TorneoSection
          key={idx}
          data={hijoData}
          esHijo={true}
          onSelectMatch={fetchFicha}
        />
      ))}

      <ModalFichaPartido
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        ficha={fichaPartido}
      />
    </div>
  );
};

export default TorneoPublic;
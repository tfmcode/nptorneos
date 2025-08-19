import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  getPublicTorneoById,
  getPosicionesByTorneoId,
  getGoleadoresByZonaId,
  getSancionesPorZona,
  getFichaPartido,
} from "../../../api/torneosPublicService";
import {
  Torneo,
  Zona,
  Partido,
  Posicion,
  Goleador,
  FichaPartido,
} from "../../../types";
import {
  ModalFichaPartido,
  TableCards,
  TableMatches,
  TablePosition,
  TableScorers,
} from "./componentes";
import { Match } from "./componentes/TableMatches";
import { Card } from "./componentes/TableCards";
import { StatusMessage } from "../../../components";

const preferZone = (zones: string[]) =>
  zones.find((k) => /(^|\s)(zona|grupo)\s*a($|\s)/i.test(k)) || zones[0] || "";

const TorneoPublic: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [fichaPartido, setFichaPartido] = useState<FichaPartido | null>(null);
  const [positions, setPositions] = useState<Record<string, Posicion[]>>({});
  const [scorers, setScorers] = useState<Record<string, Goleador[]>>({});
  const [cards, setCards] = useState<Record<string, Card[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Zona global (default + controlada por tabs arriba)
  const [activeZone, setActiveZone] = useState<string>("");

  const isAmistoso = (txt?: string | null) =>
    (txt ?? "").toLowerCase().includes("amistoso");

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);

        const [data, posicionesData] = await Promise.all([
          getPublicTorneoById(Number(id)),
          getPosicionesByTorneoId(Number(id)),
        ]);

        setTorneo(data.torneo ?? null);

        const allZonas: Zona[] = data.zonas ?? [];
        const zonasPublic = allZonas.filter(
          (z) => !isAmistoso(z.abrev ?? z.nombre)
        );
        setZonas(zonasPublic);

        const zonasPublicIds = new Set(
          zonasPublic
            .filter((z) => typeof z.id === "number")
            .map((z) => z.id as number)
        );

        const partidosPublic = (data.partidos ?? []).filter((p) =>
          zonasPublicIds.has(Number(p.idzona))
        );
        setPartidos(partidosPublic);

        // POSICIONES por zona (excluye amistosos)
        const posicionesByZona: Record<string, Posicion[]> = {};
        posicionesData.forEach((pos) => {
          const zonaNombre = pos.zona_nombre ?? "SIN ZONA";
          if (isAmistoso(zonaNombre)) return;
          if (!posicionesByZona[zonaNombre]) posicionesByZona[zonaNombre] = [];
          posicionesByZona[zonaNombre].push(pos);
        });

        // GOLEADORES (solo zonas públicas)
        const goleadoresByZona: Record<string, Goleador[]> = {};
        for (const zona of zonasPublic) {
          if (typeof zona.id === "number") {
            const goleadores = await getGoleadoresByZonaId(zona.id);
            const key = zona.abrev ?? zona.nombre;
            goleadoresByZona[key] = goleadores.map((g, idx) => ({
              ...g,
              pos: idx + 1,
            }));
          }
        }

        // TARJETAS (solo zonas públicas)
        const tarjetasByZona: Record<string, Card[]> = {};
        for (const zona of zonasPublic) {
          if (typeof zona.id === "number") {
            const sanciones = await getSancionesPorZona(zona.id);
            const key = zona.abrev ?? zona.nombre;
            tarjetasByZona[key] = sanciones.map((s, idx) => ({
              pos: idx + 1,
              jugador: s.jugador,
              equipo: s.equipo,
              amarillas: s.namarillas,
              azules: s.nazules,
              rojas: s.nrojas,
            }));
          }
        }

        setPositions(posicionesByZona);
        setScorers(goleadoresByZona);
        setCards(tarjetasByZona);

        // ---- Zona por defecto GLOBAL (preferimos ZONA/GRUPO A; si no, la primera) ----
        const posKeys = Object.keys(posicionesByZona).sort();
        const scKeys = Object.keys(goleadoresByZona).sort();
        const crKeys = Object.keys(tarjetasByZona).sort();
        const all = Array.from(
          new Set([...posKeys, ...scKeys, ...crKeys])
        ).sort();
        const chosen = preferZone(all);
        setActiveZone(chosen);
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

  // Tabs globales: usamos la unión de todas las zonas disponibles
  const allZonesTabs = useMemo(() => {
    const pos = Object.keys(positions);
    const sc = Object.keys(scorers);
    const cr = Object.keys(cards);
    return Array.from(new Set([...pos, ...sc, ...cr])).sort();
  }, [positions, scorers, cards]);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        {typeof torneo?.nombre === "string"
          ? torneo.nombre.toUpperCase()
          : "DETALLE DEL TORNEO"}
      </h1>

      <StatusMessage loading={loading} error={error} />

      {/* Selector global de ZONA */}
      {allZonesTabs.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {allZonesTabs.map((z) => (
            <button
              key={z}
              onClick={() => setActiveZone(z)}
              className={`px-4 py-2 rounded font-semibold transition-colors ${
                activeZone === z
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {z.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* 1) POSICIONES */}
      {allZonesTabs.length > 0 && Object.keys(positions).length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-4 text-center">POSICIONES</h2>
          <TablePosition positions={positions} initialZone={activeZone} />
        </div>
      )}

      {/* 2) FIXTURE */}
      {matchesFormateados.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold text-center mb-4">
            FIXTURE DE PARTIDOS
          </h2>
          <TableMatches
            matches={matchesFormateados}
            onSelectMatch={(idpartido: number) => fetchFicha(idpartido)}
          />
          <ModalFichaPartido
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            ficha={fichaPartido}
          />
        </div>
      )}

      {/* 3) TARJETAS y GOLEADORES */}
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

      {/* Sede / Mapa */}
      {torneo?.latitud && torneo?.longitud ? (
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
      ) : null}
    </div>
  );
};

export default TorneoPublic;

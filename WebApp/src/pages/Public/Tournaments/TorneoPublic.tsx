import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
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
  TablePosition,
  TableScorers,
  ModalFichaPartido,
  Sanctions,
  TableMatches,
  TableCards,
} from "./";

import type { Match } from "./components/TableMatches";
import type { Card } from "./components/TableCards";

import { StatusMessage } from "../../../components";

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
        setZonas(data.zonas ?? []);
        setPartidos(data.partidos ?? []);

        const posicionesByZona: Record<string, Posicion[]> = {};
        posicionesData.forEach((pos) => {
          const zona = pos.zona_nombre ?? "SIN ZONA";
          if (!posicionesByZona[zona]) posicionesByZona[zona] = [];
          posicionesByZona[zona].push(pos);
        });
        setPositions(posicionesByZona);

        const goleadoresByZona: Record<string, Goleador[]> = {};
        for (const zona of data.zonas) {
          if (typeof zona.id === "number") {
            const goleadores = await getGoleadoresByZonaId(zona.id);
            goleadoresByZona[zona.abrev ?? zona.nombre] = goleadores.map(
              (g, idx) => ({ ...g, pos: idx + 1 })
            );
          }
        }
        setScorers(goleadoresByZona);

        const tarjetasByZona: Record<string, Card[]> = {};
        for (const zona of data.zonas) {
          if (typeof zona.id === "number") {
            const sanciones = await getSancionesPorZona(zona.id);
            tarjetasByZona[zona.abrev ?? zona.nombre] = sanciones.map(
              (s, idx) => ({
                pos: idx + 1,
                jugador: s.jugador,
                equipo: s.equipo,
                amarillas: s.namarillas,
                azules: s.nazules,
                rojas: s.nrojas,
              })
            );
          }
        }
        setCards(tarjetasByZona);
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

  const zonaTabs = Object.keys(positions).sort();
  const goleadorTabs = Object.keys(scorers).sort();
  const tarjetasTabs = Object.keys(cards).sort();

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        {typeof torneo?.nombre === "string"
          ? torneo.nombre.toUpperCase()
          : "DETALLE DEL TORNEO"}
      </h1>

      <StatusMessage loading={loading} error={error} />

      {matchesFormateados.length > 0 && (
        <>
          <div className="mb-10">
            <h2 className="text-lg font-bold text-center mb-4">
              Fixture de Partidos
            </h2>
            <TableMatches
              matches={matchesFormateados}
              itemsPerPage={3}
              onSelectMatch={(idpartido: number) => fetchFicha(idpartido)}
            />
          </div>

          <ModalFichaPartido
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            ficha={fichaPartido}
          />
        </>
      )}

      {zonaTabs.length > 0 && goleadorTabs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div>
            <h2 className="text-lg font-bold mb-4">POSICIONES</h2>
            <TablePosition positions={positions} />
          </div>
          <div>
            <h2 className="text-lg font-bold mb-4">GOLEADORES</h2>
            <TableScorers scorersByZona={scorers} />
          </div>
        </div>
      )}

      {tarjetasTabs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div>
            <h2 className="text-lg font-bold mb-4">TARJETAS</h2>
            <TableCards cards={cards} tabs={tarjetasTabs} />
          </div>
          <div>
            <Sanctions sanciones={[]} />
          </div>
        </div>
      )}

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

import React, { useEffect, useState } from "react";
import {
  getJugadoresPorEquipo,
  savePartidoJugador,
} from "../../api/partidosJugadoresService";
import { StatusMessage } from "../common";
import {
  PartidoJugadorExtendido,
  PartidoJugadorInput,
} from "../../types/partidosJugadores";

import { TrashIcon } from "@heroicons/react/24/outline";

interface JugadoresEquipoProps {
  idpartido: number;
  idequipo: number;
}

const JugadoresEquipo: React.FC<JugadoresEquipoProps> = ({
  idpartido,
  idequipo,
}) => {
  const [jugadores, setJugadores] = useState<PartidoJugadorExtendido[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJugadores = async () => {
      try {
        setLoading(true);
        const data = await getJugadoresPorEquipo(idpartido, idequipo);
        setJugadores(data);
      } catch {
        setError("Error al cargar los jugadores.");
      } finally {
        setLoading(false);
      }
    };

    fetchJugadores();
  }, [idpartido, idequipo]);

  const handleUpdate = async (
    jugador: PartidoJugadorExtendido,
    campo: keyof PartidoJugadorInput,
    valor: string | number | boolean
  ) => {
    const input: PartidoJugadorInput = {
      idjugador: jugador.idjugador,
      jugo: campo === "jugo" ? Boolean(valor) : jugador.jugo,
      camiseta: campo === "camiseta" ? String(valor) : jugador.camiseta,
      goles: campo === "goles" ? Number(valor) : jugador.goles,
      amarilla: campo === "amarilla" ? Number(valor) : jugador.amarilla,
      azul: campo === "azul" ? Number(valor) : jugador.azul,
      roja: campo === "roja" ? Number(valor) : jugador.roja,
    };

    await savePartidoJugador(idpartido, idequipo, input);

    setJugadores((prev) =>
      prev.map((j) =>
        j.idjugador === jugador.idjugador ? { ...j, ...input } : j
      )
    );
  };

  const handleCheckboxChange = (jugador: PartidoJugadorExtendido) => {
    handleUpdate(jugador, "jugo", !jugador.jugo);
  };

  const handleInputChange = (
    jugador: PartidoJugadorExtendido,
    campo: keyof PartidoJugadorInput,
    valor: string
  ) => {
    const parsed =
      campo === "camiseta" ? valor : valor === "" ? 0 : Number(valor);
    handleUpdate(jugador, campo, parsed);
  };

  const renderColorDot = (jugador: PartidoJugadorExtendido) => {
    if (jugador.sancion === 1)
      return (
        <span
          className="inline-block w-2 h-2 rounded-full bg-red-600 mr-1"
          title="Sancionado"
        />
      );
    if (jugador.listanegra === 1)
      return (
        <span
          className="inline-block w-2 h-2 rounded-full bg-black mr-1"
          title="Lista Negra"
        />
      );
    if (jugador.tipo === 2)
      return (
        <span
          className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-1"
          title="Invitado"
        />
      );
    return null;
  };

  return (
    <div>
      <StatusMessage loading={loading} error={error} />
      {!loading && !error && (
        <table className="w-full text-sm border border-gray-300">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-2 py-1">Jugó</th>
              <th className="px-2 py-1">Nombre</th>
              <th className="px-2 py-1">Documento</th>
              <th className="px-2 py-1">N°</th>
              <th className="px-2 py-1">Goles</th>
              <th className="px-2 py-1">Amarilla</th>
              <th className="px-2 py-1">Azul</th>
              <th className="px-2 py-1">Roja</th>
              <th className="px-2 py-1"></th>
            </tr>
          </thead>
          <tbody>
            {jugadores.map((j) => (
              <tr
                key={j.idjugador}
                className={`border-t ${
                  j.listanegra === 1
                    ? "bg-gray-600 text-white"
                    : j.sancion === 1
                    ? "bg-red-100"
                    : j.tipo === 2
                    ? "bg-purple-100"
                    : ""
                }`}
              >
                <td className="px-2 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={j.jugo}
                    onChange={() => handleCheckboxChange(j)}
                  />
                </td>
                <td className="px-2 py-1 flex items-center gap-1">
                  {renderColorDot(j)}
                  {j.nombre}
                </td>
                <td className="px-2 py-1">{j.docnro}</td>
                <td className="px-2 py-1">
                  <input
                    type="text"
                    value={j.camiseta || ""}
                    onChange={(e) =>
                      handleInputChange(j, "camiseta", e.target.value)
                    }
                    className="w-12 border rounded px-1"
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="number"
                    value={j.goles}
                    onChange={(e) =>
                      handleInputChange(j, "goles", e.target.value)
                    }
                    className="w-12 border rounded px-1"
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="number"
                    value={j.amarilla}
                    onChange={(e) =>
                      handleInputChange(j, "amarilla", e.target.value)
                    }
                    className="w-12 border rounded px-1"
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="number"
                    value={j.azul}
                    onChange={(e) =>
                      handleInputChange(j, "azul", e.target.value)
                    }
                    className="w-12 border rounded px-1"
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="number"
                    value={j.roja}
                    onChange={(e) =>
                      handleInputChange(j, "roja", e.target.value)
                    }
                    className="w-12 border rounded px-1"
                  />
                </td>
                <td className="px-2 py-1 text-center">
                  <button className="text-gray-500 hover:text-red-600">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default JugadoresEquipo;

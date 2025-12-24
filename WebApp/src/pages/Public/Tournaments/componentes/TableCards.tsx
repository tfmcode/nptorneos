import React, { useEffect, useMemo, useState } from "react";

export interface Card {
  pos: number;
  jugador: string;
  equipo: string;
  amarillas: number;
  rojas: number;
  azules: number;
}

interface TableCardsProps {
  cards: Record<string, Card[]>;
  tabs: string[];
  initialZone?: string;
  codtipo?: number;
}

const TableCards: React.FC<TableCardsProps> = ({
  cards,
  tabs,
  initialZone,
  codtipo,
}) => {
  // Ocultar tarjetas azules SOLO si es Fútbol 11 (codtipo === 11)
  // Si codtipo es undefined o cualquier otro valor, mostrar
  const mostrarAzules = codtipo === undefined || codtipo !== 11;
  const zonas = useMemo(() => tabs.slice().sort(), [tabs]);

  const computedDefault = useMemo(
    () =>
      initialZone && zonas.includes(initialZone) ? initialZone : zonas[0] || "",
    [initialZone, zonas]
  );

  const [activeZone, setActiveZone] = useState<string>(computedDefault);

  useEffect(() => {
    setActiveZone(computedDefault);
  }, [computedDefault]);

  const rows = useMemo<Card[]>(
    () => cards[activeZone] ?? [],
    [cards, activeZone]
  );

  if (zonas.length === 0) {
    return (
      <div className="text-center text-gray-500">Sin zonas para mostrar.</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Tabs de zonas */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {zonas.map((zona) => (
          <button
            key={zona}
            onClick={() => setActiveZone(zona)}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              activeZone === zona
                ? "bg-yellow-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {zona.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tabla con header sticky y scroll vertical tras 6 filas */}
      <div className="overflow-x-auto">
        <div className="max-h-[288px] overflow-y-auto rounded-md border border-gray-200">
          <table className="w-full text-sm text-center">
            <thead className="bg-gray-100 text-gray-700 border-b border-gray-300 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-3 py-2 whitespace-nowrap">Pos</th>
                <th className="px-3 py-2 whitespace-nowrap">Jugador</th>
                <th className="px-3 py-2 whitespace-nowrap">Equipo</th>
                <th className="px-3 py-2 whitespace-nowrap">🔴</th>
                <th className="px-3 py-2 whitespace-nowrap">🟡</th>
                {mostrarAzules && (
                  <th className="px-3 py-2 whitespace-nowrap">🔵</th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((card, idx) => (
                  <tr
                    key={`${card.jugador}-${idx}`}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-3 py-2 border-b border-gray-200 whitespace-nowrap">
                      {card.pos}
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200 whitespace-nowrap">
                      {card.jugador}
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200 whitespace-nowrap">
                      {card.equipo}
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200 whitespace-nowrap">
                      <span className="text-red-500 font-bold">
                        {card.rojas}
                      </span>
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200 whitespace-nowrap">
                      <span className="text-yellow-500 font-bold">
                        {card.amarillas}
                      </span>
                    </td>
                    {mostrarAzules && (
                      <td className="px-3 py-2 border-b border-gray-200 whitespace-nowrap">
                        <span className="text-blue-500 font-bold">
                          {card.azules}
                        </span>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-3 py-6 text-center text-gray-500"
                    colSpan={mostrarAzules ? 6 : 5}
                  >
                    Sin tarjetas para esta zona.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableCards;

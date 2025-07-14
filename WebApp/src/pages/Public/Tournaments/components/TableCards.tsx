import React from "react";
import { TournamentsTable } from "../../../../components/tables";

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
}

const TableCards: React.FC<TableCardsProps> = ({ cards, tabs }) => {
  const data = tabs.map((zona) => {
    const rows =
      cards[zona]?.map((card) => [
        card.pos,
        card.jugador,
        card.equipo,
        <span className="text-red-500 font-bold">{card.rojas}</span>,
        <span className="text-yellow-500 font-bold">{card.amarillas}</span>,
        <span className="text-blue-500 font-bold">{card.azules}</span>,
      ]) ?? [];

    return {
      zona,
      columns: ["Pos", "Jugador", "Equipo", "🔴", "🟡", "🔵"],
      rows,
    };
  });

  return <TournamentsTable data={data} itemsPerPage={6} />;
};

export default TableCards;

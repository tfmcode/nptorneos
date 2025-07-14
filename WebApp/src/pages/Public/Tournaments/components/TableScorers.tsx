import { TournamentsTable } from "../../../../components/tables";
import { Goleador } from "../../../../types/";

interface TableScorersProps {
  scorersByZona: Record<string, Goleador[]>;
}

const TableScorers: React.FC<TableScorersProps> = ({ scorersByZona }) => {
  const zonas = Object.keys(scorersByZona).sort();

  const data = zonas.map((zona) => {
    const rows = scorersByZona[zona].map((scorer, i) => [
      i + 1,
      scorer.jugador,
      scorer.equipo,
      scorer.goles,
    ]);

    return {
      zona,
      columns: ["Pos", "Jugador", "Equipo", "Goles"],
      rows,
    };
  });

  return <TournamentsTable data={data} itemsPerPage={6} />;
};

export default TableScorers;

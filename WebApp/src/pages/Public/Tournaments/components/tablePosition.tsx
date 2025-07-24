import React from "react";
import { Posicion } from "../../../../types/";
import { TournamentsTable } from "../../../../components/tables";

interface TablePositionProps {
  positions: Record<string, Posicion[]>;
}

const TablePosition: React.FC<TablePositionProps> = ({ positions }) => {
  const zonas = Object.keys(positions).sort();

  const data = zonas.map((zona) => {
    const rows = positions[zona].map((pos, i) => [
      i + 1,
      pos.equipo_nombre,
      pos.puntos,
      pos.jugados,
      pos.ganados,
      pos.empatados,
      pos.perdidos,
      pos.gf,
      pos.gc,
      pos.dg,
      pos.pb,
    ]);
    return {
      zona,
      columns: [
        "Pos",
        "Equipo",
        "PTS",
        "PJ",
        "PG",
        "PE",
        "PP",
        "GF",
        "GC",
        "DIF",
        "PB",
      ],
      rows,
    };
  });

  return <TournamentsTable data={data} itemsPerPage={6} />;
};

export default TablePosition;

import React, { useState } from "react";
import {
 /*  Bracket, */
  Sanctions,
  TableCards,
  TableScorers,
  TableMatches,
  TablePosition,
} from "./components";
/* const rounds = [
  {
    name: "Octavos de Final",
    matches: [
      { team1: "CACIQUE", team2: "GURE", winner: "GURE" },
      { team1: "JUVENTUS", team2: "BARQUISIMETO", winner: "BARQUISIMETO" },
      { team1: "FLAN CASERO", team2: "WOLFRAMIO", winner: "FLAN CASERO" },
      { team1: "EL INTERIOR", team2: "CABALLITO", winner: "EL INTERIOR" },
      { team1: "MAPUCHETOS", team2: "MGG TRAINING", winner: "MGG TRAINING" },
      { team1: "UBITA", team2: "BARRIO FINO", winner: "UBITA" },
      {
        team1: "CLUB LIBERTADOR",
        team2: "LOS PASAJES",
        winner: "CLUB LIBERTADOR",
      },
      {
        team1: "DEFE DE VIEDMA",
        team2: "YA VAN A VER",
        winner: "DEFE DE VIEDMA",
      },
    ],
  },
  {
    name: "Cuartos de Final",
    matches: [
      { team1: "GURE", team2: "BARQUISIMETO", winner: "BARQUISIMETO" },
      { team1: "FLAN CASERO", team2: "EL INTERIOR", winner: "EL INTERIOR" },
      { team1: "MGG TRAINING", team2: "UBITA", winner: "UBITA" },
      {
        team1: "CLUB LIBERTADOR",
        team2: "DEFE DE VIEDMA",
        winner: "DEFE DE VIEDMA",
      },
    ],
  },
  {
    name: "Semifinales",
    matches: [
      { team1: "BARQUISIMETO", team2: "EL INTERIOR", winner: "EL INTERIOR" },
      { team1: "UBITA", team2: "DEFE DE VIEDMA", winner: "DEFE DE VIEDMA" },
    ],
  },
  {
    name: "Final",
    matches: [
      { team1: "EL INTERIOR", team2: "DEFE DE VIEDMA", winner: "EL INTERIOR" },
    ],
  },
]; */

type Match = {
  local: string;
  visitante: string;
  golesLocal: number;
  golesVisitante: number;
  citacion: string;
  partido: string;
  fecha: string;
  sede: string;
};

const matches: Match[] = [
  {
    local: "BUFALO CS",
    visitante: "33 DE FIESTA",
    golesLocal: 0,
    golesVisitante: 6,
    citacion: "00:00",
    partido: "00:30",
    fecha: "09/11",
    sede: "CANCHAS CLUB MITRE",
  },
  {
    local: "QUE RESAKA FC",
    visitante: "ZP FÚTBOL",
    golesLocal: 0,
    golesVisitante: 6,
    citacion: "00:00",
    partido: "00:30",
    fecha: "09/11",
    sede: "CANCHAS CLUB MITRE",
  },
  {
    local: "LOS PIBES DE KOCH",
    visitante: "EL REJUNTE FC",
    golesLocal: 0,
    golesVisitante: 6,
    citacion: "00:00",
    partido: "00:30",
    fecha: "09/11",
    sede: "CANCHAS CLUB MITRE",
  },
  {
    local: "LA PANZA",
    visitante: "LA GLORIA FC",
    golesLocal: 9,
    golesVisitante: 7,
    citacion: "17:00",
    partido: "17:30",
    fecha: "16/11",
    sede: "CANCHAS CLUB MITRE",
  },
  {
    local: "LA CHIRRI FC",
    visitante: "CONCE F.C.",
    golesLocal: 3,
    golesVisitante: 13,
    citacion: "17:45",
    partido: "18:15",
    fecha: "16/11",
    sede: "CANCHAS CLUB MITRE",
  },
  {
    local: "LA MEZCLA DE BORIS",
    visitante: "LOS MAGIOS",
    golesLocal: 6,
    golesVisitante: 0,
    citacion: "18:30",
    partido: "19:00",
    fecha: "16/11",
    sede: "CANCHAS CLUB MITRE",
  },
];

type Position = {
  pos: number;
  equipo: string;
  pts: number;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dif: number;
  pb: number;
};

const tabsPositions = ["SABADO", "DOMINGO", "SEMANA"]; // Pestañas
const positions: Record<string, Position[]> = {
  SABADO: [
    {
      pos: 1,
      equipo: "LA MEZCLA DE BORIS",
      pts: 31,
      pj: 11,
      pg: 10,
      pe: 0,
      pp: 1,
      gf: 90,
      gc: 51,
      dif: 39,
      pb: 11,
    },
    {
      pos: 2,
      equipo: "CONCE F.C.",
      pts: 29,
      pj: 11,
      pg: 9,
      pe: 0,
      pp: 2,
      gf: 77,
      gc: 38,
      dif: 39,
      pb: 11,
    },
    {
      pos: 3,
      equipo: "LA PANZA",
      pts: 28,
      pj: 11,
      pg: 8,
      pe: 1,
      pp: 2,
      gf: 88,
      gc: 57,
      dif: 31,
      pb: 11,
    },
    {
      pos: 4,
      equipo: "LA CHIRRI FC",
      pts: 25,
      pj: 11,
      pg: 7,
      pe: 0,
      pp: 4,
      gf: 78,
      gc: 67,
      dif: 11,
      pb: 11,
    },
    {
      pos: 5,
      equipo: "33 DE FIESTA",
      pts: 23,
      pj: 11,
      pg: 6,
      pe: 0,
      pp: 5,
      gf: 59,
      gc: 51,
      dif: 8,
      pb: 11,
    },
    {
      pos: 6,
      equipo: "LA GLORIA FC",
      pts: 22,
      pj: 11,
      pg: 5,
      pe: 1,
      pp: 5,
      gf: 73,
      gc: 78,
      dif: -5,
      pb: 11,
    },
    {
      pos: 7,
      equipo: "ZP FÚTBOL",
      pts: 21,
      pj: 11,
      pg: 4,
      pe: 2,
      pp: 5,
      gf: 71,
      gc: 69,
      dif: 2,
      pb: 11,
    },
    {
      pos: 8,
      equipo: "LOS MAGIOS",
      pts: 16,
      pj: 11,
      pg: 3,
      pe: 0,
      pp: 8,
      gf: 41,
      gc: 65,
      dif: -24,
      pb: 10,
    },
    {
      pos: 9,
      equipo: "LOS PIBES DE KOCH",
      pts: 15,
      pj: 11,
      pg: 4,
      pe: 2,
      pp: 5,
      gf: 45,
      gc: 48,
      dif: -3,
      pb: 5,
    },
    {
      pos: 10,
      equipo: "EL REJUNTE FC",
      pts: 13,
      pj: 11,
      pg: 2,
      pe: 1,
      pp: 8,
      gf: 43,
      gc: 68,
      dif: -25,
      pb: 8,
    },
    {
      pos: 11,
      equipo: "QUE RESAKA FC",
      pts: 12,
      pj: 11,
      pg: 3,
      pe: 1,
      pp: 7,
      gf: 36,
      gc: 59,
      dif: -23,
      pb: 5,
    },
    {
      pos: 12,
      equipo: "BUFALO CS",
      pts: 5,
      pj: 11,
      pg: 1,
      pe: 0,
      pp: 10,
      gf: 12,
      gc: 62,
      dif: -50,
      pb: 3,
    },
  ],
  DOMINGO: [],
  SEMANA: [],
};

const tabsScorers = ["SABADO", "DOMINGO", "SEMANA"];

type Scorer = {
  pos: number;
  jugador: string;
  equipo: string;
  goles: number;
};

type Zone = "A" | "B" | "C";

const scorers: Scorer[] = [
  { pos: 1, jugador: "Romero Leandro", equipo: "LA PANZA", goles: 34 },
  { pos: 2, jugador: "Melian Chistian", equipo: "ZP FÚTBOL", goles: 23 },
  { pos: 3, jugador: "Galarza Lucas", equipo: "CONCE F.C.", goles: 20 },
  { pos: 4, jugador: "Galarza Tomas", equipo: "CONCE F.C.", goles: 16 },
  {
    pos: 5,
    jugador: "Uñates Diego Fernando",
    equipo: "LA CHIRRI FC",
    goles: 16,
  },
  { pos: 6, jugador: "Martinez Enzo", equipo: "LA GLORIA FC", goles: 13 },
  { pos: 7, jugador: "Silva Agustin", equipo: "ZP FÚTBOL", goles: 13 },
  { pos: 8, jugador: "Tapia Dylan", equipo: "LA MEZCLA DE BORIS", goles: 13 },
  {
    pos: 9,
    jugador: "Fernandez Zumarraga Tomas",
    equipo: "LA PANZA",
    goles: 12,
  },
  {
    pos: 10,
    jugador: "Gonzalez Tobias Roman",
    equipo: "QUE RESAKA FC",
    goles: 12,
  },
  { pos: 11, jugador: "Salazar Agustin", equipo: "CONCE F.C.", goles: 12 },
  { pos: 12, jugador: "Silva Lautaro", equipo: "ZP FÚTBOL", goles: 12 },
  { pos: 13, jugador: "Gómez Flavio", equipo: "LA GLORIA FC", goles: 11 },
  { pos: 14, jugador: "Burtaccio Javier", equipo: "33 DE FIESTA", goles: 10 },
  {
    pos: 15,
    jugador: "Campanari Camilo",
    equipo: "LOS PIBES DE KOCH",
    goles: 10,
  },
  {
    pos: 16,
    jugador: "Espindola Alexander",
    equipo: "LA MEZCLA DE BORIS",
    goles: 10,
  },
];

type Card = {
  pos: number;
  jugador: string;
  equipo: string;
  rojas?: number;
  amarillas?: number;
  azules?: number;
};

const cardsData: Record<string, Card[]> = {
  SABADO: [
    {
      pos: 1,
      jugador: "Ortigoza Emanuel",
      equipo: "LA GLORIA FC",
      rojas: 1,
      amarillas: 1,
      azules: 1,
    },
    {
      pos: 2,
      jugador: "Gomez Hernan",
      equipo: "LA CHIRRI FC",
      rojas: 1,
      amarillas: 1,
    },
    {
      pos: 3,
      jugador: "Espindola Alexander",
      equipo: "LA MEZCLA DE BORIS",
      rojas: 1,
    },
    { pos: 4, jugador: "Garrobo Matias", equipo: "ZP FÚTBOL", rojas: 1 },
    {
      pos: 5,
      jugador: "Burtaccio Javier",
      equipo: "33 DE FIESTA",
      rojas: 4,
      amarillas: 1,
    },
    { pos: 6, jugador: "Araya Leandro", equipo: "33 DE FIESTA", amarillas: 2 },
    { pos: 7, jugador: "Correa Lucas", equipo: "EL REJUNTE FC", amarillas: 2 },
    { pos: 8, jugador: "Diaz Facundo", equipo: "ZP FÚTBOL", amarillas: 2 },
    { pos: 9, jugador: "Galarza Lucas", equipo: "CONCE F.C.", amarillas: 2 },
  ],
  DOMINGO: [],
  SEMANA: [],
};

const sanctionsData = {
  jugador: "RODRIGUEZ LEONARDO",
  equipo: "LOS PIBES DEL PLAYON",
  fecha: "21/11/2024",
  sancion: `A través del siguiente comunicado se informa al jugador RODRIGUEZ LEONARDO del equipo 
  "LOS PIBES DEL PLAYON", que será sancionado con la suspensión de 2 (DOS) PARTIDOS, 
  tras los hechos ocurridos durante la última jornada correspondiente a la FECHA 11 del 
  TORNEO CLAUSURA 2024 De FÚTBOL 5 jugado en la sede MITRE el pasado MIÉRCOLES 20/11/2024.`,
  detalles: `La medida tomada es válida e inamovible para todos los eventos deportivos organizados 
  por NP TORNEOS.`,
};

export const Tournaments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Zone>("A");

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        F5 MITRE | TORNEO CLAUSURA 2024 | CLUB MITRE
      </h1>
      {/* Tabs para Zonas */}
      <div className="flex justify-center space-x-4 mb-6">
        {["A", "B", "C"].map((zone) => (
          <button
            key={zone}
            onClick={() => setActiveTab(zone as Zone)}
            className={`px-4 py-2 rounded-lg font-semibold ${
              activeTab === zone ? "bg-yellow-600 text-white" : "bg-gray-200"
            }`}
          >
            ZONA {zone}
          </button>
        ))}
      </div>

      <TableMatches matches={matches} itemsPerPage={3} />

      <div className="container mx-auto px-4 py-6">
        {/* Contenedor flex con dos mitades */}
        <div className="flex flex-wrap lg:flex-nowrap space-y-6 lg:space-y-0 lg:space-x-6">
          {/* Tabla de posiciones */}
          <div className="w-full lg:w-1/2  p-4 bg-white shadow-md rounded-lg">
            <h1 className="text-xl font-bold text-center mb-6">Posiciones</h1>
            <TablePosition positions={positions} tabs={tabsPositions} />
          </div>

          {/* Tabla de goleadores */}
          <div className="w-full lg:w-1/2 p-4 bg-white shadow-md rounded-lg">
            <h1 className="text-xl font-bold text-center mb-6">Goleadores</h1>
            <TableScorers scorers={scorers} tabs={tabsScorers} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Contenedor flex para Tarjetas y Sanciones */}
        <div className="flex flex-wrap lg:flex-nowrap space-y-6 lg:space-y-0 lg:space-x-6">
          {/* Tarjetas */}
          <div className="w-full lg:w-1/2 p-4 bg-white shadow-md rounded-lg">
            <h1 className="text-xl font-bold text-center mb-6">Tarjetas</h1>
            <TableCards
              cards={cardsData}
              tabs={["SABADO", "DOMINGO", "SEMANA"]}
            />
          </div>

          {/* Sanciones */}
          <div className="w-full lg:w-1/2  p-4 bg-white shadow-md rounded-lg">
            <h1 className="text-xl font-bold text-center mb-6">Sanciones</h1>
            <Sanctions {...sanctionsData} />
          </div>
        </div>
      </div>

{/*       <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Bracket rounds={rounds} />
      </div>
 */}
      {/* Mapa */}
      <div className="border border-gray-300 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">SEDE: CANCHAS CLUB MITRE</h2>
        <p>GRAL. MANUEL SAVIO 2902, SAN MARTÍN, BUENOS AIRES</p>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3285.088528188185!2d-58.527474123552906!3d-34.57662645606907!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb7099b63dfff%3A0x2597564a9961651f!2sGral.%20N.%20Manuel%20Savio%202902%2C%20B1650%20Villa%20Maip%C3%BA%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses-419!2sar!4v1736918900687!5m2!1ses-419!2sar"
          width="100%"
          height="300"
          className="border rounded-md mt-4"
        ></iframe>
      </div>
    </div>
  );
};

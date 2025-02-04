import React from "react";

interface SanctionProps {
  jugador: string;
  equipo: string;
  fecha: string;
  sancion: string;
  detalles: string;
}

const Sanctions: React.FC<SanctionProps> = ({
  jugador,
  equipo,
  fecha,
  sancion,
  detalles,
}) => {
  return (
    <div className="overflow-x-auto border border-gray-300 p-6 rounded-lg shadow-md mb-8">
      <div className="flex justify-between text-gray-800 mb-4">
        <p>
          <strong>JUGADOR:</strong> {jugador}
        </p>
        <p>
          <strong>EQUIPO:</strong> {equipo}
        </p>
      </div>
      <p className="text-gray-800 mb-4">
        <strong>FECHA:</strong> {fecha}
      </p>
      <p className="text-gray-800 mb-4">
        <strong>SANCIÓN:</strong> {sancion}
      </p>
      <p className="text-gray-700 mb-4">{detalles}</p>
      <p className="text-gray-800 font-semibold mb-4">
        La sanción se determinó por{" "}
        <strong className="text-black">LENGUAJE GROZERO</strong> para con el
        árbitro del encuentro.
      </p>
      <p className="text-gray-700">
        La medida tomada es válida e inamovible para todos los eventos
        deportivos organizados por NP TORNEOS.
      </p>
      <p className="mt-4 text-gray-700">
        Esperamos que sirva de aprendizaje y reflexión para eventuales
        situaciones similares a futuro. El espíritu del torneo es que el FAIR
        PLAY esté por delante de todo y esto lo logramos entre equipos,
        jugadores, capitanes, árbitros y organización.
      </p>
    </div>
  );
};
export default Sanctions;
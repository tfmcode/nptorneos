import React from "react";

interface SanctionProps {
  jugador: string;
  equipo: string;
  fecha: string;
  detalles: string;
}

const Sanctions: React.FC<SanctionProps> = ({
  jugador,
  equipo,
  fecha,
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
        <strong>SANCIÓN</strong> 
      </p>
      <p className="text-gray-700 mb-4">{detalles}</p>
    </div>
  );
};
export default Sanctions;
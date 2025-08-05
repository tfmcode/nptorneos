import React from "react";
import { FichaPartido, JugadorFicha } from "../../../../types";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  ficha: FichaPartido | null;
}

const getResultadoColor = (goles1: number, goles2: number) => {
  if (goles1 > goles2) return ["text-blue-700 font-bold", "text-black"];
  if (goles2 > goles1) return ["text-black", "text-blue-700 font-bold"];
  return ["text-gray-700", "text-gray-700"];
};

const renderTarjetas = (j: JugadorFicha) => (
  <>
    {j.amarillas > 0 && "🟡"}
    {j.azules > 0 && "🔵"}
    {j.rojas > 0 && "🔴"}
  </>
);

const JugadorRow: React.FC<{ jugador: JugadorFicha }> = ({ jugador }) => (
  <div className="flex items-center gap-2 text-sm border-b py-1">
    {jugador.foto && (
      <img
        src={jugador.foto}
        alt={jugador.nombre}
        className="w-8 h-8 rounded-full object-cover"
      />
    )}
    <span className="w-5 text-center font-mono text-gray-600">
    </span>
    <span className="flex-1">{jugador.nombre}</span>
    <span className="text-xs font-bold">
      {jugador.goles > 0 ? `⚽ ${jugador.goles}` : ""}
    </span>
    <span>{renderTarjetas(jugador)}</span>
  </div>
);

const ModalFichaPartido: React.FC<ModalProps> = ({ open, onClose, ficha }) => {
  if (!open || !ficha) return null;

  const [localColor, visitanteColor] = getResultadoColor(
    ficha.equipo1.goles,
    ficha.equipo2.goles
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-2">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg relative">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black"
        >
          <X />
        </button>

        {/* Encabezado */}
        <div className="text-center p-6 border-b border-gray-300">
          <h2 className="text-xl font-bold">
            <span className={localColor}>{ficha.equipo1.nombre}</span>{" "}
            {ficha.equipo1.goles} vs {ficha.equipo2.goles}{" "}
            <span className={visitanteColor}>{ficha.equipo2.nombre}</span>
          </h2>
          <p className="text-sm mt-2 text-gray-600">
            <strong>Fecha:</strong> {ficha.fecha} | <strong>Horario:</strong>{" "}
            {ficha.horario} | <strong>Sede:</strong> {ficha.sede} |{" "}
            <strong>Estado:</strong> {ficha.estado}
          </p>
        </div>

        {/* Cuerpo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 max-h-[500px] overflow-y-auto">
          {/* Local */}
          <div>
            <h3 className={`text-md font-bold uppercase mb-2 ${localColor}`}>
              {ficha.equipo1.nombre} - {ficha.equipo1.goles} Goles
            </h3>
            <div className="space-y-2">
              {ficha.equipo1.jugadores.map((j) => (
                <JugadorRow key={j.idjugador} jugador={j} />
              ))}
            </div>
          </div>

          {/* Visitante */}
          <div>
            <h3
              className={`text-md font-bold uppercase mb-2 ${visitanteColor}`}
            >
              {ficha.equipo2.nombre} - {ficha.equipo2.goles} Goles
            </h3>
            <div className="space-y-2">
              {ficha.equipo2.jugadores.map((j) => (
                <JugadorRow key={j.idjugador} jugador={j} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalFichaPartido;

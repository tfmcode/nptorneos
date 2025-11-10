import React from "react";
import { FichaPartido, JugadorFicha } from "../../../../types";
import { X } from "lucide-react";
import {
  getJugadorFotoUrl,
  getEquipoEscudoUrl,
} from "../../../../utils/imageUtils";

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

const JugadorRow: React.FC<{ jugador: JugadorFicha }> = ({ jugador }) => {
  const fotoUrl = getJugadorFotoUrl(jugador.foto);

  return (
    <div className="flex items-center gap-2 text-sm border-b py-1">
      {fotoUrl ? (
        <img
          src={fotoUrl}
          alt={jugador.nombre}
          className="w-8 h-8 rounded-full object-cover border border-gray-300"
          onError={(e) => {
            // Si la imagen falla al cargar, mostrar un placeholder
            e.currentTarget.src =
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"%3E%3Ccircle cx="12" cy="12" r="10"/%3E%3Cpath d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/%3E%3C/svg%3E';
          }}
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-bold">
          {jugador.nombre.charAt(0)}
        </div>
      )}
      <span className="flex-1">{jugador.nombre}</span>
      <span className="text-xs font-bold">
        {jugador.goles > 0 ? `⚽ ${jugador.goles}` : ""}
      </span>
      <span>{renderTarjetas(jugador)}</span>
    </div>
  );
};

const EquipoHeader: React.FC<{
  nombre: string;
  escudo: string | null | undefined;
  goles: number;
  color: string;
}> = ({ nombre, escudo, goles, color }) => {
  const escudoUrl = getEquipoEscudoUrl(escudo);

  return (
    <div className="flex items-center gap-3 mb-2">
      {escudoUrl ? (
        <img
          src={escudoUrl}
          alt={nombre}
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-300 shadow-sm"
          onError={(e) => {
            // Si el escudo falla al cargar, mostrar placeholder
            e.currentTarget.src =
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"%3E%3Cpath d="M12 2L2 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/%3E%3C/svg%3E';
          }}
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg shadow-sm">
          {nombre.charAt(0)}
        </div>
      )}
      <div>
        <h3 className={`text-md font-bold uppercase ${color}`}>{nombre}</h3>
        <p className="text-sm text-gray-600">{goles} Goles</p>
      </div>
    </div>
  );
};

const ModalFichaPartido: React.FC<ModalProps> = ({ open, onClose, ficha }) => {
  if (!open || !ficha) return null;

  const [localColor, visitanteColor] = getResultadoColor(
    ficha.equipo1.goles,
    ficha.equipo2.goles
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-2">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg relative max-h-[90vh] overflow-hidden">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black z-10"
        >
          <X />
        </button>

        {/* Encabezado */}
        <div className="text-center p-6 border-b border-gray-300 bg-gradient-to-r from-blue-50 to-blue-100">
          <h2 className="text-xl font-bold mb-2">
            <span className={localColor}>{ficha.equipo1.nombre}</span>{" "}
            <span className="text-2xl mx-2">{ficha.equipo1.goles}</span>
            <span className="text-gray-500">vs</span>
            <span className="text-2xl mx-2">{ficha.equipo2.goles}</span>
            <span className={visitanteColor}>{ficha.equipo2.nombre}</span>
          </h2>
          <p className="text-sm mt-2 text-gray-600">
            <strong>Fecha:</strong> {ficha.fecha} | <strong>Horario:</strong>{" "}
            {ficha.horario} | <strong>Sede:</strong> {ficha.sede} |{" "}
            <strong>Estado:</strong> {ficha.estado}
          </p>
        </div>

        {/* Cuerpo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 max-h-[500px] overflow-y-auto">
          {/* Local */}
          <div>
            <EquipoHeader
              nombre={ficha.equipo1.nombre}
              escudo={ficha.equipo1.escudo}
              goles={ficha.equipo1.goles}
              color={localColor}
            />
            <div className="space-y-1 mt-4">
              {ficha.equipo1.jugadores.length > 0 ? (
                ficha.equipo1.jugadores.map((j) => (
                  <JugadorRow key={j.idjugador} jugador={j} />
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Sin jugadores registrados
                </p>
              )}
            </div>
          </div>

          {/* Visitante */}
          <div>
            <EquipoHeader
              nombre={ficha.equipo2.nombre}
              escudo={ficha.equipo2.escudo}
              goles={ficha.equipo2.goles}
              color={visitanteColor}
            />
            <div className="space-y-1 mt-4">
              {ficha.equipo2.jugadores.length > 0 ? (
                ficha.equipo2.jugadores.map((j) => (
                  <JugadorRow key={j.idjugador} jugador={j} />
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Sin jugadores registrados
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalFichaPartido;

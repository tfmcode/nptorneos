import React from "react";
import { FichaPartido } from "../../../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  ficha: FichaPartido | null;
}

const ModalFichaPartido: React.FC<Props> = ({ open, onClose, ficha }) => {
  if (!open || !ficha) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 font-bold"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-center mb-4">
          {ficha.equipo1.nombre} {ficha.equipo1.goles} vs {ficha.equipo2.goles}{" "}
          {ficha.equipo2.nombre}
        </h2>

        <div className="text-sm text-center mb-6">
          <p>
            <strong>Fecha:</strong> {ficha.fecha}
          </p>
          <p>
            <strong>Horario:</strong> {ficha.horario}
          </p>
          <p>
            <strong>Sede:</strong> {ficha.sede}
          </p>
          <p>
            <strong>Estado:</strong> {ficha.estado}
          </p>
        </div>

        <div className="flex justify-between gap-4">
          {[ficha.equipo1, ficha.equipo2].map((equipo, i) => (
            <div key={i} className="flex-1 border p-4 rounded">
              <h3 className="font-semibold text-center mb-2">
                {equipo.nombre}
              </h3>
              <ul className="space-y-1 text-sm">
                {equipo.jugadores.map((j, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center border-b pb-1"
                  >
                    <span>{j.nombre}</span>
                    <span>
                      {j.goles > 0 && (
                        <span className="font-bold mx-1">⚽ {j.goles}</span>
                      )}
                      {j.rojas > 0 && (
                        <span className="text-red-500 mx-1">🔴</span>
                      )}
                      {j.amarillas > 0 && (
                        <span className="text-yellow-500 mx-1">🟡</span>
                      )}
                      {j.azules > 0 && (
                        <span className="text-blue-500 mx-1">🔵</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModalFichaPartido;

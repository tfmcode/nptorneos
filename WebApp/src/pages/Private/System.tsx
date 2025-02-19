import React, { useState } from "react";
import Logo from "../../assets/logonew1.png";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import Users from "./Users";
import Championships from "./Championships";
import Players from "./Players"; // 🔥 Nuevo componente importado

type Section = "users" | "championships" | "players" | null; // 🔥 Agregado "players"

const System: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>(null);

  const renderSection = () => {
    switch (activeSection) {
      case "users":
        return <Users />;
      case "championships":
        return <Championships />;
      case "players": // 🔥 Nueva opción para renderizar Players
        return <Players />;
      default:
        return (
          <div className="text-center p-6">
            <h2 className="text-2xl font-bold text-gray-700">Bienvenido</h2>
            <p className="text-gray-600 mt-4">
              Selecciona una opción en la barra de navegación para empezar.
            </p>
          </div>
        );
    }
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barra de navegación */}
      <nav className="flex justify-between items-center bg-gray-700 text-white px-6 py-3">
        <img alt="LIGA NP" src={Logo} className="h-12 w-auto" />
        <div className="flex gap-4">
          <button
            onClick={() => setActiveSection("users")}
            className={`px-4 py-2 rounded ${
              activeSection === "users" ? "bg-blue-500" : "hover:bg-blue-400"
            }`}
          >
            Usuarios
          </button>
          <button
            onClick={() => setActiveSection("championships")}
            className={`px-4 py-2 rounded ${
              activeSection === "championships"
                ? "bg-blue-500"
                : "hover:bg-blue-400"
            }`}
          >
            Campeonatos
          </button>
          <button
            onClick={() => setActiveSection("players")} // 🔥 Botón para Players
            className={`px-4 py-2 rounded ${
              activeSection === "players" ? "bg-blue-500" : "hover:bg-blue-400"
            }`}
          >
            Jugadores
          </button>
          <button
            onClick={handleLogout}
            className=" px-4 py-2 rounded hover:bg-blue-400"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Contenido dinámico */}
      <div>{renderSection()}</div>
    </div>
  );
};

export default System;

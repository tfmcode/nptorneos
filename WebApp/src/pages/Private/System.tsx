import React, { useState } from "react";
import Users from "./Users";
import Championship from "./Championship";
import Logo from "../../assets/logonew1.png";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

type Section = "users" | "championships" | null;

const System: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>(null);

  const renderSection = () => {
    switch (activeSection) {
      case "users":
        return <Users />;
      case "championships":
        return <Championship />;
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

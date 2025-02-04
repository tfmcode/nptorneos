import React, { useState } from "react";
import Users from "./Users";
import Logo from "../../assets/logonew1.png";

const System: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null); // Cambiamos el tipo del estado

  const handleSectionChange = (section: string | null) => {
    setActiveSection(section); // Ahora acepta null
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barra de navegación */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          backgroundColor: "#5f6b7d",
          color: "white",
          height: "50px",
        }}
      >
        <img alt="LIGA NP" src={Logo} className="h-12 w-auto" />
        <div className="flex gap-4">
          <button
            onClick={() => handleSectionChange("users")}
            className={`${
              activeSection === "users"
                ? "text-white"
                : "text-white"
            } px-4 py-2 rounded hover:bg-blue-400`}
          >
            Usuarios
          </button>
          <button
            onClick={() => handleSectionChange(null)} // Ahora funciona correctamente
            className="text-white px-4 py-2 rounded hover:bg-blue-400"
          >
            Inicio
          </button>
        </div>
      </nav>

      {/* Contenido del sistema */}
      <div>
        {activeSection === "users" ? (
          <Users /> // Renderiza el componente Usuarios
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-gray-700">Bienvenido</h2>
            <p className="text-gray-600 mt-4">
              Selecciona una opción en la barra de navegación para empezar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default System;

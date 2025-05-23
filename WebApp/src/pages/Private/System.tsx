import React, { useState } from "react";
import BackgroundImage from "../../assets/login.jpg";
import Usuarios from "./Usuarios";
import Campeonatos from "./Campeonatos";
import Jugadores from "./Jugadores";
import Sedes from "./Sedes";
import Codificadores from "./Codificadores";
import Equipos from "./Equipos";
import Torneos from "./Torneos";
import { NavbarSystem } from "../../layouts/navbar/NavbarSystem";

const System: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const renderSection = () => {
    switch (activeSection) {
      case "Usuarios":
        return <Usuarios />;
      case "Campeonatos":
        return <Campeonatos />;
      case "Jugadores":
        return <Jugadores />;
      case "Sedes":
        return <Sedes />;
      case "Codificadores":
        return <Codificadores />;
      case "Equipos":
        return <Equipos />;
      case "Torneos":
        return <Torneos />;
      default:
        return (
          <p className="text-center text-xl text-white">
            Bienvenido al sistema
          </p>
      );
  }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      <NavbarSystem setActiveSection={setActiveSection} />
      <div className="p-6">{renderSection()}</div>
    </div>
  );
};

export default System;

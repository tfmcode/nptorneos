import React, { useState } from "react";
import BackgroundImage from "../../assets/login.jpg";
import { NavbarSystem } from "../../layouts/navbar/NavbarSystem";
import Usuarios from "./Usuarios";
import Campeonatos from "./Campeonatos";
import Jugadores from "./Jugadores";
import Sedes from "./Sedes";
import Codificadores from "./Codificadores";
import Equipos from "./Equipos";
import Torneos from "./Torneos";
import ListaNegra from "./ListaNegra";
import Proveedores from "./Proveedores";
import ConsentimientosAdmin from "./ConsentimientosAdmin";
import Sanciones from "./Sanciones";
import MenuTorneos from "./MenuTorneos";
import Facturas from "./Facturas";
import Inscripciones from "./Inscripciones";
import Resultados from "./Resultados";
import CajaMovimientos from './CajaMovimientos';


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
      case "Lista Negra":
        return <ListaNegra />;
      case "Proveedores":
        return <Proveedores />;
      case "Consentimiento":
        return <ConsentimientosAdmin />;
      case "Tribunal de Faltas":
        return <Sanciones />;
      case "Menú Torneos":
        return <MenuTorneos />;
      case "Facturación":
        return <Facturas />;
      case "Inscripciones":
        return <Inscripciones />;
      case "Resultados":
        return <Resultados />;
      case "Pagos":
        return <CajaMovimientos />;
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

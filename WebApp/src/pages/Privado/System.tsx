import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import BackgroundImage from "../../assets/login.jpg";
import { NavbarSystem } from "../../layouts/navbar/NavbarSystem";
import { permissions, canAccessSystem } from "../../utils/permissions";
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
import CajaMovimientos from "./CajaMovimientos";

const System: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);

  // Verificar acceso al cambiar de sección
  useEffect(() => {
    if (activeSection && user?.perfil) {
      if (!permissions.canAccessModule(activeSection, user.perfil)) {
        console.warn(`Acceso denegado a: ${activeSection}`);
        setActiveSection(null);
      }
    }
  }, [activeSection, user?.perfil]);

  // Si el usuario no tiene acceso al sistema
  if (!user?.perfil || !canAccessSystem(user.perfil)) {
    return (
      <div
        className="min-h-screen bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${BackgroundImage})` }}
      >
        <div className="bg-black/70 p-8 rounded-lg text-center text-white max-w-md">
          <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
          <p className="mb-4">
            No tienes permisos para acceder al sistema de administración.
          </p>
          <p className="text-sm text-gray-300">
            Contacta al administrador si necesitas acceso.
          </p>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    // Verificar permisos antes de renderizar
    if (!activeSection) {
      return (
        <div className="text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Bienvenido al Sistema de Administración
            </h1>
            <p className="text-gray-600 mb-6">
              Selecciona una opción del menú para comenzar
            </p>

            {user?.perfil === 2 && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-blue-800 font-medium">
                  🔹 Perfil Staff: Tienes acceso al módulo de Resultados
                </p>
              </div>
            )}

            {user?.perfil === 1 && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-800 font-medium">
                  🔹 Perfil Administrador: Tienes acceso completo al sistema
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (
      !user?.perfil ||
      !permissions.canAccessModule(activeSection, user.perfil)
    ) {
      return (
        <div className="text-center">
          <div className="bg-red-100 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-red-800 font-semibold text-lg mb-2">
              Acceso Denegado
            </h3>
            <p className="text-red-600">
              No tienes permisos para acceder a:{" "}
              <strong>{activeSection}</strong>
            </p>
          </div>
        </div>
      );
    }

    // Renderizar el componente correspondiente
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
          <div className="text-center text-white">
            <p className="text-xl">Módulo no encontrado: {activeSection}</p>
          </div>
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

import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./navbar/Navbar";
import { Footer } from "./footer/Footer";
import { EPublicRoutes } from "../models"; // Asegúrate de que este enum esté correctamente definido

const Layout: React.FC = () => {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <div>
        <Outlet />
      </div>
      {/* Condicional para ocultar el Footer en la ruta específica */}
      {location.pathname !== EPublicRoutes.CONCENTS && <Footer />}
    </>
  );
};

export default Layout;

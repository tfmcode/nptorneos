import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./navbar/Navbar";
import { Footer } from "./footer/Footer";
import { EPublicRoutes } from "../models";
import WhatsAppButton from "../components/common/WhatsAppButton";

const Layout: React.FC = () => {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <div>
        <Outlet />
      </div>
      {location.pathname !== EPublicRoutes.CONCENTS && <Footer />}
      <WhatsAppButton />
    </>
  );
};

export default Layout;

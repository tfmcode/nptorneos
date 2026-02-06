import React, { useState, useRef, useEffect } from "react";
import Logo from "../../assets/logonew1.png";
import { NavLink as RouteLink } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

const reglamentos = [
  { name: "Fútbol 5", file: "/Reglamentos/Reglamento_F5.pdf" },
  { name: "Fútbol 8", file: "/Reglamentos/Reglamento_F8.pdf" },
  { name: "Fútbol 11", file: "/Reglamentos/Reglamento_F11.pdf" },
  { name: "Infantil", file: "/Reglamentos/Reglamento_Infantil.pdf" },
];

const footerNavs = [
  {
    label: "Navegación",
    items: [
      { href: "/", name: "Inicio" },
      { href: "/about", name: "Nosotros" },
      { href: "/contact", name: "Inscribite" },
    ],
  },
  {
    label: "Información",
    items: [
      { href: "/concents", name: "Consentimiento" },
      { name: "Reglamentos", isDropdown: true },
      { href: "/", name: "Novedades" },
    ],
  },
  {
    label: "Enlaces",
    items: [
      { href: "/", name: "Política de Privacidad" },
      { href: "/", name: "Preguntas Frecuentes" },
      { href: "/", name: "Términos y Condiciones" },
    ],
  },
];

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/share/akHf85Y4poyV9jgr/?mibextid=LQQJ4d",
    icon: "bi-facebook",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/liganp_torneos/",
    icon: "bi-instagram",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/channel/UC4pPO56z4pWBDeua-kkEI5A/videos?view=57&view_as=subscriber",
    icon: "bi-youtube",
  },
];

export const Footer: React.FC = () => {
  const [isReglamentosOpen, setIsReglamentosOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsReglamentosOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <footer className="pt-10 bg-gray-800 text-white">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        {/* Navigation Links */}
        <div className="flex flex-wrap justify-between mt-10 space-y-6 sm:flex md:space-y-0">
          {footerNavs.map((nav, idx) => (
            <div key={idx} className="flex flex-col space-y-4 text-gray-300">
              <h4 className="text-gray-200 font-semibold">{nav.label}</h4>
              <ul>
                {nav.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    {item.isDropdown ? (
                      <div className="relative" ref={dropdownRef}>
                        <button
                          onClick={() => setIsReglamentosOpen(!isReglamentosOpen)}
                          className="hover:text-gray-400 duration-150 flex items-center gap-1"
                        >
                          {item.name}
                          <i className={`bi bi-chevron-${isReglamentosOpen ? 'up' : 'down'} text-xs`}></i>
                        </button>
                        {isReglamentosOpen && (
                          <div className="absolute bottom-full left-0 mb-2 bg-gray-700 rounded-md shadow-lg py-2 min-w-[160px] z-50">
                            {reglamentos.map((reg, regIdx) => (
                              <a
                                key={regIdx}
                                href={reg.file}
                                download
                                className="block px-4 py-2 text-sm hover:bg-gray-600 duration-150"
                                onClick={() => setIsReglamentosOpen(false)}
                              >
                                <i className="bi bi-file-pdf text-red-400 mr-2"></i>
                                {reg.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <a
                        href={item.href}
                        className="hover:text-gray-400 duration-150"
                      >
                        {item.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-10">
          {/* Logo */}
          <div className="flex items-center">
          <RouteLink to="/">
            <img src={Logo} alt="LIGA NP" className="w-40" />
            {/* Cambia `w-40` según el tamaño del logo que prefieras */}
          </RouteLink>
          </div>

          {/* Social Links */}
          <div className="flex space-x-6">
            {socialLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-gray-400 transition-colors duration-200"
              >
                <i
                  className={`bi ${link.icon} text-3xl`}
                  aria-label={link.name}
                ></i>
              </a>
            ))}
          </div>
        </div>

        {/* Rights Reserved */}
        <div className="mt-10 py-6 border-t border-gray-700 text-center">
          <p>
            © {new Date().getFullYear()} LIGA NP. Todos los derechos reservados.
          </p>
          <p>
            TFM Code{" "}
            <a href="https://tfmcode.com.ar/" className="hover:underline">
              Soluciones Integrales
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

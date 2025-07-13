import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { NavLink as RouteLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { logout } from "../../store/slices/authSlice";
import Logo from "../../assets/logonew1.png";

interface NavItem {
  name: string;
  submenus?: { title: string }[];
}

const navItems: NavItem[] = [
  {
    name: "Web",
    submenus: [
      { title: "Sedes" },
      { title: "Inscripciones" },
      { title: "Resultados F" },
      { title: "Campeonatos" },
      { title: "Torneos" },
      { title: "Equipos" },
      { title: "Jugadores" },
      { title: "Lista Negra" },
      { title: "Tribunal de Faltas" },
      { title: "Cambios de Equipos" },
      { title: "Menú Torneos" },
    ],
  },
  {
    name: "Admin. Datos",
    submenus: [
      { title: "Codificadores" },
      { title: "Proveedores" },
      { title: "Consentimiento" },
    ],
  },
  {
    name: "Proveedores",
    submenus: [
      { title: "Facturación" },
      { title: "Pagos" },
      { title: "C.Corriente" },
    ],
  },
  {
    name: "Movs. Caja",
    submenus: [
      { title: "Ingresos y Egresos" },
      { title: "Depósito por Equipo" },
    ],
  },
  { name: "Fecha Torneos", submenus: [{ title: "Fecha Torneos" }] },
  { name: "Reportes", submenus: [{ title: "Reportes" }] },
  { name: "Usuarios" },
];

export const NavbarSystem: React.FC<{
  setActiveSection: (section: string | null) => void;
}> = ({ setActiveSection }) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="bg-gray-800 text-white text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <RouteLink to="/">
              <img alt="LIGA NP" src={Logo} className="h-10 w-auto" />
            </RouteLink>
          </div>

          {/* Menús Desktop */}
          <div className="hidden sm:flex space-x-4">
            {navItems.map((item) =>
              item.submenus ? (
                <Menu
                  as="div"
                  className="relative inline-block text-left"
                  key={item.name}
                >
                  <MenuButton className="inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 text-white hover:bg-blue-700">
                    {item.name}
                    <ChevronDownIcon
                      className="-mr-1 h-4 w-4 text-gray-300"
                      aria-hidden="true"
                    />
                  </MenuButton>
                  <MenuItems className="absolute mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-50">
                    {item.submenus.map((submenu) => (
                      <MenuItem key={submenu.title}>
                        {({ active }) => (
                          <button
                            onClick={() => setActiveSection(submenu.title)}
                            className={`block px-4 py-2 text-gray-700 ${
                              active ? "bg-gray-100" : ""
                            } w-full text-left`}
                          >
                            {submenu.title}
                          </button>
                        )}
                      </MenuItem>
                    ))}
                  </MenuItems>
                </Menu>
              ) : (
                <button
                  key={item.name}
                  onClick={() => setActiveSection(item.name)}
                  className="px-4 py-2 rounded-md text-white hover:bg-blue-700"
                >
                  {item.name}
                </button>
              )
            )}
          </div>

          {/* Usuario y Cerrar sesión */}
          <div className="hidden sm:flex items-center space-x-4">
            <span className="text-sm font-bold">
              Bienvenido {user?.nombre?.toUpperCase() || "ADMINISTRADOR"}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm"
            >
              Salir
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <button className="text-white hover:bg-blue-700 p-2 rounded-md">
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Disclosure,
  Transition,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { NavLink as RouteLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { logout } from "../../store/slices/authSlice";
import Logo from "../../assets/logonew1.png";
import { Fragment, useState } from "react";

interface NavItem {
  name: string;
  submenus?: { title: string }[];
}

const navItems: NavItem[] = [
  {
    name: "Web",
    submenus: [
      { title: "Campeonatos" },
      { title: "Equipos" },
      { title: "Inscripciones" },
      { title: "Jugadores" },
      { title: "Lista Negra" },
      { title: "Menú Torneos" },
      { title: "Sedes" },
      { title: "Resultados" },
      { title: "Torneos" },
      { title: "Tribunal de Faltas" },
      { title: "Cambios de Equipos" },
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
  { name: "Fecha Torneos", submenus: [{ title: "Fecha Torneos" }] },
  { name: "Reportes", submenus: [{ title: "Reportes" }] },
  { name: "Usuarios" },
];

export const NavbarSystem: React.FC<{
  setActiveSection: (section: string | null) => void;
}> = ({ setActiveSection }) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => dispatch(logout());

  const onPick = (section: string) => {
    setActiveSection(section);
    setMobileOpen(false);
  };

  return (
    <nav className="bg-gray-800 text-white text-sm sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top row */}
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <RouteLink to="/" className="shrink-0">
            <img alt="LIGA NP" src={Logo} className="h-10 w-auto" />
          </RouteLink>

          {/* Desktop menus */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) =>
              item.submenus ? (
                <Menu as="div" className="relative" key={item.name}>
                  <MenuButton className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 font-semibold text-white hover:bg-blue-700">
                    {item.name}
                    <ChevronDownIcon className="h-4 w-4 text-gray-300" />
                  </MenuButton>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <MenuItems
                      anchor="bottom start"
                      className="absolute mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black/10 focus:outline-none z-[120] p-1"
                    >
                      {item.submenus.map((submenu) => (
                        <MenuItem key={submenu.title}>
                          {({ active }) => (
                            <button
                              onClick={() => onPick(submenu.title)}
                              className={`w-full text-left rounded-md px-3 py-2 text-gray-800 ${
                                active ? "bg-gray-100" : ""
                              }`}
                            >
                              {submenu.title}
                            </button>
                          )}
                        </MenuItem>
                      ))}
                    </MenuItems>
                  </Transition>
                </Menu>
              ) : (
                <button
                  key={item.name}
                  onClick={() => onPick(item.name)}
                  className="rounded-md px-3 py-2 font-semibold text-white hover:bg-blue-700"
                >
                  {item.name}
                </button>
              )
            )}
          </div>

          {/* Desktop user / logout */}
          <div className="hidden lg:flex items-center gap-3">
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

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-md hover:bg-gray-700"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[120]">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          {/* panel */}
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-gray-800 shadow-xl flex flex-col">
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-2">
                <img src={Logo} alt="LIGA NP" className="h-9 w-auto" />
              </div>
              <button
                className="p-2 rounded-md hover:bg-gray-700"
                onClick={() => setMobileOpen(false)}
                aria-label="Cerrar menú"
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>

            <div className="px-4 py-3 overflow-y-auto">
              {/* user */}
              <div className="mb-3 text-gray-200 text-sm">
                <span className="font-semibold">Bienvenido:</span>{" "}
                {user?.nombre?.toUpperCase() || "ADMINISTRADOR"}
              </div>

              {/* items */}
              <div className="space-y-2">
                {navItems.map((item) =>
                  item.submenus ? (
                    <Disclosure
                      key={item.name}
                      as="div"
                      className="rounded-md bg-gray-700/60"
                    >
                      {({ open }) => (
                        <>
                          <Disclosure.Button className="w-full flex items-center justify-between px-3 py-2 text-left font-semibold rounded-md hover:bg-gray-700">
                            <span>{item.name}</span>
                            <ChevronDownIcon
                              className={`h-5 w-5 transition-transform ${
                                open ? "rotate-180" : ""
                              }`}
                            />
                          </Disclosure.Button>
                          <Disclosure.Panel className="pb-2">
                            <div className="mt-1 space-y-1">
                              {item.submenus?.map((submenu) => (
                                <button
                                  key={submenu.title}
                                  onClick={() => onPick(submenu.title)}
                                  className="w-full text-left rounded-md px-3 py-2 text-sm text-gray-200 hover:bg-gray-700"
                                >
                                  {submenu.title}
                                </button>
                              ))}
                            </div>
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                  ) : (
                    <button
                      key={item.name}
                      onClick={() => onPick(item.name)}
                      className="w-full text-left rounded-md px-3 py-2 font-semibold hover:bg-gray-700"
                    >
                      {item.name}
                    </button>
                  )
                )}
              </div>

              {/* logout */}
              <div className="mt-6 border-t border-gray-700 pt-3">
                <button
                  onClick={handleLogout}
                  className="w-full rounded-md bg-red-600 hover:bg-red-700 px-3 py-2 text-white font-semibold"
                >
                  Salir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

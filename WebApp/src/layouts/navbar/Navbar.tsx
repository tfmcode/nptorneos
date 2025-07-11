import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { NavLink as RouteLink } from "react-router-dom";
import { useEffect, useState, Fragment } from "react";
import Logo from "../../assets/logonew1.png";
import { getPublicMenuTorneosByOpcion } from "../../api/menuTorneosPublicService";
import { MenuTorneo } from "../../types/menuTorneos";

interface NavItem {
  name: string;
  link?: string;
  dynamic?: boolean;
  idopciones?: number[];
}

export const Navbar: React.FC = () => {
  const [torneos, setTorneos] = useState<Record<number, MenuTorneo[]>>({});

  const categorias = [
    { idopcion: 5, nombre: "Fútbol 5" },
    { idopcion: 8, nombre: "Fútbol 8" },
    { idopcion: 11, nombre: "Fútbol 11" },
    { idopcion: 2, nombre: "Femenino" },
    { idopcion: 1, nombre: "NP Empresas" },
  ];

  useEffect(() => {
    const fetchAll = async () => {
      const data: Record<number, MenuTorneo[]> = {};
      for (const cat of categorias) {
        try {
          data[cat.idopcion] = await getPublicMenuTorneosByOpcion(cat.idopcion);
        } catch (error) {
          console.error(`Error al cargar torneos ${cat.nombre}:`, error);
          data[cat.idopcion] = [];
        }
      }
      setTorneos(data);
    };
    fetchAll();
  }, []);

  const navItems: NavItem[] = [
    {
      name: "TORNEOS MASCULINOS",
      dynamic: true,
      idopciones: [5, 8, 11],
    },
    {
      name: "TORNEOS FEMENINOS",
      dynamic: true,
      idopciones: [2],
    },
    {
      name: "TORNEOS CORPORATIVOS",
      dynamic: true,
      idopciones: [1],
    },
    { name: "NOSOTROS", link: "/about" },
    { name: "INSCRIBITE", link: "/contact" },
  ];

  return (
    <Disclosure as="nav" className="bg-gray-800 z-50">
      {({ open }) => (
        <>
          {/* TOP BAR */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              <RouteLink to="/">
                <img src={Logo} alt="LIGA NP" className="h-12 w-auto" />
              </RouteLink>

              {/* DESKTOP */}
              <div className="hidden sm:flex space-x-4 items-center">
                {navItems.map((item) =>
                  item.dynamic && item.idopciones ? (
                    <Menu as="div" className="relative" key={item.name}>
                      <Menu.Button className="inline-flex items-center text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-lg font-medium">
                        {item.name}
                        <ChevronDownIcon className="ml-1 h-5 w-5" />
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                          <div className="py-1">
                            {item.idopciones.map((idopcion) => {
                              const cat = categorias.find(
                                (c) => c.idopcion === idopcion
                              );
                              if (!cat) return null;
                              const torneosCat = torneos[idopcion] || [];

                              return (
                                <Menu as="div" className="relative" key={`cat-${idopcion}`}>
                                  <Menu.Button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center">
                                    {cat.nombre}
                                    {torneosCat.length > 0 && (
                                      <ChevronDownIcon className="h-4 w-4 ml-2 text-gray-500" />
                                    )}
                                  </Menu.Button>
                                  {torneosCat.length > 0 && (
                                    <Transition
                                      as={Fragment}
                                      enter="transition ease-out duration-100"
                                      enterFrom="transform opacity-0 scale-95"
                                      enterTo="transform opacity-100 scale-100"
                                      leave="transition ease-in duration-75"
                                      leaveFrom="transform opacity-100 scale-100"
                                      leaveTo="transform opacity-0 scale-95"
                                    >
                                      <Menu.Items className="absolute left-full top-0 ml-1 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                        <div className="py-1">
                                          {torneosCat.map((torneo) => (
                                            <Menu.Item
                                              key={`torneo-${torneo.idopcion}-${torneo.orden}`}
                                            >
                                              {({ active }) => (
                                                <RouteLink
                                                  to={`/torneos/${torneo.idtorneo}`}
                                                  className={`block px-4 py-2 text-sm ${
                                                    active
                                                      ? "bg-gray-100 text-gray-900"
                                                      : "text-gray-700"
                                                  }`}
                                                >
                                                  {torneo.descripcion ?? "Torneo"}
                                                </RouteLink>
                                              )}
                                            </Menu.Item>
                                          ))}
                                        </div>
                                      </Menu.Items>
                                    </Transition>
                                  )}
                                </Menu>
                              );
                            })}
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  ) : (
                    <RouteLink
                      key={item.name}
                      to={item.link || "/"}
                      className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-lg font-medium"
                    >
                      {item.name}
                    </RouteLink>
                  )
                )}
              </div>

              {/* MOBILE TOGGLE */}
              <div className="sm:hidden">
                <Disclosure.Button className="p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white">
                  {open ? (
                    <XMarkIcon className="h-6 w-6" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* MOBILE MENU */}
          <Disclosure.Panel className="sm:hidden bg-gray-800 text-white px-4 pb-4 space-y-2">
            {navItems.map((item) =>
              item.dynamic && item.idopciones ? (
                <div key={item.name}>
                  <div className="font-semibold">{item.name}</div>
                  {item.idopciones.map((idopcion) => {
                    const cat = categorias.find((c) => c.idopcion === idopcion);
                    if (!cat) return null;
                    const torneosCat = torneos[idopcion] || [];
                    return (
                      <div key={`mobile-${idopcion}`} className="ml-4">
                        {cat.nombre}
                        {torneosCat.length > 0 && (
                          <div className="ml-4 space-y-1">
                            {torneosCat.map((torneo) => (
                              <RouteLink
                                key={`mobile-${torneo.idopcion}-${torneo.orden}`}
                                to={`/torneos/${torneo.idtorneo}`}
                                className="block text-sm text-gray-200 hover:underline"
                              >
                                {torneo.descripcion ?? "Torneo"}
                              </RouteLink>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <RouteLink
                  key={item.name}
                  to={item.link || "/"}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  {item.name}
                </RouteLink>
              )
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

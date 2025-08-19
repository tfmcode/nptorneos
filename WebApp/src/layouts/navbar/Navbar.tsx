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
  const [openSub, setOpenSub] = useState<number | null>(null); // submenú abierto (desktop)

  const categorias = [
    { idopcion: 5, nombre: "Fútbol 5" },
    { idopcion: 8, nombre: "Fútbol 8" },
    { idopcion: 11, nombre: "Fútbol 11" },
    { idopcion: 2, nombre: "Femenino" },
    { idopcion: 1, nombre: "NP Empresas" },
    { idopcion: 6, nombre: "Infanto Juvenil" },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navItems: NavItem[] = [
    { name: "CORPORATIVOS", dynamic: true, idopciones: [1] },
    { name: "MASCULINOS", dynamic: true, idopciones: [5, 8, 11] },
    { name: "FEMENINOS", dynamic: true, idopciones: [2] },
    { name: "INFANTO JUVENIL", dynamic: true, idopciones: [6] },
    { name: "NOSOTROS", link: "/about" },
    { name: "INSCRIBITE", link: "/contact" },
  ];

  return (
    <Disclosure as="nav" className="bg-gray-800 relative z-[100]">
      {({ open, close }) => (
        <>
          {/* TOP BAR */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              <RouteLink to="/" className="shrink-0" onClick={() => close()}>
                <img src={Logo} alt="LIGA NP" className="h-12 w-auto" />
              </RouteLink>

              {/* DESKTOP */}
              <div className="hidden lg:flex items-center gap-2">
                {navItems.map((item) =>
                  item.dynamic && item.idopciones ? (
                    <Menu as="div" className="relative" key={item.name}>
                      <Menu.Button className="inline-flex items-center text-gray-200 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-base font-semibold tracking-wide">
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
                        <Menu.Items
                          className="absolute mt-2 min-w-[280px] bg-white rounded-md shadow-lg ring-1 ring-black/10 focus:outline-none z-[120] overflow-visible"
                          static
                          onMouseLeave={() => setOpenSub(null)}
                        >
                          <div className="py-1">
                            {item.idopciones.map((idopcion) => {
                              const cat = categorias.find(
                                (c) => c.idopcion === idopcion
                              );
                              if (!cat) return null;
                              const torneosCat = torneos[idopcion] || [];

                              return (
                                <div
                                  key={`cat-${idopcion}`}
                                  className="relative"
                                  onMouseEnter={() => setOpenSub(idopcion)}
                                >
                                  <button
                                    type="button"
                                    className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 flex justify-between items-center"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (torneosCat.length > 0) {
                                        setOpenSub((prev) =>
                                          prev === idopcion ? null : idopcion
                                        );
                                      }
                                    }}
                                  >
                                    {cat.nombre}
                                    {torneosCat.length > 0 && (
                                      <ChevronDownIcon className="h-4 w-4 ml-2 text-gray-500" />
                                    )}
                                  </button>

                                  {torneosCat.length > 0 &&
                                    openSub === idopcion && (
                                      <div className="absolute left-full top-0 ml-1 w-64 bg-white rounded-md shadow-lg ring-1 ring-black/10 focus:outline-none z-[130]">
                                        <div className="py-1">
                                          {torneosCat.map((torneo) => (
                                            <RouteLink
                                              key={`torneo-${torneo.idopcion}-${torneo.orden}`}
                                              to={`/torneos/${torneo.idtorneo}`}
                                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                              {torneo.descripcion ?? "Torneo"}
                                            </RouteLink>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                </div>
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
                      className="text-gray-200 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-base font-semibold tracking-wide"
                    >
                      {item.name}
                    </RouteLink>
                  )
                )}
              </div>

              {/* MOBILE TOGGLE */}
              <div className="lg:hidden">
                <Disclosure.Button className="p-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white">
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
          <Disclosure.Panel className="lg:hidden bg-gray-800 text-white border-t border-gray-700">
            <div className="px-4 py-4 space-y-3 max-h-[80vh] overflow-y-auto">
              {navItems.map((item) =>
                item.dynamic && item.idopciones ? (
                  <div key={item.name} className="space-y-2">
                    <div className="text-sm uppercase tracking-wider text-gray-300 font-bold">
                      {item.name}
                    </div>

                    {item.idopciones.map((idopcion) => {
                      const cat = categorias.find(
                        (c) => c.idopcion === idopcion
                      );
                      if (!cat) return null;
                      const torneosCat = torneos[idopcion] || [];

                      return (
                        <Disclosure key={`mobile-${idopcion}`}>
                          {({ open: dOpen }) => (
                            <>
                              <Disclosure.Button className="w-full flex items-center justify-between rounded-md bg-gray-700/60 px-3 py-2 text-left text-base font-medium hover:bg-gray-700 focus:outline-none">
                                <span>{cat.nombre}</span>
                                <ChevronDownIcon
                                  className={`h-5 w-5 transition-transform ${
                                    dOpen ? "rotate-180" : ""
                                  }`}
                                />
                              </Disclosure.Button>
                              <Disclosure.Panel className="pl-3">
                                {torneosCat.length > 0 ? (
                                  <div className="mt-1 space-y-1">
                                    {torneosCat.map((torneo) => (
                                      <RouteLink
                                        key={`mobile-${torneo.idopcion}-${torneo.orden}`}
                                        to={`/torneos/${torneo.idtorneo}`}
                                        className="block rounded-md px-3 py-2 text-sm text-gray-200 hover:bg-gray-700/70"
                                        onClick={() => close()} // <-- CIERRA TODO
                                      >
                                        {torneo.descripcion ?? "Torneo"}
                                      </RouteLink>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="px-3 py-2 text-sm text-gray-400">
                                    Próximamente…
                                  </div>
                                )}
                              </Disclosure.Panel>
                            </>
                          )}
                        </Disclosure>
                      );
                    })}
                  </div>
                ) : (
                  <RouteLink
                    key={item.name}
                    to={item.link || "/"}
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-200 hover:bg-gray-700"
                    onClick={() => close()} // <-- CIERRA TODO
                  >
                    {item.name}
                  </RouteLink>
                )
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

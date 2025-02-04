import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { NavLink as RouteLink } from "react-router-dom";
import Logo from "../../assets/logonew1.png";

interface NavItem {
  name: string;
  link?: string;
  submenus?: { title: string }[];
}

const navItems: NavItem[] = [
  {
    name: "TORNEOS MASCULINOS",
    link: "/Tournaments",
    submenus: [{ title: "INFANTO-JUVENIL" }, { title: "CATEGORÍA LIBRE" }],
  },
  {
    name: "TORNEOS FEMENINOS",
    submenus: [{ title: "FÚTBOL 5" }, { title: "FÚTBOL 8" }],
  },
  { name: "TORNEOS CORPORATIVOS", submenus: [{ title: "NP EMPRESAS" }] },
  { name: "NOSOTROS", link: "/about" },
  { name: "INSCRIBITE", link: "/contact" },
];

export const Navbar: React.FC = () => {
  return (
    <Disclosure as="nav" className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none">
              <span className="sr-only">Abrir menu</span>
              <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              <XMarkIcon className="hidden h-6 w-6" aria-hidden="true" />
            </Disclosure.Button>
          </div>

          {/* Logo */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <RouteLink to="/">
                <img alt="LIGA NP" src={Logo} className="h-12 w-auto" />
              </RouteLink>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.link || "#"}
                    className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-lg font-medium"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <Disclosure.Panel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {navItems.map((item) => (
            <Disclosure.Button
              key={item.name}
              as="a"
              href={item.link || "#"}
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              {item.name}
            </Disclosure.Button>
          ))}
        </div>
      </Disclosure.Panel>
    </Disclosure>
  );
};

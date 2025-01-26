import React from "react";
import centroEntrenamientos from "../../../assets/escuela_futbol.jpg";
import escuelaFutbol from "../../../assets/torneo_apertura.jpg";
import infantoJuvenil from "../../../assets/infanto_juvenil.jpeg";
import jugadoresIcon from "../../../assets/jugadores.png";
import sedesIcon from "../../../assets/sedes.png";
import equiposIcon from "../../../assets/equipos.png";

const NewSections: React.FC = () => {
  const news = [
    {
      title: "CENTRO DE ENTRENAMIENTOS",
      image: centroEntrenamientos,
      link: "#centro-entrenamientos",
    },
    {
      title: "ESCUELA DE FÚTBOL",
      image: escuelaFutbol,
      link: "#escuela-futbol",
    },
    {
      title: "LIGA INFANTO JUVENIL",
      image: infantoJuvenil,
      link: "#liga-infanto-juvenil",
    },
  ];

  const stats = [
    { label: "JUGADORES", value: 23968, icon: jugadoresIcon },
    { label: "SEDES", value: 9, icon: sedesIcon },
    { label: "EQUIPOS", value: 1800, icon: equiposIcon },
  ];

  return (
    <div>
      {/* News Section */}
      <div className="py-16 text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-6 relative">
          Novedades
          <span className="block w-16 h-1 bg-yellow-600 mx-auto mt-2"></span>
        </h2>

        <div className="flex flex-wrap justify-between gap-6">
          {news.map((item, index) => (
            <div
              key={index}
              className="relative w-full sm:w-[30%] bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-72 object-cover border-b-4 border-yellow-600"
              />
              <h5 className="text-xl font-bold text-gray-800 mt-4">
                <a
                  href={item.link}
                  className="hover:text-yellow-600 transition-colors"
                >
                  {item.title}
                </a>
              </h5>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div
        className=" text-white py-8 flex flex-wrap justify-around items-center gap-6"
        style={{ backgroundColor: "#d0a15f" }}
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex items-center gap-4 text-lg font-semibold"
          >
            <img
              src={stat.icon}
              alt={stat.label}
              className="w-12 h-12 object-contain"
            />
            <div className="text-left">
              <strong className="block text-2xl">{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default NewSections;

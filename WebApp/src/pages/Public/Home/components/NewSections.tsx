import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

import centroEntrenamientos from "../../../../assets/escuela_futbol.jpg";
import escuelaFutbol from "../../../../assets/torneo_apertura.jpg";
import nuevoParadigma from "../../../../assets/Empresa3.jpg";
import jugadoresIcon from "../../../../assets/jugadores.png";
import sedesIcon from "../../../../assets/sedes.png";
import equiposIcon from "../../../../assets/equipos.png";

const NewSections: React.FC = () => {
  const news = [
    {
      title: "CENTRO DE ENTRENAMIENTOS",
      image: centroEntrenamientos,
      link: "/centro-entrenamientos",
    },
    {
      title: "FUTBOL NP",
      image: escuelaFutbol,
      link: "/futbol-np",
    },
    {
      title: "NUEVO PARADIGMA",
      image: nuevoParadigma,
      link: "/nuevo-paradigma",
    },
  ];

  const stats = [
    { label: "JUGADORES", value: 23968, icon: jugadoresIcon },
    { label: "SEDES", value: 9, icon: sedesIcon },
    { label: "EQUIPOS", value: 1800, icon: equiposIcon },
  ];

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.15,
  });

  return (
    <div ref={ref} className="bg-white w-full">
      {/* News Section */}
      <motion.div
        className="py-16 text-center"
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        <h2 className="text-4xl font-bold text-gray-800 mb-6 relative">
          Novedades
          <span className="block w-16 h-1 bg-yellow-600 mx-auto mt-2"></span>
        </h2>

        <div className="flex justify-evenly flex-wrap gap-6 px-4">
          {news.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 1.2,
                delay: index * 0.3,
                ease: "easeInOut",
              }}
              className="relative w-full sm:w-[45%] md:w-[30%] bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-500"
            >
              <Link to={item.link}>
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-80 sm:h-96 object-cover border-b-4 border-yellow-600 cursor-pointer"
                />
                <h5 className="text-xl font-bold text-gray-800 mt-4 mb-4 hover:text-yellow-600 transition-colors">
                  {item.title}
                </h5>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        className="text-white py-10 flex flex-wrap justify-around items-center gap-8 px-4"
        style={{ backgroundColor: "#d0a15f" }}
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.5, ease: "easeInOut", delay: 0.4 }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 1,
              delay: index * 0.3 + 0.5,
              ease: "easeInOut",
            }}
            className="flex flex-col items-center text-center"
          >
            <img src={stat.icon} alt={stat.label} className="w-16 h-16 mb-2" />
            <strong className="text-3xl font-bold">
              {inView ? (
                <CountUp end={stat.value} duration={4} separator="." />
              ) : (
                "0"
              )}
            </strong>
            <span className="text-lg">{stat.label}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default NewSections;

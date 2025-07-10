import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

import img1 from "../../assets/LigaNp1.jpg";
import img2 from "../../assets/LigaNp2.jpg";
import img3 from "../../assets/LigaNp3.jpg";

const FutbolNP: React.FC = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <div
      ref={ref}
      className="py-16 px-4 max-w-6xl mx-auto flex flex-col gap-16"
    >
      <div className="flex flex-col md:flex-row items-center gap-8">
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1, ease: "anticipate" }}
          className="md:w-1/2"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4 text-center md:text-left">
            Fútbol NP
          </h2>
          <span className="block w-20 h-1 bg-yellow-600 mx-auto md:mx-0 mb-6"></span>
          <p className="text-lg text-gray-700 leading-relaxed text-justify">
            Desde nuestro inicio en 2018, hemos estado comprometidos con la
            formación integral de niños, niñas y adolescentes a través de
            nuestras Escuelas de Fútbol.
            <br />
            <br />
            Con el tiempo, hemos crecido y evolucionado junto a nuestros
            alumnos, enfocándonos en desarrollar no solo sus habilidades
            deportivas, sino también su crecimiento personal y social.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1, ease: "anticipate", delay: 0.2 }}
          className="md:w-1/2 w-full"
        >
          <img
            src={img2}
            alt="Fútbol NP - Formación"
            className="rounded-lg shadow-lg object-cover object-center w-full h-64 sm:h-80 md:h-[28rem]"
          />
        </motion.div>
      </div>

      <div className="flex flex-col md:flex-row-reverse items-center gap-8">
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1, ease: "anticipate" }}
          className="md:w-1/2"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center md:text-left">
            Valores y Crecimiento
          </h2>
          <span className="block w-16 h-1 bg-yellow-600 mx-auto md:mx-0 mb-6"></span>
          <p className="text-lg text-gray-700 leading-relaxed text-justify">
            Nuestro enfoque se basa en valores fundamentales como el respeto, la
            tolerancia y la empatía, creando un entorno seguro y estimulante
            para que nuestros alumnos aprendan y crezcan.
            <br />
            <br />
            Nuestro objetivo es seguir construyendo un espacio innovador y libre
            de negatividades, donde el fútbol sea una herramienta para el
            desarrollo y el crecimiento de nuestros jóvenes talentos.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1, ease: "anticipate", delay: 0.2 }}
          className="md:w-1/2 w-full"
        >
          <img
            src={img1}
            alt="Fútbol NP - Valores"
            className="rounded-lg shadow-lg object-cover object-center w-full h-64 sm:h-80 md:h-[28rem]"
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1, ease: "anticipate", delay: 0.4 }}
        className="w-full"
      >
        <img
          src={img3}
          alt="Fútbol NP - Crecimiento"
          className="rounded-lg shadow-lg object-cover object-center w-full h-64 sm:h-80 md:h-[32rem]"
        />
      </motion.div>
    </div>
  );
};

export default FutbolNP;

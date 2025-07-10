import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import nosotrosImg from "../../../assets/torneo_apertura.jpg";

const Nosotros: React.FC = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <div
      ref={ref}
      className="py-16 px-4 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8"
    >
      <motion.div
        initial={{ opacity: 0, x: -80 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 1, ease: "anticipate" }}
        className="md:w-1/2"
      >
        <h2 className="text-4xl font-bold text-gray-800 mb-4 text-center md:text-left">
          Nosotros
        </h2>
        <span className="block w-20 h-1 bg-yellow-600 mx-auto md:mx-0 mb-6"></span>

        <p className="text-lg text-gray-700 leading-relaxed text-justify">
          Desde el año 2007 planificamos, organizamos y coordinamos eventos y
          torneos deportivos, con el objetivo de fomentar la práctica del
          deporte dentro de un ambiente controlado con el fin de crear una sana
          competencia.
          <br />
          <br />
          Abocados principalmente al fútbol, trabajamos desde su entrenamiento
          hasta su puesta en práctica tanto para infantiles, juveniles o
          adultos.
          <br />
          <br />
          A lo largo de nuestra vasta trayectoria, hemos organizado competencias
          en todos los formatos (desde Fútbol 5 hasta Fútbol 11 y Fútbol Playa)
          por distintas zonas de CABA, Gran Buenos Aires, La Plata y Partido de
          La Costa.
          <br />
          <br />
          Con el fútbol como herramienta buscamos ser agentes de transformación
          cultural, y poder desechar los malos hábitos que se fueron generando
          en el ambiente a lo largo de la historia. Creemos que el deporte (y el
          fútbol en principal) es vital para el desarrollo y la felicidad de los
          individuos.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 80 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 1, ease: "anticipate", delay: 0.2 }}
        className="md:w-1/2 w-full"
      >
        <img
          src={nosotrosImg}
          alt="Nosotros NP Torneos"
          className="rounded-lg object-left shadow-lg object-cover w-full h-64 sm:h-80 md:h-[28rem]"
        />
      </motion.div>
    </div>
  );
};

export default Nosotros;

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import img1 from "../../assets/Centro1.jpg";
import img2 from "../../assets/Centro2.jpg";
import img3 from "../../assets/Centro3.jpg";

const CentroEntrenamiento: React.FC = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const images = [img1, img2, img3];

  return (
    <div ref={ref} className="py-16 px-4 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: "anticipate" }}
        className="text-center mb-10"
      >
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Centro de Entrenamiento NP
        </h2>
        <span className="block w-20 h-1 bg-yellow-600 mx-auto mb-6"></span>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
          Nuestro espacio para adultos está diseñado para impulsar el
          crecimiento y la excelencia de nuestros jugadores y jugadoras.
          <br />
          <br />
          Ofrecemos una amplia gama de opciones para adaptarnos a los objetivos
          y aspiraciones individuales de cada participante, desde entusiastas
          amateurs hasta futbolistas profesionales en busca de nuevos desafíos.
          <br />
          <br />
          Nuestro equipo de expertos, altamente capacitados, se encarga de guiar
          y acompañar a nuestros jugadores en todas las facetas del fútbol,
          asegurando una formación integral y personalizada.
        </p>
      </motion.div>

      {/* Galería de imágenes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: index * 0.3, ease: "easeOut" }}
            className="overflow-hidden rounded-lg shadow-lg"
          >
            <img
              src={image}
              alt={`Centro de Entrenamiento ${index + 1}`}
              className="
    object-cover 
    object-bottom 
    w-full 
    h-80         
    sm:h-96     
    md:h-[28rem]
    hover:scale-105 
    transition-transform 
    duration-500 
    ease-in-out
  "
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CentroEntrenamiento;

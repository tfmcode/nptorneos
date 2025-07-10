import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

import img1 from "../../assets/Empresa1.jpg";
import img2 from "../../assets/Empresa2.jpg";
import img3 from "../../assets/Empresa3.jpg";

const NuevoParadigma: React.FC = () => {
  const images = [img1, img2, img3];
  const [currentIndex, setCurrentIndex] = useState(0);

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

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
          Nuevo Paradigma
        </h2>
        <span className="block w-20 h-1 bg-yellow-600 mx-auto md:mx-0 mb-6"></span>
        <p className="text-lg text-gray-700 leading-relaxed text-justify">
          Los equipos más exitosos son los que saben trabajar juntos. A través
          del deporte, la creatividad y la diversión, diseñamos experiencias que
          fortalecen la confianza, mejoran la comunicación y potencian el
          rendimiento.
          <br />
          <br />
          Mediante un torneo de fútbol o un evento corporativo tu empresa
          obtendrá diferentes beneficios. Estamos diseñados específicamente para
          mejorar la dinámica y el ambiente laboral.
          <br />
          <br />
          Creemos firmemente que el deporte y las actividades recreativas son
          una herramienta poderosa para fortalecer vínculos, comunicación y
          espíritu de colaboración.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 80 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 1, ease: "anticipate", delay: 0.2 }}
        className="md:w-1/2 w-full flex justify-center"
      >
        <div className="relative w-full max-w-md aspect-[4/3] rounded-lg overflow-hidden shadow-lg">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Nuevo Paradigma ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default NuevoParadigma;

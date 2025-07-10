import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import sponsor1 from "../../../../assets/sponsor1.png";
import sponsor2 from "../../../../assets/sponsor2.jpeg";
import sponsor4 from "../../../../assets/sponsor4.jpg";
import sponsor5 from "../../../../assets/sponsor5.jpeg";
import sponsor6 from "../../../../assets/sponsor6.png";

const LogosCloud: React.FC = () => {
  const sponsors = [
    { name: "Transistor", src: sponsor1 },
    { name: "Reform", src: sponsor2 },
    { name: "SavvyCal", src: sponsor4 },
    { name: "Statamic", src: sponsor5 },
    { name: "Tailwind UI", src: sponsor6 },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sponsors.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isMobile, sponsors.length]);

  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
          Marcas que confían en nosotros
        </h2>
        <span className="block w-16 h-1 bg-yellow-600 mx-auto mb-10"></span>

        {isMobile ? (
          <div className="relative w-full flex items-center justify-center h-32">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                src={sponsors[currentIndex].src}
                alt={sponsors[currentIndex].name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="max-h-20 object-contain"
              />
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 items-center justify-center"
          >
            {sponsors.map((sponsor) => (
              <motion.div
                key={sponsor.name}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={sponsor.src}
                  alt={sponsor.name}
                  className="max-h-20 w-full object-contain"
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default LogosCloud;

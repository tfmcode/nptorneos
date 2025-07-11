import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import img1 from "../../../../assets/1.png";
import img2 from "../../../../assets/2.png";
import img3 from "../../../../assets/3.png";
import img4 from "../../../../assets/4.png";
import img5 from "../../../../assets/5.png";

const HeroCarousel: React.FC = () => {
  const images = [img1, img2, img3, img4, img5];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(interval);
  }, [handleNext]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 1,
    }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (direction: number) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
      scale: 1,
    }),
  };

  return (
    <div id="heroCarousel" className="relative w-full h-screen overflow-hidden">
      <div className="relative w-full h-full">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover"
            alt={`Hero ${currentIndex + 1}`}
          />
        </AnimatePresence>
      </div>

      <button
        onClick={handlePrev}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black focus:outline-none z-10"
      >
        ◀
      </button>

      <button
        onClick={handleNext}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black focus:outline-none z-10"
      >
        ▶
      </button>
    </div>
  );
};

export default HeroCarousel;

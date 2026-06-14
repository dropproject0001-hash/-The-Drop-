import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const banners = [
  "/coverphoto001.png",
  "/coverphoto002.jpg",
  "/coverphoto003.jpg",
  "/coverphoto004.jpg"
];

export const BannerSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, []);

  const slidePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(slideNext, 5000);
    return () => clearInterval(timer);
  }, [slideNext]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="relative w-full h-full group overflow-hidden rounded-lg border-2 border-[#106011]/50 shadow-[0_0_20px_rgba(16,96,17,0.3)] bg-black">
      <AnimatePresence initial={false} custom={direction}>
        <motion.img
          key={currentIndex}
          src={banners[currentIndex]}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 }
          }}
          className="absolute inset-0 w-full h-full object-cover filter brightness-90 contrast-125"
          referrerPolicy="no-referrer"
        />
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute inset-0 z-20 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button 
          onClick={(e) => { e.stopPropagation(); slidePrev(); }}
          className="p-1.5 rounded-full bg-black/60 border border-[#106011]/50 text-[#106011] hover:bg-[#106011] hover:text-white transition-all shadow-[0_0_10px_rgba(16,96,17,0.5)]"
        >
          <ChevronLeft size={16} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); slideNext(); }}
          className="p-1.5 rounded-full bg-black/60 border border-[#106011]/50 text-[#106011] hover:bg-[#106011] hover:text-white transition-all shadow-[0_0_10px_rgba(16,96,17,0.5)]"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Status Overlay */}
      <div className="absolute top-2 left-2 z-20 flex items-center gap-2">
        <div className="px-2 py-0.5 rounded bg-black/80 border border-[#106011]/50 text-[8px] font-mono text-[#106011] tracking-widest uppercase">
          LIVE FEED / CAM_{currentIndex + 1}
        </div>
      </div>

      {/* Progress Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {banners.map((_, idx) => (
          <div 
            key={idx}
            className={`h-1 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-4 bg-[#106011] shadow-[0_0_8px_rgba(16,96,17,0.8)]' : 'w-1 bg-[#106011]/30'
            }`}
          />
        ))}
      </div>

      {/* Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%]"></div>
    </div>
  );
};

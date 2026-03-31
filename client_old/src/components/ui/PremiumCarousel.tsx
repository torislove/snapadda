import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PremiumCarouselProps {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  title?: string;
  subtitle?: string;
  itemsPerView?: number;
}

export const PremiumCarousel: React.FC<PremiumCarouselProps> = ({ 
  items, 
  renderItem, 
  title, 
  subtitle,
  itemsPerView = 3
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const maxIndex = Math.max(0, items.length - itemsPerView);

  const nextSlide = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(maxIndex);
    }
  };

  const [viewCount, setViewCount] = useState(itemsPerView);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setViewCount(1.2);
      else if (window.innerWidth < 1024) setViewCount(2.2);
      else setViewCount(itemsPerView);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [itemsPerView]);

  if (!items || items.length === 0) return null;

  return (
    <div 
      className="premium-carousel-container w-full py-12 relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="container">
        {(title || subtitle) && (
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-[2px] bg-gold" />
                <span className="text-[10px] uppercase font-black tracking-widest text-gold">{subtitle}</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black font-serif text-white tracking-tight leading-tight">{title}</h2>
            </motion.div>

            <div className="flex items-center gap-4">
              <button 
                onClick={prevSlide}
                className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-gold hover:text-midnight hover:border-gold transition-all group active:scale-95"
              >
                <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={nextSlide}
                className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-gold hover:text-midnight hover:border-gold transition-all group active:scale-95"
              >
                <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        <div className="relative overflow-visible">
          <motion.div 
            className="flex gap-6 will-change-transform"
            animate={{ x: `calc(-${currentIndex * (100 / viewCount)}% - ${currentIndex * 24}px)` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {items.map((item, idx) => {
              const isActive = idx >= currentIndex && idx < currentIndex + Math.floor(viewCount);
              return (
                <motion.div 
                  key={idx}
                  className="flex-shrink-0"
                  style={{ width: `calc(${100 / viewCount}% - 24px)` }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                >
                  <div className={`transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-40 grayscale-[0.5]'}`}>
                    {renderItem(item, idx)}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <div className="mt-12 h-[2px] w-full bg-white/5 relative overflow-hidden rounded-full">
           <motion.div 
             className="absolute top-0 left-0 h-full bg-gold shadow-[0_0_10px_rgba(212,175,55,1)]"
             animate={{ width: `${((currentIndex + (Math.floor(viewCount))) / items.length) * 100}%` }}
             transition={{ type: "spring", stiffness: 100, damping: 20 }}
           />
        </div>
      </div>

      {isHovered && (
        <div className="absolute inset-0 z-[-1] pointer-events-none opacity-30 transition-opacity duration-1000">
          <div className="absolute top-[20%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-gold/5 blur-[120px]" />
          <div className="absolute bottom-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-emerald/5 blur-[120px]" />
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Play, Sparkles } from 'lucide-react';
import { BANNER_SLIDES } from '../data/mockData';

interface BannerSliderProps {
  onPromoClick: () => void;
}

export default function BannerSlider({ onPromoClick }: BannerSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide rotation every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % BANNER_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setCurrentSlide(prev => (prev - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length);
  };

  const handleNext = () => {
    setCurrentSlide(prev => (prev + 1) % BANNER_SLIDES.length);
  };

  const slide = BANNER_SLIDES[currentSlide];

  return (
    <div id="banner-slider-container" className="relative w-full h-[180px] sm:h-[260px] md:h-[320px] rounded-2xl overflow-hidden bg-slate-900 shadow-lg group">
      
      {/* Background Banner with gradient overlays */}
      <div className="absolute inset-0 transition-all duration-700 ease-in-out">
        <img 
          src={slide.image} 
          alt={slide.title} 
          className="w-full h-full object-cover object-center opacity-40 blur-[1px] scale-102" 
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} via-transparent to-slate-950/80`}></div>
      </div>

      {/* Content overlays */}
      <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 md:px-16 text-white space-y-3 max-w-xl z-10">
        <div className="inline-flex items-center gap-1.5 bg-rose-500 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full w-fit">
          <Sparkles className="w-3 h-3 text-yellow-300 fill-yellow-300" /> Promoted Premieres
        </div>
        
        <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-none drop-shadow">
          {slide.title}
        </h2>
        
        <p className="text-xs sm:text-sm text-slate-300 max-w-sm font-medium">
          {slide.subtitle}
        </p>

        <button
          onClick={onPromoClick}
          className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold px-5 py-2 sm:py-2.5 rounded-xl shadow-md text-xs w-fit transition-all flex items-center gap-1.5 active:scale-97 cursor-pointer hover:shadow-rose-505/20"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          {slide.buttonText}
        </button>
      </div>

      {/* Slide Navigation controls */}
      <button 
        onClick={handlePrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
        title="Previous slide"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <button 
        onClick={handleNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
        title="Next slide"
      >
        <ArrowRight className="w-5 h-5" />
      </button>

      {/* Bullet Indicators */}
      <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {BANNER_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-2.5 h-1 md:w-5 rounded-full transition-all ${idx === currentSlide ? 'bg-rose-500' : 'bg-white/40'}`}
            title={`Slide ${idx + 1}`}
          ></button>
        ))}
      </div>

    </div>
  );
}

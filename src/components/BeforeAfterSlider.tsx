import React, { useState, useRef, useCallback } from 'react';
import { ArrowLeftRight } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeUrl,
  afterUrl,
  beforeLabel = 'BEFORE REMEDIATION',
  afterLabel = 'AFTER RESOLUTION',
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onMouseMove={handleMouseMove}
      onTouchStart={() => setIsDragging(true)}
      onTouchEnd={() => setIsDragging(false)}
      onTouchMove={handleTouchMove}
      className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden shadow-md border border-[#D5DCE5] select-none cursor-ew-resize group bg-slate-900"
    >
      {/* AFTER IMAGE (Background - Full width) */}
      <img
        src={afterUrl}
        alt={afterLabel}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* BEFORE IMAGE (Clipped on top based on sliderPos) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${sliderPos}%` }}
      >
        <img
          src={beforeUrl}
          alt={beforeLabel}
          className="absolute inset-0 w-full h-full object-cover max-w-none"
          style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%' }}
        />
      </div>

      {/* Badges */}
      <div className="absolute top-4 left-4 z-10">
        <span className="bg-[#D60E00] text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md uppercase tracking-wider backdrop-blur-xs">
          {beforeLabel}
        </span>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <span className="bg-[#166534] text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md uppercase tracking-wider backdrop-blur-xs">
          {afterLabel}
        </span>
      </div>

      {/* Vertical Divider Line */}
      <div
        className="absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ left: `${sliderPos}%` }}
      >
        {/* Circular Handle */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-[#0B1370] shadow-lg flex items-center justify-center border-2 border-[#0018FF] group-hover:scale-110 transition-transform cursor-ew-resize">
          <ArrowLeftRight className="w-4 h-4 text-[#0018FF]" />
        </div>
      </div>

      {/* Subtle Hint on bottom center */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white/90 text-[10px] font-semibold px-3 py-0.5 rounded-full pointer-events-none backdrop-blur-xs">
        Drag slider to compare evidence
      </div>
    </div>
  );
};

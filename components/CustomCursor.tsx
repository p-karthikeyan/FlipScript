'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Feather } from 'lucide-react';

export function CustomCursor() {
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the movement slightly
  const springConfig = { damping: 25, stiffness: 700, mass: 0.1 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Add global class to hide default cursor
    document.body.classList.add('custom-cursor-active');

    let lastSparkleTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const now = Date.now();
      // Throttle sparkle creation a bit
      if (now - lastSparkleTime > 40) {
        if (Math.random() > 0.3) { // 70% chance to spawn sparkle when moving
          setSparkles((prev) => [
            ...prev.slice(-15), // keep last 15 sparkles to avoid memory bloat
            {
              id: now + Math.random(),
              x: e.clientX,
              y: e.clientY,
            },
          ]);
        }
        lastSparkleTime = now;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.classList.remove('custom-cursor-active');
    };
  }, [mouseX, mouseY]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-cursor-active, .custom-cursor-active * {
          cursor: none !important;
        }
      ` }} />
      
      {/* Sparkles / Twinkling Magic Dust */}
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            initial={{ opacity: 1, scale: 0, x: sparkle.x, y: sparkle.y }}
            animate={{ 
              opacity: 0, 
              scale: Math.random() * 1.5 + 0.5, 
              y: sparkle.y + (Math.random() * 40 + 20),
              x: sparkle.x + (Math.random() * 40 - 20)
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed top-0 left-0 pointer-events-none z-[9998] w-1.5 h-1.5 rounded-full bg-amber-200 shadow-[0_0_8px_rgba(251,191,36,1)]"
            style={{ 
              marginLeft: -3, 
              marginTop: -3 
            }}
          />
        ))}
      </AnimatePresence>

      {/* Main Cursor (Feather + Glow) */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center isolate"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-15%", // Adjust so the feather tip is near the actual pointer position
          translateY: "-15%"
        }}
      >
        {/* Glow */}
        <div className="absolute w-20 h-20 bg-amber-500/20 blur-xl rounded-full -z-10" />
        {/* Feather */}
        <Feather className="w-8 h-8 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] -scale-x-100" />
      </motion.div>
    </>
  );
}

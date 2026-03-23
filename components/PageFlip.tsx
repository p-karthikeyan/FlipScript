'use client';

import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { type ReactNode, useEffect, useRef, useState } from 'react';

export type PageFlipDirection = 'next' | 'prev';

const MAX_ROTATE_DEG = 180;
const DURATION_S = 0.55;
const EASING: [number, number, number, number] = [0.645, 0.045, 0.355, 1];

export function PageFlip({
  canPrev,
  canNext,
  front,
  backNext,
  backPrev,
  flipRequest,
  onFlip,
  onBusyChange,
}: {
  canPrev: boolean;
  canNext: boolean;
  front: ReactNode;
  backNext: ReactNode;
  backPrev: ReactNode;
  flipRequest?: { direction: PageFlipDirection; nonce: number } | null;
  onFlip: (direction: PageFlipDirection) => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const rotateY = useMotionValue(0);
  const [isBusy, setIsBusy] = useState(false);
  const [activeDir, setActiveDir] = useState<PageFlipDirection>('next');
  const [frozenBack, setFrozenBack] = useState<ReactNode>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const absProgress = useTransform(rotateY, (v) => Math.min(1, Math.abs(v) / MAX_ROTATE_DEG));
  
  // High-fidelity curly transforms
  const rotateZ = useTransform(absProgress, [0, 0.5, 1], [0, activeDir === 'next' ? -8 : 8, 0]);
  const skewY = useTransform(absProgress, [0, 0.5, 1], [0, activeDir === 'next' ? 4 : -4, 0]);
  const translateZ = useTransform(absProgress, [0, 0.5, 1], [0, 50, 0]);
  const backOpacity = useTransform(absProgress, [0, 1], [1, 0]);

  async function doFlip(dir: PageFlipDirection) {
    if (isBusy) return;
    setIsBusy(true);
    onBusyChange?.(true);
    setActiveDir(dir);
    setFrozenBack(dir === 'next' ? backNext : backPrev);
    setIsAnimating(true);

    const start = 0;
    const end = dir === 'next' ? -MAX_ROTATE_DEG : MAX_ROTATE_DEG;

    rotateY.set(start);
    await (animate as any)(rotateY, end, {
      duration: DURATION_S,
      ease: EASING,
    });

    onFlip(dir);

    // Reset loop
    rotateY.set(0);
    setIsAnimating(false);
    setIsBusy(false);
    onBusyChange?.(false);
  }

  useEffect(() => {
    if (flipRequest && !isBusy) {
      void doFlip(flipRequest.direction);
    }
  }, [flipRequest?.nonce]);

  return (
    <div className="relative w-full h-full pointer-events-none" style={{ perspective: 1500 }}>
       {/* Edge click zones */}
       <div 
         className="absolute top-0 right-0 w-20 h-full cursor-pointer pointer-events-auto z-50 flex items-center justify-end pr-4 opacity-0 hover:opacity-100 transition-opacity"
         onClick={() => canNext && doFlip('next')}
       >
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/40">→</div>
       </div>
       <div 
         className="absolute top-0 left-0 w-20 h-full cursor-pointer pointer-events-auto z-50 flex items-center justify-start pl-4 opacity-0 hover:opacity-100 transition-opacity"
         onClick={() => canPrev && doFlip('prev')}
       >
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/40">←</div>
       </div>

       {/* The animating sheet */}
       {(isAnimating || isBusy) && (
         <motion.div
           className="absolute top-0 w-1/2 h-full z-40"
           style={{
             left: activeDir === 'next' ? '50%' : '0%',
             transformOrigin: activeDir === 'next' ? 'left center' : 'right center',
             rotateY,
             rotateZ,
             skewY,
             z: translateZ,
             transformStyle: 'preserve-3d',
           }}
         >
            {/* Front of the sheet being turned */}
            <div className="absolute inset-0 bg-[#efe3c9] rounded-sm ring-1 ring-black/5" style={{ backfaceVisibility: 'hidden' }}>
               {front}
               <motion.div 
                 className="absolute inset-0 bg-black/10" 
                 style={{ opacity: absProgress }} 
               />
            </div>

            {/* Back of the sheet being turned (revealing next content) */}
            <div 
              className="absolute inset-0 bg-[#efe3c9] rounded-sm ring-1 ring-black/5" 
              style={{ 
                backfaceVisibility: 'hidden', 
                transform: `rotateY(180deg)` 
              }}
            >
               {frozenBack}
               <motion.div 
                 className="absolute inset-0 bg-white/10" 
                 style={{ opacity: backOpacity }} 
               />
            </div>
         </motion.div>
       )}
    </div>
  );
}

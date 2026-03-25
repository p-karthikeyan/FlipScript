'use client';

import { useMemo, useRef, useState } from 'react';
import { Page } from '@/components/Page';
import { PageFlip, type PageFlipDirection } from '@/components/PageFlip';
import { useBookStore } from '@/store/useBookStore';

export function BookViewer() {
  const pages = useBookStore((s) => s.pages);
  const currentPageIndex = useBookStore((s) => s.currentPageIndex);
  const goPrev = useBookStore((s) => s.goPrev);
  const goNext = useBookStore((s) => s.goNext);

  // Normalization: index is always even (left page of spread)
  const spreadIndex = currentPageIndex % 2 === 0 ? currentPageIndex : Math.max(0, currentPageIndex - 1);
  const leftPage = pages[spreadIndex];
  const rightPage = pages[spreadIndex + 1];

  // Navigation Logic
  const canPrev = spreadIndex >= 2;
  const canNext = spreadIndex + 2 < pages.length;

  const [flipBusy, setFlipBusy] = useState(false);
  const [flipRequest, setFlipRequest] = useState<{ direction: PageFlipDirection; nonce: number } | null>(null);
  const flipNonceRef = useRef(0);

  const spreadNumber = Math.floor(spreadIndex / 2) + 1;
  const totalSpreads = Math.ceil(pages.length / 2);

  if (!leftPage) return <div className="p-20 text-white/20 uppercase tracking-widest text-[10px]">Opening the book...</div>;

  function requestFlip(dir: PageFlipDirection) {
    if (flipBusy) return;
    if (dir === 'next' && !canNext) return;
    if (dir === 'prev' && !canPrev) return;
    flipNonceRef.current += 1;
    setFlipRequest({ direction: dir, nonce: flipNonceRef.current });
  }

  return (
    <div className="relative flex w-full flex-col items-center justify-center p-4">
      {/* The Book Container: Adaptive sizing for immersive feel */}
      <div className="relative h-[clamp(550px,80vh,900px)] w-[clamp(360px,95vw,1100px)] flex shadow-[0_50px_100px_-50px_rgba(0,0,0,1)] rounded-sm overflow-visible bg-[#241a0d]">

        {/* Left Side Page */}
        <div className="absolute left-0 top-0 h-full w-1/2 flex items-center justify-center">
          {leftPage && <Page pageId={leftPage.id} side="left" editable={!flipBusy} />}
        </div>

        {/* Right Side Page */}
        <div className="absolute right-0 top-0 h-full w-1/2 flex items-center justify-center">
          {rightPage && <Page pageId={rightPage.id} side="right" editable={!flipBusy} />}
        </div>

        {/* Real-feel Hinge/Spine */}
        <div className="absolute left-1/2 top-0 z-[20] h-full w-[4px] -translate-x-1/2 bg-black/40 blur-[1px] pointer-events-none" />

        {/* Animation Layer */}
        <PageFlip
          canPrev={canPrev}
          canNext={canNext}
          onBusyChange={setFlipBusy}
          onFlip={(dir) => (dir === 'prev' ? goPrev() : goNext())}
          flipRequest={flipRequest}
          front={
            flipRequest?.direction === 'next' ? (
              rightPage && <Page pageId={rightPage.id} side="right" editable={false} />
            ) : (
              leftPage && <Page pageId={leftPage.id} side="left" editable={false} />
            )
          }
          backNext={
            pages[spreadIndex + 2] && <Page pageId={pages[spreadIndex + 2].id} side="left" editable={false} />
          }
          backPrev={
            pages[spreadIndex - 1] && <Page pageId={pages[spreadIndex - 1].id} side="right" editable={false} />
          }
        />
      </div>

      {/* Subtle Floating Navigation */}
      <div className="mt-8 flex items-center gap-8 bg-black/20 backdrop-blur-sm px-6 py-2 rounded-full border border-white/5 transition-opacity duration-300 hover:bg-black/40">
        <button
          onClick={() => requestFlip('prev')}
          disabled={!canPrev || flipBusy}
          className="text-white/20 hover:text-white/70 transition-colors disabled:opacity-0"
        >
          PREV
        </button>

        <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/40 font-bold">
          {spreadNumber} / {totalSpreads}
        </div>

        <button
          onClick={() => requestFlip('next')}
          disabled={!canNext || flipBusy}
          className="text-white/20 hover:text-white/70 transition-colors disabled:opacity-0"
        >
          NEXT
        </button>
      </div>
    </div>
  );
}

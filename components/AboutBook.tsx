'use client';

import { forwardRef, useRef, useState, useCallback, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ChevronLeft, ChevronRight, Feather } from 'lucide-react';

/* ─── Page wrapper — same pattern as BookViewer ─────────────────────────── */
const FlipPage = forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; 'data-density'?: 'soft' | 'hard' }
>(({ children, 'data-density': density = 'soft' }, ref) => (
  <div ref={ref} className="page" data-density={density} style={{ height: '100%', overflow: 'hidden' }}>
    <div className="page-content h-full w-full">{children}</div>
  </div>
));
FlipPage.displayName = 'FlipPage';

/* ─── Page content ──────────────────────────────────────────────────────── */

function Cover() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 select-none"
      style={{ background: 'linear-gradient(160deg,#2a1505 0%,#0d0700 100%)', zIndex: 1 }}>
      <div className="absolute inset-3 border border-amber-700/20 rounded pointer-events-none" />
      <div className="absolute inset-5 border border-amber-800/10 rounded pointer-events-none" />
      {/* Subtle diagonal pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 14px,rgba(180,120,40,1) 14px,rgba(180,120,40,1) 15px)' }} />
      <Feather className="w-8 h-8 text-amber-700/60" />
      <p className="font-hand text-3xl text-amber-100/80 tracking-tight">FlipScript</p>
      <div className="w-10 h-[1px] bg-amber-700/30" />
      <p className="font-hand text-[12px] text-amber-100/30 tracking-[0.2em] uppercase text-center leading-loose">
        A sanctuary<br />for writers
      </p>
    </div>
  );
}

function DearWriter() {
  return (
    <PageShell side="left" pageNum={1}>
      <p className="font-hand text-base font-bold text-[#3a1f00] mb-4">Dear Writer,</p>
      <p className="font-hand text-sm text-[#5a3a1a] leading-relaxed mb-3">
        You have a story that only you can tell. And somewhere out there,
        a reader is waiting for exactly that story.
      </p>
      <p className="font-hand text-sm text-[#5a3a1a] leading-relaxed mb-3">
        For too long, writing tools online were either too complex, too expensive,
        or simply not built with the love of writing in mind. There was no quiet
        corner of the internet where you could open a book, write, and know it
        would be safely kept.
      </p>
      <p className="font-hand text-sm text-[#5a3a1a] leading-relaxed mb-4">
        FlipScript was made to change that — a place where your words live in
        peace, preserved exactly as you wrote them.
      </p>
      <p className="font-hand text-sm text-[#5a3a1a] leading-relaxed italic">
        Read on, and discover the story behind the platform.
      </p>
      <p className="font-hand text-xs text-[#8a6a3a]/60 text-right mt-5">
        — The FlipScript Team
      </p>
    </PageShell>
  );
}

function OurMotive() {
  return (
    <PageShell side="right" pageNum={2}>
      <Chapter>Our Motive</Chapter>
      <p className="font-hand text-sm text-[#5a3a1a] leading-relaxed mb-3">
        Every writer deserves a peaceful place to create.
      </p>
      <p className="font-hand text-sm text-[#5a3a1a] leading-relaxed mb-3">
        We noticed writers scattered across tools that were too complex, too costly,
        or simply not designed for books — none of them giving the simple joy of
        turning a real page.
      </p>
      <p className="font-hand text-sm text-[#5a3a1a] leading-relaxed mb-3">
        FlipScript was born from one belief:{' '}
        <em>writing should be effortless, and publishing should cost nothing.</em>
      </p>
      <p className="font-hand text-sm text-[#5a3a1a] leading-relaxed">
        Store every book you write, forever, without limits. Publish to readers
        worldwide — no printing budgets, no gatekeepers, no physical costs.
        Your words. Your terms. Your readers.
      </p>
    </PageShell>
  );
}

function ThePlatform() {
  return (
    <PageShell side="left" pageNum={3}>
      <Chapter>The Platform</Chapter>
      <p className="font-hand text-sm text-[#5a3a1a] leading-relaxed mb-3">
        FlipScript is more than an editor — it is a home for books.
      </p>
      <p className="font-hand text-sm text-[#5a3a1a] leading-relaxed mb-3">
        Write in a distraction-free canvas that feels like real paper. Read your
        manuscript as a beautifully flipping book. Share a private link with
        trusted readers, or open your work to the world on the Public Rack with
        a single toggle.
      </p>
      <p className="font-hand text-sm text-[#5a3a1a] leading-relaxed mb-3">
        Unlimited books. Custom covers. A library that grows as fast as your
        imagination — completely free, with no hidden limits.
      </p>
      <p className="font-hand text-sm text-[#5a3a1a] leading-relaxed italic">
        Every feature was designed around one person: the writer.
      </p>
    </PageShell>
  );
}

function OurPromise() {
  return (
    <PageShell side="right" pageNum={4}>
      <Chapter>Our Promise</Chapter>
      <p className="font-hand text-sm text-[#5a3a1a] leading-relaxed mb-3">
        We will never stand between you and your writing.
      </p>
      <p className="font-hand text-sm text-[#5a3a1a] leading-relaxed mb-3">
        No caps on books. No limits on pages. No paywalls on features that matter.
        Your library is yours — always accessible, always private until you choose
        to share it with the world.
      </p>
      <p className="font-hand text-sm text-[#5a3a1a] leading-relaxed mb-3">
        Your stories are preserved the moment you write them, safely stored and
        ready whenever you return.
      </p>
      <p className="font-hand text-sm text-[#5a3a1a] leading-relaxed">
        FlipScript is free because the craft of writing has no price. We believe
        in the people who sit down each day and make something from nothing.
      </p>
    </PageShell>
  );
}

function TheRoadAhead() {
  return (
    <PageShell side="left" pageNum={5}>
      <Chapter>The Road Ahead</Chapter>
      <p className="font-hand text-sm text-[#5a3a1a] leading-relaxed mb-3">
        FlipScript is just beginning.
      </p>
      <p className="font-hand text-sm text-[#5a3a1a] leading-relaxed mb-3">
        Our roadmap is not written by investors — it is written by writers.
        Every feature that comes next will be shaped by the people who use this
        platform to tell real stories.
      </p>
      <p className="font-hand text-sm text-[#5a3a1a] leading-relaxed mb-3">
        We are building toward richer collaboration, reader engagement, and a
        writing experience that keeps improving with every chapter of feedback
        we receive.
      </p>
      <p className="font-hand text-sm text-[#5a3a1a] leading-relaxed">
        The writers who join today are not just users — they are co-authors of
        what FlipScript becomes. Thank you for being here at the beginning.
      </p>
    </PageShell>
  );
}

function Closing() {
  return (
    <PageShell side="right" pageNum={6}>
      <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
        <div className="w-8 h-[1px] bg-amber-800/30" />
        <p className="font-hand text-lg text-[#3a1f00] italic leading-snug">
          "Write the story<br />only you can tell."
        </p>
        <div className="w-8 h-[1px] bg-amber-800/30" />
        <p className="font-hand text-sm text-[#8a6a3a]/60 leading-relaxed">
          The page is open.<br />The ink is yours.<br /><br />Begin.
        </p>
        <p className="font-hand text-xs text-[#8a6a3a]/40 tracking-widest uppercase mt-2">
          — FlipScript
        </p>
      </div>
    </PageShell>
  );
}

function BackCover() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 select-none"
      style={{ background: 'linear-gradient(200deg,#1a0800 0%,#0d0500 100%)', zIndex: 1 }}>
      <div className="absolute inset-3 border border-amber-800/15 rounded pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 14px,rgba(180,120,40,1) 14px,rgba(180,120,40,1) 15px)' }} />
      <Feather className="w-6 h-6 text-amber-800/40" />
      <p className="font-hand text-sm text-amber-100/20 tracking-[0.3em] uppercase">flipscript.app</p>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */
function Chapter({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="font-hand text-base font-bold text-[#3a1f00]">{children}</p>
      <div className="w-8 h-[1px] bg-amber-800/30 mt-1.5" />
    </div>
  );
}

function PageShell({ children, side, pageNum }: {
  children: React.ReactNode;
  side: 'left' | 'right';
  pageNum: number;
}) {
  return (
    <div className="absolute inset-0 flex flex-col justify-start p-9 overflow-hidden">
      {/* Binding shadow */}
      {side === 'left' && (
        <div className="absolute right-0 top-0 w-8 h-full bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />
      )}
      {side === 'right' && (
        <div className="absolute left-0 top-0 w-8 h-full bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
      )}
      {children}
      <p className="absolute bottom-4 left-0 right-0 text-center font-hand text-[10px] text-[#8a6a3a]/30">
        {pageNum}
      </p>
    </div>
  );
}

/* ─── removeChild patch (same as BookViewer) ─────────────────────────────── */
function patchNode(node: HTMLElement) {
  if ((node as any).__rcPatched) return;
  (node as any).__rcPatched = true;
  const orig = node.removeChild.bind(node);
  node.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== node) return child;
    return orig(child);
  };
}

function applyPatch(node: HTMLElement | null) {
  if (!node) return;
  patchNode(node);
  const observer = new MutationObserver(() => {
    node.querySelectorAll('div').forEach(patchNode);
  });
  observer.observe(node, { childList: true, subtree: true });
  node.querySelectorAll('div').forEach(patchNode);
}

/* ─── Main export ────────────────────────────────────────────────────────── */
export function AboutBook() {
  const bookRef = useRef<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // 8 pages: 0=cover, 1-6=content, 7=back cover
  const TOTAL_PAGES = 8;
  // Spreads inside (pairs): 3 spreads → pages 1-2, 3-4, 5-6
  const TOTAL_SPREADS = 3;

  useEffect(() => { setIsMounted(true); }, []);

  const onFlip = useCallback((e: any) => {
    setCurrentPage(e.data);
  }, []);

  const spreadNum = currentPage <= 0 ? 0
    : currentPage >= TOTAL_PAGES - 1 ? TOTAL_SPREADS + 1
    : Math.ceil(currentPage / 2);

  const pageLabel = currentPage === 0 ? 'Cover'
    : currentPage >= TOTAL_PAGES - 1 ? 'Back Cover'
    : `${spreadNum} / ${TOTAL_SPREADS}`;

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="font-hand text-amber-100/20 text-sm tracking-widest uppercase">
          Opening the book…
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Page styles — must be here because BookViewer's global CSS isn't loaded on this route */}
      <style jsx global>{`
        .about-book-wrap .page {
          background-color: #efe3c9 !important;
          height: 100%;
          overflow: hidden;
          isolation: isolate;
        }
        .about-book-wrap .page-content {
          height: 100%;
          background-color: #efe3c9 !important;
          box-shadow: inset 0 0 40px rgba(0,0,0,0.02);
        }
        .about-book-wrap .stf__block {
          background-color: transparent !important;
        }
        .about-book-wrap .stPageFlip {
          overflow: visible !important;
        }
        .about-book-wrap .--shadow {
          background: rgba(0,0,0,0.55) !important;
        }
      `}</style>

      {/* Book wrapper with removeChild patch */}
      <div
        className="about-book-wrap relative shadow-[0_50px_100px_-50px_rgba(0,0,0,0.9)] rounded-sm"
        ref={applyPatch}
      >
        {/* @ts-ignore */}
        <HTMLFlipBook
          ref={bookRef}
          width={350}
          height={460}
          size="fixed"
          minWidth={200}
          maxWidth={700}
          minHeight={280}
          maxHeight={920}
          showCover={true}
          usePortrait={false}
          drawShadow={true}
          maxShadowOpacity={0.8}
          flippingTime={650}
          mobileScrollSupport={true}
          useMouseEvents={true}
          swipeDistance={30}
          showPageCorners={true}
          disableFlipByClick={false}
          clickEventForward={true}
          startZIndex={0}
          autoSize={true}
          onFlip={onFlip}
          className="flip-book-canvas"
        >
          {/* 0 — Front cover */}
          <FlipPage data-density="hard">
            <Cover />
          </FlipPage>

          {/* 1 — Dear Writer (left of spread 1) */}
          <FlipPage>
            <DearWriter />
          </FlipPage>

          {/* 2 — Our Motive (right of spread 1) */}
          <FlipPage>
            <OurMotive />
          </FlipPage>

          {/* 3 — The Platform (left of spread 2) */}
          <FlipPage>
            <ThePlatform />
          </FlipPage>

          {/* 4 — Our Promise (right of spread 2) */}
          <FlipPage>
            <OurPromise />
          </FlipPage>

          {/* 5 — The Road Ahead (left of spread 3) */}
          <FlipPage>
            <TheRoadAhead />
          </FlipPage>

          {/* 6 — Closing (right of spread 3) */}
          <FlipPage>
            <Closing />
          </FlipPage>

          {/* 7 — Back cover */}
          <FlipPage data-density="hard">
            <BackCover />
          </FlipPage>
        </HTMLFlipBook>
      </div>

      {/* Navigation bar — same style as BookViewer */}
      <div className="flex items-center gap-8 bg-black/20 backdrop-blur-sm px-8 py-3 rounded-full border border-white/5 hover:bg-black/30 transition-all">
        <button
          onClick={() => bookRef.current?.pageFlip().flipPrev()}
          className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.2em] text-white/20 hover:text-amber-500/80 transition-colors uppercase"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Previous
        </button>

        <div className="text-[10px] font-hand tracking-[0.3em] uppercase text-white/40 font-bold border-x border-white/5 px-6">
          {pageLabel}
        </div>

        <button
          onClick={() => bookRef.current?.pageFlip().flipNext()}
          className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.2em] text-white/20 hover:text-amber-500/80 transition-colors uppercase"
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

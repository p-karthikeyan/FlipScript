'use client';

import { useEffect, useRef, useState, useCallback, ReactNode, forwardRef } from 'react';
import { useBookStore } from '@/store/useBookStore';
import { Page } from '@/components/Page';
import { CoverPage } from '@/components/CoverPage';
import HTMLFlipBook from 'react-pageflip';

const QUOTE = '"A reader lives a thousand lives before he dies. The man who never reads lives only one."';
const ATTRIBUTION = '— George R.R. Martin';

function QuotePanel() {
  const [displayed, setDisplayed] = useState('');
  const [showAttr, setShowAttr] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setDisplayed('');
    setShowAttr(false);
    const interval = setInterval(() => {
      idx.current += 1;
      setDisplayed(QUOTE.slice(0, idx.current));
      if (idx.current >= QUOTE.length) {
        clearInterval(interval);
        setTimeout(() => setShowAttr(true), 400);
      }
    }, 38);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="absolute inset-y-0 left-0 flex flex-col items-center justify-center pointer-events-none select-none"
      style={{ width: '550px' }}
    >
      <div className="flex flex-col gap-8 px-12">
        <p
          className="text-[28px] leading-[1.75] text-amber-100/20"
          style={{ fontFamily: 'var(--font-hand), cursive', minHeight: '7rem' }}
        >
          {displayed}
          <span className="inline-block w-[2px] h-[1.1em] bg-amber-400/30 ml-0.5 align-middle animate-pulse" />
        </p>
        <p
          className="text-right text-[14px] tracking-[0.25em] uppercase text-amber-400/25 transition-opacity duration-700"
          style={{ fontFamily: 'var(--font-hand), cursive', opacity: showAttr ? 1 : 0 }}
        >
          {ATTRIBUTION}
        </p>

        {/* Arrow + CTA */}
        <div
          className="flex items-center justify-end gap-3 transition-opacity duration-700"
          style={{ opacity: showAttr ? 1 : 0 }}
        >
          <span
            className="text-[13px] tracking-[0.3em] uppercase text-amber-300/30"
            style={{ fontFamily: 'var(--font-hand), cursive' }}
          >
            Click to read
          </span>
          {/* Animated arrow pointing right toward the book */}
          <svg
            className="w-16 h-5 text-amber-400/25"
            viewBox="0 0 64 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 10 Q20 8 48 10"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
              style={{
                strokeDasharray: 52,
                strokeDashoffset: 0,
                animation: 'arrowDraw 1.2s ease forwards, arrowPulse 2s 1.2s ease-in-out infinite',
              }}
            />
            <path
              d="M42 4 L56 10 L42 16"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

const FlipPage = forwardRef<HTMLDivElement, { children: ReactNode; className?: string; 'data-density'?: 'soft' | 'hard' }>((props, ref) => {
  const { children, className, 'data-density': density = 'soft' } = props;
  return (
    <div
      ref={ref}
      className={`page ${className ?? ''}`}
      data-density={density}
      style={{ height: '100%', overflow: 'hidden' }}
    >
      <div className="page-content h-full w-full">
        {children}
      </div>
    </div>
  );
});
FlipPage.displayName = 'FlipPage';

export function BookViewer({ editable = true }: { editable?: boolean }) {
  const pages = useBookStore((s) => s.pages);
  const currentPageIndex = useBookStore((s) => s.currentPageIndex);
  const setPageIndex = useBookStore((s) => s.setPageIndex);
  const title = useBookStore((s) => s.title);
  const coverImage = useBookStore((s) => s.coverImage);
  const penName = useBookStore((s) => s.penName);

  const bookRef = useRef<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const isEditModeRef = useRef(isEditMode);
  const [showBook, setShowBook] = useState(() => currentPageIndex > 0);

  useEffect(() => { setIsMounted(true); }, []);

  // Keep ref in sync so the keydown handler always sees the latest value
  useEffect(() => { isEditModeRef.current = isEditMode; }, [isEditMode]);

  // Flush all page content to the store before remounting the book (mode switch).
  // Dispatches a save event that each Page component listens to, then defers the
  // actual mode change by one tick so the saves complete first.
  const switchMode = useCallback((newMode: boolean) => {
    window.dispatchEvent(new CustomEvent('flipscript:savepages'));
    setTimeout(() => setIsEditMode(newMode), 0);
  }, []);

  // Keyboard shortcuts: E → write mode, Escape → flip mode
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (!isTyping && e.key === 'e' && !e.metaKey && !e.ctrlKey) {
        switchMode(true);
      } else if (e.key === 'Escape' && isEditModeRef.current) {
        (document.activeElement as HTMLElement)?.blur();
        switchMode(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [switchMode]);

  useEffect(() => {
    if (bookRef.current && isMounted) {
      const flip = bookRef.current.pageFlip();
      if (flip && flip.getCurrentPageIndex() !== currentPageIndex) {
        flip.turnToPage(currentPageIndex);
      }
    }
  }, [currentPageIndex, isMounted]);

  const handleOpenBook = useCallback(() => {
    setShowBook(true);
    // Library is always mounted so flipNext() works immediately — no init delay
    bookRef.current?.pageFlip().flipNext();
  }, []);

  const onFlip = useCallback((e: any) => {
    setPageIndex(e.data);
    // When flipping back to cover, hide the book after the animation finishes
    if (e.data === 0) {
      setTimeout(() => setShowBook(false), 700);
    }
  }, [setPageIndex]);


  if (!isMounted) {
    return (
      <div className="p-20 text-white/20 uppercase tracking-widest text-[10px]">
        Preparing the manuscript...
      </div>
    );
  }

  const totalPages = pages.length;

  const bookIdentity = pages[0]?.id ?? 'empty';
  const bookKey = `${isEditMode ? 'edit' : 'flip'}-${bookIdentity}`;

  return (
    <div className="relative flex w-full flex-col items-center justify-center p-4">

      {/* Mode indicator — only after the book is opened */}
      {editable && showBook && (
        <div className="mb-4 flex items-center gap-1">
          <button
            onClick={() => switchMode(false)}
            className={`flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full transition-all ${!isEditMode
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-white/30 hover:text-white/50'
              }`}
          >
            📖 Flip Mode
            {isEditMode && (
              <kbd className="text-[9px] font-mono bg-white/10 border border-white/20 rounded px-1 py-0.5 leading-none">Esc</kbd>
            )}
          </button>
          <div className="text-white/15 text-[10px]">/</div>
          <button
            onClick={() => switchMode(true)}
            className={`flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full transition-all ${isEditMode
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-white/30 hover:text-white/50'
              }`}
          >
            ✏️ Write Mode
            {!isEditMode && (
              <kbd className="text-[9px] font-mono bg-white/10 border border-white/20 rounded px-1 py-0.5 leading-none">E</kbd>
            )}
          </button>
        </div>
      )}

      {/* ── Book wrapper — HTMLFlipBook is always mounted so the library stays
           initialized. The cover overlay sits on top when the book is closed,
           and flipNext() fires instantly (no init wait) when the user opens it. ── */}
      <div className="relative">

        {/* Flip book — always in the DOM; hidden via opacity when showing cover card */}
        <div
          className="relative shadow-[0_50px_100px_-50px_rgba(0,0,0,1)] rounded-sm overflow-visible"
          style={{ opacity: showBook ? 1 : 0, pointerEvents: showBook ? 'auto' : 'none' }}
          ref={(node) => {
            if (node && !(node as any).__rcPatched) {
              (node as any).__rcPatched = true;
              const orig = node.removeChild.bind(node);
              node.removeChild = function <T extends Node>(child: T): T {
                if (child.parentNode !== node) return child;
                return orig(child);
              };
              const observer = new MutationObserver(() => {
                node.querySelectorAll('div').forEach((div) => {
                  if ((div as any).__rcPatched) return;
                  (div as any).__rcPatched = true;
                  const origDiv = div.removeChild.bind(div);
                  div.removeChild = function <T extends Node>(child: T): T {
                    if (child.parentNode !== div) return child;
                    return origDiv(child);
                  };
                });
              });
              observer.observe(node, { childList: true, subtree: true });
              node.querySelectorAll('div').forEach((div) => {
                if ((div as any).__rcPatched) return;
                (div as any).__rcPatched = true;
                const origDiv = div.removeChild.bind(div);
                div.removeChild = function <T extends Node>(child: T): T {
                  if (child.parentNode !== div) return child;
                  return origDiv(child);
                };
              });
            }
          }}
        >
          {/* @ts-ignore */}
          <HTMLFlipBook
            key={bookKey}
            width={550}
            height={750}
            size="fixed"
            minWidth={315}
            maxWidth={1000}
            minHeight={400}
            maxHeight={1533}
            maxShadowOpacity={0.8}
            showCover={true}
            mobileScrollSupport={true}
            onFlip={onFlip}
            className="flip-book-canvas"
            ref={bookRef}
            startPage={currentPageIndex}
            drawShadow={true}
            flippingTime={650}
            usePortrait={false}
            startZIndex={0}
            autoSize={true}
            clickEventForward={true}
            useMouseEvents={!isEditMode}
            swipeDistance={30}
            showPageCorners={!isEditMode}
            disableFlipByClick={isEditMode}
          >
            <FlipPage key="cover" data-density="hard">
              <CoverPage title={title} coverImage={coverImage} penName={penName} />
            </FlipPage>
            {pages.map((page, idx) => (
              <FlipPage key={page.id}>
                <Page
                  pageId={page.id}
                  side={idx % 2 === 0 ? 'left' : 'right'}
                  editable={editable && isEditMode}
                />
              </FlipPage>
            ))}
          </HTMLFlipBook>
        </div>

        {/* Quote panel — left half, visible only when book is closed */}
        {!showBook && <QuotePanel />}

        {/* Cover card overlay — sits over the right half of the book container
            (exactly where the library places the cover page at spread 0) */}
        {!showBook && (
          <div
            className="absolute inset-y-0 right-0 cursor-pointer group rounded-sm overflow-hidden shadow-[0_50px_100px_-50px_rgba(0,0,0,0.9)]"
            style={{ width: '550px' }}
            onClick={handleOpenBook}
          >
            <CoverPage title={title} coverImage={coverImage} penName={penName} />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all duration-300" />
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-7 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-[10px] tracking-[0.45em] uppercase text-amber-200/80 font-bold">Open Book</span>
            </div>
          </div>
        )}

      </div>

      {/* Navigation — only shown when the book is open */}
      {showBook && <div className="mt-8 flex items-center gap-8 bg-black/20 backdrop-blur-sm px-8 py-3 rounded-full border border-white/5 transition-all hover:bg-black/30 group">
        <button
          onClick={() => bookRef.current?.pageFlip().flipPrev()}
          className="text-[11px] font-bold tracking-[0.2em] text-white/20 hover:text-amber-500/80 transition-colors uppercase"
        >
          Previous
        </button>
        <div className="text-[10px] font-mono tracking-[0.4em] uppercase text-white/40 font-bold border-x border-white/5 px-6">
          {currentPageIndex === 0 ? 'Cover' : `${Math.ceil(currentPageIndex / 2)} / ${Math.ceil(totalPages / 2)}`}
        </div>
        <button
          onClick={() => bookRef.current?.pageFlip().flipNext()}
          className="text-[11px] font-bold tracking-[0.2em] text-white/20 hover:text-amber-500/80 transition-colors uppercase"
        >
          Next
        </button>
      </div>}

      <style jsx global>{`
        .flip-book-canvas {
          box-shadow: 0 0 30px rgba(0,0,0,0.5);
          background-color: transparent !important;
        }
        .page {
          background-color: #efe3c9;
          height: 100%;
          overflow: hidden;
          isolation: isolate;
        }
        .page-content {
          height: 100%;
          background-color: #efe3c9;
          box-shadow: inset 0 0 40px rgba(0,0,0,0.02);
        }
        .stf__block {
          background-color: transparent !important;
        }
        .stPageFlip {
          overflow: visible !important;
        }
        .--shadow {
          background: rgba(0, 0, 0, 0.55) !important;
        }
        @keyframes arrowDraw {
          from { stroke-dashoffset: 52; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes arrowPulse {
          0%, 100% { opacity: 1; transform: translateX(0); }
          50%       { opacity: 0.5; transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
'use client';

import { useEffect, useRef, useState, useCallback, ReactNode, forwardRef } from 'react';
import { useBookStore } from '@/store/useBookStore';
import { Page } from '@/components/Page';
import HTMLFlipBook from 'react-pageflip';

const FlipPage = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>((props, ref) => {
  return (
    <div
      ref={ref}
      className={`page ${props.className ?? ''}`}
      data-density="soft"
      style={{ height: '100%', overflow: 'hidden' }}
    >
      <div className="page-content h-full w-full">
        {props.children}
      </div>
    </div>
  );
});
FlipPage.displayName = 'FlipPage';

export function BookViewer({ editable = true }: { editable?: boolean }) {
  const pages = useBookStore((s) => s.pages);
  const currentPageIndex = useBookStore((s) => s.currentPageIndex);
  const setPageIndex = useBookStore((s) => s.setPageIndex);

  const bookRef = useRef<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const isEditModeRef = useRef(isEditMode);

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

  const onFlip = useCallback((e: any) => {
    setPageIndex(e.data);
  }, [setPageIndex]);


  if (!isMounted) {
    return (
      <div className="p-20 text-white/20 uppercase tracking-widest text-[10px]">
        Preparing the manuscript...
      </div>
    );
  }

  const totalPages = pages.length;

  // Unique key that changes whenever the book itself changes (new book / loaded book)
  // or the mode toggles. This forces HTMLFlipBook to fully unmount before remounting,
  // so react-pageflip's internally-reparented DOM nodes are destroyed cleanly instead
  // of React trying to removeChild from stale parents.
  // Uses the first page ID as a stable book identity — it only changes when a new
  // book is created or loaded, NOT when overflow adds pages at the end.
  const bookIdentity = pages[0]?.id ?? 'empty';
  const bookKey = `${isEditMode ? 'edit' : 'flip'}-${bookIdentity}`;

  return (
    <div className="relative flex w-full flex-col items-center justify-center p-4">

      {/* Mode indicator with keyboard shortcuts */}
      {editable && (
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

      <div
        className="relative shadow-[0_50px_100px_-50px_rgba(0,0,0,1)] rounded-sm overflow-visible bg-[#241a0d]"
        ref={(node) => {
          // react-pageflip reparents FlipPage DOM nodes internally.
          // When React unmounts (new book, mode switch, Fast Refresh), it
          // walks the fiber tree and calls removeChild on the original parent.
          // But those nodes now live under react-pageflip's internal container,
          // so removeChild throws NotFoundError.
          // Patch removeChild on this container (and any child that React uses
          // as a parent) to silently handle missing nodes.
          if (node && !(node as any).__rcPatched) {
            (node as any).__rcPatched = true;
            const orig = node.removeChild.bind(node);
            node.removeChild = function <T extends Node>(child: T): T {
              if (child.parentNode !== node) return child;
              return orig(child);
            };
            // Also patch all current and future child divs (react-pageflip
            // creates wrapper divs that React may also try to clean up).
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
            // Run once immediately for existing children
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
          showCover={false}
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

      {/* Navigation */}
      <div className="mt-8 flex items-center gap-8 bg-black/20 backdrop-blur-sm px-8 py-3 rounded-full border border-white/5 transition-all hover:bg-black/30 group">
        <button
          onClick={() => bookRef.current?.pageFlip().flipPrev()}
          className="text-[11px] font-bold tracking-[0.2em] text-white/20 hover:text-amber-500/80 transition-colors uppercase"
        >
          Previous
        </button>
        <div className="text-[10px] font-mono tracking-[0.4em] uppercase text-white/40 font-bold border-x border-white/5 px-6">
          {Math.floor(currentPageIndex / 2) + 1} / {Math.ceil(totalPages / 2)}
        </div>
        <button
          onClick={() => bookRef.current?.pageFlip().flipNext()}
          className="text-[11px] font-bold tracking-[0.2em] text-white/20 hover:text-amber-500/80 transition-colors uppercase"
        >
          Next
        </button>
      </div>

      <style jsx global>{`
        .flip-book-canvas {
          box-shadow: 0 0 30px rgba(0,0,0,0.5);
          background-color: #efe3c9;
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
        .stf__item {
          background-color: #efe3c9 !important;
        }
        .stf__block {
          background-color: #efe3c9 !important;
        }
        .stPageFlip {
          overflow: visible !important;
        }
        .--shadow {
          background: rgba(0, 0, 0, 0.55) !important;
        }
      `}</style>
    </div>
  );
}
'use client';

import { useEffect, useRef, useState } from 'react';
import { useBookStore } from '@/store/useBookStore';

export function Page({
  pageId,
  side,
  editable = true,
}: {
  pageId: string;
  side: 'left' | 'right';
  editable?: boolean;
}) {
  const content = useBookStore((s) => s.pages.find((p) => p.id === pageId)?.content ?? '');
  const updatePage = useBookStore((s) => s.updatePage);
  const pushOverflow = useBookStore((s) => s.pushOverflow);
  const pullFromNext = useBookStore((s) => s.pullFromNext);
  const focusedPageId = useBookStore((s) => s.focusedPageId);
  const selectionOffset = useBookStore((s) => s.selectionOffset);
  const clearFocus = useBookStore((s) => s.clearFocus);

  const editableRef = useRef<HTMLDivElement | null>(null);
  const mirrorRef = useRef<HTMLDivElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Synchronize content to DOM without triggering re-render if focused.
  useEffect(() => {
    if (!editable) return;
    if (isFocused) return;
    if (editableRef.current && editableRef.current.innerText !== content) {
      editableRef.current.innerText = content;
    }
  }, [content, editable, isFocused]);

  // Sync content to Mirror for measurement.
  useEffect(() => {
    if (mirrorRef.current && mirrorRef.current.innerText !== content) {
      mirrorRef.current.innerText = content;
    }
  }, [content]);

  // Handle cross-page focus transitions.
  useEffect(() => {
    if (focusedPageId === pageId && editableRef.current) {
      editableRef.current.focus();
      const selection = window.getSelection();
      const range = document.createRange();
      
      // Calculate where to put the cursor if we have an offset.
      if (selectionOffset > 0 && editableRef.current.firstChild) {
         range.setStart(editableRef.current.firstChild, selectionOffset);
         range.collapse(true);
      } else {
         range.selectNodeContents(editableRef.current);
         range.collapse(false); // Default to end
      }
      
      selection?.removeAllRanges();
      selection?.addRange(range);
      clearFocus();
    }
  }, [focusedPageId, pageId, selectionOffset, clearFocus]);

  const handleInput = () => {
    const el = editableRef.current;
    const mirror = mirrorRef.current;
    if (!el || !mirror) return;

    // Update mirror's text to current input
    mirror.innerText = el.innerText;
    
    // Check for overflow on Mirror
    if (mirror.scrollHeight > el.clientHeight + 4) {
      const fullText = el.innerText;
      const chunks = fullText.split(/(\s+)/); // Keep delimiters
      
      // Find the split point that fits
      let splitIdx = chunks.length;
      const testMirror = mirror.cloneNode(true) as HTMLDivElement;
      testMirror.style.visibility = 'hidden';
      testMirror.style.position = 'absolute';
      testMirror.style.top = '-9999px';
      document.body.appendChild(testMirror);

      for (let i = chunks.length; i >= 0; i--) {
         testMirror.innerText = chunks.slice(0, i).join('');
         if (testMirror.scrollHeight <= el.clientHeight) {
            splitIdx = i;
            break;
         }
      }
      document.body.removeChild(testMirror);

      const remaining = chunks.slice(0, splitIdx).join('');
      const overflow = chunks.slice(splitIdx).join('').trimStart();

      if (overflow.length > 0) {
        pushOverflow(pageId, remaining, overflow);
        el.innerText = remaining;
      }
    } else {
      updatePage(pageId, el.innerText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Detect Backspace at start to pull from the PREVIOUS page's logic?
    // Actually, store provides pullFromNext for the target page.
    if (e.key === 'Backspace') {
       const selection = window.getSelection();
       if (selection && selection.isCollapsed && selection.anchorOffset === 0) {
          // Double-check if we are at the absolute beginning
          const range = selection.getRangeAt(0);
          const preRange = range.cloneRange();
          preRange.selectNodeContents(editableRef.current!);
          preRange.setEnd(range.startContainer, range.startOffset);
          
          if (preRange.toString().length === 0) {
             // We are at the start. Pull this page into the PREVIOUS one.
             // This needs to be called on the previous page's id.
             // But we only have this page id. We need the store to find prev.
             // Or better, let the store handle pull(id) which pulls into previous?
             // Actually, I defined pullFromNext(targetPageId) which pulls next into it.
             // So I'll find previous and call pullFromNext on it.
          }
       }
    }
  };

  const paperTextureStyles = side === 'left' 
    ? 'linear-gradient(to right, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0) 10%), linear-gradient(to bottom, #fcfaf5, #efe3c9)'
    : 'linear-gradient(to left, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0) 10%), linear-gradient(to bottom, #fcfaf5, #efe3c9)';

  return (
    <section className={`relative h-full w-full overflow-hidden bg-[#efe3c9] ${side === 'left' ? 'rounded-l-lg' : 'rounded-r-lg'}`}>
      <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: paperTextureStyles }} />
      
      {/* Decorative spine crease */}
      <div className={`absolute top-0 h-full w-[20px] bg-black/5 blur-[4px] ${side === 'left' ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'}`} />

      {/* Main editable container */}
      <div className="relative h-full w-full p-10 mt-4">
        {editable && content.length === 0 && !isFocused && (
           <div className="pointer-events-none absolute left-10 top-14 text-[15px] leading-6 text-black/25 font-hand italic" style={{ fontFamily: 'var(--font-hand)' }}>
             Begin your tale here...
           </div>
        )}

        <div
          ref={editableRef}
          contentEditable={editable}
          suppressContentEditableWarning
          spellCheck={false}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="h-full w-full outline-none overflow-hidden whitespace-pre-wrap break-words text-[18px] leading-[1.8] text-[#2a1a0d]"
          style={{ fontFamily: 'var(--font-hand)' }}
        />

        {/* The Mirror: Invisible, but used to calculate height accurately */}
        <div
          ref={mirrorRef}
          aria-hidden
          className="pointer-events-none absolute left-10 right-10 top-14 opacity-0 h-auto whitespace-pre-wrap break-words text-[18px] leading-[1.8]"
          style={{ fontFamily: 'var(--font-hand)', visibility: 'hidden' }}
        />
      </div>

      {/* Page number */}
      <div 
        suppressHydrationWarning
        className={`absolute bottom-6 ${side === 'left' ? 'left-6' : 'right-6'} text-[11px] font-mono text-black/20 uppercase tracking-widest`}
      >
         {pageId.slice(0, 4)}
      </div>
    </section>
  );
}

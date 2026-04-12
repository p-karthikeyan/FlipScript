'use client';

import { useEffect, useRef } from 'react';
import { useBookStore } from '@/store/useBookStore';

// ── Cached page metrics ────────────────────────────────────────────────────────
const metrics = {
  width: 470,
  height: 654,
  fontSize: '18px',
  lineHeight: '32.4px',
  fontFamily: 'inherit',
  fontWeight: 'normal',
};

function captureMetrics(el: HTMLDivElement) {
  if (el.clientWidth > 0 && el.clientHeight > 0) {
    metrics.width = el.clientWidth;
    metrics.height = el.clientHeight;
    const cs = window.getComputedStyle(el);
    metrics.fontSize = cs.fontSize;
    metrics.lineHeight = cs.lineHeight;
    metrics.fontFamily = cs.fontFamily;
    metrics.fontWeight = cs.fontWeight;
  }
}

// ── Overflow measurement ───────────────────────────────────────────────────────
function splitContent(
  html: string,
  width: number,
  height: number,
): { remaining: string; overflow: string } | null {
  const baseStyle: Partial<CSSStyleDeclaration> = {
    position: 'fixed',
    visibility: 'hidden',
    pointerEvents: 'none',
    top: '-9999px',
    left: '-9999px',
    width: width + 'px',
    height: 'auto',
    overflow: 'visible',
    fontSize: metrics.fontSize,
    lineHeight: metrics.lineHeight,
    fontFamily: metrics.fontFamily,
    fontWeight: metrics.fontWeight,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  };

  const outer = document.createElement('div');
  const helper = document.createElement('div');
  Object.assign(outer.style, baseStyle);
  Object.assign(helper.style, baseStyle);
  document.body.appendChild(outer);
  document.body.appendChild(helper);

  try {
    outer.innerHTML = html;
    if (outer.scrollHeight <= height + 4) return null;

    const nodes = Array.from(outer.childNodes);

    let splitIdx = nodes.length;
    for (let i = 1; i <= nodes.length; i++) {
      helper.innerHTML = '';
      for (let j = 0; j < i; j++) helper.appendChild(nodes[j].cloneNode(true));
      if (helper.scrollHeight > height) {
        splitIdx = i - 1;
        break;
      }
    }

    const boundaryNode = nodes[splitIdx];
    if (boundaryNode) {
      const boundaryText = boundaryNode.textContent ?? '';
      if (boundaryText.length > 0) {
        let lo = 0, hi = boundaryText.length, fitLen = 0;
        while (lo <= hi) {
          const mid = Math.floor((lo + hi) / 2);
          helper.innerHTML = '';
          for (let j = 0; j < splitIdx; j++) helper.appendChild(nodes[j].cloneNode(true));
          if (boundaryNode.nodeType === Node.TEXT_NODE) {
            helper.appendChild(document.createTextNode(boundaryText.slice(0, mid)));
          } else {
            const partial = boundaryNode.cloneNode(false) as HTMLElement;
            partial.textContent = boundaryText.slice(0, mid);
            helper.appendChild(partial);
          }
          if (helper.scrollHeight <= height) { fitLen = mid; lo = mid + 1; }
          else hi = mid - 1;
        }

        if (fitLen > 0) {
          const fitText = boundaryText.slice(0, fitLen);
          const lastSpace = fitText.lastIndexOf(' ');
          const snap = lastSpace > 0 ? lastSpace : fitLen;

          const rDiv = document.createElement('div');
          for (let i = 0; i < splitIdx; i++) rDiv.appendChild(nodes[i].cloneNode(true));
          if (snap > 0) {
            if (boundaryNode.nodeType === Node.TEXT_NODE) {
              rDiv.appendChild(document.createTextNode(boundaryText.slice(0, snap)));
            } else {
              const partial = boundaryNode.cloneNode(false) as HTMLElement;
              partial.textContent = boundaryText.slice(0, snap);
              rDiv.appendChild(partial);
            }
          }

          const oDiv = document.createElement('div');
          const restText = boundaryText.slice(snap).trimStart();
          if (restText) {
            if (boundaryNode.nodeType === Node.TEXT_NODE) {
              oDiv.appendChild(document.createTextNode(restText));
            } else {
              const partial = boundaryNode.cloneNode(false) as HTMLElement;
              partial.textContent = restText;
              oDiv.appendChild(partial);
            }
          }
          for (let i = splitIdx + 1; i < nodes.length; i++) oDiv.appendChild(nodes[i].cloneNode(true));

          const overflow = oDiv.innerHTML;
          if (overflow) return { remaining: rDiv.innerHTML, overflow };
        }
      }
    }

    if (splitIdx > 0) {
      const rDiv = document.createElement('div');
      const oDiv = document.createElement('div');
      for (let i = 0; i < splitIdx; i++) rDiv.appendChild(nodes[i].cloneNode(true));
      for (let i = splitIdx; i < nodes.length; i++) oDiv.appendChild(nodes[i].cloneNode(true));
      const overflow = oDiv.innerHTML;
      if (!overflow) return null;
      return { remaining: rDiv.innerHTML, overflow };
    }

    const fullText = outer.innerText ?? outer.textContent ?? '';
    let lo = 0, hi = fullText.length, fitLen = 0;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      helper.textContent = fullText.slice(0, mid);
      if (helper.scrollHeight <= height) { fitLen = mid; lo = mid + 1; }
      else hi = mid - 1;
    }
    if (fitLen === 0) return null;

    const fitText = fullText.slice(0, fitLen);
    const lastSpace = fitText.lastIndexOf(' ');
    const snap = lastSpace > 0 ? lastSpace : fitLen;
    return {
      remaining: fullText.slice(0, snap),
      overflow: fullText.slice(snap).trimStart(),
    };
  } finally {
    if (outer.parentNode) outer.parentNode.removeChild(outer);
    if (helper.parentNode) helper.parentNode.removeChild(helper);
  }
}

let isCascading = false;
let isOverflowing = false;

// ── Component ──────────────────────────────────────────────────────────────────
export function Page({
  pageId,
  side,
  editable = true,
}: {
  pageId: string;
  side: 'left' | 'right';
  editable?: boolean;
}) {
  // Container is the only React-managed DOM node.
  // The editable div is created imperatively and appended to the container,
  // so React never tracks its children and won't crash on unmount.
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editableRef = useRef<HTMLDivElement | null>(null);
  const placeholderRef = useRef<HTMLDivElement | null>(null);
  const lastSentContent = useRef('');
  const focusHandledRef = useRef(false);
  const unmountedRef = useRef(false);

  const showPlaceholder = (show: boolean) => {
    if (placeholderRef.current)
      placeholderRef.current.style.display = show ? 'block' : 'none';
  };

  // ── Create the editable div imperatively ──────────────────────────────────
  useEffect(() => {
    unmountedRef.current = false;
    const container = containerRef.current;
    if (!container) return;

    const el = document.createElement('div');
    el.contentEditable = editable ? 'true' : 'false';
    el.spellcheck = false;
    el.className = 'h-full w-full outline-none overflow-hidden whitespace-pre-wrap break-words text-[18px] leading-[1.8] text-[#2a1a0d]';
    el.style.pointerEvents = editable ? 'auto' : 'none';
    el.style.fontFamily = 'var(--font-hand), cursive';
    container.appendChild(el);
    editableRef.current = el;

    // Stamp initial content
    const initial = useBookStore.getState().pages.find((p) => p.id === pageId)?.content ?? '';
    lastSentContent.current = initial;
    el.innerHTML = initial;
    showPlaceholder(editable && initial.length === 0);

    // ── Event handlers (attached imperatively) ───────────────────────────────
    const onInput = () => {
      if (unmountedRef.current) return;
      captureMetrics(el);
      if (el.scrollHeight <= el.clientHeight + 4) return;

      const split = splitContent(el.innerHTML, el.clientWidth, el.clientHeight);
      if (!split) return;

      isOverflowing = true;
      lastSentContent.current = split.remaining;
      el.innerHTML = split.remaining;
      isOverflowing = false;

      useBookStore.getState().pushOverflow(pageId, split.remaining, split.overflow, true);
    };

    const onBlur = () => {
      if (isOverflowing || unmountedRef.current) return;
      showPlaceholder(editable && el.innerHTML.length === 0);
      const html = el.innerHTML;
      if (html === lastSentContent.current) return;
      lastSentContent.current = html;
      useBookStore.getState().updatePage(pageId, html);
    };

    const onFocus = () => {
      showPlaceholder(false);
      captureMetrics(el);
    };

    el.addEventListener('input', onInput);
    el.addEventListener('blur', onBlur);
    el.addEventListener('focus', onFocus);

    // Cleanup: remove the imperatively-created element.
    // React never knew about it, so no removeChild conflict.
    return () => {
      unmountedRef.current = true;
      el.removeEventListener('input', onInput);
      el.removeEventListener('blur', onBlur);
      el.removeEventListener('focus', onFocus);
      editableRef.current = null;
      if (el.parentNode) el.parentNode.removeChild(el);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editable]);

  // ── Imperative store subscription ──────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = useBookStore.subscribe((state) => {
      if (unmountedRef.current) return;
      const el = editableRef.current;
      if (!el) return;

      const page = state.pages.find((p) => p.id === pageId);
      if (!page) return;

      const newContent = page.content;
      const isFocused = document.activeElement === el;

      const shouldTakeFocus =
        !isCascading &&
        state.focusedPageId === pageId &&
        !focusHandledRef.current;

      if (newContent !== lastSentContent.current && !isFocused) {
        lastSentContent.current = newContent;
        el.innerHTML = newContent;
        showPlaceholder(editable && newContent.length === 0);

        const w = el.clientWidth > 0 ? el.clientWidth : metrics.width;
        const h = el.clientHeight > 0 ? el.clientHeight : metrics.height;
        const split = splitContent(newContent, w, h);
        if (split) {
          lastSentContent.current = split.remaining;
          el.innerHTML = split.remaining;
          isCascading = true;
          useBookStore.getState().pushOverflow(pageId, split.remaining, split.overflow, false);
          isCascading = false;
        }
      }

      if (shouldTakeFocus) {
        focusHandledRef.current = true;
        // Don't clearFocus() here — clearing it triggers a subscription
        // notification with focusedPageId=null, which resets focusHandledRef
        // and causes a duplicate attemptFocus that destroys the cursor.
        // Clear it inside attemptFocus after focus is established.

        let retries = 0;
        const attemptFocus = () => {
          if (unmountedRef.current) return;
          if (!el.offsetParent && retries < 20) {
            retries++;
            setTimeout(attemptFocus, 80);
            return;
          }

          // Sync DOM with latest store content before placing cursor
          const latest = useBookStore.getState().pages.find((p) => p.id === pageId)?.content ?? '';
          if (el.innerHTML !== latest) {
            lastSentContent.current = latest;
            el.innerHTML = latest;
          }

          el.focus();
          const sel = window.getSelection();
          if (sel) {
            const range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
          }

          // Now clear the store signal — focus is established.
          useBookStore.getState().clearFocus();
        };
        requestAnimationFrame(attemptFocus);
      } else if (state.focusedPageId !== null && state.focusedPageId !== pageId) {
        // Only reset when a DIFFERENT page takes focus, not when clearFocus()
        // sets focusedPageId to null. This prevents the double-fire chain.
        focusHandledRef.current = false;
      }
    });
    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId, editable]);

  // ── Pre-switch save ────────────────────────────────────────────────────────
  useEffect(() => {
    const save = () => {
      const el = editableRef.current;
      if (!el || !editable) return;
      const html = el.innerHTML;
      if (html !== lastSentContent.current) {
        lastSentContent.current = html;
        useBookStore.getState().updatePage(pageId, html);
      }
    };
    window.addEventListener('flipscript:savepages', save);
    return () => window.removeEventListener('flipscript:savepages', save);
  }, [pageId, editable]);

  const spineBoxShadow = side === 'left'
    ? 'inset -10px 0 18px -6px rgba(0,0,0,0.28)'
    : 'inset 10px 0 18px -6px rgba(0,0,0,0.28)';

  return (
    <section
      className={`relative h-full w-full overflow-hidden bg-[#efe3c9] ${side === 'left' ? 'rounded-l-lg' : 'rounded-r-lg'}`}
      style={{ boxShadow: spineBoxShadow }}
    >
      <div className="relative h-full w-full p-10 mt-4">
        {editable && (
          <div
            ref={placeholderRef}
            className="pointer-events-none absolute left-10 top-14 text-[15px] leading-6 text-black/25 italic"
            style={{ fontFamily: 'var(--font-hand)', display: 'none' }}
          >
            Begin your tale here...
          </div>
        )}
        {/* Container — React manages this empty div.
            The contentEditable child is created/destroyed imperatively,
            so React never tries to reconcile its innerHTML children. */}
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </section>
  );
}

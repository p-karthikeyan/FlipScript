'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const uid = () => crypto.randomUUID();

export type Page = {
  id: string;
  content: string;
};

export type Book = {
  title: string;
  pages: Page[];
  /**
   * The left-hand page of the currently visible spread.
   * This index is always even (0, 2, 4, ...).
   */
  currentPageIndex: number;
  focusedPageId: string | null;
  /**
   * Offset for caret placement when focusing.
   */
  selectionOffset: number;
};

type BookActions = {
  newBook: () => void;
  setTitle: (title: string) => void;
  
  // Content Actions
  updatePage: (id: string, content: string) => void;
  pushOverflow: (fromPageId: string, remainingContent: string, overflow: string) => void;
  pullFromNext: (targetPageId: string) => void;
  
  // Navigation
  goNext: () => void;
  goPrev: () => void;
  clearFocus: () => void;
  setPageIndex: (index: number) => void;
};

export type BookStore = Book & BookActions;

const createDefaultPages = (): Page[] => [
  { id: uid(), content: '' },
  { id: uid(), content: '' },
];

export const useBookStore = create<BookStore>()(
  persist(
    (set, get) => ({
      title: 'Untitled Book',
      pages: createDefaultPages(),
      currentPageIndex: 0,
      focusedPageId: null,
      selectionOffset: 0,

      newBook: () => {
        set({
          title: 'Untitled Book',
          pages: createDefaultPages(),
          currentPageIndex: 0,
          focusedPageId: null,
          selectionOffset: 0,
        });
      },

      setTitle: (title) => set({ title }),

      updatePage: (id, content) => {
        const { pages } = get();
        set({
          pages: pages.map((p) => (p.id === id ? { ...p, content } : p)),
        });
      },

      pushOverflow: (fromPageId, remainingContent, overflow) => {
        const { pages, currentPageIndex } = get();
        const fromIdx = pages.findIndex((p) => p.id === fromPageId);
        if (fromIdx === -1) return;

        const nextPages = [...pages];
        nextPages[fromIdx].content = remainingContent;

        // If it's the last page, create a new one
        if (fromIdx === pages.length - 1) {
          nextPages.push({ id: uid(), content: overflow });
        } else {
          // Prepend to next page
          nextPages[fromIdx + 1].content = overflow + nextPages[fromIdx + 1].content;
        }

        set({ pages: nextPages, focusedPageId: nextPages[fromIdx + 1].id, selectionOffset: 0 });

        // If the right-hand page (odd index) overflowed, flip the spread
        if (fromIdx % 2 !== 0 && fromIdx === currentPageIndex + 1) {
          set({ currentPageIndex: currentPageIndex + 2 });
        }
      },

      pullFromNext: (targetPageId) => {
        const { pages, currentPageIndex } = get();
        const idx = pages.findIndex((p) => p.id === targetPageId);
        if (idx === -1 || idx === pages.length - 1) return;

        const nextIdx = idx + 1;
        const nextContent = pages[nextIdx].content;
        const newPages = [...pages];

        // Merge content
        const targetOldLength = newPages[idx].content.length;
        newPages[idx].content += nextContent;
        
        // Remove the next page if it's beyond the first spread and we can shrink
        if (newPages.length > 2) {
          newPages.splice(nextIdx, 1);
        } else {
          newPages[nextIdx].content = '';
        }

        set({ 
          pages: newPages, 
          focusedPageId: targetPageId, 
          selectionOffset: targetOldLength 
        });

        // Re-check navigation boundaries
        if (currentPageIndex >= newPages.length) {
          set({ currentPageIndex: Math.max(0, newPages.length - (newPages.length % 2 === 0 ? 2 : 1)) });
        }
      },

      goNext: () => {
        const { pages, currentPageIndex } = get();
        if (currentPageIndex + 2 < pages.length) {
          set({ currentPageIndex: currentPageIndex + 2 });
        }
      },

      goPrev: () => {
        const { currentPageIndex } = get();
        if (currentPageIndex - 2 >= 0) {
          set({ currentPageIndex: currentPageIndex - 2 });
        }
      },

      setPageIndex: (index) => {
        // Ensure index is even (left of spread)
        const normalized = index % 2 === 0 ? index : index - 1;
        set({ currentPageIndex: Math.max(0, normalized) });
      },

      clearFocus: () => set({ focusedPageId: null, selectionOffset: 0 }),
    }),
    {
      name: 'storywriter_v2', // New version marker for fresh start
      version: 2,
    },
  ),
);

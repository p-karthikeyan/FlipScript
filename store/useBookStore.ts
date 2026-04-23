'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const customStorage = {
  getItem: (name: string) => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname;
    if (path.includes('/editor/guest') || path === '/') {
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name: string) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(name);
  },
};

const uid = () => crypto.randomUUID();

export type Page = {
  id: string;
  content: string;
};

export type PublishStatus = 'none' | 'pending' | 'approved' | 'rejected';

export type Book = {
  title: string;
  pages: Page[];
  currentPageIndex: number;
  focusedPageId: string | null;
  selectionOffset: number;
  isPublic: boolean;
  isOwner: boolean;
  shareId?: string | null;
  coverImage?: string | null;
  penName?: string | null;
  publishedAt?: string | null;
  publishStatus?: PublishStatus;
  publishRequestedAt?: string | null;
};

type BookActions = {
  newBook: () => void;
  setTitle: (title: string) => void;

  // Content Actions
  updatePage: (id: string, content: string) => void;
  pushOverflow: (fromPageId: string, remainingContent: string, overflow: string, moveFocus?: boolean) => void;
  pullFromNext: (targetPageId: string) => void;

  // Navigation
  goNext: () => void;
  goPrev: () => void;
  clearFocus: () => void;
  setPageIndex: (index: number) => void;
  setBook: (book: {
    title: string;
    pages: Page[];
    isPublic?: boolean;
    shareId?: string;
    coverImage?: string | null;
    penName?: string | null;
    publishedAt?: string | null;
    publishStatus?: PublishStatus;
    publishRequestedAt?: string | null;
  }) => void;
  setPages: (pages: Page[]) => void;
  setIsPublic: (isPublic: boolean) => void;
  setIsOwner: (isOwner: boolean) => void;
  setCoverImage: (url: string | null) => void;
  setPenName: (name: string | null) => void;
  setPublishedAt: (date: string | null) => void;
  setPublishStatus: (status: PublishStatus) => void;
};

export type BookStore = Book & BookActions;

const createDefaultPages = (): Page[] => [
  { id: uid(), content: 'The journey begins on a blank page...' },
  { id: uid(), content: 'Thoughts flow like a river across the spread.' },
  { id: uid(), content: 'A new chapter in digital storytelling.' },
  { id: uid(), content: 'The end is just the start of another tale.' },
];

const padPagesToEven = (pages: Page[]): Page[] => {
  if (pages.length % 2 !== 0) {
    return [...pages, { id: uid(), content: '' }];
  }
  return pages;
};

export const useBookStore = create<BookStore>()(
  persist(
    (set, get) => ({
      title: 'Untitled Book',
      pages: createDefaultPages(),
      currentPageIndex: 0,
      focusedPageId: null,
      selectionOffset: 0,
      isPublic: false,
      isOwner: true,
      shareId: null,
      coverImage: null,
      penName: null,
      publishedAt: null,
      publishStatus: 'none',
      publishRequestedAt: null,

      newBook: () => {
        set({
          title: 'Untitled Book',
          pages: createDefaultPages(),
          currentPageIndex: 0,
          focusedPageId: null,
          selectionOffset: 0,
          isPublic: false,
          isOwner: true,
          shareId: null,
          coverImage: null,
          penName: null,
          publishedAt: null,
          publishStatus: 'none',
          publishRequestedAt: null,
        });
      },

      setTitle: (title) => set({ title }),

      updatePage: (id, content) => {
        const { pages } = get();
        set({ pages: pages.map((p) => (p.id === id ? { ...p, content } : p)) });
      },

      pushOverflow: (fromPageId, remainingContent, overflow, moveFocus = true) => {
        const { pages, currentPageIndex } = get();
        const fromIdx = pages.findIndex((p) => p.id === fromPageId);
        if (fromIdx === -1) return;

        const nextPages = [...pages];
        nextPages[fromIdx].content = remainingContent;

        if (fromIdx === pages.length - 1) {
          nextPages.push({ id: uid(), content: overflow });
        } else {
          nextPages[fromIdx + 1].content = overflow + nextPages[fromIdx + 1].content;
        }

        const paddedPages = padPagesToEven(nextPages);
        set({
          pages: paddedPages,
          focusedPageId: moveFocus ? nextPages[fromIdx + 1].id : get().focusedPageId,
          selectionOffset: 0,
        });

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
        const targetOldLength = newPages[idx].content.length;
        newPages[idx].content += nextContent;

        if (newPages.length > 2) {
          newPages.splice(nextIdx, 1);
        } else {
          newPages[nextIdx].content = '';
        }

        const paddedPages = padPagesToEven(newPages);
        set({ pages: paddedPages, focusedPageId: targetPageId, selectionOffset: targetOldLength });

        if (currentPageIndex >= paddedPages.length) {
          set({ currentPageIndex: Math.max(0, paddedPages.length - 2) });
        }
      },

      goNext: () => {
        const { pages, currentPageIndex } = get();
        if (currentPageIndex + 2 < pages.length) set({ currentPageIndex: currentPageIndex + 2 });
      },

      goPrev: () => {
        const { currentPageIndex } = get();
        if (currentPageIndex - 2 >= 0) set({ currentPageIndex: currentPageIndex - 2 });
      },

      setPageIndex: (index) => {
        const normalized = index % 2 === 0 ? index : index - 1;
        set({ currentPageIndex: Math.max(0, normalized) });
      },

      setBook: (book) => {
        const initialPages = book.pages.length > 0 ? book.pages : createDefaultPages();
        set({
          title: book.title,
          pages: padPagesToEven(initialPages),
          isPublic: book.isPublic ?? false,
          shareId: book.shareId ?? null,
          coverImage: book.coverImage ?? null,
          penName: book.penName ?? null,
          publishedAt: book.publishedAt ?? null,
          publishStatus: (book.publishStatus as PublishStatus) ?? 'none',
          publishRequestedAt: book.publishRequestedAt ?? null,
          currentPageIndex: 0,
          focusedPageId: null,
          selectionOffset: 0,
        });
      },

      setIsPublic: (isPublic) => set({ isPublic }),
      setIsOwner: (isOwner) => set({ isOwner }),
      setPages: (pages) => set({ pages: padPagesToEven(pages) }),
      setCoverImage: (url) => set({ coverImage: url }),
      setPenName: (name) => set({ penName: name }),
      setPublishedAt: (date) => set({ publishedAt: date }),
      setPublishStatus: (status) => set({ publishStatus: status }),

      clearFocus: () => set({ focusedPageId: null, selectionOffset: 0 }),
    }),
    {
      name: 'storywriter_v3',
      version: 3,
      storage: createJSONStorage(() => customStorage),
    },
  ),
);

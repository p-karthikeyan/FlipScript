'use client';

import { useBookStore } from '@/store/useBookStore';
import { downloadBookAsPdf } from '@/lib/pdfExport';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, LogOut, Library } from 'lucide-react';
import { AuthModal } from './AuthModal';

function CustomDropdown({ options, value, onChange, className }: any) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o: any) => o.value === value)?.label || value;

  return (
    <div className="relative">
      <button
        onMouseDown={(e) => { e.preventDefault(); setOpen(!open); }}
        className={`px-3 flex items-center justify-between gap-2.5 rounded-lg hover:bg-amber-900/20 text-amber-100/40 hover:text-amber-400 transition-colors bg-transparent text-[11px] ${className}`}
      >
        <span>{selectedLabel}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div 
              className="fixed inset-0 z-[190]" 
              onMouseDown={(e) => { e.preventDefault(); setOpen(false); }} 
            />
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-full mt-3 left-0 min-w-full whitespace-nowrap bg-[#0f0f0f] border border-amber-900/30 rounded-xl shadow-2xl overflow-hidden z-[200]"
            >
              <div className="flex flex-col py-1">
                {options.map((opt: any) => (
                  <button
                    key={opt.value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-[11px] hover:bg-amber-900/40 transition-colors ${value === opt.value ? 'bg-amber-900/20 text-amber-400' : 'text-amber-100/60'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FloatingNavbar() {
  const title = useBookStore((s) => s.title);
  const setTitle = useBookStore((s) => s.setTitle);
  const newBook = useBookStore((s) => s.newBook);

  const { data: session, status } = useSession();
  const [downloading, setDownloading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [fontName, setFontName] = useState('var(--font-hand)');
  const [fontSize, setFontSize] = useState('5');
  const [refresh, setRefresh] = useState(0);
  const router = useRouter();

  // Re-render when selection changes to update active button states
  useEffect(() => {
    const handleSelectionChange = () => setRefresh(r => r + 1);
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const handleDownload = async () => {
    if (status !== 'authenticated') {
      setIsAuthModalOpen(true);
      return;
    }
    if (downloading) return;
    setDownloading(true);
    try {
      const book = useBookStore.getState();
      await downloadBookAsPdf(book);
    } finally {
      setDownloading(false);
    }
  };

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    setRefresh(r => r + 1);
  };

  return (
    <>
      <nav className="fixed top-0 left-1/2 -translate-x-1/2 z-[100]">
        <div className="flex items-center gap-4 px-6 py-2.5 rounded-b-2xl bg-black/60 border-b border-x border-amber-900/30 shadow-2xl backdrop-blur-xl">
          {/* Group: File Actions */}
          <div className="flex items-center gap-1.5 px-2 border-r border-amber-900/30 mr-1">
            <button
              onClick={() => { if (confirm("Start new story?")) newBook(); }}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-amber-900/20 text-amber-100/40 hover:text-amber-400 transition-colors group relative"
              title="New Book"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
            <button
              onClick={async () => {
                const book = useBookStore.getState();
                const path = window.location.pathname;
                if (path.startsWith('/editor/') && !path.includes('/guest')) {
                  const id = path.split('/').pop();
                  if (id) {
                    await fetch(`/api/books/${id}`, {
                      method: "PUT",
                      body: JSON.stringify({ title: book.title, pages: book.pages }),
                      headers: { "Content-Type": "application/json" },
                    }).catch(console.error);
                  }
                }
                router.push('/dashboard');
              }}
              className="px-3 h-8 flex items-center justify-center gap-2 rounded-lg bg-amber-900/10 border border-amber-900/20 text-amber-500/60 hover:text-amber-500 hover:bg-amber-900/20 hover:border-amber-700/40 transition-all font-bold text-[10px] uppercase tracking-widest"
              title="Return to Library"
            >
              <Library className="w-3.5 h-3.5" />
              <span>Library</span>
            </button>
          </div>

          {/* Group: Text Styling */}
          <div className="flex items-center gap-1 px-1 border-r border-amber-900/30 mr-1">
            <button
              onMouseDown={(e) => { e.preventDefault(); exec('bold'); }}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-sm font-bold ${
                typeof document !== 'undefined' && document.queryCommandState('bold') 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                  : 'hover:bg-amber-900/20 text-amber-100/40 hover:text-amber-400'
              }`}
              title="Bold"
            >
              B
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); exec('italic'); }}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-sm italic ${
                typeof document !== 'undefined' && document.queryCommandState('italic') 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                  : 'hover:bg-amber-900/20 text-amber-100/40 hover:text-amber-400'
              }`}
              title="Italic"
            >
              I
            </button>

            <CustomDropdown
              value={fontName}
              onChange={(v: string) => {
                setFontName(v);
                exec('fontName', v);
              }}
              options={[
                { label: 'Patrick Hand', value: 'var(--font-hand)' },
                { label: 'Serif', value: 'serif' },
                { label: 'Sans Serif', value: 'sans-serif' }
              ]}
              className="h-8"
            />

            <CustomDropdown
              value={fontSize}
              onChange={(v: string) => {
                setFontSize(v);
                exec('fontSize', v);
              }}
              options={[
                { label: 'Smallest', value: '1' },
                { label: 'Smaller', value: '2' },
                { label: 'Small', value: '3' },
                { label: 'Default', value: '4' },
                { label: 'Large', value: '5' },
                { label: 'Larger', value: '6' },
                { label: 'Largest', value: '7' }
              ]}
              className="h-8"
            />
          </div>

          {/* Center Group: Title Edit */}
          <div className="flex items-center px-4 max-w-[240px]">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent text-[12px] font-bold text-amber-100/60 text-center outline-none focus:text-amber-400 transition-colors w-full tracking-wider"
              placeholder="Untitled"
            />
          </div>

          {/* Right Group: Export */}
          <div className="flex items-center ml-1 pl-2 border-l border-amber-900/30">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className={`h-8 px-4 flex items-center justify-center rounded-lg bg-amber-900/10 border border-amber-900/30 text-amber-500/80 text-[11px] font-bold uppercase tracking-wider transition-all hover:bg-amber-900/30 hover:border-amber-700/50 hover:text-amber-400 disabled:opacity-20`}
            >
              {downloading ? "..." : "EXPORT"}
            </button>
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Permission to Export"
        description="To export your book, please verify your identity with Google. This ensures your work is stored in the archives."
      />
    </>
  );
}

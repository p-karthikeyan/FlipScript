'use client';

import { useBookStore } from '@/store/useBookStore';
import { downloadBookAsPdf } from '@/lib/pdfExport';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { LayoutGrid, LogOut, Library } from 'lucide-react';
import { AuthModal } from './AuthModal';

export function FloatingNavbar() {
  const title = useBookStore((s) => s.title);
  const setTitle = useBookStore((s) => s.setTitle);
  const newBook = useBookStore((s) => s.newBook);
  
  const { data: session, status } = useSession();
  const [downloading, setDownloading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
  };

  return (
    <>
      {/* Top Edge Sensor */}
      <div 
        className="fixed top-0 left-0 w-full h-10 z-[150]" 
        onMouseEnter={() => setIsHovered(true)}
      />

      <nav 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isHovered ? 'translate-y-6 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="flex items-center gap-4 px-2 py-1.5 rounded-2xl bg-[#1e1e1e]/90 border border-white/5 shadow-2xl backdrop-blur-xl">
          {/* Group: File Actions */}
          <div className="flex items-center gap-1.5 px-2 border-r border-white/5 mr-1">
            <button
              onClick={() => { if(confirm("Start new story?")) newBook(); }}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors group relative"
              title="New Book"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
            <Link
              href="/dashboard"
              className="px-3 h-8 flex items-center justify-center gap-2 rounded-lg bg-amber-900/10 border border-amber-900/20 text-amber-500/60 hover:text-amber-500 hover:bg-amber-900/20 hover:border-amber-700/40 transition-all font-bold text-[10px] uppercase tracking-widest"
              title="Return to Library"
            >
              <Library className="w-3.5 h-3.5" />
              <span>Library</span>
            </Link>
          </div>

          {/* Group: Text Styling */}
          <div className="flex items-center gap-1 px-1 border-r border-white/5 mr-1">
            <button
              onMouseDown={(e) => { e.preventDefault(); exec('bold'); }}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors text-sm font-bold"
              title="Bold"
            >
              B
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); exec('italic'); }}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors text-sm italic"
              title="Italic"
            >
              I
            </button>
            
            <select 
              onChange={(e) => exec('fontName', e.target.value)}
              className="bg-transparent text-[11px] text-white/40 outline-none hover:text-white transition-colors cursor-pointer px-2"
            >
              <option value="var(--font-hand)">Patrick Hand</option>
              <option value="serif">Serif</option>
              <option value="sans-serif">Sans Serif</option>
            </select>

            <select 
              defaultValue="5"
              onChange={(e) => exec('fontSize', e.target.value)}
              className="bg-transparent text-[11px] text-white/40 outline-none hover:text-white transition-colors cursor-pointer px-2"
            >
              <option value="1">Smallest</option>
              <option value="2">Smaller</option>
              <option value="3">Small</option>
              <option value="4">Default</option>
              <option value="5">Large</option>
              <option value="6">Larger</option>
              <option value="7">Largest</option>
            </select>
          </div>

          {/* Center Group: Title Edit */}
          <div className="flex items-center px-4 max-w-[240px]">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent text-[12px] font-medium text-white/60 text-center outline-none focus:text-white transition-colors w-full"
              placeholder="Untitled"
            />
          </div>

          {/* Right Group: Export */}
          <div className="flex items-center ml-1 pl-2 border-l border-white/5">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className={`h-8 px-4 flex items-center justify-center rounded-lg bg-[#5e5ce6]/20 text-[#7c7aff] text-[11px] font-bold uppercase tracking-wider transition-all hover:bg-[#5e5ce6]/30 disabled:opacity-20`}
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
        description="To export your manuscript, please verify your identity with Google. This ensures your work is stored in the archives."
      />
    </>
  );
}

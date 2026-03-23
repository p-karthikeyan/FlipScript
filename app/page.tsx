'use client';

import { BookViewer } from '@/components/BookViewer';
import { useBookStore } from '@/store/useBookStore';
import { downloadBookAsPdf } from '@/lib/pdfExport';
import { useState } from 'react';

export default function Home() {
  const title = useBookStore((s) => s.title);
  const setTitle = useBookStore((s) => s.setTitle);
  const newBook = useBookStore((s) => s.newBook);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const book = useBookStore.getState();
      await downloadBookAsPdf(book);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="relative h-screen w-full bg-[#121212] text-white flex flex-col overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(1000px_circle_at_20%_20%,rgba(59,130,246,0.1),transparent_60%),radial-gradient(900px_circle_at_80%_10%,rgba(168,85,247,0.08),transparent_55%)] pointer-events-none" />

      {/* Top Overlay UI (Minimalist) */}
      <nav className="relative z-50 flex items-center justify-between px-10 pt-10 pointer-events-none">
        {/* Left Side: Editable Title & New Book */}
        <div className="flex items-center gap-6 pointer-events-auto group">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent text-[13px] font-mono tracking-[0.4em] uppercase text-white/40 border-none outline-none focus:text-white/80 transition-all w-[300px]"
            title="Book Title"
          />
          <button
            onClick={() => {
               if(confirm("Are you sure? This will delete the current story.")) newBook();
            }}
            className="w-6 h-6 flex items-center justify-center rounded-md border border-white/5 bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/70 transition-all relative group"
            title="Create New Book"
          >
            +
            <div className="absolute top-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-black/80 text-[10px] px-2 py-1 rounded whitespace-nowrap transition-transform opacity-0 group-hover:opacity-100 origin-top">
              Start New Story
            </div>
          </button>
        </div>

        {/* Right Side: Download Button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="pointer-events-auto h-10 px-5 flex items-center justify-center rounded-lg border border-white/5 bg-white/5 text-[11px] font-mono uppercase tracking-widest text-white/40 hover:bg-white/10 hover:text-white/70 transition-all disabled:opacity-20"
        >
          {downloading ? "Preparing..." : "Export PDF"}
        </button>
      </nav>

      {/* Main Experience: Center-focused Book */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-4 -mt-10 overflow-auto scrollbar-hide">
        <div className="w-full flex justify-center">
           <BookViewer />
        </div>
      </main>

      {/* Subtle Bottom Branding */}
      <footer className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="text-[10px] tracking-[0.8em] text-white/5 uppercase">
             Anti-Gravity StoryWriter v2
          </div>
      </footer>
    </div>
  );
}

'use client';

import { BookViewer } from '@/components/BookViewer';
import { FloatingNavbar } from '@/components/FloatingNavbar';

export default function Home() {
  return (
    <div className="relative h-screen w-full bg-[#121212] text-white flex flex-col overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(1000px_circle_at_20%_20%,rgba(59,130,246,0.1),transparent_60%),radial-gradient(900px_circle_at_80%_10%,rgba(168,85,247,0.08),transparent_55%)] pointer-events-none" />

      {/* Centered Floating Navbar */}
      <FloatingNavbar />

      {/* Main Experience: Center-focused Book */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-4 overflow-auto scrollbar-hide">
        <div className="w-full h-full flex items-center justify-center">
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

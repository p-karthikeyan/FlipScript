'use client';

import { BookViewer } from '@/components/BookViewer';
import { useEffect, useState } from 'react';
import { useBookStore } from '@/store/useBookStore';
import { useParams, useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { Feather, Plus } from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';

export default function PublicViewerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const setBook = useBookStore(s => s.setBook);
  const setIsOwner = useBookStore(s => s.setIsOwner);
  const title = useBookStore(s => s.title);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { data: session, status } = useSession();

  useEffect(() => {
    if (id) {
      fetchBook();
    }
  }, [id, session]);

  const fetchBook = async () => {
    try {
      const res = await fetch(`/api/books/${id}`);
      if (res.ok) {
        const data = await res.json();
        const sanitizedPages = data.pages?.map((p: any) => ({
          ...p,
          id: p.id || p._id || crypto.randomUUID()
        })) || [];
        
        // Update Store
        const owner = session?.user && data.userId === (session.user as any).id;
        setIsOwner(!!owner);
        setBook({ 
          title: data.title, 
          pages: sanitizedPages,
          shareId: data.shareId
        });
        setLoading(false);
      } else {
         router.push('/');
      }
    } catch (e) {
      console.error("Failed to load book:", e);
      setLoading(false);
    }
  };

  const handleStartWriting = () => {
    if (status === "authenticated") {
      router.push('/dashboard');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center font-hand text-amber-100/20 text-4xl animate-pulse">
        Opening the scroll...
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-[#0a0a0a] text-[#d4d4d4] font-sans selection:bg-amber-900/30 flex flex-col overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-900/10 blur-[150px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(150,75,0,0.02)_1px,transparent_1px)] bg-[length:60px_60px] opacity-20" />
      </div>

      {/* Top Bar */}
      <header className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        {/* Left: Logo */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-full border border-amber-900/30 flex items-center justify-center bg-black/40 backdrop-blur-md group-hover:border-amber-500/50 transition-colors shadow-lg">
            <Feather className="w-5 h-5 text-amber-500/60 group-hover:text-amber-500 transition-colors" />
          </div>
          <span className="text-2xl tracking-tighter font-hand text-amber-100/40 group-hover:text-amber-100/80 transition-colors">FlipScript</span>
        </button>

        {/* Center: Title */}
        <div className="flex flex-col items-center">
           <h1 className="text-2xl font-hand text-amber-50/90 tracking-tight leading-none">{title}</h1>
           <span className="text-[9px] tracking-[0.5em] text-amber-500/40 font-bold uppercase mt-2">Historical Archive</span>
        </div>

        {/* Right: Write Button */}
        <button
          onClick={handleStartWriting}
          className="px-6 py-2 border border-amber-900/40 text-amber-200/90 text-lg rounded-full hover:bg-amber-900/10 transition-all hover:border-amber-700/60 font-hand"
        >
          Start Writing
        </button>
      </header>

      {/* Main Experience: Center-focused Book */}
      <main className="relative flex-1 flex flex-col items-center px-4 pt-4 pb-16 overflow-auto scrollbar-hide">
        <div className="my-auto w-full flex items-center justify-center">
          <BookViewer editable={false} />
        </div>
      </main>

      <footer className="relative z-10 py-8 px-8 text-center text-[10px] tracking-[0.4em] text-white/5 uppercase font-bold">
        FlipScript Archive Residency • {new Date().getFullYear()}
      </footer>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        title="Begin Your Journey"
        description="Write your own stories in our deep archive. Start your handwritten journey today."
      />

      <style jsx global>{`
        .font-hand {
          font-family: var(--font-hand), cursive;
        }
      `}</style>
    </div>
  );
}

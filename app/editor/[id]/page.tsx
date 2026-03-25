'use client';

import { BookViewer } from '@/components/BookViewer';
import { FloatingNavbar } from '@/components/FloatingNavbar';
import { useEffect, useState } from 'react';
import { useBookStore } from '@/store/useBookStore';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function EditorPage() {
  const { status } = useSession();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const setBook = useBookStore(s => s.setBook);
  const title = useBookStore(s => s.title);
  const pages = useBookStore(s => s.pages);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (id && id !== "guest") {
      fetchBook();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchBook = async () => {
    try {
      const res = await fetch(`/api/books/${id}`);
      if (res.ok) {
        const data = await res.json();
        const sanitizedPages = data.pages?.map((p: any) => ({
          ...p,
          id: p.id || p._id || crypto.randomUUID()
        })) || [];
        // Update Title and Pages in Store
        setBook({ title: data.title, pages: sanitizedPages });
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-save logic
  useEffect(() => {
    if (loading || !id || id === "guest" || status !== "authenticated") return;

    // Set saving to true immediately on change, then false after sync
    const timer = setTimeout(async () => {
      setSaving(true);
      try {
        await fetch(`/api/books/${id}`, {
          method: "PUT",
          body: JSON.stringify({ title, pages }),
          headers: { "Content-Type": "application/json" },
        });
      } finally {
        setTimeout(() => setSaving(false), 1000); // Visual delay for the "Saved" feel
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, pages, id, loading, status]);

  if (loading || status === "loading") {
    return (
      <div className="h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center gap-6">
        <div className="font-bold tracking-[0.5em] text-amber-100/20 uppercase text-xs animate-pulse">
          Syncing book with vault...
        </div>
        <button
          onClick={() => window.location.reload()}
          className="text-[10px] tracking-[0.2em] text-white/10 uppercase hover:text-white/40 transition-colors border-b border-white/5 pb-1"
        >
          Taking too long? Click here to refresh
        </button>
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

      {/* Centered Floating Navbar */}
      <FloatingNavbar />

      {/* Main Experience: Center-focused Book */}
      <main className="relative flex-1 flex flex-col items-center px-4 pt-20 pb-16 overflow-auto scrollbar-hide">
        <div className="my-auto w-full flex items-center justify-center">
          <BookViewer />
        </div>
      </main>

      {/* Subtle Bottom Branding */}
      <footer className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center gap-2">
        {/* Save Status Indicator */}
        {id !== "guest" && (
          <div className={`text-[9px] tracking-[0.4em] uppercase font-bold transition-all duration-700 ${saving ? 'text-amber-500 opacity-100 animate-pulse' : 'text-white/10 opacity-50'}`}>
            {saving ? "Syncing to Archives..." : "Manifest Stored"}
          </div>
        )}
        <div className="text-[8px] tracking-[0.4em] text-white/10 uppercase font-bold">
          {id === "guest" ? "GUEST MODE" : "SECURE SESSION"}
        </div>
      </footer>
    </div>
  );
}

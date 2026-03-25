'use client';

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Plus, Book as BookIcon, LogOut, Trash2, ArrowRight, Feather, Library } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CustomCursor } from "@/components/CustomCursor";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
    if (status === "authenticated") {
      fetchBooks();
    }
  }, [status, router]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/books");
      const data = await res.json();
      setBooks(data);
    } finally {
      setLoading(false);
    }
  };

  const createBook = async () => {
    const res = await fetch("/api/books", {
      method: "POST",
      body: JSON.stringify({ title: "A New Story" }),
      headers: { "Content-Type": "application/json" },
    });
    const newBook = await res.json();
    router.push(`/editor/${newBook._id}`);
  };

  const deleteBook = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure? This delete is permanent.")) return;
    await fetch(`/api/books/${id}`, { method: "DELETE" });
    setBooks(prev => prev.filter(b => b._id !== id));
  };

  if (status === "loading" || loading) {
    return (
      <div className="h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center font-hand text-amber-100/20 text-4xl animate-pulse">
        Consulting the archives...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-[#d4d4d4] p-8 md:p-16 relative overflow-hidden font-hand">
      <CustomCursor />

      {/* Background Ambience: Ink on Parchment style (matching landing) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-900/10 blur-[150px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(150,75,0,0.02)_1px,transparent_1px)] bg-[length:60px_60px] opacity-20" />
      </div>

      <header className="relative flex items-center justify-between max-w-7xl mx-auto mb-24">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 border border-amber-900/30 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md">
            <Library className="w-8 h-8 text-amber-600/60" />
          </div>
          <div>
            <h1 className="text-5xl font-bold tracking-tight text-amber-50/90 leading-none">The Archive</h1>
            <p className="text-amber-100/20 text-xl mt-1">Preserve your books for eternity.</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            {session?.user?.image && (
              <div className="relative group flex-shrink-0">
                <img src={session.user.image} className="w-10 h-10 rounded-full border border-amber-900/20 transition-all group-hover:border-amber-700/60" alt="Profile" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-amber-600 rounded-full border-2 border-[#0a0a0a]" />
              </div>
            )}
            {session?.user?.name && (
              <span className="text-lg text-amber-50/80 font-bold tracking-wide pr-2">{session.user.name}</span>
            )}
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center justify-center w-12 h-12 rounded-full border border-amber-900/30 hover:border-amber-600/60 hover:bg-amber-900/20 text-amber-600/60 hover:text-amber-400 transition-all shadow-sm"
            title="Sign out"
          >
            <LogOut className="w-5 h-5 ml-1" />
          </button>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Create New Book Card */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={createBook}
            className="group relative h-[400px] bg-amber-900/5 border border-dashed border-amber-900/20 rounded-[40px] flex flex-col items-center justify-center gap-6 overflow-hidden hover:bg-amber-900/10 hover:border-amber-700/40 transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]"
          >
            <div className="w-20 h-20 rounded-full border border-amber-900/30 flex items-center justify-center bg-black/40 group-hover:scale-110 transition-transform">
              <Plus className="w-10 h-10 text-amber-500/60" />
            </div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-amber-100/60">New Book</span>
              <span className="text-sm text-amber-700/60 font-bold uppercase tracking-[0.3em] mt-2 block">Begin writing</span>
            </div>
          </motion.button>

          {/* Book Cards */}
          {books.map((book) => (
            <motion.div
              layout
              key={book._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative h-[400px] bg-white/[0.02] border border-white/5 rounded-[40px] p-8 hover:bg-white/[0.04] hover:border-amber-900/30 transition-all flex flex-col items-center justify-between shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]"
            >
              {/* Decorative Ink Splat Background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-900/5 blur-[100px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="w-full flex justify-between items-start relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-900/20 flex items-center justify-center">
                  <Feather className="w-6 h-6 text-amber-500/60" />
                </div>
                <button
                  onClick={(e) => deleteBook(book._id, e)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-500/10 text-white/10 hover:text-red-400 transition-all"
                  title="Incinerate Book"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center relative z-10 py-10">
                <h3 className="text-3xl font-bold text-amber-50/90 mb-2 truncate max-w-[200px]">{book.title}</h3>
                <div className="flex flex-col items-center gap-1 text-sm text-amber-100/20 italic">
                  <span>{book.pages?.length || 0} Pages composed</span>
                  <span>Updated {new Date(book.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <Link
                href={`/editor/${book._id}`}
                className="w-full py-4 rounded-2xl bg-amber-900/10 border border-amber-900/20 text-amber-200/90 text-xl font-bold hover:bg-amber-800/20 hover:border-amber-700/40 transition-all flex items-center justify-center gap-2 group/btn"
              >
                Open Page <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform opacity-40" />
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer Branded consistent with Landing */}
      <footer className="mt-40 border-t border-amber-900/10 py-16 flex flex-col md:row items-center justify-between text-amber-100/10 text-xs font-bold tracking-[0.4em] uppercase max-w-7xl mx-auto">
        <span>FlipScript Vault Archive</span>
        <span>Established MCMXXVI</span>
      </footer>

      <style jsx global>{`
        .font-hand {
          font-family: var(--font-hand), cursive;
        }
      `}</style>
    </div>
  );
}

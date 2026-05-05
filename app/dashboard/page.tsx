'use client';

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Plus, Book as BookIcon, LogOut, Trash2, ArrowRight, Feather, Library, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CustomCursor } from "@/components/CustomCursor";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);
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
    setBookToDelete(id);
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return;
    const id = bookToDelete;
    setBookToDelete(null);
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
            <h1 className="text-5xl font-bold tracking-tight text-amber-50/90 leading-none">Library</h1>
            <p className="text-amber-100/20 text-xl mt-1">Preserve your books for eternity.</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            {session?.user?.image && (
              <div className="relative group flex-shrink-0">
                <img src={session.user.image} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full border border-amber-900/20 transition-all group-hover:border-amber-700/60" alt="Profile" />
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">

          {/* Create New Book — same shape as a book cover */}
          <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }} className="flex flex-col gap-3">
            <button
              onClick={createBook}
              className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-amber-900/30 hover:border-amber-700/50 bg-amber-900/5 hover:bg-amber-900/10 transition-all shadow-xl shadow-black/40 flex flex-col items-center justify-center gap-4"
              style={{ aspectRatio: '550/750' }}
            >
              <div className="w-14 h-14 rounded-full border border-amber-900/30 flex items-center justify-center bg-black/30 group-hover:scale-110 transition-transform">
                <Plus className="w-7 h-7 text-amber-500/60" />
              </div>
              <div className="text-center">
                <span className="block text-base font-bold text-amber-100/50" style={{ fontFamily: 'var(--font-hand), cursive' }}>New Book</span>
                <span className="text-[10px] text-amber-700/50 font-bold uppercase tracking-widest mt-1 block">Begin writing</span>
              </div>
            </button>
          </motion.div>

          {/* Book Cards */}
          {books.map((book) => (
            <motion.div
              layout
              key={book._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="group flex flex-col gap-3"
            >
              {/* Cover */}
              <div
                className="relative overflow-hidden rounded-2xl shadow-xl shadow-black/50 transition-shadow duration-300 group-hover:shadow-2xl"
                style={{ aspectRatio: '550/750' }}
              >
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full bg-gradient-to-br from-[#2a1505] via-[#1a0f03] to-[#0d0700] flex flex-col items-center justify-end p-4"
                    style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 15px,rgba(180,120,40,0.1) 15px,rgba(180,120,40,0.1) 16px)' }}
                  >
                    <div className="absolute inset-2 border border-amber-700/20 rounded-xl pointer-events-none" />
                    <p className="text-amber-100/60 text-xs font-bold text-center leading-tight line-clamp-3" style={{ fontFamily: 'var(--font-hand), cursive' }}>
                      {book.title}
                    </p>
                  </div>
                )}

                {/* Spine shadow */}
                <div className="absolute left-0 top-0 w-3 h-full bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />

                {/* Public badge */}
                {book.publishedAt && (
                  <div className="absolute top-2 left-2 bg-emerald-500 text-black text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow">
                    Public
                  </div>
                )}

                {/* Delete — top right, appears on hover */}
                <button
                  onClick={(e) => deleteBook(book._id, e)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/80 text-white/60 hover:text-white transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Open hover overlay */}
                <Link
                  href={`/editor/${book._id}`}
                  className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 rounded-full px-4 py-2 flex items-center gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-300 text-[11px] font-bold uppercase tracking-wider">Open</span>
                  </div>
                </Link>
              </div>

              {/* Meta below cover */}
              <div className="px-1">
                <h3
                  className="text-amber-50/90 text-base font-bold leading-snug line-clamp-2 group-hover:text-amber-300 transition-colors"
                  style={{ fontFamily: 'var(--font-hand), cursive' }}
                >
                  {book.title}
                </h3>
                {book.penName && (
                  <p className="text-amber-100/50 text-sm mt-1 truncate" style={{ fontFamily: 'var(--font-hand), cursive' }}>
                    {book.penName}
                  </p>
                )}
                <p className="text-white/30 text-xs mt-0.5">
                  {book.pages?.length || 0} pages · {new Date(book.updatedAt).toLocaleDateString()}
                </p>
              </div>
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

      <AnimatePresence>
        {bookToDelete && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBookToDelete(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#0f0f0f] border border-red-900/30 rounded-[40px] p-10 overflow-hidden font-sans"
            >
              {/* Background Ambience */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-900/10 blur-[60px] pointer-events-none rounded-full" />
              <button
                onClick={() => setBookToDelete(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors text-white/20 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-900/10 border border-red-900/20 flex items-center justify-center mb-6">
                  <Trash2 className="w-8 h-8 text-red-500/60" />
                </div>
                <h2 className="text-3xl font-bold font-hand text-red-50/90 mb-2">
                  Incinerate Book?
                </h2>
                <p className="text-lg font-hand text-red-100/40 mb-8 leading-relaxed italic">
                  This action is permanent and cannot be undone. Your manuscript will be lost to the void.
                </p>
                <div className="flex w-full gap-4">
                  <button
                    onClick={() => setBookToDelete(null)}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white/60 rounded-2xl font-bold transition-all font-sans"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 py-4 bg-red-900/80 hover:bg-red-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(220,38,38,0.2)] font-sans"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Loader2, Library } from 'lucide-react';

interface RackBook {
  _id: string;
  title: string;
  coverImage?: string | null;
  penName?: string | null;
  shareId?: string | null;
  publishedAt: string;
}

export default function RackPage() {
  const [books, setBooks] = useState<RackBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/rack')
      .then((r) => r.json())
      .then((data) => setBooks(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-[#d4d4d4] relative overflow-hidden">
      {/* Background ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-900/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-950/10 blur-[150px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(150,75,0,0.02)_1px,transparent_1px)] bg-[length:60px_60px] opacity-20" />
      </div>

      <div className="relative max-w-7xl mx-auto px-8 py-16 md:px-16">
        {/* Header */}
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 border border-amber-900/30 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md">
              <Library className="w-7 h-7 text-amber-600/60" />
            </div>
            <div>
              <h1
                className="text-4xl font-bold text-amber-50/90 leading-none"
                style={{ fontFamily: 'var(--font-hand), cursive' }}
              >
                Public Rack
              </h1>
              <p className="text-amber-100/20 text-sm mt-1" style={{ fontFamily: 'var(--font-hand), cursive' }}>
                Public stories from the vault
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-100/20 hover:text-amber-400 transition-colors"
            style={{ fontFamily: 'var(--font-hand), cursive' }}
          >
            ← FlipScript
          </Link>
        </header>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="w-8 h-8 text-amber-600/40 animate-spin" />
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <BookOpen className="w-16 h-16 text-amber-900/30" />
            <p className="text-amber-100/20 text-lg" style={{ fontFamily: 'var(--font-hand), cursive' }}>
              The rack is empty. Be the first to publish.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {books.map((book, i) => (
              <motion.div
                key={book._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={book.shareId ? `/public/${book.shareId}` : '#'}
                  className="group flex flex-col gap-3"
                >
                  {/* Book cover */}
                  <div
                    className="relative overflow-hidden rounded-xl shadow-xl shadow-black/50 transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl"
                    style={{ aspectRatio: '2/3' }}
                  >
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      /* Default cover */
                      <div className="w-full h-full bg-gradient-to-br from-[#2a1505] via-[#1a0f03] to-[#0d0700] flex flex-col items-center justify-end p-4"
                        style={{
                          backgroundImage: `repeating-linear-gradient(45deg,transparent,transparent 15px,rgba(180,120,40,0.1) 15px,rgba(180,120,40,0.1) 16px)`,
                        }}
                      >
                        <div className="absolute inset-2 border border-amber-700/20 rounded-lg pointer-events-none" />
                        <p
                          className="text-amber-100/70 text-xs font-bold text-center leading-tight"
                          style={{ fontFamily: 'var(--font-hand), cursive' }}
                        >
                          {book.title}
                        </p>
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3 text-amber-400" />
                        <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider">Read</span>
                      </div>
                    </div>

                    {/* Spine shadow */}
                    <div className="absolute left-0 top-0 w-3 h-full bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
                  </div>

                  {/* Meta */}
                  <div className="px-1">
                    <h3
                      className="text-amber-50/90 text-base font-bold leading-snug line-clamp-2 group-hover:text-amber-300 transition-colors"
                      style={{ fontFamily: 'var(--font-hand), cursive' }}
                    >
                      {book.title}
                    </h3>
                    {book.penName && (
                      <p
                        className="text-amber-100/50 text-sm mt-1 truncate"
                        style={{ fontFamily: 'var(--font-hand), cursive' }}
                      >
                        {book.penName}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <footer className="mt-24 border-t border-amber-900/10 pt-8 text-center text-amber-100/10 text-[10px] font-bold tracking-[0.4em] uppercase"
          style={{ fontFamily: 'var(--font-hand), cursive' }}>
          FlipScript Public Rack
        </footer>
      </div>
    </div>
  );
}

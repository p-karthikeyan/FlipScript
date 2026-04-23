'use client';

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { BookOpen, Feather, PenTool, Bookmark, ArrowRight, Library } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthModal } from "@/components/AuthModal";
import { CustomCursor } from "@/components/CustomCursor";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const router = useRouter();
  const [rackBooks, setRackBooks] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/rack')
      .then((r) => r.json())
      .then((d) => setRackBooks(Array.isArray(d) ? d.slice(0, 12) : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="h-screen w-full bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-t-2 border-amber-800/50 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] text-[#d4d4d4] overflow-hidden selection:bg-amber-900/30 font-sans">
      <CustomCursor />
      
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "FlipScript",
            "url": "https://flipscript.app",
            "description": "An immersive digital book writing and reading platform with realistic page flips and secure storage.",
            "applicationCategory": "DesignApplication, MultimediaApplication",
            "operatingSystem": "All",
            "keywords": "flip book, type online, book writing, reading online, digital manuscript",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "author": {
              "@type": "Organization",
              "name": "FlipScript"
            }
          })
        }}
      />

      {/* Background Ambience: Ink on Parchment style */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-900/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-amber-900/5 blur-[120px] rounded-full" />

        {/* Subtle Paper Texture */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/old-mathematics.png')] pointer-events-none" />

        {/* Floating Ink Droplets (Decorative) */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.2, scale: 1 }}
            transition={{ delay: i * 0.4, duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute rounded-full bg-amber-900/20 blur-xl"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 200 + 100}px`,
              height: `${Math.random() * 200 + 100}px`,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-amber-900/30 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md">
            <Feather className="w-5 h-5 text-amber-600/80" />
          </div>
          <span className="text-2xl tracking-tighter font-hand text-amber-100/90">
            FlipScript
          </span>
        </div>

        <div className="flex items-center gap-8 font-hand">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="text-lg text-amber-100/40 hover:text-amber-100 transition-colors"
          >
            Sign-in
          </button>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-6 py-2 border border-amber-900/40 text-amber-200/90 text-lg rounded-full hover:bg-amber-900/10 transition-all hover:border-amber-700/60"
          >
            Start Writing
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-24 pb-32 text-center max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="space-y-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-900/5 border border-amber-900/20 text-[11px] font-bold uppercase tracking-[0.3em] text-amber-500/80">
            <PenTool className="w-3 h-3" />
            Analog Souls, Digital Paper
          </div>

          <h1 className="text-7xl md:text-9xl font-hand tracking-tight leading-[0.85] text-amber-50/90">
            Your Book <br />
            <span className="text-amber-500/40">Breathes Here.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl md:text-2xl font-hand text-amber-100/30 leading-relaxed italic">
            A sanctuary for stories. No distractions, just the sound of virtual pages
            turning and the permanence of shared memory.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="group relative px-10 py-5 bg-amber-900/10 border border-amber-800/40 rounded-2xl font-hand text-2xl text-amber-200/90 hover:bg-amber-800/20 transition-all hover:-translate-y-1 shadow-[0_0_30px_rgba(150,75,0,0.05)]"
            >
              <span className="flex items-center gap-3">
                Enter the Vault <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform opacity-50" />
              </span>
            </button>
            <Link
              href="/editor/guest"
              className="px-10 py-5 bg-transparent border border-white/5 rounded-2xl font-hand text-2xl text-white/20 hover:text-white/40 hover:border-white/10 transition-all"
            >
              Write Anonymously
            </Link>
          </div>
        </motion.div>

      </main>

      {/* Public Rack Section */}
      <section className="relative z-10 px-8 pb-40 max-w-7xl mx-auto">
        {/* Divider */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-900/30 to-transparent mb-24" />

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-14"
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Library className="w-5 h-5 text-amber-600/60" />
              <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-amber-600/60 font-hand">
                Community
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-hand font-bold text-amber-50/80 leading-tight">
              Public Rack
            </h2>
            <p className="text-xl font-hand text-amber-100/25 italic mt-3">
              Stories written by real people, open for anyone to read.
            </p>
          </div>
          <Link
            href="/rack"
            className="flex items-center gap-2 px-6 py-3 border border-amber-900/30 rounded-full font-hand text-amber-400/70 hover:text-amber-300 hover:border-amber-700/50 hover:bg-amber-900/10 transition-all text-sm font-bold uppercase tracking-widest whitespace-nowrap"
          >
            Browse All <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {rackBooks.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 gap-4 border border-dashed border-amber-900/20 rounded-3xl">
            <BookOpen className="w-12 h-12 text-amber-900/30" />
            <p className="font-hand text-amber-100/20 text-lg italic">
              No books published yet. Be the first.
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="mt-2 px-6 py-2.5 border border-amber-900/30 rounded-full font-hand text-amber-500/60 hover:text-amber-400 hover:border-amber-700/50 transition-all text-sm"
            >
              Start writing →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {rackBooks.map((book, i) => (
              <motion.div
                key={book._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -6 }}
              >
                <Link
                  href={book.shareId ? `/public/${book.shareId}` : '/rack'}
                  className="group flex flex-col gap-3"
                >
                  {/* Cover */}
                  <div
                    className="relative overflow-hidden rounded-2xl shadow-xl shadow-black/60 transition-shadow duration-300 group-hover:shadow-2xl group-hover:shadow-amber-900/20"
                    style={{ aspectRatio: '2/3' }}
                  >
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full bg-gradient-to-br from-[#2a1505] via-[#1a0f03] to-[#0d0700] flex flex-col items-end justify-end p-4"
                        style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 15px,rgba(180,120,40,0.08) 15px,rgba(180,120,40,0.08) 16px)' }}
                      >
                        <div className="absolute inset-2 border border-amber-700/20 rounded-xl pointer-events-none" />
                        <p className="text-amber-100/50 text-xs font-bold text-right leading-tight line-clamp-3 font-hand">
                          {book.title}
                        </p>
                      </div>
                    )}
                    {/* Spine */}
                    <div className="absolute left-0 top-0 w-3 h-full bg-gradient-to-r from-black/50 to-transparent pointer-events-none" />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 rounded-full px-4 py-2 flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-amber-300 text-[11px] font-bold uppercase tracking-wider font-hand">Read</span>
                      </div>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="px-0.5">
                    <h3 className="text-amber-50/90 text-sm font-bold leading-snug line-clamp-2 group-hover:text-amber-300 transition-colors font-hand">
                      {book.title}
                    </h3>
                    {book.penName && (
                      <p className="text-amber-100/40 text-xs mt-0.5 truncate font-hand">
                        {book.penName}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-amber-900/10 py-20 px-8 text-center bg-black/20">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
          <div className="font-hand text-4xl text-amber-100/20">FlipScript</div>
          <div className="flex gap-12 text-[10px] tracking-[0.5em] text-white/10 uppercase font-bold">
            <span>Book Repository</span>
            <span>Privacy First</span>
            <span>No Tracking</span>
          </div>
          <p className="text-[10px] tracking-[0.2em] text-white/5 uppercase font-medium mt-4">
            &copy; FlipScripts. Dedicated to the craft of writing.
          </p>
        </div>
      </footer>

      {/* Custom Styles for Font Selection */}
      <style jsx global>{`
        .font-hand {
          font-family: var(--font-hand), cursive;
        }
      `}</style>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Welcome to FlipScript"
        description="Verify your identity to secure your books in the vault."
      />
    </div>
  );
}

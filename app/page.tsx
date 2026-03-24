'use client';

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { BookOpen, Feather, PenTool, Bookmark, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthModal } from "@/components/AuthModal";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const router = useRouter();

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
            Your Manuscript <br />
            <span className="text-amber-500/40 italic">Breathes Here.</span>
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

        {/* Artistic Visual Element */}
        <div className="relative mt-40 w-full max-w-4xl opacity-40 group">
           <div className="absolute inset-0 bg-amber-900/5 blur-[100px] rounded-full group-hover:bg-amber-800/10 transition-colors" />
           <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-900/40 to-transparent" />
           <div className="py-20 flex items-center justify-center gap-20">
              <Bookmark className="w-8 h-8 text-amber-900/40" />
              <Feather className="w-12 h-12 text-amber-800/40 rotate-12" />
              <BookOpen className="w-8 h-8 text-amber-900/40 -scale-x-100" />
           </div>
           <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-900/40 to-transparent" />
        </div>

        {/* Philosophy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-40 w-full text-left font-hand">
          {[
            {
              title: "Weight of Paper",
              desc: "Engineered physics that mimic the tactile feedback of a physical journal.",
            },
            {
              title: "Eternal Storage",
              desc: "Ink that never fades. Your manuscripts are secured in the MongoDB deep vault.",
            },
            {
              title: "Silent Focus",
              desc: "Zero clutter. Just you, the pen, and the infinite horizon of the page.",
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="space-y-4 border-l border-amber-900/20 pl-6"
            >
              <h3 className="text-3xl font-bold text-amber-400/60 leading-none">{item.title}</h3>
              <p className="text-lg text-amber-100/20 leading-relaxed italic">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-amber-900/10 py-20 px-8 text-center bg-black/20">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
          <div className="font-hand text-4xl text-amber-100/20">FlipScript</div>
          <div className="flex gap-12 text-[10px] tracking-[0.5em] text-white/10 uppercase font-bold">
             <span>Manuscript Repository</span>
             <span>Privacy First</span>
             <span>No Tracking</span>
          </div>
          <p className="text-[10px] tracking-[0.2em] text-white/5 uppercase font-medium mt-4">
             &copy; MCMXXVI Anti-Gravity Labs. Dedicated to the craft of writing.
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
        description="Verify your identity to secure your manuscripts in the vault."
      />
    </div>
  );
}

'use client';

import { motion } from "framer-motion";
import { Feather, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState, ReactNode } from "react";
import { AuthModal } from "@/components/AuthModal";
import { CustomCursor } from "@/components/CustomCursor";

interface SEOLandingTemplateProps {
  heroBadge: string;
  heroTitle: ReactNode;
  heroSubtitle: string;
  contentSections: {
    title: string;
    content: ReactNode;
  }[];
  keywords: string[];
  ctaText?: string;
}

export function SEOLandingTemplate({
  heroBadge,
  heroTitle,
  heroSubtitle,
  contentSections,
  keywords,
  ctaText = "Start Writing"
}: SEOLandingTemplateProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] text-[#d4d4d4] overflow-x-hidden selection:bg-amber-900/30 font-sans pb-20">
      <CustomCursor />
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-900/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-amber-900/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/old-mathematics.png')] pointer-events-none" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-8 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 border border-amber-900/30 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md group-hover:border-amber-700/60 transition-colors">
            <Feather className="w-5 h-5 text-amber-600/80" />
          </div>
          <span className="text-2xl tracking-tighter font-hand text-amber-100/90 group-hover:text-amber-100 transition-colors">
            FlipScript
          </span>
        </Link>

        <div className="flex items-center gap-8 font-hand">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-6 py-2 border border-amber-900/40 text-amber-200/90 text-lg rounded-full hover:bg-amber-900/10 transition-all hover:border-amber-700/60"
          >
            Start Writing
          </button>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-20 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-900/5 border border-amber-900/20 text-[11px] font-bold uppercase tracking-[0.3em] text-amber-500/80">
            {heroBadge}
          </div>

          <h1 className="text-5xl md:text-7xl font-hand tracking-tight leading-tight text-amber-50/90">
            {heroTitle}
          </h1>

          <p className="max-w-2xl mx-auto text-xl md:text-2xl font-hand text-amber-100/40 leading-relaxed italic">
            {heroSubtitle}
          </p>

          <div className="pt-8">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="group relative px-10 py-5 bg-amber-900/10 border border-amber-800/40 rounded-2xl font-hand text-2xl text-amber-200/90 hover:bg-amber-800/20 transition-all hover:-translate-y-1"
            >
              <span className="flex items-center gap-3">
                {ctaText} <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform opacity-50" />
              </span>
            </button>
          </div>
        </motion.div>

        <div className="mt-32 text-left space-y-24 max-w-4xl">
          {contentSections.map((section, idx) => (
            <section key={idx} className="space-y-8">
              <h2 className="text-4xl font-hand text-amber-400/70 border-b border-amber-900/20 pb-4">
                {section.title}
              </h2>
              <div className="text-amber-100/50 leading-relaxed text-lg italic">
                {section.content}
              </div>
            </section>
          ))}

          <section className="space-y-6 border-t border-amber-900/10 pt-16">
            <h2 className="text-3xl font-hand text-amber-400/70 uppercase tracking-widest text-sm opacity-50">Related Keywords</h2>
            <div className="flex gap-4 flex-wrap">
              {keywords.map((kw, i) => (
                <span key={i} className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] uppercase tracking-widest text-white/30 border border-white/5">
                  {kw}
                </span>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="mt-32 border-t border-amber-900/10 py-20 px-8 text-center bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          <div className="font-hand text-4xl text-amber-100/20">FlipScript</div>
          <p className="text-[10px] tracking-[0.2em] text-white/5 uppercase font-medium">
            &copy; FlipScripts. Dedicated to the craft of writing.
          </p>
        </div>
      </footer>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Start Your Journey"
        description="Create an account to save your book in our secure vault."
      />

      <style jsx global>{`
        .font-hand {
          font-family: var(--font-hand), cursive;
        }
      `}</style>
    </div>
  );
}

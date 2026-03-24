'use client';

import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { X, Feather, LogIn } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function AuthModal({ isOpen, onClose, title, description }: AuthModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[#0f0f0f] border border-amber-900/20 rounded-[40px] p-10 overflow-hidden"
          >
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-900/10 blur-[60px] pointer-events-none rounded-full" />
            
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors text-white/20 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-amber-900/10 border border-amber-900/20 flex items-center justify-center mb-6">
                <Feather className="w-8 h-8 text-amber-500/60" />
              </div>
              
              <h2 className="text-3xl font-hand text-amber-50/90 mb-2">
                {title || "Save Your Manuscript"}
              </h2>
              <p className="text-lg font-hand text-amber-100/30 mb-8 leading-relaxed italic">
                {description || "Join the archive to export your manuscript and secure it in our deep vault."}
              </p>

              <button
                onClick={() => signIn("google")}
                className="w-full py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/90 active:scale-95 transition-all shadow-xl"
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="G" />
                Continue with Google
              </button>
              
              <div className="mt-8 pt-8 border-t border-white/5 w-full flex flex-col items-center gap-1">
                 <span className="text-[10px] tracking-[0.3em] uppercase text-white/10 font-bold">Secure Private Access</span>
                 <span className="text-[10px] tracking-[0.3em] uppercase text-white/10 font-bold">No tracking. No ads.</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

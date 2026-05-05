'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, PenTool, Library, Globe, Infinity as InfinityIcon, Share2, Eye, ImageIcon,
} from 'lucide-react';

/* ─── Feature definitions ─────────────────────────────────────────────────── */

const features = [
  {
    id: 'flip',
    icon: BookOpen,
    label: 'Flip Mode',
    tagline: 'Turn pages like a real book',
    description:
      'Every read is a tactile experience. Drag or click to flip pages with a physics-driven animation — the closest thing to paper on a screen.',
    demo: FlipDemo,
  },
  {
    id: 'write',
    icon: PenTool,
    label: 'Write Mode',
    tagline: 'Distraction-free writing canvas',
    description:
      'A full-screen editor that stays out of your way. Formatted pages, live word count, and nothing else between you and the story.',
    demo: WriteDemo,
  },
  {
    id: 'library',
    icon: Library,
    label: 'Your Library',
    tagline: 'All your books, one place',
    description:
      'Every book you create lives in your private library. Flip through covers, pick up where you left off, keep the vault tidy.',
    demo: LibraryDemo,
  },
  {
    id: 'rack',
    icon: Globe,
    label: 'Public Rack',
    tagline: 'Publish for the world to read',
    description:
      'One toggle puts your book on the Public Rack — a community shelf anyone can browse and read without signing in.',
    demo: PublishDemo,
  },
  {
    id: 'unlimited',
    icon: InfinityIcon,
    label: 'Unlimited Books',
    tagline: 'Write without limits',
    description:
      'Create as many books as your imagination demands. No caps on titles, pages, or chapters — ever.',
    demo: UnlimitedDemo,
  },
  {
    id: 'share',
    icon: Share2,
    label: 'Share Read-Only',
    tagline: 'Send a link, keep control',
    description:
      'Generate a private share link for any book. Recipients can read but never edit. Revoke access any time.',
    demo: ShareDemo,
  },
  {
    id: 'public',
    icon: Eye,
    label: 'Read Public Books',
    tagline: 'Explore stories from real writers',
    description:
      'Browse the Public Rack and open any book instantly. No account, no friction — just reading.',
    demo: PublicReadDemo,
  },
  {
    id: 'cover',
    icon: ImageIcon,
    label: 'Custom Covers',
    tagline: 'Design a cover that fits the story',
    description:
      'Upload your own artwork or choose a generated cover. Your book spine on the shelf, exactly how you imagined it.',
    demo: CoverDemo,
  },
] as const;

/* ─── Main component ──────────────────────────────────────────────────────── */

export function FeaturesShowcase() {
  const [active, setActive] = useState<string>('flip');
  const [autoplay, setAutoplay] = useState(true);

  // Cycle through features automatically
  useEffect(() => {
    if (!autoplay) return;
    const ids = features.map((f) => f.id);
    const timer = setInterval(() => {
      setActive((cur) => {
        const idx = ids.indexOf(cur as typeof ids[number]);
        return ids[(idx + 1) % ids.length];
      });
    }, 3500);
    return () => clearInterval(timer);
  }, [autoplay]);

  const current = features.find((f) => f.id === active)!;
  const DemoComponent = current.demo;

  return (
    <section className="relative z-10 px-4 sm:px-8 pb-24 max-w-7xl mx-auto">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-900/5 border border-amber-900/20 text-[10px] font-bold uppercase tracking-[0.35em] text-amber-600/70 mb-6">
          <BookOpen className="w-3 h-3" />
          Everything you need
        </div>
        <h2 className="text-5xl md:text-6xl font-hand font-bold text-amber-50/80 leading-tight">
          Built for the craft
        </h2>
        <p className="mt-4 text-xl font-hand text-amber-100/25 italic max-w-xl mx-auto">
          Click any feature to see it in action.
        </p>
      </motion.div>

      {/* Interactive layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-stretch">

        {/* Feature pill list */}
        <div
          className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none lg:justify-between"
          onMouseEnter={() => setAutoplay(false)}
          onMouseLeave={() => setAutoplay(true)}
        >
          {features.map((f) => {
            const Icon = f.icon;
            const isActive = active === f.id;
            return (
              <button
                key={f.id}
                onClick={() => { setActive(f.id); setAutoplay(false); }}
                className={`
                  group relative flex items-center gap-3 px-4 py-3 rounded-xl text-left whitespace-nowrap lg:whitespace-normal
                  border transition-all duration-300 flex-shrink-0 lg:flex-shrink lg:flex-1
                  ${isActive
                    ? 'border-amber-800/50 bg-amber-900/15 text-amber-200'
                    : 'border-white/5 bg-white/[0.02] text-amber-100/40 hover:border-amber-900/30 hover:text-amber-100/70 hover:bg-amber-900/8'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="feature-highlight"
                    className="absolute inset-0 rounded-xl bg-amber-900/10 border border-amber-800/30"
                    transition={{ type: 'spring', duration: 0.4 }}
                  />
                )}
                <div className={`relative z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isActive ? 'bg-amber-900/30' : 'bg-white/5'}`}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-amber-100/30'}`} />
                </div>
                <div className="relative z-10 min-w-0">
                  <div className={`text-sm font-bold font-hand transition-colors ${isActive ? 'text-amber-200' : 'text-amber-100/50'}`}>
                    {f.label}
                  </div>
                  <div className={`text-[11px] font-hand hidden lg:block transition-colors leading-tight mt-0.5 ${isActive ? 'text-amber-100/50' : 'text-amber-100/20'}`}>
                    {f.tagline}
                  </div>
                </div>
                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    layoutId="active-bar"
                    className="absolute right-0 top-2 bottom-2 w-0.5 rounded-full bg-amber-600/60 hidden lg:block"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Demo panel */}
        <div
          className="rounded-2xl border border-amber-900/20 bg-black/30 backdrop-blur-sm overflow-hidden"
          onMouseEnter={() => setAutoplay(false)}
          onMouseLeave={() => setAutoplay(true)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full flex flex-col md:flex-row"
            >
              {/* Text side */}
              <div className="p-8 md:p-10 flex flex-col justify-center md:max-w-[280px] border-b md:border-b-0 md:border-r border-amber-900/15 md:h-full">
                <div className="w-10 h-10 rounded-xl bg-amber-900/20 flex items-center justify-center mb-5">
                  <current.icon className="w-5 h-5 text-amber-500/80" />
                </div>
                <h3 className="text-2xl font-hand font-bold text-amber-50/90 mb-2">
                  {current.label}
                </h3>
                <p className="text-sm font-hand text-amber-100/40 leading-relaxed">
                  {current.description}
                </p>

                {/* Auto-play progress bar */}
                {autoplay && (
                  <div className="mt-6 h-0.5 bg-amber-900/20 rounded-full overflow-hidden">
                    <motion.div
                      key={active + '-bar'}
                      className="h-full bg-amber-700/60 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 3.5, ease: 'linear' }}
                    />
                  </div>
                )}
              </div>

              {/* Visual demo side */}
              <div className="flex-1 flex items-center justify-center p-8 min-h-[280px] md:min-h-0">
                <DemoComponent />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ─── Individual demo components ──────────────────────────────────────────── */

function FlipDemo() {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setFlipped((v) => !v), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative flex items-center justify-center w-full h-full select-none" style={{ perspective: 900 }}>
      {/* Book body */}
      <div className="relative" style={{ width: 220, height: 280 }}>
        {/* Back cover */}
        <div className="absolute inset-0 rounded-r-lg rounded-l-sm bg-gradient-to-br from-[#2a1505] to-[#0d0700] border border-amber-900/30 shadow-2xl" />

        {/* Spine */}
        <div className="absolute left-0 top-0 w-4 h-full bg-gradient-to-r from-black/70 to-transparent rounded-l-sm z-10" />

        {/* Pages stack */}
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-[#f5ead8] border-r border-amber-900/10"
            style={{ top: 4, bottom: 4, left: 14 + i * 0.8, right: 0, borderRadius: '0 4px 4px 0', zIndex: i + 1 }}
          />
        ))}

        {/* Flipping page */}
        <motion.div
          animate={{ rotateY: flipped ? -160 : 0, z: flipped ? 40 : 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          style={{ position: 'absolute', top: 4, bottom: 4, left: 14, right: 0, transformOrigin: 'left center', transformStyle: 'preserve-3d', zIndex: 10 }}
        >
          {/* Front face */}
          <div className="absolute inset-0 bg-[#f5ead8] rounded-r-md flex flex-col p-4 gap-2 overflow-hidden backface-hidden">
            <div className="h-1.5 w-3/4 bg-amber-900/20 rounded" />
            <div className="h-1.5 w-full bg-amber-900/10 rounded" />
            <div className="h-1.5 w-5/6 bg-amber-900/10 rounded" />
            <div className="h-1.5 w-2/3 bg-amber-900/10 rounded" />
            <div className="h-1.5 w-full bg-amber-900/10 rounded" />
            <div className="h-1.5 w-4/5 bg-amber-900/10 rounded" />
            <div className="mt-2 h-1.5 w-3/4 bg-amber-900/20 rounded" />
            <div className="h-1.5 w-full bg-amber-900/10 rounded" />
            <div className="h-1.5 w-5/6 bg-amber-900/10 rounded" />
          </div>
          {/* Back face (reversed) */}
          <div className="absolute inset-0 bg-[#f0e2ca] rounded-l-md flex flex-col p-4 gap-2 overflow-hidden" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
            <div className="h-1.5 w-2/3 bg-amber-900/20 rounded" />
            <div className="h-1.5 w-full bg-amber-900/10 rounded" />
            <div className="h-1.5 w-4/5 bg-amber-900/10 rounded" />
          </div>
        </motion.div>

        {/* Front cover */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#3a2008] via-[#2a1505] to-[#1a0d02] border border-amber-800/40 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-end p-5 z-20 pointer-events-none"
          style={{ opacity: flipped ? 0 : 1, transition: 'opacity 0.35s' }}
        >
          <div className="absolute inset-2 border border-amber-700/20 rounded-md pointer-events-none" />
          <p className="text-amber-200/60 text-xs font-hand text-center leading-snug">The Art of<br/>Page Turning</p>
        </div>

        {/* Shadow */}
        <div className="absolute -bottom-4 left-4 right-4 h-6 bg-black/60 blur-md rounded-full -z-10" />
      </div>

      {/* Hint */}
      <motion.p
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-0 text-[10px] font-hand text-amber-100/30 uppercase tracking-widest"
      >
        page turning
      </motion.p>
    </div>
  );
}

function WriteDemo() {
  const lines = [
    'Chapter One',
    '',
    'The morning light filtered through the',
    'dusty curtains, casting amber shadows',
    'across the empty desk where she had',
    'once written everything.',
    '',
    'She picked up the pen.|',
  ];
  const [visible, setVisible] = useState(0);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    if (visible >= lines.length) return;
    const t = setTimeout(() => setVisible((v) => v + 1), 340);
    return () => clearTimeout(t);
  }, [visible, lines.length]);

  useEffect(() => {
    const t = setInterval(() => setBlink((b) => !b), 530);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full max-w-xs">
      {/* Editor chrome */}
      <div className="rounded-xl border border-amber-900/20 bg-[#0d0d0d] overflow-hidden shadow-2xl">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-amber-900/15 bg-black/30">
          <div className="w-2.5 h-2.5 rounded-full bg-red-900/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-900/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-900/50" />
          <div className="flex-1" />
          <div className="text-[9px] text-amber-100/20 font-hand tracking-widest uppercase">FlipScript — Write</div>
        </div>

        {/* Page */}
        <div className="px-6 py-5 min-h-[200px] bg-[#f5ead8] font-hand">
          {lines.slice(0, visible).map((line, i) => (
            <div
              key={i}
              className={`leading-relaxed ${i === 0 ? 'text-sm font-bold text-[#3a1f00] mb-2' : 'text-xs text-[#5a3a1a]'} ${line === '' ? 'h-3' : ''}`}
            >
              {line.replace('|', '')}
              {i === visible - 1 && line.includes('|') && (
                <span className={`inline-block w-0.5 h-3 bg-amber-800 ml-px align-middle transition-opacity ${blink ? 'opacity-100' : 'opacity-0'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-1.5 border-t border-amber-900/15 bg-black/20">
          <span className="text-[9px] text-amber-100/20 font-hand">Page 1 of 1</span>
          <span className="text-[9px] text-amber-100/20 font-hand">127 words</span>
        </div>
      </div>
    </div>
  );
}

function LibraryDemo() {
  const colors = [
    ['#3a1505', '#1a0800'],
    ['#0a1a2e', '#051020'],
    ['#1a1a0a', '#0d0d05'],
    ['#2a0a1a', '#150510'],
    ['#0a2a1a', '#051510'],
    ['#1a0a2a', '#0d0515'],
  ];
  const titles = ['Ember & Ash', 'The Blue Hour', 'Verdant', 'Crimson Ink', 'Sea Whispers', 'Violet Dusk'];

  return (
    <div className="grid grid-cols-3 gap-3">
      {colors.map(([c1, c2], i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ y: -4, scale: 1.03 }}
          className="group cursor-pointer"
        >
          <div
            className="relative overflow-hidden rounded-lg shadow-xl"
            style={{ aspectRatio: '55/75', background: `linear-gradient(135deg, ${c1}, ${c2})` }}
          >
            {/* Subtle pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(255,255,255,0.05) 8px,rgba(255,255,255,0.05) 9px)' }} />
            <div className="absolute inset-1 border border-white/10 rounded-md pointer-events-none" />
            <div className="absolute left-0 top-0 w-2 h-full bg-gradient-to-r from-black/50 to-transparent" />
            <div className="absolute inset-0 flex items-end p-2">
              <p className="text-[7px] font-hand text-white/50 leading-tight line-clamp-2">{titles[i]}</p>
            </div>
            <div className="absolute inset-0 bg-amber-400/0 group-hover:bg-amber-400/5 transition-colors rounded-lg" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function PublishDemo() {
  const [published, setPublished] = useState(false);

  useEffect(() => {
    const cycle = () => {
      setPublished(false);
      setTimeout(() => setPublished(true), 1200);
    };
    cycle();
    const t = setInterval(cycle, 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-xs">
      {/* Book preview */}
      <div className="relative">
        <div className="w-24 h-32 rounded-lg bg-gradient-to-br from-[#3a1505] to-[#0d0700] border border-amber-800/30 shadow-xl flex items-end p-3">
          <p className="text-[8px] font-hand text-amber-200/40 leading-tight">My First Novel</p>
        </div>
        <AnimatePresence>
          {published && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-3 -right-3 bg-emerald-900/80 border border-emerald-600/40 rounded-full px-2.5 py-1 flex items-center gap-1 shadow-lg"
            >
              <Globe className="w-2.5 h-2.5 text-emerald-400" />
              <span className="text-[9px] font-hand font-bold text-emerald-300">Published</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toggle */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-amber-900/20 bg-black/30">
        <span className="text-[11px] font-hand text-amber-100/40">Public Rack</span>
        <div
          className={`relative w-9 h-5 rounded-full transition-colors duration-500 ${published ? 'bg-emerald-700/70' : 'bg-white/10'}`}
        >
          <motion.div
            animate={{ x: published ? 16 : 2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute top-0.5 w-4 h-4 rounded-full bg-white/90 shadow-sm"
          />
        </div>
      </div>

      <AnimatePresence>
        {published && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[10px] font-hand text-amber-100/30 italic text-center"
          >
            Now visible on the Public Rack
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function UnlimitedDemo() {
  const count = 8;
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative flex items-end justify-center" style={{ width: 180, height: 120 }}>
        {[...Array(count)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 200, damping: 18 }}
            className="absolute rounded shadow-lg border border-white/10"
            style={{
              width: 52,
              height: 70 + i * 1,
              bottom: 0,
              left: `${i * 14}px`,
              background: `hsl(${24 + i * 12}, ${40 + i * 3}%, ${8 + i * 1.5}%)`,
              zIndex: i,
              transform: `rotate(${-6 + i * 1.5}deg)`,
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-900/10 border border-amber-900/20">
        <InfinityIcon className="w-4 h-4 text-amber-500/70" />
        <span className="text-sm font-hand text-amber-200/60 font-bold">No limits, ever</span>
      </div>
    </div>
  );
}

function ShareDemo() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const cycle = () => {
      setCopied(false);
      setTimeout(() => setCopied(true), 1400);
      setTimeout(() => setCopied(false), 2800);
    };
    cycle();
    const t = setInterval(cycle, 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xs">
      {/* Shared book illustration */}
      <div className="flex items-end gap-3">
        <div className="w-16 h-22 rounded-lg bg-gradient-to-br from-[#1a0a2a] to-[#0a0515] border border-purple-900/30 shadow-xl flex items-end p-2">
          <p className="text-[7px] font-hand text-purple-200/40 leading-tight">Secret Garden</p>
        </div>
        <motion.div
          animate={{ x: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Share2 className="w-5 h-5 text-amber-600/50" />
        </motion.div>
      </div>

      {/* Share link bar */}
      <div className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-amber-900/20 bg-black/40">
        <div className="flex-1 text-[10px] font-hand text-amber-100/30 truncate">
          flipscript.app/public/xk7m3q…
        </div>
        <motion.button
          animate={{ scale: copied ? [1, 1.15, 1] : 1 }}
          className={`px-2.5 py-1 rounded-md text-[9px] font-hand font-bold transition-colors ${copied ? 'bg-emerald-800/60 text-emerald-300' : 'bg-amber-900/30 text-amber-300/70'}`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </motion.button>
      </div>

      <p className="text-[10px] font-hand text-amber-100/25 italic text-center">
        Recipients can read — never edit
      </p>
    </div>
  );
}

function PublicReadDemo() {
  const books = [
    { title: 'The Lost Atlas', color: '#1a0d2a', accent: '#7c3aed' },
    { title: 'Salt & Stone', color: '#0a1a0d', accent: '#16a34a' },
    { title: 'Dust & Neon', color: '#1a0a00', accent: '#d97706' },
    { title: 'Ocean\'s Edge', color: '#051020', accent: '#0ea5e9' },
  ];
  const [reading, setReading] = useState<number | null>(null);

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setReading(i % books.length);
      i++;
    }, 900);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col gap-2.5 w-full max-w-xs">
      {books.map((book, i) => (
        <motion.div
          key={i}
          animate={{ backgroundColor: reading === i ? 'rgba(180,120,40,0.06)' : 'rgba(0,0,0,0)' }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-amber-900/10 transition-colors"
        >
          <div
            className="w-8 h-11 rounded flex-shrink-0 shadow-md border border-white/10"
            style={{ background: `linear-gradient(135deg, ${book.color}, #000)` }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-hand font-bold text-amber-50/80 truncate">{book.title}</p>
          </div>
          <AnimatePresence>
            {reading === i && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-900/20 border border-amber-700/30"
              >
                <Eye className="w-2.5 h-2.5 text-amber-400" />
                <span className="text-[8px] font-hand text-amber-300 font-bold">Reading</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

function CoverDemo() {
  const covers = [
    { type: 'gradient', colors: ['#3a1505', '#0d0700'], label: 'Autumn Ink' },
    { type: 'gradient', colors: ['#051020', '#020a18'], label: 'Midnight' },
    { type: 'gradient', colors: ['#0a1a05', '#050d00'], label: 'Forest' },
    { type: 'gradient', colors: ['#1a0520', '#0d0215'], label: 'Dusk' },
    { type: 'gradient', colors: ['#201005', '#100802'], label: 'Ember' },
    { type: 'upload', colors: ['#1a1a1a', '#111'], label: 'Your Art' },
  ];
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSelected((v) => (v + 1) % covers.length), 800);
    return () => clearInterval(t);
  }, []);

  const cur = covers[selected];

  return (
    <div className="flex items-center gap-8">
      {/* Book preview */}
      <div className="relative flex-shrink-0">
        <motion.div
          key={selected}
          initial={{ rotateY: -15, opacity: 0.7 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="w-24 h-32 rounded-lg shadow-2xl border border-white/10 flex flex-col items-end justify-end p-3 relative overflow-hidden"
          style={{
            background: cur.type === 'upload'
              ? 'linear-gradient(135deg, #1a1a1a, #111)'
              : `linear-gradient(135deg, ${cur.colors[0]}, ${cur.colors[1]})`,
          }}
        >
          {cur.type === 'upload' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="w-7 h-7 text-white/20" />
            </div>
          )}
          <div className="absolute inset-1.5 border border-white/10 rounded-md pointer-events-none" />
          <div className="absolute left-0 top-0 w-2.5 h-full bg-gradient-to-r from-black/60 to-transparent" />
          <p className="relative text-[7px] font-hand text-white/40 leading-tight">{cur.label}</p>
        </motion.div>
        <div className="absolute -bottom-3 left-2 right-2 h-5 bg-black/50 blur-md rounded-full -z-10" />
      </div>

      {/* Palette */}
      <div className="flex flex-col gap-2">
        <p className="text-[9px] font-hand text-amber-100/30 uppercase tracking-widest mb-1">Choose Cover</p>
        <div className="grid grid-cols-3 gap-1.5">
          {covers.map((c, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className="relative w-8 h-8 rounded-md border-2 transition-all overflow-hidden"
              style={{
                borderColor: selected === i ? 'rgba(217,119,6,0.7)' : 'rgba(255,255,255,0.08)',
                background: `linear-gradient(135deg, ${c.colors[0]}, ${c.colors[1]})`,
              }}
            >
              {c.type === 'upload' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="w-3 h-3 text-white/30" />
                </div>
              )}
            </button>
          ))}
        </div>
        <p className="text-[9px] font-hand text-amber-100/20 italic mt-1">or upload your own</p>
      </div>
    </div>
  );
}

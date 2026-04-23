'use client';

import { useBookStore } from '@/store/useBookStore';
import { downloadBookAsPdf } from '@/lib/pdfExport';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, LogOut, Library, Share2, Globe, Lock, Copy, Check, X, ImageIcon, BookOpen, Loader2, ShieldCheck } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { CoverUploadModal } from './CoverUploadModal';

function CustomDropdown({ options, value, onChange, className }: any) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o: any) => o.value === value)?.label || value;

  return (
    <div className="relative">
      <button
        onMouseDown={(e) => { e.preventDefault(); setOpen(!open); }}
        className={`px-3 flex items-center justify-between gap-2.5 rounded-lg hover:bg-amber-900/20 text-amber-100/40 hover:text-amber-400 transition-colors bg-transparent text-[11px] ${className}`}
      >
        <span>{selectedLabel}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div 
              className="fixed inset-0 z-[190]" 
              onMouseDown={(e) => { e.preventDefault(); setOpen(false); }} 
            />
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-full mt-3 left-0 min-w-full whitespace-nowrap bg-[#0f0f0f] border border-amber-900/30 rounded-xl shadow-2xl overflow-hidden z-[200]"
            >
              <div className="flex flex-col py-1">
                {options.map((opt: any) => (
                  <button
                    key={opt.value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    style={opt.style}
                    className={`w-full text-left px-4 py-2 text-[11px] hover:bg-amber-900/40 transition-colors ${value === opt.value ? 'bg-amber-900/20 text-amber-400' : 'text-amber-100/60'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FloatingNavbar() {
  const title = useBookStore((s) => s.title);
  const setTitle = useBookStore((s) => s.setTitle);
  const newBook = useBookStore((s) => s.newBook);
  const isOwner = useBookStore((s) => s.isOwner);
  const shareId = useBookStore((s) => s.shareId);
  const setBook = useBookStore((s) => s.setBook);
  const coverImage = useBookStore((s) => s.coverImage);
  const penName = useBookStore((s) => s.penName);
  const publishedAt = useBookStore((s) => s.publishedAt);
  const publishStatus = useBookStore((s) => s.publishStatus);
  const setCoverImage = useBookStore((s) => s.setCoverImage);
  const setPenName = useBookStore((s) => s.setPenName);
  const setPublishedAt = useBookStore((s) => s.setPublishedAt);
  const setPublishStatus = useBookStore((s) => s.setPublishStatus);
  const setIsPublic = useBookStore((s) => s.setIsPublic);

  const { data: session, status } = useSession();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCoverOpen, setIsCoverOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [publishPenName, setPublishPenName] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fontName, setFontName] = useState('Patrick Hand');
  const [fontSize, setFontSize] = useState('5');
  const [refresh, setRefresh] = useState(0);
  const router = useRouter();

  // Re-render when selection changes to update active button states
  useEffect(() => {
    const handleSelectionChange = () => setRefresh(r => r + 1);
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const handleShare = async () => {
    if (status !== 'authenticated') {
      setIsAuthModalOpen(true);
      return;
    }
    // If we're on guest mode but authenticated, we can't share until saved to DB.
    // Actually, we could show a different message.
    const path = window.location.pathname;
    const id = path.split('/').pop();
    if (id === "guest") {
       // Maybe redirect to dashboard to create a new book? 
       // For now just toggle and show instructions or disable?
       // The user said "open the book (for a guest in read only mode.)"
    }
    setIsShareOpen(!isShareOpen);
  };

  const generatePublicLink = async () => {
     const path = window.location.pathname;
     const id = path.split('/').pop();
     if (id && id !== "guest") {
       const res = await fetch(`/api/books/${id}`, {
         method: "PUT",
         body: JSON.stringify({ generateShareId: true }),
         headers: { "Content-Type": "application/json" },
       });
       if (res.ok) {
         const updatedBook = await res.json();
         setBook(updatedBook);
       }
     }
  };

  const copyLink = () => {
    if (!shareId) return;
    
    // Construct public share URL using shareId
    const publicUrl = `${window.location.origin}/public/${shareId}`;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    setRefresh(r => r + 1);
  };

  const handleCoverUpload = async (url: string) => {
    setCoverImage(url);
    // Persist to DB
    const path = window.location.pathname;
    const id = path.split('/').pop();
    if (id && id !== 'guest') {
      await fetch(`/api/books/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ coverImage: url }),
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };

  const handlePublish = async () => {
    if (!publishPenName.trim()) return;
    setPublishing(true);
    try {
      const path = window.location.pathname;
      const id = path.split('/').pop();
      if (!id || id === 'guest') return;

      const res = await fetch(`/api/books/${id}/request-publish`, {
        method: 'POST',
        body: JSON.stringify({ penName: publishPenName.trim() }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const updated = await res.json();
        setPenName(publishPenName.trim());
        setPublishStatus('pending');
        // Store shareId generated by the API if new
        if (updated.shareId) {
          const s = useBookStore.getState();
          s.setBook({
            title: s.title, pages: s.pages,
            shareId: updated.shareId,
            coverImage: s.coverImage,
            penName: publishPenName.trim(),
            publishStatus: 'pending',
          });
        }
        setIsPublishOpen(false);
      }
    } finally {
      setPublishing(false);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-1/2 -translate-x-1/2 z-[100]">
        <div className="flex items-center gap-4 px-6 py-2.5 rounded-b-2xl bg-black/60 border-b border-x border-amber-900/30 shadow-2xl backdrop-blur-xl">
          {/* Group: File Actions */}
          {isOwner && (
            <div className="flex items-center gap-1.5 px-2 border-r border-amber-900/30 mr-1">
              <button
                onClick={() => { if (confirm("Start new story?")) newBook(); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-amber-900/20 text-amber-100/40 hover:text-amber-400 transition-colors group relative"
                title="New Book"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </button>
              <button
                onClick={async () => {
                  const book = useBookStore.getState();
                  const path = window.location.pathname;
                  if (path.startsWith('/editor/') && !path.includes('/guest')) {
                    const id = path.split('/').pop();
                    if (id) {
                      await fetch(`/api/books/${id}`, {
                        method: "PUT",
                        body: JSON.stringify({ title: book.title, pages: book.pages }),
                        headers: { "Content-Type": "application/json" },
                      }).catch(console.error);
                    }
                  }
                  router.push('/dashboard');
                }}
                className="px-3 h-8 flex items-center justify-center gap-2 rounded-lg bg-amber-900/10 border border-amber-900/20 text-amber-500/60 hover:text-amber-500 hover:bg-amber-900/20 hover:border-amber-700/40 transition-all font-bold text-[10px] uppercase tracking-widest"
                title="Return to Library"
              >
                <Library className="w-3.5 h-3.5" />
                <span>Library</span>
              </button>
            </div>
          )}

          {!isOwner && (
            <div className="flex items-center gap-1.5 px-4 border-r border-amber-900/30 mr-1">
               <span className="text-[10px] tracking-[0.4em] text-amber-500/60 font-bold uppercase">Reading Mode</span>
            </div>
          )}

          {/* Group: Text Styling */}
          {isOwner && (
            <div className="flex items-center gap-1 px-1 border-r border-amber-900/30 mr-1">
              <button
                onMouseDown={(e) => { e.preventDefault(); exec('bold'); }}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-sm font-bold ${
                  typeof document !== 'undefined' && document.queryCommandState('bold') 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                    : 'hover:bg-amber-900/20 text-amber-100/40 hover:text-amber-400'
                }`}
                title="Bold"
              >
                B
              </button>
              <button
                onMouseDown={(e) => { e.preventDefault(); exec('italic'); }}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-sm italic ${
                  typeof document !== 'undefined' && document.queryCommandState('italic') 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                    : 'hover:bg-amber-900/20 text-amber-100/40 hover:text-amber-400'
                }`}
                title="Italic"
              >
                I
              </button>

              <CustomDropdown
                value={fontName}
                onChange={(v: string) => {
                  setFontName(v);
                  exec('fontName', v);
                }}
                options={[
                  { label: 'Patrick Hand', value: 'Patrick Hand', style: { fontFamily: 'var(--font-hand), cursive', fontSize: '14px' } },
                  { label: 'Caveat', value: 'Caveat', style: { fontFamily: 'var(--font-caveat), cursive', fontSize: '14px' } },
                  { label: 'Dancing Script', value: 'Dancing Script', style: { fontFamily: 'var(--font-dancing), cursive', fontSize: '14px' } },
                  { label: 'Indie Flower', value: 'Indie Flower', style: { fontFamily: 'var(--font-indie), cursive', fontSize: '14px' } },
                  { label: 'Shadows Into Light', value: 'Shadows Into Light', style: { fontFamily: 'var(--font-shadows), cursive', fontSize: '14px' } },
                  { label: 'Kalam', value: 'Kalam', style: { fontFamily: 'var(--font-kalam), cursive', fontSize: '14px' } },
                  { label: 'Serif', value: 'serif', style: { fontFamily: 'serif', fontSize: '13px' } },
                  { label: 'Sans Serif', value: 'sans-serif', style: { fontFamily: 'sans-serif', fontSize: '13px' } },
                ]}
                className="h-8"
              />

              <CustomDropdown
                value={fontSize}
                onChange={(v: string) => {
                  setFontSize(v);
                  exec('fontSize', v);
                }}
                options={[
                  { label: 'Smallest', value: '1' },
                  { label: 'Smaller', value: '2' },
                  { label: 'Small', value: '3' },
                  { label: 'Default', value: '4' },
                  { label: 'Large', value: '5' },
                  { label: 'Larger', value: '6' },
                  { label: 'Largest', value: '7' }
                ]}
                className="h-8"
              />
            </div>
          )}

          {/* Center Group: Title Edit */}
          <div className="flex items-center px-4 min-w-[120px] max-w-[240px]">
            {isOwner ? (
               <input
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
                 className="bg-transparent text-[12px] font-bold text-amber-100/60 text-center outline-none focus:text-amber-400 transition-colors w-full tracking-wider"
                 placeholder="Untitled"
               />
            ) : (
               <div className="text-[12px] font-bold text-amber-100/80 text-center w-full tracking-tighter overflow-hidden truncate">
                 {title}
               </div>
            )}
          </div>

          {/* Cover + Publish buttons */}
          {isOwner && (
            <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-amber-900/30">
              <button
                onClick={() => setIsCoverOpen(true)}
                className="h-8 px-3 flex items-center justify-center gap-1.5 rounded-lg bg-amber-900/10 border border-amber-900/20 text-amber-500/60 hover:text-amber-400 hover:bg-amber-900/20 hover:border-amber-700/40 transition-all text-[10px] font-bold uppercase tracking-wider"
                title="Upload book cover"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Cover
              </button>
              {/* Publish button — adapts to the 4 states */}
              {publishStatus === 'approved' ? (
                <div className="h-8 px-3 flex items-center gap-1.5 rounded-lg bg-emerald-900/20 border border-emerald-700/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  <Check className="w-3 h-3" />
                  Published
                </div>
              ) : publishStatus === 'pending' ? (
                <div className="h-8 px-3 flex items-center gap-1.5 rounded-lg bg-amber-900/20 border border-amber-700/30 text-amber-400/70 text-[10px] font-bold uppercase tracking-wider">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Pending
                </div>
              ) : publishStatus === 'rejected' ? (
                <button
                  onClick={() => { setPublishPenName(penName ?? ''); setIsPublishOpen(true); }}
                  className="h-8 px-3 flex items-center gap-1.5 rounded-lg bg-red-900/20 border border-red-700/30 text-red-400 text-[10px] font-bold uppercase tracking-wider hover:bg-red-900/30 transition-all"
                  title="Rejected — click to re-submit"
                >
                  <X className="w-3 h-3" />
                  Rejected
                </button>
              ) : (
                <button
                  onClick={() => { setPublishPenName(penName ?? ''); setIsPublishOpen(true); }}
                  className="h-8 px-3 flex items-center gap-1.5 rounded-lg bg-amber-900/10 border border-amber-900/20 text-amber-500/60 hover:text-amber-400 hover:bg-amber-900/20 hover:border-amber-700/40 transition-all text-[10px] font-bold uppercase tracking-wider"
                  title="Request to publish on rack"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Publish
                </button>
              )}
            </div>
          )}

          {/* Right Group: Share */}
          <div className="flex items-center ml-1 pl-2 border-l border-amber-900/30 relative">
            <button
              onClick={handleShare}
              className={`h-8 px-4 flex items-center justify-center gap-2 rounded-lg bg-amber-900/10 border border-amber-900/30 text-amber-500/80 text-[11px] font-bold uppercase tracking-wider transition-all hover:bg-amber-900/30 hover:border-amber-700/50 hover:text-amber-400 ${isShareOpen ? 'bg-amber-900/30 text-amber-400' : ''}`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>SHARE</span>
            </button>

          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isShareOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 cursor-default">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#0f0f0f] border border-amber-900/20 rounded-[40px] p-8 overflow-hidden shadow-2xl shadow-amber-900/10"
            >
              {/* Background Ambience */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-900/10 blur-[60px] pointer-events-none rounded-full" />

              <button
                onClick={() => setIsShareOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors text-white/20 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-amber-900/10 border border-amber-900/20 flex items-center justify-center mb-6">
                  <Share2 className="w-7 h-7 text-amber-500/60" />
                </div>

                <h2 className="text-3xl font-hand text-amber-50/90 mb-2">
                  {shareId ? "Share Story" : "Secure Access"}
                </h2>
                <p className="text-sm font-hand text-amber-100/30 mb-8 leading-relaxed italic px-4">
                  {shareId 
                    ? "Your public link is ready. Share it with your readers across the stars."
                    : "Generate a secure access key to allow others to read your manuscript."}
                </p>

                <div className="w-full font-hand">
                  {window.location.pathname.includes('/guest') ? (
                     <div className="text-[10px] text-amber-100/10 italic uppercase tracking-[.3em] text-center py-4 leading-loose border-t border-white/5">
                       Register your story in the Library to generate a secure sharing link
                     </div>
                  ) : (
                    <div className="flex flex-col gap-5 w-full">
                       {!shareId ? (
                          <button
                            onClick={generatePublicLink}
                            className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl bg-amber-500 text-black hover:bg-amber-400 transition-all text-[11px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 font-hand"
                          >
                            <Globe className="w-4 h-4" />
                            Generate Access Key
                          </button>
                       ) : (
                          <div className="flex flex-col gap-6">
                             <div className="flex items-center gap-2 bg-white/5 rounded-2xl p-2 border border-white/5 shadow-inner" onClick={(e) => e.stopPropagation()}>
                                <div className="flex-1 px-3 text-[10px] text-amber-100/60 truncate font-mono tracking-tight lowercase font-hand">
                                  {typeof window !== 'undefined' ? `${window.location.host}/public/${shareId}` : ''}
                                </div>
                                <button
                                  onClick={copyLink}
                                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-black rounded-xl font-black text-[10px] uppercase tracking-[0.1em] hover:bg-amber-400 transition-all active:scale-95 shadow-lg font-hand"
                                >
                                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                  {copied ? 'Copied' : 'Copy'}
                                </button>
                             </div>

                             <button 
                               onClick={generatePublicLink}
                               className="text-[9px] font-bold text-white/5 hover:text-white/20 transition-colors uppercase tracking-[0.4em] mb-2 font-hand"
                             >
                               Regenerate Access Key
                             </button>
                          </div>
                       )}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-white/5 w-full flex flex-col items-center gap-1">
                  <span className="text-[9px] tracking-[0.3em] uppercase text-white/5 font-bold font-hand">Encrypted Archive Access</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cover upload modal */}
      <CoverUploadModal
        isOpen={isCoverOpen}
        onClose={() => setIsCoverOpen(false)}
        onUpload={handleCoverUpload}
        currentCover={coverImage}
      />

      {/* Publish to Rack modal */}
      <AnimatePresence>
        {isPublishOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPublishOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="relative w-full max-w-sm bg-[#0f0f0f] border border-amber-900/20 rounded-[32px] p-8 overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-900/10 blur-[60px] pointer-events-none rounded-full" />
              <button
                onClick={() => setIsPublishOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/5 text-white/20 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-amber-900/10 border border-amber-900/20 flex items-center justify-center mb-5">
                  <BookOpen className="w-6 h-6 text-amber-500/60" />
                </div>
                <h2 className="text-2xl font-bold text-amber-50/90 mb-1" style={{ fontFamily: 'var(--font-hand), cursive' }}>
                  {publishStatus === 'rejected' ? 'Re-submit Request' : 'Request to Publish'}
                </h2>
                <p className="text-xs text-amber-100/30 mb-6 leading-relaxed px-2">
                  Your request will be reviewed by an admin. Once approved, your book appears on the Public Rack.
                </p>

                <div className="w-full space-y-3">
                  <label className="block text-left text-[10px] text-amber-100/40 uppercase tracking-widest font-bold mb-1">
                    Your Pen Name
                  </label>
                  <input
                    value={publishPenName}
                    onChange={(e) => setPublishPenName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handlePublish(); }}
                    placeholder="e.g. J. Inksworth"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-amber-50/80 placeholder-white/20 outline-none focus:border-amber-700/50 transition-colors"
                    style={{ fontFamily: 'var(--font-hand), cursive' }}
                    autoFocus
                  />

                  <button
                    onClick={handlePublish}
                    disabled={publishing || !publishPenName.trim()}
                    className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-900/30 mt-2"
                  >
                    {publishing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    ) : (
                      <><Globe className="w-4 h-4" /> Submit Request</>
                    )}
                  </button>

                  {publishedAt && (
                    <p className="text-[10px] text-emerald-400/60 text-center">
                      Published {new Date(publishedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Join the Vault"
        description="To share your story with others, please verify your identity with Google. This ensures your work is secured in the deep vault."
      />

      <style jsx global>{`
        .font-hand {
          font-family: var(--font-hand), cursive;
        }
      `}</style>
    </>
  );
}

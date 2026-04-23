'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Eye, EyeOff, Check, X, BookOpen, Loader2, RefreshCw, LogOut, Clock, CheckCircle, XCircle } from 'lucide-react';

type Book = {
  _id: string | { $oid: string };
  title: string;
  coverImage?: string | null;
  penName?: string | null;
  shareId?: string | null;
  publishStatus: 'pending' | 'approved' | 'rejected';
  publishRequestedAt?: string | null;
  publishRejectedReason?: string | null;
};

const bookId = (b: Book) =>
  typeof b._id === 'string' ? b._id : (b._id as any)?.toString?.() ?? String(b._id);

const STATUS_TABS = ['pending', 'approved', 'rejected'] as const;

export default function SuperAdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<typeof STATUS_TABS[number]>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Persist password for the session
  const storedPassword = () =>
    typeof window !== 'undefined' ? sessionStorage.getItem('admin_pw') ?? '' : '';

  useEffect(() => {
    const pw = storedPassword();
    if (pw) { setPassword(pw); setAuthed(true); }
  }, []);

  const adminFetch = useCallback(
    (url: string, options: RequestInit = {}) =>
      fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': storedPassword(),
          ...(options.headers ?? {}),
        },
      }),
    []
  );

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/requests');
      if (res.status === 401) { setAuthed(false); sessionStorage.removeItem('admin_pw'); return; }
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [adminFetch]);

  useEffect(() => {
    if (authed) fetchBooks();
  }, [authed, fetchBooks]);

  const handleLogin = async () => {
    if (!password.trim()) return;
    setAuthLoading(true);
    setAuthError('');
    // Validate by hitting the API
    const res = await fetch('/api/admin/requests', {
      headers: { 'x-admin-password': password },
    });
    setAuthLoading(false);
    if (res.ok) {
      sessionStorage.setItem('admin_pw', password);
      setAuthed(true);
    } else {
      setAuthError('Incorrect password.');
    }
  };

  const approve = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await adminFetch(`/api/admin/approve/${id}`, { method: 'POST' });
      if (res.ok) {
        setBooks((prev) =>
          prev.map((b) => (bookId(b) === id ? { ...b, publishStatus: 'approved' } : b))
        );
      }
    } finally {
      setProcessingId(null);
    }
  };

  const reject = async () => {
    if (!rejectId) return;
    setProcessingId(rejectId);
    try {
      const res = await adminFetch(`/api/admin/reject/${rejectId}`, {
        method: 'POST',
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (res.ok) {
        setBooks((prev) =>
          prev.map((b) =>
            b._id === rejectId
              ? { ...b, publishStatus: 'rejected', publishRejectedReason: rejectReason }
              : b
          )
        );
        setRejectId(null);
        setRejectReason('');
      }
    } finally {
      setProcessingId(null);
    }
  };

  const signOut = () => {
    sessionStorage.removeItem('admin_pw');
    setAuthed(false);
    setPassword('');
    setBooks([]);
  };

  const filtered = books.filter((b) => b.publishStatus === activeTab);

  // ── Password Gate ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen w-full bg-[#060606] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm bg-[#0f0f0f] border border-amber-900/20 rounded-[32px] p-8 shadow-2xl"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-amber-900/10 border border-amber-900/30 flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-amber-600/60" />
            </div>
            <h1 className="text-2xl font-bold text-amber-50/90" style={{ fontFamily: 'var(--font-hand), cursive' }}>
              Super Admin
            </h1>
            <p className="text-xs text-amber-100/20 mt-1 text-center">
              Restricted access. Enter the admin password to continue.
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Admin password"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 pr-12 text-sm text-amber-50/80 placeholder-white/20 outline-none focus:border-amber-700/40 transition-colors"
                autoFocus
              />
              <button
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {authError && (
              <p className="text-red-400/80 text-xs text-center">{authError}</p>
            )}

            <button
              onClick={handleLogin}
              disabled={authLoading || !password.trim()}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Enter
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Admin Dashboard ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full bg-[#060606] text-white/80 px-6 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-amber-500/60" />
            <h1 className="text-2xl font-bold text-amber-50/90" style={{ fontFamily: 'var(--font-hand), cursive' }}>
              Publish Requests
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchBooks}
              disabled={loading}
              className="p-2 rounded-xl hover:bg-white/5 text-white/30 hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {STATUS_TABS.map((tab) => {
            const count = books.filter((b) => b.publishStatus === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                  activeTab === tab
                    ? tab === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : tab === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-white/5 text-white/30 hover:bg-white/10 border border-white/5'
                }`}
              >
                {tab === 'pending' && <Clock className="w-3 h-3" />}
                {tab === 'approved' && <CheckCircle className="w-3 h-3" />}
                {tab === 'rejected' && <XCircle className="w-3 h-3" />}
                {tab}
                {count > 0 && (
                  <span className="bg-white/10 rounded-full px-1.5 py-0.5 text-[10px]">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Book list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-500/40 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 border border-dashed border-white/5 rounded-3xl">
            <BookOpen className="w-10 h-10 text-white/10" />
            <p className="text-white/20 text-sm">No {activeTab} requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((book) => (
              <motion.div
                key={bookId(book)}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-5 bg-white/[0.03] border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all"
              >
                {/* Cover */}
                <div className="w-12 h-18 flex-shrink-0 rounded-xl overflow-hidden bg-amber-900/20 border border-amber-900/20" style={{ height: 72 }}>
                  {book.coverImage ? (
                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-amber-700/40" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-amber-50/80 truncate" style={{ fontFamily: 'var(--font-hand), cursive' }}>
                    {book.title}
                  </h3>
                  {book.penName && (
                    <p className="text-xs text-amber-100/30 mt-0.5">by {book.penName}</p>
                  )}
                  {book.publishRequestedAt && (
                    <p className="text-[10px] text-white/20 mt-1">
                      Requested {new Date(book.publishRequestedAt).toLocaleString()}
                    </p>
                  )}
                  {book.publishStatus === 'rejected' && book.publishRejectedReason && (
                    <p className="text-[10px] text-red-400/50 mt-1 italic">
                      Reason: {book.publishRejectedReason}
                    </p>
                  )}
                  {book.shareId && (
                    <a
                      href={`/public/${book.shareId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-amber-500/40 hover:text-amber-400 transition-colors mt-1 inline-block"
                    >
                      Preview ↗
                    </a>
                  )}
                </div>

                {/* Actions */}
                {book.publishStatus === 'pending' && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => approve(bookId(book))}
                      disabled={processingId === bookId(book)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-900/30 hover:bg-emerald-700/30 border border-emerald-700/30 text-emerald-400 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                    >
                      {processingId === bookId(book) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Approve
                    </button>
                    <button
                      onClick={() => { setRejectId(bookId(book)); setRejectReason(''); }}
                      disabled={processingId === bookId(book)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-900/20 hover:bg-red-700/20 border border-red-700/20 text-red-400 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                )}
                {book.publishStatus === 'approved' && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/20 border border-emerald-700/20 text-emerald-400 text-xs font-bold uppercase tracking-wider flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Live
                  </div>
                )}
                {book.publishStatus === 'rejected' && (
                  <button
                    onClick={() => approve(bookId(book))}
                    disabled={processingId === bookId(book)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/20 hover:bg-emerald-700/20 border border-emerald-700/20 text-emerald-400 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex-shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Reject reason modal */}
      <AnimatePresence>
        {rejectId && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRejectId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.93 }}
              className="relative w-full max-w-sm bg-[#0f0f0f] border border-red-900/20 rounded-[28px] p-7 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-red-300/80 mb-1" style={{ fontFamily: 'var(--font-hand), cursive' }}>
                Reject Request
              </h3>
              <p className="text-xs text-white/20 mb-4">Optionally provide a reason shown to the author.</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Content does not meet community guidelines"
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/70 placeholder-white/20 outline-none focus:border-red-700/40 resize-none transition-colors mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setRejectId(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={reject}
                  disabled={processingId === rejectId}
                  className="flex-1 py-2.5 rounded-xl bg-red-900/50 hover:bg-red-700/50 text-red-300 text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {processingId === rejectId ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                  Reject
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

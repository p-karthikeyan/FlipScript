'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, ImageIcon, Crop, Check, Loader2 } from 'lucide-react';

interface CoverUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (url: string) => void;
  currentCover?: string | null;
}

// 2:3 aspect ratio (portrait book cover)
const CROP_RATIO = 2 / 3;
const OUTPUT_W = 600;
const OUTPUT_H = 900;

export function CoverUploadModal({ isOpen, onClose, onUpload, currentCover }: CoverUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);
  const [displayW, setDisplayW] = useState(0);
  const [displayH, setDisplayH] = useState(0);

  // Crop box in display pixels
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const dragging = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);

  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState<'pick' | 'crop'>('pick');

  // Initialise crop box when image loads
  const initCrop = useCallback((dw: number, dh: number) => {
    // Fit the largest 2:3 box inside the displayed image
    let boxW = dw;
    let boxH = boxW / CROP_RATIO;
    if (boxH > dh) {
      boxH = dh;
      boxW = boxH * CROP_RATIO;
    }
    setCrop({
      x: (dw - boxW) / 2,
      y: (dh - boxH) / 2,
      w: boxW,
      h: boxH,
    });
  }, []);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setStep('crop');
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) handleFile(file);
  };

  const onImgLoad = () => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;
    setNaturalW(img.naturalWidth);
    setNaturalH(img.naturalHeight);
    const rect = img.getBoundingClientRect();
    setDisplayW(rect.width);
    setDisplayH(rect.height);
    initCrop(rect.width, rect.height);
  };

  // Drag the crop box
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = { startX: e.clientX, startY: e.clientY, ox: crop.x, oy: crop.y };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - dragging.current.startX;
      const dy = e.clientY - dragging.current.startY;
      setCrop((c) => ({
        ...c,
        x: Math.max(0, Math.min(displayW - c.w, dragging.current!.ox + dx)),
        y: Math.max(0, Math.min(displayH - c.h, dragging.current!.oy + dy)),
      }));
    };
    const onUp = () => { dragging.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [displayW, displayH]);

  const cropAndUpload = async () => {
    if (!imageSrc || !imgRef.current) return;
    setUploading(true);

    try {
      // Scale crop coords from display space → natural image space
      const scaleX = naturalW / displayW;
      const scaleY = naturalH / displayH;
      const sx = crop.x * scaleX;
      const sy = crop.y * scaleY;
      const sw = crop.w * scaleX;
      const sh = crop.h * scaleY;

      // Draw cropped image onto canvas at target output size
      const canvas = document.createElement('canvas');
      canvas.width = OUTPUT_W;
      canvas.height = OUTPUT_H;
      const ctx = canvas.getContext('2d')!;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = rej;
        img.src = imageSrc;
      });

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, OUTPUT_W, OUTPUT_H);

      const blob = await new Promise<Blob>((res) =>
        canvas.toBlob((b) => res(b!), 'image/jpeg', 0.9)
      );

      const form = new FormData();
      form.append('file', blob, 'cover.jpg');

      const response = await fetch('/api/upload', { method: 'POST', body: form });
      if (!response.ok) throw new Error('Upload failed');
      const { url } = await response.json();

      onUpload(url);
      onClose();
    } catch (err) {
      alert('Upload failed. Check your Cloudinary configuration.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setImageSrc(null);
    setStep('pick');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            className="relative w-full max-w-xl bg-[#0f0f0f] border border-amber-900/20 rounded-[32px] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 pt-8 pb-4">
              <div>
                <h2 className="text-xl font-bold text-amber-50/90" style={{ fontFamily: 'var(--font-hand), cursive' }}>
                  {step === 'pick' ? 'Upload Cover' : 'Crop Cover'}
                </h2>
                <p className="text-xs text-amber-100/30 mt-0.5">
                  {step === 'pick' ? 'Choose an image for your book cover' : 'Drag the box to set the crop area (2:3)'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5 text-white/20 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-8 pb-8">
              {step === 'pick' ? (
                <div className="space-y-4">
                  {/* Current cover preview */}
                  {currentCover && (
                    <div className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5">
                      <img src={currentCover} alt="Current cover" className="w-12 h-18 object-cover rounded-lg" style={{ aspectRatio: '2/3' }} />
                      <div>
                        <p className="text-xs text-amber-100/50">Current cover</p>
                        <p className="text-xs text-amber-100/20 mt-0.5">Upload a new one to replace it</p>
                      </div>
                    </div>
                  )}

                  {/* Drop zone */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-amber-900/30 rounded-2xl p-10 cursor-pointer hover:border-amber-700/50 hover:bg-amber-900/5 transition-all"
                  >
                    <div className="w-14 h-14 rounded-full bg-amber-900/10 border border-amber-900/20 flex items-center justify-center">
                      <ImageIcon className="w-7 h-7 text-amber-600/50" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-amber-100/60">Drop image here or click to browse</p>
                      <p className="text-xs text-amber-100/20 mt-1">JPG, PNG, WEBP — will be cropped to 2:3</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-900/20 border border-amber-900/30 rounded-xl text-amber-400 text-xs font-bold uppercase tracking-wider hover:bg-amber-900/30 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      Choose File
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Crop area */}
                  <div
                    ref={containerRef}
                    className="relative select-none overflow-hidden rounded-2xl bg-black/40"
                    style={{ maxHeight: '420px' }}
                  >
                    {/* Dim overlay around crop */}
                    <div className="absolute inset-0 bg-black/50 pointer-events-none z-10" />

                    <img
                      ref={imgRef}
                      src={imageSrc!}
                      alt="Crop preview"
                      onLoad={onImgLoad}
                      className="block w-full object-contain"
                      style={{ maxHeight: '420px' }}
                      draggable={false}
                    />

                    {/* Crop box */}
                    <div
                      className="absolute z-20 border-2 border-amber-400 cursor-move"
                      style={{ left: crop.x, top: crop.y, width: crop.w, height: crop.h }}
                      onMouseDown={onMouseDown}
                    >
                      {/* Clear window inside box */}
                      <div className="absolute inset-0 bg-transparent" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)' }} />
                      {/* Corner handles */}
                      {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([cx, cy], i) => (
                        <div
                          key={i}
                          className="absolute w-3 h-3 bg-amber-400 rounded-sm"
                          style={{
                            left: cx < 0 ? -5 : undefined,
                            right: cx > 0 ? -5 : undefined,
                            top: cy < 0 ? -5 : undefined,
                            bottom: cy > 0 ? -5 : undefined,
                          }}
                        />
                      ))}
                      {/* Centre label */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="flex items-center gap-1 bg-black/60 rounded-lg px-2 py-1">
                          <Crop className="w-3 h-3 text-amber-400" />
                          <span className="text-[10px] text-amber-300 font-bold">2 : 3</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={reset}
                      className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/50 text-sm font-bold transition-colors"
                    >
                      ← Pick different
                    </button>
                    <button
                      onClick={cropAndUpload}
                      disabled={uploading}
                      className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-900/30"
                    >
                      {uploading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                      ) : (
                        <><Check className="w-4 h-4" /> Crop &amp; Upload</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

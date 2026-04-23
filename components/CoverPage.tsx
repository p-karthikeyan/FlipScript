'use client';

interface CoverPageProps {
  title: string;
  coverImage?: string | null;
  penName?: string | null;
}

export function CoverPage({ title, coverImage, penName }: CoverPageProps) {
  return (
    <section className="relative h-full w-full overflow-hidden bg-[#1a0f05] flex flex-col">
      {coverImage ? (
        <>
          {/* Full-bleed cover image */}
          <img
            src={coverImage}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
          {/* Gradient overlay for title legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        </>
      ) : (
        /* Default cover — decorative pattern when no image uploaded */
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-[#2a1505] via-[#1a0f03] to-[#0d0700]" />
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 20px,
                rgba(180,120,40,0.3) 20px,
                rgba(180,120,40,0.3) 21px
              )`,
            }}
          />
          {/* Decorative border */}
          <div className="absolute inset-4 border border-amber-700/30 rounded-sm pointer-events-none" />
          <div className="absolute inset-6 border border-amber-700/15 rounded-sm pointer-events-none" />
        </>
      )}

      {/* Title + author block, pinned to bottom */}
      <div className="absolute bottom-0 left-0 right-0 px-8 pb-10 pt-16">
        <h1
          className="text-amber-50 font-bold leading-tight mb-3 drop-shadow-2xl"
          style={{
            fontFamily: 'var(--font-hand), cursive',
            fontSize: 'clamp(1.5rem, 4vw, 2.4rem)',
          }}
        >
          {title}
        </h1>
        {penName && (
          <p
            className="text-amber-300/70 text-sm tracking-widest uppercase drop-shadow-lg"
            style={{ fontFamily: 'var(--font-hand), cursive' }}
          >
            {penName}
          </p>
        )}
      </div>

      {/* Top decorative stamp */}
      {!coverImage && (
        <div className="absolute top-10 left-0 right-0 flex justify-center">
          <div className="border border-amber-700/30 rounded-full px-6 py-2">
            <span
              className="text-amber-600/50 text-[10px] tracking-[0.4em] uppercase font-bold"
              style={{ fontFamily: 'var(--font-hand), cursive' }}
            >
              FlipScript
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

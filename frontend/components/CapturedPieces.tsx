'use client';

const PIECE_NAMES: Record<string, string> = {
  p: '♟', r: '♜', n: '♞', b: '♝', q: '♛',
  P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕',
};

const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };

interface CapturedPiecesProps {
  captured: { white: string[]; black: string[] };
}

function PieceGroup({ pieces, label }: { pieces: string[]; label: string }) {
  const sorted = [...pieces].sort((a, b) => (PIECE_VALUES[b.toLowerCase()] ?? 0) - (PIECE_VALUES[a.toLowerCase()] ?? 0));
  const advantage = pieces.reduce((sum, p) => sum + (PIECE_VALUES[p.toLowerCase()] ?? 0), 0);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs w-12 shrink-0" style={{ color: 'var(--muted)' }}>{label}</span>
      <div className="flex flex-wrap gap-0.5">
        {sorted.map((p, i) => (
          <span key={i} className="text-base leading-none">{PIECE_NAMES[p] ?? p}</span>
        ))}
      </div>
      {advantage > 0 && (
        <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>+{advantage}</span>
      )}
    </div>
  );
}

export default function CapturedPieces({ captured }: CapturedPiecesProps) {
  if (captured.white.length === 0 && captured.black.length === 0) return null;

  return (
    <div className="px-5 pb-3 space-y-1">
      <PieceGroup pieces={captured.white} label="White +" />
      <PieceGroup pieces={captured.black} label="Black +" />
    </div>
  );
}

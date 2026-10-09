import type { PatternItem } from '../types';

interface PatternPieceProps {
  item: PatternItem;
  size?: 'sequence' | 'choice';
  selected?: boolean;
}

export function PatternPiece({ item, size = 'sequence', selected = false }: PatternPieceProps) {
  const hasEmoji = Boolean(item.symbol);
  return (
    <span
      className={`pattern-piece pattern-piece--${size} pattern-piece--${item.shape ?? 'object'} ${selected ? 'is-selected' : ''}`}
      style={{ '--piece-color': item.color } as React.CSSProperties}
      aria-hidden="true"
    >
      {hasEmoji && <span className="pattern-piece__symbol">{item.symbol}</span>}
    </span>
  );
}

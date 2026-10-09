import { useEffect, useState } from 'react';

interface ArtworkProps {
  src?: string;
  alt: string;
  emoji: string;
  variant: 'world' | 'story' | 'reader' | 'chapter' | 'pattern';
}

export function Artwork({ src, alt, emoji, variant }: ArtworkProps) {
  const [missing, setMissing] = useState(!src);

  useEffect(() => setMissing(!src), [src]);

  return (
    <span className={`artwork artwork--${variant} ${missing ? 'is-placeholder' : ''}`}>
      {!missing && src ? (
        <img src={src} alt={alt} onError={() => setMissing(true)} />
      ) : (
        <span className="artwork__placeholder" role="img" aria-label={`Ilustración pendiente: ${alt}`}>
          <span className="artwork__emoji">{emoji}</span>
          {variant !== 'world' && variant !== 'chapter' && variant !== 'pattern' && <small>Ilustración de la historia</small>}
        </span>
      )}
    </span>
  );
}

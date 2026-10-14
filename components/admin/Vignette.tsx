import type { Media } from '@/lib/types';

// Aperçu léger d'un média (la vignette pour les vidéos).
export default function Vignette({ media, className = 'vignette' }: { media: Media; className?: string }) {
  const src = media.t === 'video' ? media.poster || '' : media.src;
  return (
    <span className={className}>
      {src ? <img src={src} alt="" loading="lazy" draggable={false} /> : <span className="vignette-vide">vidéo</span>}
      {media.t === 'video' && <span className="vignette-badge">▶</span>}
    </span>
  );
}

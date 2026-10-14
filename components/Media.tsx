import type { Media as MediaType } from '@/lib/types';

// Image ou vidéo (muette, en boucle) qui remplit son conteneur.
export default function Media({ media, className = 'media' }: { media: MediaType; className?: string }) {
  if (media.t === 'video') {
    return (
      <video
        className={className}
        src={media.src}
        poster={media.poster ?? undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
    );
  }
  return <img className={className} src={media.src} alt="" loading="lazy" decoding="async" />;
}

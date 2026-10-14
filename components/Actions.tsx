import type { Reglages } from '@/lib/types';

// Boutons « Instagram » (seulement si un lien est renseigné) et « Let’s talk about your project ».
export default function Actions({ reglages, className = '' }: { reglages: Reglages; className?: string }) {
  return (
    <div className={`actions ${className}`}>
      {reglages.instagram && (
        <a className="bouton bouton--instagram" href={reglages.instagram} target="_blank" rel="noopener noreferrer">
          Instagram
        </a>
      )}
      <a className="bouton bouton--contact" href={`mailto:${reglages.email}`}>
        Let’s talk about your project
      </a>
    </div>
  );
}

export function PiedDePage({ reglages }: { reglages: Reglages }) {
  return (
    <footer className="pied">
      <p className="copyright">
        John Leon Morales
        <br />
        LMD Studios ©2026 All rights reserved
      </p>
      <Actions reglages={reglages} />
    </footer>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LIENS = [
  { href: '/admin', label: 'Tableau de bord' },
  { href: '/admin/collage', label: 'Collage' },
  { href: '/admin/curseur', label: 'Curseur' },
  { href: '/admin/projets', label: 'Projets' },
  { href: '/admin/medias', label: 'Médias' },
  { href: '/admin/reglages', label: 'Réglages' },
];

// Navigation de l'admin : même style que le menu du site (soulignement menthe sur la rubrique active).
export default function NavAdmin() {
  const chemin = usePathname();
  const actif = (href: string) => (href === '/admin' ? chemin === '/admin' : chemin.startsWith(href));
  return (
    <nav className="admin-nav" aria-label="Rubriques de l’admin">
      {LIENS.map((l) => (
        <Link key={l.href} href={l.href} className={actif(l.href) ? 'actif' : undefined} aria-current={actif(l.href) ? 'page' : undefined}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import type { Format, Media } from '@/lib/types';

// Traînée d'images qui suit la souris sur l'accueil.
// - L'espacement s'adapte à la vitesse : geste rapide = images plus rapprochées et plus grandes.
// - Chaque image arrive avec une légère inclinaison aléatoire.
// - Quand la souris s'arrête, les images s'effacent l'une après l'autre.
// Active uniquement à la souris, et seulement sur les formats où le collage est vide.

const MAX_VISIBLES = 6;
const INCLINAISON_MAX = 7; // degrés, de part et d'autre
const ARRET_MS = 120; // délai d'immobilité avant l'effacement
const CASCADE_MS = 60; // décalage entre deux effacements
const DUREE_MS = 500; // durée des transitions (voir .trainee-image)

function formatCourant(): Format {
  const w = window.innerWidth;
  return w > 1024 ? 'desktop' : w > 600 ? 'tablette' : 'mobile';
}

interface Visible {
  el: HTMLImageElement;
  angle: number;
}

export default function TraineeCurseur({ images, formatsAvecCollage }: { images: Media[]; formatsAvecCollage: Format[] }) {
  const zoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const zone = zoneRef.current;
    const page = zone?.parentElement;
    if (!zone || !page || !images.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Préchargement : les images apparaissent sans délai dès le premier geste.
    images.forEach((m) => {
      const i = new Image();
      i.src = m.src;
    });

    let suivante = 0;
    let dernier = { x: 0, y: 0, t: 0 };
    let visibles: Visible[] = [];
    let minuterieArret: ReturnType<typeof setTimeout> | undefined;
    const minuteries = new Set<ReturnType<typeof setTimeout>>();
    const plusTard = (fn: () => void, ms: number) => {
      const id = setTimeout(() => {
        minuteries.delete(id);
        fn();
      }, ms);
      minuteries.add(id);
    };

    function effacer(v: Visible) {
      v.el.style.opacity = '0';
      v.el.style.transform = `translate(-50%, -55%) rotate(${v.angle}deg) scale(0.9)`;
      plusTard(() => v.el.remove(), DUREE_MS);
    }

    function toutEffacer() {
      const liste = visibles;
      visibles = [];
      liste.forEach((v, i) => plusTard(() => effacer(v), i * CASCADE_MS));
    }

    function bouger(e: PointerEvent) {
      if (e.pointerType !== 'mouse') return;
      if (formatsAvecCollage.includes(formatCourant())) return;

      const maintenant = performance.now();
      const dx = e.clientX - dernier.x;
      const dy = e.clientY - dernier.y;
      const distance = Math.hypot(dx, dy);
      const vitesse = distance / Math.max(1, maintenant - dernier.t); // px par ms

      clearTimeout(minuterieArret);
      minuterieArret = setTimeout(toutEffacer, ARRET_MS);

      // Seuils adaptatifs : plus le geste est rapide, plus les images sont rapprochées.
      const ecartMin = Math.max(50, 120 - vitesse * 60);
      const delaiMin = Math.max(80, 180 - vitesse * 80);
      if (distance < ecartMin || maintenant - dernier.t < delaiMin) return;
      dernier = { x: e.clientX, y: e.clientY, t: maintenant };

      if (visibles.length >= MAX_VISIBLES) effacer(visibles.shift()!);

      const media = images[suivante++ % images.length];
      const cadre = page!.getBoundingClientRect();
      const angle = Math.round((Math.random() * 2 - 1) * INCLINAISON_MAX * 100) / 100;
      const echelle = Math.min(1.1, 0.88 + vitesse * 0.3);

      const el = document.createElement('img');
      el.className = 'trainee-image';
      el.alt = '';
      el.decoding = 'async';
      el.src = media.src;
      if (media.largeur && media.hauteur) el.style.aspectRatio = `${media.largeur} / ${media.hauteur}`;
      el.style.left = `${e.clientX - cadre.left}px`;
      el.style.top = `${e.clientY - cadre.top}px`;
      el.style.transform = `translate(-50%, -40%) rotate(${angle}deg) scale(${echelle * 0.88})`;
      zone!.appendChild(el);
      visibles.push({ el, angle });

      // Deux images d'animation : l'état de départ est rendu avant la transition.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          el.style.opacity = '1';
          el.style.transform = `translate(-50%, -50%) rotate(${angle}deg) scale(${echelle})`;
        })
      );
    }

    page.addEventListener('pointermove', bouger);
    page.addEventListener('pointerleave', toutEffacer);
    return () => {
      page.removeEventListener('pointermove', bouger);
      page.removeEventListener('pointerleave', toutEffacer);
      clearTimeout(minuterieArret);
      minuteries.forEach(clearTimeout);
      zone.innerHTML = '';
    };
  }, [images, formatsAvecCollage]);

  return <div className="trainee" aria-hidden="true" ref={zoneRef} />;
}

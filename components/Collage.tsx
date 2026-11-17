'use client';

import React, { useEffect, useRef } from 'react';
import { BASES, type Carte, type Collage as CollageType, type Format } from '@/lib/types';

function formatCourant(): Format {
  const w = window.innerWidth;
  if (w > 1024) return 'desktop';
  if (w > 600) return 'tablette';
  return 'mobile';
}

interface Element {
  el: HTMLDivElement;
  p: Carte;
  deplace: boolean;
}

// Marge transparente autour de chaque carte : le bord visible de l'image n'est plus le bord
// de la couche pivotée, ce qui évite l'effet « dent de scie » au rendu GPU.
const MARGE_AA = 1;

export default function Collage({ collage }: { collage: CollageType }) {
  const zoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;

    let format = formatCourant();
    let elements: Element[] = [];
    let cleanups: (() => void)[] = [];
    let zTop = 0;

    function vider() {
      cleanups.forEach((fn) => fn());
      cleanups = [];
      elements = [];
      zone!.innerHTML = '';
    }

    // Crée une carte par placement de la disposition (une même image peut apparaître deux fois).
    function construire() {
      vider();
      const cartes = collage[format];
      cartes.forEach((p, i) => {
        const media = p.media;
        const el = document.createElement('div');
        el.className = 'carte';
        el.style.zIndex = String(i + 1);
        el.style.transform = `rotate(${p.a}deg)`;
        const cadre = document.createElement('div');
        cadre.className = 'carte-media';
        el.appendChild(cadre);

        if (media.t === 'img') {
          const img = document.createElement('img');
          img.alt = '';
          img.draggable = false;
          img.decoding = 'async';
          img.src = media.src;
          cadre.appendChild(img);
        } else {
          const v = document.createElement('video');
          v.muted = true;
          v.loop = true;
          v.autoplay = true;
          v.playsInline = true;
          v.setAttribute('muted', '');
          v.setAttribute('playsinline', '');
          v.preload = 'auto';
          if (media.poster) v.poster = media.poster;
          v.src = media.src;
          cadre.appendChild(v);
          v.play().catch(() => {});
          cleanups.push(() => {
            v.pause();
            v.removeAttribute('src');
            v.load();
          });
        }

        zone!.appendChild(el);
        const item = { el, p, deplace: false };
        elements.push(item);
        rendreDeplacable(item);
      });
      zTop = cartes.length;
      placer();
    }

    function placer() {
      if (!zone) return;
      const base = BASES[format];
      const zw = zone.clientWidth || window.innerWidth;
      let k: number;
      let ox = 0;
      let oy = 0;

      if (format === 'desktop') {
        // Le collage tient dans la carte et reste centré sur le logo du fond.
        const zh = zone.clientHeight || window.innerHeight;
        k = Math.min(zw / base.w, zh / base.h);
        ox = (zw - base.w * k) / 2;
        oy = (zh - base.h * k) / 2;
        zone.style.height = '';
      } else {
        // Tablette / mobile : le repère est la page entière, à l'échelle de la largeur.
        // La carte arrondie garde la hauteur de l'écran : le collage y défile.
        k = zw / base.w;
        zone.style.height = `${Math.round(base.h * k)}px`;
      }

      elements.forEach((o) => {
        // Une carte déplacée par l'utilisateur garde sa position.
        if (o.deplace) return;
        const p = o.p;
        o.el.style.left = `${ox + p.x * k - MARGE_AA}px`;
        o.el.style.top = `${oy + p.y * k - MARGE_AA}px`;
        o.el.style.width = `${p.w * k + 2 * MARGE_AA}px`;
        o.el.style.height = `${p.h * k + 2 * MARGE_AA}px`;
        o.el.style.setProperty('--rayon', `${12 * k}px`);
      });
    }

    function rendreDeplacable(item: Element) {
      const el = item.el;
      let depart: { x: number; y: number; left: number; top: number } | null = null;

      const onPointerDown = (e: PointerEvent) => {
        if (e.button !== 0) return;
        e.preventDefault();
        el.style.zIndex = String(++zTop);
        el.classList.add('carte--saisie');
        depart = { x: e.clientX, y: e.clientY, left: el.offsetLeft, top: el.offsetTop };
        try {
          el.setPointerCapture(e.pointerId);
        } catch (_) {}
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!depart || !zone) return;
        e.preventDefault();
        item.deplace = true;
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        const left = Math.min(zone.clientWidth - w / 2, Math.max(-w / 2, depart.left + e.clientX - depart.x));
        const top = Math.min(zone.clientHeight - h / 2, Math.max(-h / 2, depart.top + e.clientY - depart.y));
        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
      };

      const fin = () => {
        if (!depart) return;
        depart = null;
        el.classList.remove('carte--saisie');
      };

      el.addEventListener('pointerdown', onPointerDown);
      el.addEventListener('pointermove', onPointerMove);
      el.addEventListener('pointerup', fin);
      el.addEventListener('pointercancel', fin);
      cleanups.push(() => {
        el.removeEventListener('pointerdown', onPointerDown);
        el.removeEventListener('pointermove', onPointerMove);
        el.removeEventListener('pointerup', fin);
        el.removeEventListener('pointercancel', fin);
      });
    }

    construire();

    let derniereLargeur = window.innerWidth;
    let derniereHauteur = window.innerHeight;
    let minuterie: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      // Sur mobile, la barre d'URL change la hauteur pendant le défilement : on ne réagit
      // à la hauteur qu'en desktop, où le collage dépend de la hauteur de la carte.
      const largeurChange = window.innerWidth !== derniereLargeur;
      const hauteurChange = window.innerHeight !== derniereHauteur && format === 'desktop';
      if (!largeurChange && !hauteurChange) return;
      derniereLargeur = window.innerWidth;
      derniereHauteur = window.innerHeight;
      clearTimeout(minuterie);
      minuterie = setTimeout(() => {
        const nouveau = formatCourant();
        if (nouveau !== format) {
          format = nouveau;
          construire();
        } else {
          placer();
        }
      }, 100);
    };
    window.addEventListener('resize', onResize);

    // Le collage apparaît en fondu, après un temps pour voir le fond avec le logo.
    let annule = false;
    const pretTimer = setTimeout(() => {
      if (!annule) zone.classList.add('collage--pret');
    }, 2000);

    return () => {
      annule = true;
      clearTimeout(pretTimer);
      clearTimeout(minuterie);
      window.removeEventListener('resize', onResize);
      vider();
      zone.classList.remove('collage--pret');
    };
  }, [collage]);

  return <div className="collage" aria-hidden="true" ref={zoneRef} />;
}

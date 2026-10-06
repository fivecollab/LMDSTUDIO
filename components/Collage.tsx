'use client';

import React, { useEffect, useRef } from 'react';
import { CARTES, BASE_W, BASE_H, DECALAGE_Y, Carte, MOBILE_MAP } from './cards-data';

export default function Collage() {
  const zoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;

    let zTop = 0;
    const attentes: Promise<unknown>[] = [];
    const elements: { el: HTMLDivElement; c: Carte; deplace?: boolean }[] = [];
    const cleanups: (() => void)[] = [];

    // Clear any previous children (in case of Strict Mode double-invoke)
    zone.innerHTML = '';
    zone.classList.remove('collage--pret');

    CARTES.forEach((c) => {
      const el = document.createElement('div');
      el.className = 'carte' + (c.drag ? ' carte--drag' : '');
      el.style.zIndex = String(c.z);
      el.style.transform = `rotate(${c.a}deg)`;
      const item = { el, c, deplace: false };
      elements.push(item);
      zTop = Math.max(zTop, c.z);

      if (c.t === 'img') {
        const img = document.createElement('img');
        img.alt = '';
        img.draggable = false;
        img.decoding = 'async';
        attentes.push(
          new Promise<void>((ok) => {
            img.onload = () => ok();
            img.onerror = () => ok();
          })
        );
        img.src = c.src;
        el.appendChild(img);
      } else {
        const v = document.createElement('video');
        v.muted = true;
        v.loop = true;
        v.autoplay = true;
        v.playsInline = true;
        v.setAttribute('muted', '');
        v.setAttribute('playsinline', '');
        v.preload = 'auto';
        if (c.poster) v.poster = c.poster;
        v.src = c.src;
        attentes.push(
          new Promise<void>((ok) => {
            if (v.readyState >= 2) ok();
            else {
              v.addEventListener('loadeddata', () => ok(), { once: true });
              v.addEventListener('error', () => ok(), { once: true });
            }
          })
        );
        el.appendChild(v);
        v.play().catch(() => {});
        cleanups.push(() => {
          v.pause();
          v.removeAttribute('src');
          v.load();
        });
      }
      zone.appendChild(el);
      if (c.drag) rendreDeplacable(item, zone);
    });

    function placer() {
      if (!zone) return;
      const isMobile = window.innerWidth <= 900;
      const zw = zone.clientWidth || window.innerWidth;
      const k = isMobile
        ? Math.max(0.85, Math.min(zw / 360, 1.05))
        : zw / BASE_W;
      const ox = isMobile ? 0 : (zw - BASE_W * k) / 2;
      const oy = 0;

      let maxBottom = 0;
      elements.forEach((o) => {
        const c = o.c;

        // Si l'utilisateur a personnalisé la position de cette carte en la déplaçant,
        // on préserve scrupuleusement sa position sans la réinitialiser.
        if (o.deplace) {
          if (o.el.offsetTop + o.el.offsetHeight > maxBottom) {
            maxBottom = o.el.offsetTop + o.el.offsetHeight;
          }
          return;
        }

        let leftPx: number;
        let topPx: number;
        let wPx: number;
        let hPx: number;

        if (isMobile) {
          const m = MOBILE_MAP[c.id];
          const scale = Math.max(0.95, Math.min(zw / 320, 1.25));
          if (m) {
            leftPx = m.left * scale;
            topPx = (m.top - 315) * scale;
            wPx = m.width * scale;
            hPx = m.height * scale;
            o.el.style.transform = `rotate(${m.rot}deg)`;
            o.el.style.zIndex = String(m.z);
          } else {
            leftPx = 20;
            topPx = 30;
            wPx = c.w * 0.95;
            hPx = c.h * 0.95;
            o.el.style.transform = `rotate(${c.a}deg)`;
          }
          if (topPx + hPx > maxBottom) {
            maxBottom = topPx + hPx;
          }
        } else {
          leftPx = ox + c.x * k;
          topPx = oy + (c.y + DECALAGE_Y) * k;
          wPx = c.w * k;
          hPx = c.h * k;
          o.el.style.transform = `rotate(${c.a}deg)`;
          o.el.style.zIndex = String(c.z);
        }

        o.el.style.left = `${leftPx}px`;
        o.el.style.top = `${topPx}px`;
        o.el.style.width = `${wPx}px`;
        o.el.style.height = `${hPx}px`;
        o.el.style.borderRadius = `${c.r * (isMobile ? 1 : k)}px`;
        if (c.t === 'img' && o.el.firstChild) {
          const im = o.el.firstChild as HTMLImageElement;
          const imgK = isMobile ? wPx / c.w : k;
          im.style.width = `${(c.iw ?? c.w) * imgK}px`;
          im.style.height = `${(c.ih ?? c.h) * imgK}px`;
          im.style.left = `${(c.ix ?? 0) * imgK}px`;
          im.style.top = `${(c.iy ?? 0) * imgK}px`;
        }
      });

      if (!isMobile) {
        const zt = zoneTexte();
        if (zt) {
          elements.forEach((o) => {
            if (o.deplace) return;
            o.el.style.top = `${eviterTexte(o.el, o.el.offsetLeft, o.el.offsetTop, zt)}px`;
          });
        }
      }

      if (isMobile) {
        const totalCollageH = Math.round(maxBottom + 80);
        zone.style.height = `${totalCollageH}px`;
      } else {
        zone.style.height = '';
      }
    }

    // Zone du texte en bas à gauche (desktop) : aucune carte ne doit passer dessous,
    // sinon le texte devient illisible.
    function zoneTexte() {
      if (!zone || window.innerWidth <= 900) return null;
      const t = zone.parentElement?.querySelector('.pied-texte');
      if (!t) return null;
      const zr = zone.getBoundingClientRect();
      const r = t.getBoundingClientRect();
      const marge = 12;
      return { left: r.left - zr.left - marge, right: r.right - zr.left + marge, top: r.top - zr.top - marge };
    }

    // Remonte la carte si (rotation comprise) elle empiète sur la zone du texte.
    function eviterTexte(el: HTMLElement, left: number, top: number, zt: { left: number; right: number; top: number }) {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const bb = el.getBoundingClientRect();
      const dx = (bb.width - w) / 2;
      const dy = (bb.height - h) / 2;
      if (left - dx < zt.right && left + w + dx > zt.left && top + h + dy > zt.top) {
        return zt.top - h - dy;
      }
      return top;
    }

    placer();

    let lastWidth = window.innerWidth;
    let minuterie: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      const currentWidth = window.innerWidth;
      // Sur mobile, le défilement entraîne la contraction/expansion de la barre d'URL,
      // ce qui déclenche un événement resize avec une hauteur différente mais une largeur identique.
      // On ignore ces événements pour ne jamais réinitialiser la disposition pendant le scroll.
      if (currentWidth === lastWidth) return;
      lastWidth = currentWidth;

      clearTimeout(minuterie);
      minuterie = setTimeout(placer, 100);
    };
    window.addEventListener('resize', onResize);

    // Le collage apparaît avec un fondu fluide après un délai de 2 secondes
    // pour que l'utilisateur puisse contempler le fond avec le logo
    let isCancelled = false;
    const pretTimer = setTimeout(() => {
      if (!isCancelled && zone) {
        zone.classList.add('collage--pret');
      }
    }, 2000);

    function rendreDeplacable(item: { el: HTMLDivElement; c: Carte; deplace?: boolean }, container: HTMLDivElement) {
      const el = item.el;
      let depart: { x: number; y: number; left: number; top: number; pointerId: number } | null = null;
      let isDragging = false;

      const onPointerDown = (e: PointerEvent) => {
        if (e.button !== 0) return;
        e.preventDefault();
        el.style.zIndex = String(++zTop);
        el.classList.add('carte--saisie');
        depart = { x: e.clientX, y: e.clientY, left: el.offsetLeft, top: el.offsetTop, pointerId: e.pointerId };
        isDragging = true;
        try {
          el.setPointerCapture(e.pointerId);
        } catch (_) {}
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!depart || !isDragging) return;
        e.preventDefault();
        item.deplace = true;

        const l = depart.left + e.clientX - depart.x;
        const t = depart.top + e.clientY - depart.y;
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        const zr = container.getBoundingClientRect();
        const pr = container.parentElement
          ? container.parentElement.getBoundingClientRect()
          : zr;
        const minL = pr.left - zr.left - w / 2;
        const maxL = pr.right - zr.left - w / 2;
        const minT = -h / 2;
        const maxT = container.clientHeight - h / 2;
        const left = Math.min(maxL, Math.max(minL, l));
        let top = Math.min(maxT, Math.max(minT, t));
        const zt = zoneTexte();
        if (zt) top = eviterTexte(el, left, top, zt);
        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
      };

      const fin = () => {
        if (!depart) return;
        depart = null;
        isDragging = false;
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

    return () => {
      isCancelled = true;
      clearTimeout(pretTimer);
      clearTimeout(minuterie);
      window.removeEventListener('resize', onResize);
      cleanups.forEach((fn) => fn());
      zone.innerHTML = '';
    };
  }, []);

  return <div className="collage" aria-hidden="true" ref={zoneRef} />;
}

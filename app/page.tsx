import type { Metadata } from 'next';
import Link from 'next/link';
import Collage from '@/components/Collage';

export const metadata: Metadata = {
  title: 'John Leon Morales — L.M.D Studios',
};

export default function HomePage() {
  return (
    <div className="accueil">
      <main className="page">
        <Collage />
        <div className="zone-haut">
          <header className="entete">
            <Link className="ident" href="/">
              <span className="d">
                John Leon Morales
                <br />
              </span>
              L.M.D Studios
              <span className="m">
                <br />
              </span>
              {' '}©2026
            </Link>
            <div className="metier">
              <span className="d">
                Fashion, Design, Art Direction &amp; Consulting.
                <br />
              </span>
              <span className="m">
                Fashion, Design,
                <br />
                Art Direction,
                <br />
                and Consulting.
              </span>
              <span className="ville">Geneva, Switzerland</span>
            </div>
            <div className="statut">
              Experimentation
              <br />
              in progress
              <img className="point d" src="/assets/point.svg" width={11} height={11} alt="" />
              <img className="point m" src="/assets/point-mobile.svg" width={8} height={8} alt="" />
            </div>
            <Link className="nav" href="/about">
              About
            </Link>
          </header>

          <div className="mobile-actions">
            <a className="contact contact--mobile" href="mailto:john@lmdstudios.ch">
              Let’s talk about your project
            </a>
            <div className="mobile-instruction">
              <p className="mobile-instruction__titre">
                *Drag around the work to explore the archive.
              </p>
              <p className="mobile-instruction__credit">
                Most of what you see here was built with incredible teams — I&apos;m grateful to have played my part.
              </p>
            </div>
          </div>
        </div>

        <footer className="pied">
          <div className="pied-texte">
            <p className="pied-instruction">
              *Drag around the work to explore the archive.
            </p>
            <p className="pied-credit">
              Most of what you see here was built with incredible teams — I&apos;m grateful to have played my part.
            </p>
          </div>
          <a className="contact contact--desktop" href="mailto:john@lmdstudios.ch">
            Let’s talk about your project
          </a>
        </footer>
      </main>
    </div>
  );
}

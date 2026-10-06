import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About — L.M.D Studios',
};

export default function AboutPage() {
  return (
    <div className="apropos">
      <main className="page">
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
          <Link className="nav" href="/">
            Back
          </Link>
        </header>

        <section className="bloc presentation">
          <h2>Hello,</h2>
          <div>
            <p>
              L.M.D Studios establishes the creative practice and vision of John Leon Morales, a designer with a
              multicultural background based in Geneva, Switzerland.
            </p>
            <p>
              Founded in 2022, its role is to serve as a space for continuous experimentation across his personal projects.
              With fashion as the main medium, his work explores clothing codes in a contemporary context, combining ideas
              from streetwear, art, music, and popular culture. Each piece reinterprets familiar archetypes through colors,
              fits, and materials — using design as a language to articulate an intention or a message shaped into garments
              and essential everyday objects.
            </p>
            <p>
              Beyond John’s personal work, his practice extends into a wider field of graphic design, art direction,
              product development and visual storytelling. Grounded in a community-driven approach, he collaborates with
              artists and creative partners on commissions for cultural and commercial clients, offering thoughtful and
              sharp consulting services.
            </p>
          </div>
        </section>

        <section className="bloc services">
          <h2>Services</h2>
          <p>
            Fashion Design, Product Development, Art Direction, Visual Identity, Websites, Ecommerce, Graphic Design,
            Brand &amp; Campaign Visuals, and Creative Consultancy.
          </p>
        </section>

        <a className="contact" href="mailto:john@lmdstudios.ch">
          Let’s talk about your project
        </a>
      </main>
    </div>
  );
}

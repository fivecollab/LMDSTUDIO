import Link from 'next/link';

export interface LienNav {
  label: string;
  href: string;
}

// En-tête commun à toutes les pages : identité, métier, statut et liens de navigation
// (« Work » n'est passé que s'il y a des projets publiés).
export default function Entete({ nav }: { nav: LienNav[] }) {
  return (
    <header className="entete">
      <Link className="ident" href="/">
        <span className="d">
          John Leon Morales
          <br />
        </span>
        LMD Studios
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
          <br />
        </span>
        Geneva, Switzerland
      </div>
      <div className="statut">
        Experimentation
        <br />
        in progress
        <img className="point" src="/assets/point.svg" width={9} height={9} alt="" />
      </div>
      <nav className="nav">
        {nav.map((l) => (
          <Link key={l.href + l.label} href={l.href}>
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

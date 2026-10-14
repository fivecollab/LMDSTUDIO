import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="cadre apropos">
      <main className="page introuvable">
        <h1>404</h1>
        <p>Page not found</p>
        <Link className="bouton bouton--contact" href="/">
          Back to Home
        </Link>
      </main>
    </div>
  );
}

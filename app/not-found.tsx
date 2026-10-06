import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="apropos">
      <main
        className="page"
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          minHeight: 'calc(100vh - 32px)',
        }}
      >
        <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>404</h1>
        <p style={{ fontSize: '20px', marginBottom: '32px' }}>Page not found</p>
        <Link className="contact" href="/" style={{ justifyContent: 'center', padding: 0 }}>
          Back to Home
        </Link>
      </main>
    </div>
  );
}

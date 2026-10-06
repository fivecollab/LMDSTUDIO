import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'John Leon Morales — L.M.D Studios',
  description: 'Fashion, Design, Art Direction & Consulting. Geneva, Switzerland',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/assets/fond.jpg" as="image" fetchPriority="high" />
      </head>
      <body>{children}</body>
    </html>
  );
}

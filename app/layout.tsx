import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'John Leon Morales — LMD Studios',
  description: 'Fashion, Design, Art Direction & Consulting. Geneva, Switzerland',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#242424',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/MADEOuterSans-Medium.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/MADEOuterSans-Light.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/NeueHelveticaPro-55Roman.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>{children}</body>
    </html>
  );
}

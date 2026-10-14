/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Permet de builder dans un autre dossier sans toucher au .next du serveur de dev.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  async redirects() {
    return [
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
      {
        source: '/about.html',
        destination: '/about',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: 'Admin — LMD Studios',
  robots: { index: false, follow: false },
};

// L'admin lit toujours les données à jour.
export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin">{children}</div>;
}

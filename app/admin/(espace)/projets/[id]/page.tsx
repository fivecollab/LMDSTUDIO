import { notFound } from 'next/navigation';
import { listerMedias, listerProjets } from '@/lib/admin-donnees';
import Link from 'next/link';
import FormProjet from '@/components/admin/FormProjet';
import EntetePage from '@/components/admin/EntetePage';

export default async function ProjetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [projets, medias] = await Promise.all([listerProjets(), listerMedias()]);
  const projet = projets.find((p) => p.id === Number(id));
  if (!projet) notFound();
  return (
    <>
      <Link href="/admin/projets" className="lien-retour">
        ← Tous les projets
      </Link>
      <EntetePage titre={projet.titre}>
        Remplis la carte du projet (page Work) et sa page détail, coche « Publié » puis enregistre.
      </EntetePage>
      <FormProjet projet={projet} medias={medias} />
    </>
  );
}

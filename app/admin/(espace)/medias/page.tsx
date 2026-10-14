import { listerMedias } from '@/lib/admin-donnees';
import Bibliotheque from '@/components/admin/Bibliotheque';
import EntetePage from '@/components/admin/EntetePage';

export default async function MediasPage() {
  const medias = await listerMedias();
  return (
    <>
      <EntetePage titre="Médias">
        Ta bibliothèque d’images et de vidéos. Envoie tes fichiers ici, puis utilise-les dans le collage, le curseur ou
        les projets. Leurs dimensions d’origine sont gardées.
      </EntetePage>
      <Bibliotheque medias={medias} />
    </>
  );
}

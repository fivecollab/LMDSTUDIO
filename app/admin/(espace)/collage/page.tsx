import { admin } from '@/lib/contenu';
import { listerMedias } from '@/lib/admin-donnees';
import EditeurCollage from '@/components/admin/EditeurCollage';
import EntetePage from '@/components/admin/EntetePage';

export default async function CollagePage() {
  const [collage, medias] = await Promise.all([admin.lireCollage(), listerMedias()]);
  return (
    <>
      <EntetePage titre="Collage">
        Les images déplaçables de la page d’accueil. Compose chaque écran (desktop, tablette, mobile) : ajoute des
        images, place-les à la souris, puis enregistre.
      </EntetePage>
      <EditeurCollage collage={collage} medias={medias} />
    </>
  );
}

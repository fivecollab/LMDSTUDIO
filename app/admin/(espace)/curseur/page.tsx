import { admin } from '@/lib/contenu';
import { listerMedias } from '@/lib/admin-donnees';
import EditeurCurseur from '@/components/admin/EditeurCurseur';
import EntetePage from '@/components/admin/EntetePage';

export default async function CurseurPage() {
  const [images, medias] = await Promise.all([admin.lireCurseur(), listerMedias()]);
  return (
    <>
      <EntetePage titre="Curseur">
        Les images qui suivent la souris sur la page d’accueil, dans cet ordre. L’effet est actif quand le collage de
        l’écran est vide. Les images gardent leurs proportions (300 px de large sur desktop, 220 px sur tablette).
      </EntetePage>
      <EditeurCurseur images={images} medias={medias} />
    </>
  );
}

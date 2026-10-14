import { admin } from '@/lib/contenu';
import FormReglages from '@/components/admin/FormReglages';
import EntetePage from '@/components/admin/EntetePage';

export default async function ReglagesPage() {
  const reglages = await admin.lireReglages();
  return (
    <>
      <EntetePage titre="Réglages">
        Les liens des boutons présents sur toutes les pages du site.
      </EntetePage>
      <FormReglages reglages={reglages} />
    </>
  );
}

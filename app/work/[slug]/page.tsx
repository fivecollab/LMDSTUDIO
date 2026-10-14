import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Entete from '@/components/Entete';
import { PiedDePage } from '@/components/Actions';
import CarteProjet from '@/components/CarteProjet';
import Media from '@/components/Media';
import { getProjets, getReglages } from '@/lib/contenu';

// Régénérée à chaque enregistrement dans l'admin, et au plus tard toutes les 60 s.
export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProjets()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const projet = (await getProjets()).find((p) => p.slug === slug);
  return { title: projet ? `${projet.titre} — LMD Studios` : 'LMD Studios' };
}

export default async function ProjetPage({ params }: Props) {
  const { slug } = await params;
  const [reglages, projets] = await Promise.all([getReglages(), getProjets()]);
  const projet = projets.find((p) => p.slug === slug);
  if (!projet) notFound();
  const autres = projets.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <div className="cadre detail">
      <main className="page">
        <Entete
          nav={[
            { label: 'Back', href: '/work' },
            { label: 'About', href: '/about' },
          ]}
        />

        <h1 className="titre-page titre-detail">{projet.titreDetail}</h1>
        <div className="detail-intro">
          <p className="detail-infos">
            {projet.client && (
              <>
                Client
                <br />
                {projet.client}
                <br />
                <br />
              </>
            )}
            {projet.annee}
            {projet.services.map((s) => (
              <span key={s}>
                <br />
                {s}
              </span>
            ))}
          </p>
          <div className="detail-description">
            {projet.description.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>

        {projet.galerie.length > 0 && (
          <div className="galerie">
            {projet.galerie.map((g, i) =>
              g.type === 'paire' ? (
                g.medias.map((m, j) => (
                  <div key={`${i}-${j}`} className="galerie-item galerie-item--demi">
                    <Media media={m} />
                  </div>
                ))
              ) : (
                <div key={i} className="galerie-item galerie-item--large">
                  <Media media={g.media} />
                </div>
              )
            )}
          </div>
        )}

        {autres.length > 0 && (
          <section className="plus">
            <h2 className="plus-titre">More projects</h2>
            <Link className="plus-lien" href="/work">
              See all works
            </Link>
            <div className="grille-projets">
              {autres.map((p) => (
                <CarteProjet key={p.slug} projet={p} legende={false} />
              ))}
            </div>
          </section>
        )}

        <PiedDePage reglages={reglages} />
      </main>
    </div>
  );
}

import type { Metadata } from 'next';
import Entete from '@/components/Entete';
import Actions from '@/components/Actions';
import { getProjets, getReglages } from '@/lib/contenu';

// Régénérée à chaque enregistrement dans l'admin, et au plus tard toutes les 60 s.
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'About — LMD Studios',
};

export default async function AboutPage() {
  const [reglages, projets] = await Promise.all([getReglages(), getProjets()]);

  return (
    <div className="cadre apropos">
      <main className="page">
        <Entete
          nav={[
            ...(projets.length ? [{ label: 'Work', href: '/work' }] : []),
            { label: 'Back', href: '/' },
          ]}
        />

        <section className="bloc presentation">
          <div className="bloc-texte">
            <p>
              LMD Studios establishes the creative practice and vision of John Leon Morales, a designer with a
              multicultural background based in Geneva, Switzerland.
            </p>
            <p>
              Founded in 2022, its role is to serve as a space for continuous experimentation across his personal projects.
              With fashion as the main medium, his work explores clothing codes in a contemporary context, combining ideas
              from streetwear, art, music, and popular culture. Each piece reinterprets familiar archetypes through colors,
              fits, and materials — using design as a language to articulate an intention or a message shaped into garments
              and essential everyday objects.
            </p>
            <p>
              Beyond John’s personal work, his practice extends into a wider field of graphic design, art direction,
              product development and visual storytelling. Grounded in a community-driven approach, he collaborates with
              artists and creative partners on commissions for cultural and commercial clients, offering thoughtful and
              sharp consulting services.
            </p>
          </div>
        </section>

        <section className="bloc services">
          <h2>Services</h2>
          <div className="bloc-texte">
            <p>
              Fashion Design, Product Development, Art Direction, Visual Identity, Websites, Ecommerce, Graphic Design,
              Brand &amp; Campaign Visuals, and Creative Consultancy.
            </p>
          </div>
        </section>

        <Actions reglages={reglages} className="apropos-actions" />
      </main>
    </div>
  );
}

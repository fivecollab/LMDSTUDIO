export type Format = 'desktop' | 'tablette' | 'mobile';

export const FORMATS: Format[] = ['desktop', 'tablette', 'mobile'];

/** Cadre Figma de référence de chaque format (le collage est positionné dans ce repère). */
export const BASES: Record<Format, { w: number; h: number }> = {
  desktop: { w: 1420, h: 880 },
  tablette: { w: 768, h: 1529 },
  mobile: { w: 390, h: 1297 },
};

export interface Media {
  id?: number;
  t: 'img' | 'video';
  src: string;
  poster?: string | null;
  largeur?: number;
  hauteur?: number;
  nom?: string;
}

/** Carte du collage : boîte non pivotée (x, y, w, h) dans le repère du format, pivotée de « a » degrés. */
export interface Carte {
  id?: number;
  media: Media;
  x: number;
  y: number;
  w: number;
  h: number;
  a: number;
}

export type Collage = Record<Format, Carte[]>;

export interface Reglages {
  instagram: string;
  email: string;
}

export type BlocGalerie = { type: 'paire'; medias: [Media, Media] } | { type: 'large'; media: Media };

export interface Projet {
  id?: number;
  slug: string;
  titre: string;
  categorie: string;
  couverture: Media | null;
  publie: boolean;
  titreDetail: string;
  client: string;
  annee: string;
  services: string[];
  description: string[];
  galerie: BlocGalerie[];
}

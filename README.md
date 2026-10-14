# LMDSTUDIO

Site Next.js de LMD Studios, avec un espace d’administration sur `/admin`.

## Contenu et version temporaire

Les contenus (lien Instagram, email, collage de l’accueil, projets) sont stockés dans Supabase et modifiés
depuis `/admin`.

- Sans lien Instagram, le bouton « Instagram » est masqué.
- Sans projet publié, le lien « Work » et la page `/work` sont masqués : c’est la version temporaire de la maquette.
- Sans image envoyée depuis l’admin, l’accueil n’affiche aucune image (seulement le fond et le logo).

## Installation de Supabase (une fois)

1. Crée un projet sur [supabase.com](https://supabase.com).
2. Dans **SQL Editor**, exécute `supabase/schema.sql` (tables + bucket public `medias`).
3. Dans **Authentication > Users**, crée le compte admin (email + mot de passe), puis désactive les
   inscriptions publiques (Authentication > Sign In / Providers > « Allow new users to sign up » décoché) :
   tout compte Supabase Auth peut se connecter à `/admin`.
4. Copie `.env.example` en `.env.local` et remplis les variables (Project Settings > API).
5. Sur Vercel, ajoute les mêmes variables dans Project > Settings > Environment Variables.

## Développement

```
npm run dev
```


'use client';

import { useActionState } from 'react';
import { connexion } from '../actions';

export default function ConnexionPage() {
  const [etat, action, envoi] = useActionState(connexion, undefined);
  return (
    <div className="admin-cadre">
      <main className="admin-page admin-connexion">
        <form action={action}>
          <p className="connexion-ident">
            LMD Studios ©2026
            <br />
            <span>Espace admin</span>
          </p>
          <label>
            Email
            <input type="email" name="email" autoComplete="username" required autoFocus />
          </label>
          <label>
            Mot de passe
            <input type="password" name="motdepasse" autoComplete="current-password" required />
          </label>
          {etat?.erreur && <p className="message message--erreur">{etat.erreur}</p>}
          <button className="btn btn--principal" disabled={envoi}>
            {envoi ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </main>
    </div>
  );
}

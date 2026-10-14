'use client';

import { useActionState } from 'react';
import { enregistrerReglages } from '@/app/admin/actions';
import type { Reglages } from '@/lib/types';

export default function FormReglages({ reglages }: { reglages: Reglages }) {
  const [etat, action, envoi] = useActionState(enregistrerReglages, undefined);
  return (
    <form action={action} className="carte-admin formulaire" style={{ maxWidth: 720 }}>
      <label>
        Lien Instagram
        <input type="url" name="instagram" defaultValue={reglages.instagram} placeholder="https://www.instagram.com/…" />
        <small>Laisse vide pour masquer le bouton « Instagram » sur tout le site.</small>
      </label>
      <label>
        Email du bouton « Let’s talk about your project »
        <input type="email" name="email" defaultValue={reglages.email} required />
        <small>Un clic sur le bouton ouvre un nouveau message vers cette adresse.</small>
      </label>
      {etat?.erreur && <p className="message message--erreur">{etat.erreur}</p>}
      {etat?.ok && <p className="message message--ok">{etat.ok}</p>}
      <button className="btn btn--principal" disabled={envoi}>
        {envoi ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </form>
  );
}

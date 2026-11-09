'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Loader2, Terminal } from 'lucide-react';
import { api, session } from '../lib/api';
import type { ReponseConnexion } from '../lib/types';
import { Erreur } from '../components/ui';

export function Connexion({ surConnexion }: { surConnexion: () => void }) {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<unknown>(null);

  useEffect(() => {
    document.title = 'Connexion · Console CETIC';
  }, []);

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    try {
      const r = await api<ReponseConnexion>('/console/auth/connexion', { methode: 'POST', corps: { email, motDePasse } });
      session.definir(r.jeton);
      surConnexion();
    } catch (err) {
      setErreur(err);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <form onSubmit={soumettre} className="w-full max-w-sm space-y-4 rounded-lg border border-bord bg-surface p-6">
        <div className="flex items-center gap-2">
          <Terminal className="h-6 w-6 text-primaire" />
          <div>
            <h1 className="text-lg font-bold leading-tight text-encre">Console CETIC</h1>
            <p className="text-xs text-encre-2">Accès réservé au développeur</p>
          </div>
        </div>

        {erreur != null && <Erreur erreur={erreur} />}

        <div>
          <label className="etiquette" htmlFor="email">
            E-mail
          </label>
          <input id="email" className="champ" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="etiquette" htmlFor="mdp">
            Mot de passe
          </label>
          <input id="mdp" className="champ" type="password" autoComplete="current-password" required value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} />
        </div>

        <button type="submit" className="bouton-primaire w-full" disabled={envoi}>
          {envoi && <Loader2 className="h-4 w-4 animate-spin" />}
          Se connecter
        </button>
      </form>
    </div>
  );
}

'use client';

import { useEffect, useState, type FormEvent } from 'react';
import clsx from 'clsx';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { api, session } from '../lib/api';
import type { ReponseConnexion } from '../lib/types';
import { Erreur } from '../components/ui';

export function Connexion({ surConnexion }: { surConnexion: () => void }) {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [visible, setVisible] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<unknown>(null);
  const [secousse, setSecousse] = useState(0);

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
      setSecousse((n) => n + 1);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="fond-connexion flex min-h-screen items-center justify-center p-4">
      {/* La clé relance la secousse à chaque échec. */}
      <form key={secousse} onSubmit={soumettre} className={clsx('apparition w-full max-w-md space-y-4 rounded-xl bg-surface p-6 shadow-2xl sm:p-8', secousse > 0 && 'secousse')}>
        <div className="space-y-2 pb-2 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg">
            <img src="/favicon.png" alt="" width={56} height={56} className="object-contain" />
          </div>
          <h1 className="pt-1 text-2xl font-bold tracking-tight text-encre">Console CETIC</h1>
          <p className="text-sm text-encre-2">Connectez-vous pour accéder au tableau de bord</p>
        </div>

        {erreur != null && <Erreur erreur={erreur} />}

        <div>
          <label className="etiquette" htmlFor="email">
            E-mail
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-encre-3" />
            <input id="email" className="champ h-11 pl-10" type="email" autoComplete="username" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="etiquette" htmlFor="mdp">
            Mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-encre-3" />
            <input id="mdp" className="champ h-11 px-10" type={visible ? 'text' : 'password'} autoComplete="current-password" required value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-encre-3 hover:text-encre"
              onClick={() => setVisible(!visible)}
              aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button type="submit" className="bouton-primaire h-11 w-full" disabled={envoi}>
          {envoi && <Loader2 className="h-4 w-4 animate-spin" />}
          Se connecter
        </button>
      </form>
    </div>
  );
}

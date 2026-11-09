'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Loader2, ShieldCheck, Terminal } from 'lucide-react';
import qrcode from 'qrcode-generator';
import { api, session } from '../lib/api';
import type { ReponseConnexion } from '../lib/types';
import { Erreur } from '../components/ui';

/** Mot de passe, puis code à usage unique. À la toute première connexion, le QR code à scanner. */
export function Connexion({ surConnexion }: { surConnexion: () => void }) {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [code, setCode] = useState('');
  const [enrolement, setEnrolement] = useState<ReponseConnexion['enrolement']>(null);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<unknown>(null);

  useEffect(() => {
    document.title = 'Connexion · Console CETIC';
  }, []);

  const image = useMemo(() => {
    if (!enrolement) return null;
    const qr = qrcode(0, 'M');
    qr.addData(enrolement.uri);
    qr.make();
    return qr.createDataURL(5, 10);
  }, [enrolement]);

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    try {
      const r = await api<ReponseConnexion>('/console/auth/connexion', { methode: 'POST', corps: { email, motDePasse, code: code || undefined } });
      if (r.jeton) {
        session.definir(r.jeton);
        surConnexion();
      } else {
        setEnrolement(r.enrolement);
      }
    } catch (err) {
      setErreur(err);
      setCode('');
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

        {enrolement ? (
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-sm text-encre">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primaire" />
              <p>Activez la double authentification : scannez ce code avec une application comme Google Authenticator ou Aegis.</p>
            </div>
            {image && (
              <div className="flex justify-center">
                <img src={image} alt="QR code à scanner avec l'application d'authentification" className="rounded bg-white" />
              </div>
            )}
            <div>
              <span className="etiquette">Ou saisissez cette clé</span>
              <code className="block break-all rounded bg-surface-2 px-2 py-1.5 text-xs text-encre">{enrolement.secret}</code>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}

        <div>
          <label className="etiquette" htmlFor="code">
            Code à 6 chiffres
          </label>
          <input
            id="code"
            className="champ tracking-widest"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="\d{6}"
            required={enrolement != null}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          />
          {!enrolement && <p className="mt-1 text-xs text-encre-2">À laisser vide à la toute première connexion.</p>}
        </div>

        <button type="submit" className="bouton-primaire w-full" disabled={envoi}>
          {envoi && <Loader2 className="h-4 w-4 animate-spin" />}
          {enrolement ? 'Activer et se connecter' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}

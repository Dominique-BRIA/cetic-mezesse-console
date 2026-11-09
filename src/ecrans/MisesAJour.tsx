'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, CheckCircle2, ExternalLink, Loader2, Zap } from 'lucide-react';
import { api } from '../lib/api';
import { dateHeure, taille } from '../lib/format';
import { usePublications } from '../lib/publications';
import type { VuePolitique } from '../lib/types';
import { Carte, Chargement, Erreur, Etat, Page, Tableau, Vide } from '../components/ui';

export default function MisesAJour() {
  const q = useQuery({ queryKey: ['politique'], queryFn: () => api<VuePolitique>('/console/mises-a-jour/politique') });
  return (
    <Page titre="Mises à jour" description="Arrêter la diffusion d'une APK sans rien publier : l'application consulte cette politique avant chaque téléchargement.">
      {q.isError && <Erreur erreur={q.error} />}
      {q.isPending && <Chargement lignes={6} />}
      {/* Recréé après chaque enregistrement : le formulaire repart des valeurs du serveur. */}
      {q.data && <Formulaire key={q.data.majLe ?? 'initial'} vue={q.data} />}
    </Page>
  );
}

function Formulaire({ vue }: { vue: VuePolitique }) {
  const client = useQueryClient();
  const publications = usePublications();
  const [suspendue, setSuspendue] = useState(vue.politique.suspendue);
  const [bloquees, setBloquees] = useState<number[]>(vue.politique.versionsBloquees);
  const [minimum, setMinimum] = useState(String(vue.politique.minimum));
  const [message, setMessage] = useState(vue.politique.message ?? '');

  const enregistrer = useMutation({
    mutationFn: () =>
      api<VuePolitique>('/console/mises-a-jour/politique', {
        methode: 'PUT',
        corps: { suspendue, versionsBloquees: bloquees, minimum: Number(minimum) || 0, message },
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['politique'] }),
  });

  const basculer = (n: number) => setBloquees((b) => (b.includes(n) ? b.filter((x) => x !== n) : [...b, n]));
  const soumettre = (e: FormEvent) => {
    e.preventDefault();
    enregistrer.mutate();
  };

  return (
    <form onSubmit={soumettre} className="space-y-5">
      {enregistrer.isError && <Erreur erreur={enregistrer.error} />}

      <Carte titre="Politique" actions={vue.majLe && <span className="text-xs text-encre-2">Modifiée le {dateHeure(vue.majLe)} par {vue.majPar}</span>}>
        <div className="space-y-4">
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[rgb(var(--primaire))]" checked={suspendue} onChange={(e) => setSuspendue(e.target.checked)} />
            <span>
              <span className="block text-sm font-semibold text-encre">Suspendre toutes les mises à jour</span>
              <span className="block text-sm text-encre-2">Aucun téléphone ne télécharge de nouvelle APK tant que cette case reste cochée.</span>
            </span>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="etiquette" htmlFor="minimum">
                Numéro de version minimal
              </label>
              <input id="minimum" className="champ" type="number" min={0} value={minimum} onChange={(e) => setMinimum(e.target.value)} />
              <p className="mt-1 text-xs text-encre-2">En dessous, l'application se bloque et impose la mise à jour. 0 : aucun minimum.</p>
            </div>
            <div>
              <label className="etiquette" htmlFor="message">
                Note interne
              </label>
              <input id="message" className="champ" maxLength={300} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Pourquoi ce réglage" />
            </div>
          </div>
        </div>
      </Carte>

      <Carte titre="Versions publiées" sansMarge>
        {publications.isPending && <Chargement lignes={3} />}
        {publications.isError && <Vide titre="GitHub est injoignable">La liste des versions n'a pas pu être chargée. La politique reste modifiable.</Vide>}
        {publications.data && (
          <Tableau>
            <thead>
              <tr>
                <th>Version</th>
                <th>Publiée le</th>
                <th>Taille</th>
                <th>Type</th>
                <th>État</th>
                <th aria-label="Action" />
              </tr>
            </thead>
            <tbody>
              {publications.data.map((p) => {
                const bloquee = bloquees.includes(p.numero);
                return (
                  <tr key={p.numero}>
                    <td className="whitespace-nowrap font-medium text-encre">
                      {p.nom} <span className="font-normal text-encre-2">({p.numero})</span>
                    </td>
                    <td className="whitespace-nowrap text-encre-2">{dateHeure(p.date)}</td>
                    <td className="whitespace-nowrap text-encre-2">{p.taille ? taille(p.taille) : '—'}</td>
                    <td className="text-encre-2">{p.shorebird ? 'Shorebird' : 'Classique'}</td>
                    <td>
                      {bloquee ? (
                        <Etat ton="danger" icone={<Ban className="h-3.5 w-3.5" />}>
                          Bloquée
                        </Etat>
                      ) : (
                        <Etat ton="succes" icone={<CheckCircle2 className="h-3.5 w-3.5" />}>
                          Diffusable
                        </Etat>
                      )}
                    </td>
                    <td className="text-right">
                      <button type="button" className="bouton-secondaire py-1" onClick={() => basculer(p.numero)}>
                        {bloquee ? 'Débloquer' : 'Bloquer'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Tableau>
        )}
      </Carte>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <a href="https://console.shorebird.dev" target="_blank" rel="noreferrer" className="lien inline-flex items-center gap-1 text-sm">
          <Zap className="h-4 w-4" /> Correctifs Shorebird : les retirer depuis leur console <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <button type="submit" className="bouton-primaire" disabled={enregistrer.isPending}>
          {enregistrer.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Enregistrer la politique
        </button>
      </div>
    </form>
  );
}

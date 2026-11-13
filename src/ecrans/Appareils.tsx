'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { BellRing, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { dateHeure, ilYa, libelleRole, pluriel } from '../lib/format';
import { usePublications } from '../lib/publications';
import type { Parc } from '../lib/types';
import { Carte, Chargement, Erreur, Etat, Page, Tableau, Vide } from '../components/ui';

export default function Appareils() {
  const q = useQuery({ queryKey: ['appareils'], queryFn: () => api<Parc>('/console/appareils') });
  const derniere = usePublications().data?.[0];
  const [recherche, setRecherche] = useState('');
  const [version, setVersion] = useState('');
  const [essai, setEssai] = useState<{ ok: boolean; texte: string } | null>(null);
  // Notification d'essai à un seul téléphone : vérifie Firebase, le jeton et l'affichage sur l'appareil.
  const envoi = useMutation({
    mutationFn: (installationId: string) => api<{ message: string }>(`/console/appareils/${encodeURIComponent(installationId)}/push-essai`, { methode: 'POST' }),
    onMutate: () => setEssai(null),
    onSuccess: (r) => setEssai({ ok: true, texte: r.message }),
    onError: (e) => setEssai({ ok: false, texte: e instanceof Error ? e.message : 'Envoi impossible.' }),
  });

  const versions = useMemo(() => [...new Set((q.data?.appareils ?? []).map((a) => a.nomVersion))], [q.data]);
  const lignes = useMemo(() => {
    const t = recherche.trim().toLowerCase();
    return (q.data?.appareils ?? []).filter((a) => (!version || a.nomVersion === version) && (!t || `${a.compte ?? ''} ${a.modele ?? ''}`.toLowerCase().includes(t)));
  }, [q.data, recherche, version]);

  return (
    <Page titre="Appareils" description="Chaque téléphone qui a ouvert l'application : sa version, son dernier compte et sa dernière activité.">
      {q.isError && <Erreur erreur={q.error} />}
      {essai && (essai.ok ? (
        <div className="flex items-center gap-2 rounded-lg border border-succes/30 bg-succes/10 px-3 py-2.5 text-sm text-succes" role="status">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {essai.texte} Vérifiez qu'elle s'affiche sur le téléphone.
        </div>
      ) : (
        <Erreur erreur={new Error(essai.texte)} />
      ))}
      <Carte
        titre={q.data ? pluriel(lignes.length, 'appareil') : 'Appareils'}
        sansMarge
        actions={
          <div className="flex flex-wrap gap-2">
            <input className="champ w-48" type="search" placeholder="Compte ou modèle" aria-label="Rechercher un compte ou un modèle" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
            <select className="champ w-48" aria-label="Filtrer par version" value={version} onChange={(e) => setVersion(e.target.value)}>
              <option value="">Toutes les versions</option>
              {versions.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
        }
      >
        {q.isPending && <Chargement />}
        {q.data && lignes.length === 0 && <Vide titre="Aucun appareil">Aucun téléphone ne correspond, ou aucun ne s'est encore signalé.</Vide>}
        {lignes.length > 0 && (
          <Tableau>
            <thead>
              <tr>
                <th>Compte</th>
                <th>Rôle</th>
                <th>Version</th>
                <th>État</th>
                <th>Modèle</th>
                <th>Android</th>
                <th>Dernière activité</th>
                <th>Notifications</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((a) => (
                <tr key={a.installationId}>
                  <td className="font-medium text-encre">{a.compte ?? '—'}</td>
                  <td className="text-encre-2">{libelleRole(a.role)}</td>
                  <td className="whitespace-nowrap">
                    {a.nomVersion} <span className="text-encre-2">({a.numeroVersion})</span>
                    {a.correctif != null && <span className="ml-1 text-xs text-encre-2">correctif {a.correctif}</span>}
                  </td>
                  <td>
                    {derniere == null ? (
                      '—'
                    ) : a.numeroVersion >= derniere.numero ? (
                      <Etat ton="succes" icone={<CheckCircle2 className="h-3.5 w-3.5" />}>
                        À jour
                      </Etat>
                    ) : (
                      <Etat ton="alerte" icone={<Clock className="h-3.5 w-3.5" />}>
                        En retard
                      </Etat>
                    )}
                  </td>
                  <td className="whitespace-nowrap text-encre-2">{a.modele ?? '—'}</td>
                  <td className="text-encre-2">{a.versionAndroid ?? '—'}</td>
                  <td className="whitespace-nowrap text-encre-2" title={dateHeure(a.derniereVue)}>
                    {ilYa(a.derniereVue)}
                  </td>
                  <td className="whitespace-nowrap">
                    {a.push ? (
                      <button
                        type="button"
                        className="bouton-secondaire h-8 px-2.5 text-xs"
                        disabled={envoi.isPending}
                        onClick={() => envoi.mutate(a.installationId)}
                        title="Envoyer une notification d'essai à ce seul téléphone"
                      >
                        {envoi.isPending && envoi.variables === a.installationId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BellRing className="h-3.5 w-3.5" />}
                        Essai
                      </button>
                    ) : (
                      <span className="text-xs text-encre-3" title="Version 1.1.6 ou plus, ouverte avec un compte connecté">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Tableau>
        )}
      </Carte>

      {q.data && q.data.comptesSansAppareil.length > 0 && (
        <Carte titre={`${pluriel(q.data.comptesSansAppareil.length, 'compte')} sans appareil signalé`} sansMarge>
          <p className="border-b border-bord px-4 py-3 text-sm text-encre-2">
            Ces personnes utilisent le site seul, ou une version de l'application trop ancienne pour se signaler. Une version bloquée au démarrage ne se signale pas non plus.
          </p>
          <Tableau>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Rôle</th>
                <th>Téléphone</th>
              </tr>
            </thead>
            <tbody>
              {q.data.comptesSansAppareil.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium text-encre">{c.nom}</td>
                  <td className="text-encre-2">{libelleRole(c.role)}</td>
                  <td className="text-encre-2">{c.telephone ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </Tableau>
        </Carte>
      )}
    </Page>
  );
}

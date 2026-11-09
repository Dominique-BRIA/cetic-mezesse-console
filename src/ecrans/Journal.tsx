'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { dateHeure } from '../lib/format';
import type { LigneJournal } from '../lib/types';
import { Carte, Chargement, Erreur, Page, Tableau, Vide } from '../components/ui';

const ACTIONS: Record<string, string> = {
  connexion: 'Connexion',
  'connexion.echec': 'Connexion refusée',
  'connexion.verrouillage': 'Compte verrouillé',
  'plantage.resolu': 'Plantage marqué résolu',
  'plantage.rouvert': 'Plantage rouvert',
  'mises-a-jour.politique': 'Politique de mise à jour modifiée',
};

export default function Journal() {
  const q = useQuery({ queryKey: ['journal'], queryFn: () => api<LigneJournal[]>('/console/journal') });
  return (
    <Page titre="Journal" description="Chaque connexion et chaque action faite depuis cette console : les 200 dernières.">
      {q.isError && <Erreur erreur={q.error} />}
      <Carte sansMarge>
        {q.isPending && <Chargement />}
        {q.data?.length === 0 && <Vide titre="Journal vide" />}
        {q.data && q.data.length > 0 && (
          <Tableau>
            <thead>
              <tr>
                <th>Date</th>
                <th>Compte</th>
                <th>Action</th>
                <th>Détail</th>
                <th>Adresse</th>
              </tr>
            </thead>
            <tbody>
              {q.data.map((l) => (
                <tr key={l.id}>
                  <td className="whitespace-nowrap text-encre-2">{dateHeure(l.date)}</td>
                  <td className="whitespace-nowrap text-encre-2">{l.adminEmail}</td>
                  <td className="font-medium text-encre">{ACTIONS[l.action] ?? l.action}</td>
                  <td className="max-w-md break-words text-xs text-encre-2">{[l.cible, l.detail].filter(Boolean).join(' · ') || '—'}</td>
                  <td className="whitespace-nowrap text-xs text-encre-2">{l.adresse ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </Tableau>
        )}
      </Carte>
    </Page>
  );
}

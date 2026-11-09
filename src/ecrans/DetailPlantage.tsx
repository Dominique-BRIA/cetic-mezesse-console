'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, CircleAlert, RotateCcw } from 'lucide-react';
import { api } from '../lib/api';
import { dateHeure, ilYa } from '../lib/format';
import type { DetailPlantage as Detail } from '../lib/types';
import { Carte, Chargement, Erreur, Etat, Indicateur, Page, Tableau } from '../components/ui';

export default function DetailPlantage() {
  const { empreinte } = useParams<{ empreinte: string }>();
  const client = useQueryClient();
  const q = useQuery({ queryKey: ['plantage', empreinte], queryFn: () => api<Detail>(`/console/plantages/${empreinte}`) });
  const resolution = useMutation({
    mutationFn: (resolu: boolean) => api(`/console/plantages/${empreinte}/resolution`, { methode: 'POST', corps: { resolu } }),
    onSuccess: () => client.invalidateQueries(),
  });
  const g = q.data?.groupe;

  return (
    <Page
      titre="Détail du plantage"
      actions={
        g && (
          <button type="button" className={g.resolu ? 'bouton-secondaire' : 'bouton-primaire'} disabled={resolution.isPending} onClick={() => resolution.mutate(!g.resolu)}>
            {g.resolu ? <RotateCcw className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            {g.resolu ? 'Rouvrir' : 'Marquer résolu'}
          </button>
        )
      }
    >
      <Link href="/plantages" className="lien inline-flex items-center gap-1 text-sm">
        <ArrowLeft className="h-4 w-4" /> Tous les plantages
      </Link>
      {q.isError && <Erreur erreur={q.error} />}
      {resolution.isError && <Erreur erreur={resolution.error} />}
      {q.isPending && <Chargement lignes={6} />}
      {q.data && g && (
        <>
          <Carte>
            <div className="mb-2 flex flex-wrap items-center gap-3">
              {g.resolu ? (
                <Etat ton="succes" icone={<CheckCircle2 className="h-3.5 w-3.5" />}>
                  Résolu
                </Etat>
              ) : (
                <Etat ton="danger" icone={<CircleAlert className="h-3.5 w-3.5" />}>
                  Ouvert
                </Etat>
              )}
              <span className="text-xs font-semibold text-encre-2">{g.type}</span>
            </div>
            <p className="break-words text-sm font-medium text-encre">{g.message}</p>
          </Carte>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Indicateur libelle="Occurrences" valeur={g.occurrences} />
            <Indicateur libelle="Téléphones" valeur={g.appareils} />
            <Indicateur libelle="Première fois" valeur={<span className="text-base">{dateHeure(g.premiereFois)}</span>} />
            <Indicateur libelle="Dernière fois" valeur={<span className="text-base">{dateHeure(g.derniereFois)}</span>} detail={ilYa(g.derniereFois)} />
          </div>

          <Carte titre="Pile d'appels" sansMarge>
            <pre className="max-h-96 overflow-auto whitespace-pre p-4 text-xs leading-relaxed text-encre">{q.data.pile || 'Aucune pile transmise.'}</pre>
          </Carte>

          <Carte titre="Téléphones touchés" sansMarge>
            <Tableau>
              <thead>
                <tr>
                  <th>Compte</th>
                  <th>Modèle</th>
                  <th>Android</th>
                  <th>Version</th>
                  <th>Nombre</th>
                  <th>Dernière fois</th>
                </tr>
              </thead>
              <tbody>
                {q.data.occurrences.map((o) => (
                  <tr key={`${o.installationId}-${o.nomVersion}`}>
                    <td className="font-medium text-encre">{o.compte ?? 'Non identifié'}</td>
                    <td className="whitespace-nowrap text-encre-2">{o.modele ?? '—'}</td>
                    <td className="text-encre-2">{o.versionAndroid ?? '—'}</td>
                    <td className="whitespace-nowrap">{o.nomVersion}</td>
                    <td className="font-semibold text-encre">{o.occurrences}</td>
                    <td className="whitespace-nowrap text-encre-2" title={dateHeure(o.derniereFois)}>
                      {ilYa(o.derniereFois)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tableau>
          </Carte>
        </>
      )}
    </Page>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, CircleAlert } from 'lucide-react';
import { api } from '../lib/api';
import { dateHeure, ilYa } from '../lib/format';
import type { GroupePlantage } from '../lib/types';
import { Carte, Chargement, Erreur, Etat, Page, Tableau, Vide } from '../components/ui';

const ETATS = [
  { code: 'ouverts', libelle: 'Ouverts' },
  { code: 'resolus', libelle: 'Résolus' },
  { code: 'tous', libelle: 'Tous' },
];

export default function Plantages() {
  const [etat, setEtat] = useState('ouverts');
  const q = useQuery({ queryKey: ['plantages', etat], queryFn: () => api<GroupePlantage[]>(`/console/plantages?etat=${etat}`) });

  return (
    <Page titre="Plantages" description="Les erreurs remontées par l'application, regroupées par origine. Conservées 90 jours.">
      {q.isError && <Erreur erreur={q.error} />}
      <Carte
        titre="Problèmes"
        sansMarge
        actions={
          <div className="flex gap-1" role="tablist">
            {ETATS.map((e) => (
              <button
                key={e.code}
                type="button"
                role="tab"
                aria-selected={etat === e.code}
                className={clsx('rounded px-3 py-1.5 text-sm font-medium', etat === e.code ? 'bg-primaire-pale font-semibold text-primaire' : 'text-encre-2 hover:bg-surface-2')}
                onClick={() => setEtat(e.code)}
              >
                {e.libelle}
              </button>
            ))}
          </div>
        }
      >
        {q.isPending && <Chargement />}
        {q.data?.length === 0 && <Vide titre={etat === 'ouverts' ? 'Aucun plantage ouvert' : 'Aucun plantage'} />}
        {q.data && q.data.length > 0 && (
          <Tableau>
            <thead>
              <tr>
                <th>Erreur</th>
                <th>Type</th>
                <th>État</th>
                <th>Nombre</th>
                <th>Téléphones</th>
                <th>Versions</th>
                <th>Dernière fois</th>
              </tr>
            </thead>
            <tbody>
              {q.data.map((g) => (
                <tr key={g.empreinte}>
                  <td className="max-w-md">
                    <Link href={`/plantages/${g.empreinte}`} className="lien line-clamp-2 break-words">
                      {g.message}
                    </Link>
                  </td>
                  <td className="text-encre-2">{g.type}</td>
                  <td>
                    {g.resolu ? (
                      <Etat ton="succes" icone={<CheckCircle2 className="h-3.5 w-3.5" />}>
                        Résolu
                      </Etat>
                    ) : (
                      <Etat ton="danger" icone={<CircleAlert className="h-3.5 w-3.5" />}>
                        Ouvert
                      </Etat>
                    )}
                  </td>
                  <td className="font-semibold text-encre">{g.occurrences}</td>
                  <td className="text-encre-2">{g.appareils}</td>
                  <td className="whitespace-nowrap text-encre-2">{g.versions.join(', ')}</td>
                  <td className="whitespace-nowrap text-encre-2" title={dateHeure(g.derniereFois)}>
                    {ilYa(g.derniereFois)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Tableau>
        )}
      </Carte>
    </Page>
  );
}

'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { PauseCircle } from 'lucide-react';
import { api } from '../lib/api';
import { pluriel } from '../lib/format';
import { usePublications } from '../lib/publications';
import type { Apercu as DonneesApercu } from '../lib/types';
import { Carte, Chargement, Erreur, Indicateur, Page, Vide } from '../components/ui';

export default function Apercu() {
  const q = useQuery({ queryKey: ['apercu'], queryFn: () => api<DonneesApercu>('/console/apercu'), refetchInterval: 60_000 });
  const publications = usePublications();
  const derniere = publications.data?.[0];
  const d = q.data;
  const maximum = d ? Math.max(1, ...d.repartition.map((r) => r.appareils)) : 1;
  const enRetard = d && derniere ? d.repartition.filter((r) => r.numeroVersion < derniere.numero).reduce((s, r) => s + r.appareils, 0) : null;

  return (
    <Page titre="Aperçu" description="L'état du parc d'appareils, des plantages et des mises à jour.">
      {q.isError && <Erreur erreur={q.error} />}
      {!d && q.isPending && <Chargement lignes={6} />}
      {d && (
        <>
          {d.politique.suspendue && (
            <div className="flex items-center gap-2 rounded border border-alerte/40 bg-alerte/10 px-3 py-2.5 text-sm font-medium text-alerte" role="status">
              <PauseCircle className="h-4 w-4 shrink-0" />
              <span>
                Les mises à jour sont suspendues.{' '}
                <Link href="/mises-a-jour" className="underline underline-offset-2">
                  Voir la politique
                </Link>
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Indicateur libelle="Appareils" valeur={d.appareils} detail={`${d.actifsSeptJours} actifs sur 7 jours`} />
            <Indicateur libelle="Comptes sans appareil" valeur={d.comptesSansAppareil} detail={`sur ${d.comptesActifs} comptes actifs`} />
            <Indicateur libelle="Plantages ouverts" valeur={d.plantagesOuverts} detail="problèmes distincts" />
            <Indicateur libelle="Plantages, 24 heures" valeur={d.plantages24h} detail="occurrences récentes" />
          </div>

          <Carte
            titre="Versions installées"
            actions={
              <Link href="/appareils" className="lien text-sm">
                Voir les appareils
              </Link>
            }
          >
            {d.repartition.length === 0 ? (
              <Vide titre="Aucun appareil ne s'est encore signalé">Les téléphones apparaissent ici dès l'ouverture d'une version qui envoie son signal.</Vide>
            ) : (
              <>
                <ul className="space-y-3">
                  {d.repartition.map((r) => (
                    <li key={r.numeroVersion} title={`${pluriel(r.appareils, 'appareil')} en version ${r.nomVersion}`}>
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="font-medium text-encre">
                          {r.nomVersion} <span className="font-normal text-encre-2">({r.numeroVersion})</span>
                          {derniere?.numero === r.numeroVersion && <span className="ml-2 text-xs font-normal text-encre-2">dernière publiée</span>}
                        </span>
                        <span className="font-semibold text-encre">{r.appareils}</span>
                      </div>
                      <div className="mt-1 h-2 rounded bg-surface-2">
                        <div className="h-full rounded bg-primaire" style={{ width: `${(r.appareils / maximum) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
                {enRetard != null && (
                  <p className="mt-4 text-sm text-encre-2">
                    {enRetard === 0 ? 'Tous les appareils sont sur la dernière version.' : `${pluriel(enRetard, 'appareil')} sur une version plus ancienne que la ${derniere?.nom}.`}
                  </p>
                )}
              </>
            )}
          </Carte>
        </>
      )}
    </Page>
  );
}

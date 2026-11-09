'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { Activity, Bug, CheckCircle2, Clock, Flame, PauseCircle, Smartphone, UploadCloud, UserX } from 'lucide-react';
import { api } from '../lib/api';
import { evolution, jourCourt, PERIODES, plantagesParType, TYPES_PLANTAGE, useAnalytique } from '../lib/analytique';
import { libelleRole, pluriel } from '../lib/format';
import { usePublications } from '../lib/publications';
import type { Apercu as DonneesApercu, Moi } from '../lib/types';
import { Chargement, Erreur, Indicateur, Page } from '../components/ui';
import { Aire, Anneau, Barres, CarteGraphique, Colonnes, Legende, SERIE, SERIE_NEUTRE } from '../components/graphiques';

const VIDE_SIGNAL = { titre: 'Aucune donnée pour le moment', texte: "Les courbes se remplissent dès qu'un téléphone ouvre une version de l'application qui envoie son signal (1.1.5 ou plus)." };

function Banniere({ actifs }: { actifs: number }) {
  const moi = useQuery({ queryKey: ['moi'], queryFn: () => api<Moi>('/console/auth/moi'), staleTime: Infinity });
  const [maintenant, setMaintenant] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setMaintenant(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const heure = maintenant.getHours();
  return (
    <div className="apparition relative overflow-hidden rounded-2xl bg-surface shadow-sm">
      <div className="banniere-lueur" />
      <div className="relative flex flex-wrap items-center justify-between gap-6 px-6 py-5 sm:px-8 sm:py-6">
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight text-encre">
            {heure >= 18 || heure < 5 ? 'Bonsoir' : 'Bonjour'}, <span className="text-primaire">{moi.data?.nom.split(' ')[0] ?? ''}</span>
          </h2>
          <p className="mt-0.5 text-sm text-encre-2">L'état des téléphones du CETIC de Mezesse aujourd'hui</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-succes/25 bg-succes/10 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-succes opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-succes" />
              </span>
              <span className="text-xs font-medium text-succes">{pluriel(actifs, 'téléphone')} actif{actifs > 1 ? 's' : ''} aujourd'hui</span>
            </div>
            <Link href="/mises-a-jour" className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-shadow hover:shadow-md">
              <UploadCloud className="h-3.5 w-3.5" />
              Mises à jour
            </Link>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-encre-2" />
            <span className="text-2xl font-bold tabular-nums tracking-tight text-encre">{maintenant.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <span className="text-xs text-encre-2">{maintenant.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
}

export default function Apercu() {
  const [jours, setJours] = useState<number>(30);
  const q = useQuery({ queryKey: ['apercu'], queryFn: () => api<DonneesApercu>('/console/apercu'), refetchInterval: 60_000 });
  const a = useAnalytique(jours);
  const derniere = usePublications().data?.[0];
  const d = q.data;
  const stats = a.data;

  const courbe = useMemo(() => (stats?.serie ?? []).map((j) => ({ libelle: jourCourt(j.jour), actifs: j.actifs })), [stats]);
  const plantages = useMemo(() => plantagesParType(stats?.serie ?? []), [stats]);
  const typesVus = TYPES_PLANTAGE.filter((t) => plantages.some((l) => Number(l[t.code]) > 0));
  const seriesPlantages = typesVus.map((t) => ({ cle: t.code, nom: t.libelle, couleur: SERIE[TYPES_PLANTAGE.indexOf(t)] }));

  const versions = useMemo(() => {
    if (!d) return [];
    const parNombre = [...d.repartition].sort((x, y) => y.appareils - x.appareils);
    const premieres = parNombre.slice(0, 5).map((r) => ({ nom: `Version ${r.nomVersion}`, valeur: r.appareils, couleur: SERIE[r.numeroVersion % 5] }));
    const reste = parNombre.slice(5).reduce((s, r) => s + r.appareils, 0);
    return reste ? [...premieres, { nom: 'Autres', valeur: reste, couleur: SERIE_NEUTRE }] : premieres;
  }, [d]);

  const roles = useMemo(() => (stats?.roles ?? []).map((r) => ({ libelle: libelleRole(r.role), equipes: r.equipes, sans: r.sansAppareil })), [stats]);
  const aJour = d && derniere && d.appareils > 0 ? Math.round((d.repartition.filter((r) => r.numeroVersion >= derniere.numero).reduce((s, r) => s + r.appareils, 0) / d.appareils) * 100) : null;
  const tendanceActifs = stats ? evolution(stats.periode.actifs, stats.precedente.actifs) : undefined;
  const tendancePlantages = stats ? evolution(stats.periode.plantages, stats.precedente.plantages) : undefined;
  const actifsDuJour = stats?.serie.at(-1)?.actifs ?? 0;
  const aucunActif = courbe.every((l) => l.actifs === 0);
  const aucunPlantage = seriesPlantages.length === 0;

  return (
    <div className="space-y-6">
      <Banniere actifs={actifsDuJour} />
      <Page
        titre="Aperçu"
        description="Le parc d'appareils, les plantages et les mises à jour."
        actions={
          <select className="champ w-32" aria-label="Période" value={jours} onChange={(e) => setJours(Number(e.target.value))}>
            {PERIODES.map((p) => (
              <option key={p} value={p}>
                {p} jours
              </option>
            ))}
          </select>
        }
      >
        {(q.isError || a.isError) && <Erreur erreur={q.error ?? a.error} />}
        {!d && q.isPending && <Chargement lignes={6} />}
        {d && (
          <div className={clsx('space-y-6 transition-opacity', a.isPlaceholderData && 'opacity-60')}>
            {d.politique.suspendue && (
              <div className="flex items-center gap-2 rounded-lg border border-alerte/40 bg-alerte/10 px-3 py-2.5 text-sm font-medium text-alerte" role="status">
                <PauseCircle className="h-4 w-4 shrink-0" />
                <span>
                  Les mises à jour sont suspendues.{' '}
                  <Link href="/mises-a-jour" className="underline underline-offset-2">
                    Voir la politique
                  </Link>
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Indicateur libelle="Appareils" valeur={d.appareils} detail={`${pluriel(d.actifsSeptJours, 'actif')} sur 7 jours`} icone={Smartphone} teinte="#6366f1" href="/appareils" />
              <Indicateur
                libelle={`Actifs sur ${jours} jours`}
                valeur={stats?.periode.actifs ?? '—'}
                detail="téléphones différents"
                icone={Activity}
                teinte="#22c55e"
                href="/analytique"
                tendance={tendanceActifs == null ? undefined : { pourcentage: tendanceActifs, bon: tendanceActifs >= 0 }}
              />
              <Indicateur libelle="À jour" valeur={aJour == null ? '—' : `${aJour} %`} detail={derniere ? `sur la version ${derniere.nom}` : 'dernière version inconnue'} icone={CheckCircle2} teinte="#3b82f6" href="/appareils" />
              <Indicateur libelle="Comptes sans appareil" valeur={d.comptesSansAppareil} detail={`sur ${d.comptesActifs} comptes actifs`} icone={UserX} teinte="#f59e0b" href="/appareils" />
              <Indicateur libelle="Plantages ouverts" valeur={d.plantagesOuverts} detail="problèmes distincts" icone={Bug} teinte="#ef4444" href="/plantages" />
              <Indicateur
                libelle={`Plantages sur ${jours} jours`}
                valeur={stats?.periode.plantages ?? '—'}
                detail="occurrences remontées"
                icone={Flame}
                teinte="#8b5cf6"
                href="/plantages"
                tendance={tendancePlantages == null ? undefined : { pourcentage: tendancePlantages, bon: tendancePlantages <= 0 }}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <CarteGraphique titre="Téléphones actifs par jour" vide={aucunActif ? VIDE_SIGNAL : null} tableau={{ colonnes: ['Jour', 'Téléphones actifs'], lignes: courbe.map((l) => [l.libelle, l.actifs]) }}>
                  <Aire donnees={courbe} cle="actifs" nom="téléphones actifs" />
                </CarteGraphique>
              </div>
              <CarteGraphique
                titre="Versions installées"
                vide={versions.length === 0 ? VIDE_SIGNAL : null}
                tableau={{ colonnes: ['Version', 'Appareils'], lignes: versions.map((v) => [v.nom, v.valeur]) }}
              >
                <Anneau elements={versions} libelleTotal={d.appareils > 1 ? 'appareils' : 'appareil'} />
              </CarteGraphique>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <CarteGraphique
                  titre="Plantages par jour"
                  vide={aucunPlantage ? { titre: 'Aucun plantage sur la période', texte: "C'est la bonne nouvelle : aucun plantage n'a été remonté sur ces jours." } : null}
                  tableau={{ colonnes: ['Jour', ...typesVus.map((t) => t.libelle)], lignes: plantages.map((l) => [String(l.libelle), ...typesVus.map((t) => Number(l[t.code]))]) }}
                >
                  {seriesPlantages.length > 1 && <Legende elements={seriesPlantages.map((s) => ({ libelle: s.nom, couleur: s.couleur }))} />}
                  <Colonnes donnees={plantages} series={seriesPlantages} />
                </CarteGraphique>
              </div>
              <CarteGraphique
                titre="Comptes équipés par rôle"
                vide={roles.length === 0 ? { titre: 'Aucun compte actif', texte: "Aucun compte de l'école n'est actif." } : null}
                tableau={{ colonnes: ['Rôle', 'Avec téléphone', 'Sans téléphone'], lignes: roles.map((r) => [r.libelle, r.equipes, r.sans]) }}
              >
                <Legende
                  elements={[
                    { libelle: 'Avec téléphone', couleur: SERIE[0] },
                    { libelle: 'Sans téléphone', couleur: SERIE_NEUTRE },
                  ]}
                />
                <Barres
                  donnees={roles}
                  largeurLibelle={132}
                  series={[
                    { cle: 'equipes', nom: 'avec téléphone', couleur: SERIE[0] },
                    { cle: 'sans', nom: 'sans téléphone', couleur: SERIE_NEUTRE },
                  ]}
                />
              </CarteGraphique>
            </div>
          </div>
        )}
      </Page>
    </div>
  );
}

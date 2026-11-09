'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Activity, Bug, UserPlus } from 'lucide-react';
import { evolution, jourCourt, PERIODES, useAnalytique } from '../lib/analytique';
import { taille } from '../lib/format';
import { usePublications } from '../lib/publications';
import type { Part } from '../lib/types';
import { Chargement, Erreur, Indicateur, Page } from '../components/ui';
import { Barres, CarteGraphique, Colonnes, CourbePourcentage, SERIE } from '../components/graphiques';

const VIDE_SIGNAL = { titre: 'Aucune donnée pour le moment', texte: "Ce graphique se remplit dès qu'un téléphone ouvre une version de l'application qui envoie son signal (1.1.5 ou plus)." };
const SERIE_UNIQUE = (nom: string, cle = 'valeur') => [{ cle, nom, couleur: SERIE[0] }];

function RepartitionParc({ titre, parts, largeurLibelle }: { titre: string; parts: Part[]; largeurLibelle?: number }) {
  return (
    <CarteGraphique titre={titre} vide={parts.length === 0 ? VIDE_SIGNAL : null} tableau={{ colonnes: ['Nom', 'Appareils'], lignes: parts.map((p) => [p.libelle, p.valeur]) }}>
      <Barres donnees={parts} series={SERIE_UNIQUE('appareils')} largeurLibelle={largeurLibelle} />
    </CarteGraphique>
  );
}

export default function Analytique() {
  const [jours, setJours] = useState<number>(30);
  const q = useAnalytique(jours);
  const publications = usePublications().data;
  const d = q.data;

  const nouveaux = useMemo(() => (d?.serie ?? []).map((j) => ({ libelle: jourCourt(j.jour), nouveaux: j.nouveaux })), [d]);

  // La version de référence : la dernière publiée, ou la plus récente vue si GitHub ne répond pas.
  const reference = useMemo(() => {
    const vues = (d?.serie ?? []).flatMap((j) => Object.keys(j.parVersion).map(Number));
    return Math.max(publications?.[0]?.numero ?? 0, ...vues, 0);
  }, [d, publications]);
  const adoption = useMemo(
    () =>
      (d?.serie ?? []).map((j) => ({
        libelle: jourCourt(j.jour),
        part: j.actifs ? Math.round(((j.parVersion[reference] ?? 0) / j.actifs) * 100) : null,
      })),
    [d, reference],
  );

  const tailles = useMemo(
    () =>
      [...(publications ?? [])]
        .filter((p) => p.taille != null)
        .reverse()
        .map((p) => ({ libelle: p.nom, mo: Math.round(((p.taille as number) / 1_048_576) * 10) / 10, taille: p.taille as number })),
    [publications],
  );

  const tendance = (actuel: number, precedent: number, baisseBonne: boolean) => {
    const p = evolution(actuel, precedent);
    return p == null ? undefined : { pourcentage: p, bon: baisseBonne ? p <= 0 : p >= 0 };
  };

  return (
    <Page
      titre="Analytique"
      description="L'évolution du parc et des incidents sur la période choisie."
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
      {q.isError && <Erreur erreur={q.error} />}
      {!d && q.isPending && <Chargement lignes={6} />}
      {d && (
        <div className={clsx('space-y-6 transition-opacity', q.isPlaceholderData && 'opacity-60')}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Indicateur libelle="Téléphones actifs" valeur={d.periode.actifs} detail={`sur ${jours} jours`} icone={Activity} teinte="#22c55e" tendance={tendance(d.periode.actifs, d.precedente.actifs, false)} />
            <Indicateur libelle="Nouveaux appareils" valeur={d.periode.nouveaux} detail={`sur ${jours} jours`} icone={UserPlus} teinte="#6366f1" tendance={tendance(d.periode.nouveaux, d.precedente.nouveaux, false)} />
            <Indicateur libelle="Plantages" valeur={d.periode.plantages} detail={`sur ${jours} jours`} icone={Bug} teinte="#ef4444" tendance={tendance(d.periode.plantages, d.precedente.plantages, true)} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CarteGraphique titre="Adoption de la dernière version" vide={adoption.every((l) => l.part == null) ? VIDE_SIGNAL : null} tableau={{ colonnes: ['Jour', 'Part des téléphones actifs'], lignes: adoption.map((l) => [l.libelle, l.part == null ? '—' : `${l.part} %`]) }}>
              <CourbePourcentage donnees={adoption} cle="part" nom="des téléphones actifs" />
            </CarteGraphique>
            <CarteGraphique titre="Nouveaux appareils par jour" vide={nouveaux.every((l) => l.nouveaux === 0) ? VIDE_SIGNAL : null} tableau={{ colonnes: ['Jour', 'Nouveaux appareils'], lignes: nouveaux.map((l) => [l.libelle, l.nouveaux]) }}>
              <Colonnes donnees={nouveaux} series={SERIE_UNIQUE('nouveaux appareils', 'nouveaux')} />
            </CarteGraphique>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RepartitionParc titre="Modèles de téléphone" parts={d.modeles} largeurLibelle={140} />
            <RepartitionParc titre="Versions d'Android" parts={d.versionsAndroid} largeurLibelle={90} />
          </div>

          <CarteGraphique
            titre="Taille de l'APK par version publiée"
            vide={tailles.length === 0 ? { titre: 'Publications indisponibles', texte: 'GitHub ne répond pas pour le moment, ou aucune version ne contient d’APK.' } : null}
            tableau={{ colonnes: ['Version', 'Taille'], lignes: [...tailles].reverse().map((t) => [t.libelle, taille(t.taille)]) }}
          >
            <Colonnes donnees={tailles} series={SERIE_UNIQUE('Mo', 'mo')} suffixe=" Mo" decimales hauteur={240} />
          </CarteGraphique>
        </div>
      )}
    </Page>
  );
}

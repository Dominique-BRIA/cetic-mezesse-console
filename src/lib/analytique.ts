// Données des courbes : une seule période pour toute la page, l'ancienne reste affichée pendant le chargement.
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from './api';
import type { Analytique, JourAnalytique } from './types';

export const PERIODES = [7, 30, 90] as const;

export function useAnalytique(jours: number) {
  return useQuery({
    queryKey: ['analytique', jours],
    queryFn: () => api<Analytique>(`/console/analytique?jours=${jours}`),
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
  });
}

const JOUR = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

/** La date vient sans fuseau : midi évite tout décalage d'un jour. */
export const jourCourt = (iso: string) => JOUR.format(new Date(`${iso}T12:00:00`));

export const TYPES_PLANTAGE = [
  { code: 'NATIF', libelle: 'Android natif' },
  { code: 'FLUTTER', libelle: 'Flutter' },
  { code: 'DART', libelle: 'Dart' },
  { code: 'AUTRE', libelle: 'Autre' },
];

/** Une ligne par jour et une colonne par type ; un type inconnu rejoint « Autre » plutôt que de disparaître. */
export function plantagesParType(serie: JourAnalytique[]) {
  const connus = new Set(['NATIF', 'FLUTTER', 'DART']);
  return serie.map((j) => {
    const ligne: Record<string, number | string> = { libelle: jourCourt(j.jour), NATIF: 0, FLUTTER: 0, DART: 0, AUTRE: 0 };
    for (const [type, n] of Object.entries(j.plantages)) {
      const code = connus.has(type) ? type : 'AUTRE';
      ligne[code] = Number(ligne[code]) + n;
    }
    return ligne;
  });
}

/** Évolution en pourcentage ; rien à comparer si la période précédente est vide. */
export function evolution(actuel: number, precedent: number): number | undefined {
  if (!precedent) return undefined;
  return Math.round(((actuel - precedent) / precedent) * 100);
}

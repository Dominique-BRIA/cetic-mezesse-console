const DATE = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const dateHeure = (iso: string) => DATE.format(new Date(iso));

/** « à l'instant », « il y a 3 h », « il y a 12 j ». */
export function ilYa(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const heures = Math.floor(minutes / 60);
  if (heures < 24) return `il y a ${heures} h`;
  return `il y a ${Math.floor(heures / 24)} j`;
}

export const taille = (octets: number) => `${(octets / 1_048_576).toFixed(1).replace('.', ',')} Mo`;

const ROLES: Record<string, string> = {
  PROVISEUR: 'Directeur',
  SURVEILLANT_GENERAL: 'Surveillant Général',
  PROFESSEUR: 'Professeur',
};

export const libelleRole = (role: string | null) => (role ? (ROLES[role] ?? role) : '—');

export const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`;

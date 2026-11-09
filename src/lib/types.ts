// Réponses de l'API /api/console (cetic-mezesse-backend, ConsoleDto).

export interface Moi {
  id: string;
  email: string;
  nom: string;
}

export interface ReponseConnexion {
  jeton: string;
  admin: Moi;
}

export interface Politique {
  suspendue: boolean;
  versionsBloquees: number[];
  minimum: number;
  message: string | null;
}

export interface VuePolitique {
  politique: Politique;
  majLe: string | null;
  majPar: string | null;
}

export interface Apercu {
  appareils: number;
  actifsSeptJours: number;
  comptesActifs: number;
  comptesSansAppareil: number;
  plantages24h: number;
  plantagesOuverts: number;
  repartition: { numeroVersion: number; nomVersion: string; appareils: number }[];
  politique: Politique;
}

export interface JourAnalytique {
  jour: string;
  actifs: number;
  nouveaux: number;
  parVersion: Record<string, number>;
  plantages: Record<string, number>;
}

export interface Cumul {
  actifs: number;
  nouveaux: number;
  plantages: number;
}

export interface Part {
  libelle: string;
  valeur: number;
}

export interface Analytique {
  jours: number;
  periode: Cumul;
  precedente: Cumul;
  serie: JourAnalytique[];
  modeles: Part[];
  versionsAndroid: Part[];
  roles: { role: string; equipes: number; sansAppareil: number }[];
}

export interface LigneAppareil {
  installationId: string;
  compte: string | null;
  role: string | null;
  numeroVersion: number;
  nomVersion: string;
  correctif: number | null;
  modele: string | null;
  versionAndroid: string | null;
  premiereVue: string;
  derniereVue: string;
}

export interface CompteSansAppareil {
  id: string;
  nom: string;
  role: string;
  telephone: string | null;
}

export interface Parc {
  appareils: LigneAppareil[];
  comptesSansAppareil: CompteSansAppareil[];
}

export interface GroupePlantage {
  empreinte: string;
  type: string;
  message: string;
  occurrences: number;
  appareils: number;
  premiereFois: string;
  derniereFois: string;
  resolu: boolean;
  versions: string[];
}

export interface DetailPlantage {
  groupe: GroupePlantage;
  pile: string | null;
  occurrences: {
    installationId: string;
    compte: string | null;
    modele: string | null;
    versionAndroid: string | null;
    nomVersion: string;
    occurrences: number;
    derniereFois: string;
  }[];
}

export interface LigneJournal {
  id: string;
  date: string;
  adminEmail: string;
  action: string;
  cible: string | null;
  detail: string | null;
  adresse: string | null;
}

/** Une Release GitHub de l'application mobile. */
export interface Publication {
  numero: number;
  nom: string;
  date: string;
  taille: number | null;
  shorebird: boolean;
  url: string;
}

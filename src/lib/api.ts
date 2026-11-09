// Accès à l'API : jeton dans l'en-tête, erreurs en français. Le jeton reste dans l'onglet (sessionStorage).

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

const CLE_JETON = 'cetic-console-jeton';

function lire(): string | null {
  try {
    return sessionStorage.getItem(CLE_JETON);
  } catch {
    return null;
  }
}

let jeton = lire();

export const session = {
  jeton: () => jeton,
  definir(j: string | null) {
    jeton = j;
    try {
      if (j) sessionStorage.setItem(CLE_JETON, j);
      else sessionStorage.removeItem(CLE_JETON);
    } catch {
      // stockage indisponible : la session ne survivra pas au rechargement
    }
  },
};

export class ErreurApi extends Error {
  constructor(
    public statut: number,
    message: string,
  ) {
    super(message);
  }
}

let surExpiration: (() => void) | null = null;
export function quandSessionExpire(f: () => void) {
  surExpiration = f;
}

export async function api<T = unknown>(chemin: string, options: { methode?: string; corps?: unknown } = {}): Promise<T> {
  let r: Response;
  try {
    r = await fetch(API_URL + chemin, {
      method: options.methode ?? 'GET',
      headers: {
        ...(options.corps !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(jeton ? { Authorization: `Bearer ${jeton}` } : {}),
      },
      body: options.corps === undefined ? undefined : JSON.stringify(options.corps),
    });
  } catch {
    throw new ErreurApi(0, 'Impossible de joindre le serveur. Vérifiez votre connexion.');
  }
  if (r.status === 401 && jeton) {
    session.definir(null);
    surExpiration?.();
  }
  if (!r.ok) {
    let message = `Erreur ${r.status}`;
    try {
      const j = (await r.json()) as { message?: string };
      if (j.message) message = j.message;
    } catch {
      // réponse sans JSON
    }
    throw new ErreurApi(r.status, message);
  }
  if (r.status === 204) return undefined as T;
  return r.json() as Promise<T>;
}

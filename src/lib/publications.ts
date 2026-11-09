// Versions publiées de l'application mobile : les Releases GitHub, publiques, lues directement.
import { useQuery } from '@tanstack/react-query';
import type { Publication } from './types';

const DEPOT = 'Dominique-BRIA/cetic-mezesse-mobile';

interface Release {
  tag_name: string;
  published_at: string;
  html_url: string;
  draft: boolean;
  assets: { name: string; size: number }[];
}

async function charger(): Promise<Publication[]> {
  const r = await fetch(`https://api.github.com/repos/${DEPOT}/releases?per_page=20`, { headers: { Accept: 'application/vnd.github+json' } });
  if (!r.ok) throw new Error(`GitHub a répondu ${r.status}`);
  const liste = (await r.json()) as Release[];
  return liste.flatMap((x) => {
    const m = /^v(.+)\+(\d+)$/.exec(x.tag_name);
    if (!m || x.draft) return [];
    return [
      {
        numero: Number(m[2]),
        nom: m[1],
        date: x.published_at,
        taille: x.assets.find((a) => a.name.endsWith('.apk'))?.size ?? null,
        shorebird: x.assets.some((a) => a.name === 'shorebird.txt'),
        url: x.html_url,
      },
    ];
  });
}

/** Du plus récent au plus ancien ; GitHub limite les appels sans jeton, d'où les 5 minutes de cache. */
export function usePublications() {
  return useQuery({ queryKey: ['publications'], queryFn: charger, staleTime: 5 * 60_000, retry: 0 });
}

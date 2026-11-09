'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { Bug, LayoutDashboard, LogOut, ScrollText, Smartphone, Terminal, UploadCloud } from 'lucide-react';
import { api } from '../lib/api';
import { useSession } from '../lib/contexte';
import type { Moi } from '../lib/types';

const MENU = [
  { href: '/', libelle: 'Aperçu', icone: LayoutDashboard },
  { href: '/appareils', libelle: 'Appareils', icone: Smartphone },
  { href: '/plantages', libelle: 'Plantages', icone: Bug },
  { href: '/mises-a-jour', libelle: 'Mises à jour', icone: UploadCloud },
  { href: '/journal', libelle: 'Journal', icone: ScrollText },
];

export function Cadre({ children }: { children: ReactNode }) {
  const chemin = usePathname();
  const { deconnecter } = useSession();
  const moi = useQuery({ queryKey: ['moi'], queryFn: () => api<Moi>('/console/auth/moi'), staleTime: Infinity });
  const actif = (href: string) => (href === '/' ? chemin === '/' : chemin.startsWith(href));

  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-bord bg-surface md:sticky md:top-0 md:flex md:h-screen md:w-56 md:shrink-0 md:flex-col md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-2 px-4 py-3 md:py-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primaire" />
            <div>
              <div className="text-sm font-bold leading-tight text-encre">Console CETIC</div>
              <div className="text-[0.7rem] text-encre-2">Pilotage technique</div>
            </div>
          </div>
          <button type="button" className="bouton-discret md:hidden" onClick={deconnecter} title="Se déconnecter" aria-label="Se déconnecter">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-1 md:flex-col md:overflow-visible md:pb-0">
          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              aria-current={actif(m.href) ? 'page' : undefined}
              className={clsx(
                'flex items-center gap-2.5 whitespace-nowrap rounded px-3 py-2 text-sm font-medium transition-colors',
                actif(m.href) ? 'bg-primaire-pale font-semibold text-primaire' : 'text-encre-2 hover:bg-surface-2 hover:text-encre',
              )}
            >
              <m.icone className="h-4 w-4 shrink-0" />
              {m.libelle}
            </Link>
          ))}
        </nav>
        <div className="hidden border-t border-bord p-3 md:block">
          <div className="truncate px-1 text-xs text-encre-2" title={moi.data?.email}>
            {moi.data?.email ?? ' '}
          </div>
          <button type="button" className="bouton-discret mt-1 w-full justify-start" onClick={deconnecter}>
            <LogOut className="h-4 w-4" /> Se déconnecter
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-5 md:px-8 md:py-6">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

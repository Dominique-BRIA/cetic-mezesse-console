'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Bug, ChevronLeft, LayoutDashboard, LogOut, Menu, ScrollText, Smartphone, UploadCloud, UserCircle, X } from 'lucide-react';
import { api } from '../lib/api';
import { useSession } from '../lib/contexte';
import type { Moi } from '../lib/types';
import { BasculeTheme } from './Theme';

const MENU = [
  { href: '/', libelle: 'Aperçu', icone: LayoutDashboard },
  { href: '/analytique', libelle: 'Analytique', icone: BarChart3 },
  { href: '/appareils', libelle: 'Appareils', icone: Smartphone },
  { href: '/plantages', libelle: 'Plantages', icone: Bug },
  { href: '/mises-a-jour', libelle: 'Mises à jour', icone: UploadCloud },
  { href: '/journal', libelle: 'Journal', icone: ScrollText },
];

const initiales = (nom?: string) =>
  (nom ?? 'D')
    .split(' ')
    .map((m) => m[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

export function Cadre({ children }: { children: ReactNode }) {
  const chemin = usePathname();
  const { deconnecter } = useSession();
  const moi = useQuery({ queryKey: ['moi'], queryFn: () => api<Moi>('/console/auth/moi'), staleTime: Infinity });
  const [replie, setReplie] = useState(false);
  const [tiroir, setTiroir] = useState(false);
  const actif = (href: string) => (href === '/' ? chemin === '/' : chemin.startsWith(href));
  // Sur téléphone le menu est un tiroir, toujours complet.
  const compact = replie && !tiroir;

  return (
    <div className="flex h-screen overflow-hidden bg-fond">
      {tiroir && <button type="button" className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setTiroir(false)} aria-label="Fermer le menu" />}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-bord bg-surface transition-all duration-300 md:static md:translate-x-0',
          tiroir ? 'translate-x-0' : '-translate-x-full',
          replie ? 'md:w-16' : 'md:w-64',
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-bord px-4">
          <img src="/favicon.png" alt="" width={36} height={36} className="shrink-0 rounded-lg bg-white object-contain shadow-sm" />
          {!compact && <span className="flex-1 truncate text-lg font-bold tracking-tight text-encre">Console CETIC</span>}
          <button type="button" className="rounded-lg p-1.5 text-encre-2 hover:bg-surface-2 md:hidden" onClick={() => setTiroir(false)} aria-label="Fermer le menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              title={compact ? m.libelle : undefined}
              aria-current={actif(m.href) ? 'page' : undefined}
              onClick={() => setTiroir(false)}
              className={clsx(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                actif(m.href) ? 'bg-primaire-pale text-primaire' : 'text-encre-2 hover:bg-surface-2 hover:text-encre',
              )}
            >
              <m.icone className="h-5 w-5 shrink-0" />
              {!compact && <span className="flex-1">{m.libelle}</span>}
            </Link>
          ))}
        </nav>

        <div className="space-y-1 border-t border-bord p-2">
          {!compact && moi.data && (
            <div className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-encre-2" title={moi.data.email}>
              <UserCircle className="h-5 w-5 shrink-0 text-primaire" />
              <span className="truncate">{moi.data.email}</span>
            </div>
          )}
          <button type="button" onClick={deconnecter} title={compact ? 'Déconnexion' : undefined} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10">
            <LogOut className="h-5 w-5 shrink-0" />
            {!compact && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-bord bg-surface px-4 md:px-6">
          <div>
            <button type="button" className="rounded-lg p-2 text-encre-2 hover:bg-surface-2 md:hidden" onClick={() => setTiroir(true)} aria-label="Ouvrir le menu">
              <Menu className="h-5 w-5" />
            </button>
            <button type="button" className="hidden rounded-lg p-2 text-encre-2 hover:bg-surface-2 md:block" onClick={() => setReplie(!replie)} aria-label={replie ? 'Déplier le menu' : 'Replier le menu'}>
              {replie ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <BasculeTheme />
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white" title={moi.data?.nom}>
              {initiales(moi.data?.nom)}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-[96rem]">{children}</div>
        </main>
      </div>
    </div>
  );
}

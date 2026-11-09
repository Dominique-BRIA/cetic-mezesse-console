import { useEffect, type ReactNode } from 'react';
import clsx from 'clsx';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function Page({ titre, description, actions, children }: { titre: string; description?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  useEffect(() => {
    document.title = `${titre} · Console CETIC`;
  }, [titre]);
  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-bord pb-4">
        <div className="min-w-0">
          <h1 className="text-[1.4rem] font-bold leading-tight tracking-tight text-encre">{titre}</h1>
          {description && <p className="mt-1 max-w-3xl text-sm text-encre-2">{description}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {actions}
          <Actualiser />
        </div>
      </header>
      {children}
    </div>
  );
}

function Actualiser() {
  const client = useQueryClient();
  const enCours = useIsFetching() > 0;
  return (
    <button type="button" className="bouton-secondaire" onClick={() => client.refetchQueries({ type: 'active' })} disabled={enCours} title="Recharger les données">
      <RefreshCw className={clsx('h-4 w-4', enCours && 'animate-spin')} />
      <span className="hidden sm:inline">Actualiser</span>
    </button>
  );
}

export function Carte({ titre, actions, children, sansMarge }: { titre?: ReactNode; actions?: ReactNode; children: ReactNode; sansMarge?: boolean }) {
  return (
    <section className="rounded-lg border border-bord bg-surface">
      {titre && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-bord px-4 py-3">
          <h2 className="text-sm font-bold text-encre">{titre}</h2>
          {actions}
        </div>
      )}
      <div className={sansMarge ? '' : 'p-4'}>{children}</div>
    </section>
  );
}

export function Indicateur({ libelle, valeur, detail }: { libelle: string; valeur: ReactNode; detail?: ReactNode }) {
  return (
    <div className="rounded-lg border border-bord bg-surface p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-encre-2">{libelle}</div>
      <div className="mt-1 text-[1.7rem] font-bold leading-tight text-encre">{valeur}</div>
      {detail && <div className="mt-0.5 text-xs text-encre-2">{detail}</div>}
    </div>
  );
}

export function Chargement({ lignes = 5 }: { lignes?: number }) {
  return (
    <div className="space-y-2 p-4" role="status" aria-label="Chargement">
      {Array.from({ length: lignes }, (_, i) => (
        <div key={i} className="squelette h-8" />
      ))}
    </div>
  );
}

export function Erreur({ erreur }: { erreur: unknown }) {
  const message = erreur instanceof Error ? erreur.message : 'Une erreur est survenue.';
  return (
    <div className="flex items-start gap-2 rounded border border-danger/30 bg-danger/5 px-3 py-2.5 text-sm text-danger" role="alert">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="whitespace-pre-line">{message}</span>
    </div>
  );
}

export function Vide({ titre, children }: { titre: string; children?: ReactNode }) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="text-sm font-semibold text-encre">{titre}</p>
      {children && <div className="mx-auto mt-1 max-w-md text-sm text-encre-2">{children}</div>}
    </div>
  );
}

const TONS = { succes: 'text-succes', danger: 'text-danger', alerte: 'text-alerte', neutre: 'text-encre-2' };

/** État : toujours une icône et un libellé, jamais la couleur seule. */
export function Etat({ ton, icone, children }: { ton: keyof typeof TONS; icone: ReactNode; children: ReactNode }) {
  return <span className={clsx('inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold', TONS[ton])}>{icone}{children}</span>;
}

/** Tableau qui défile dans sa carte, sans élargir la page sur un téléphone. */
export function Tableau({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="tableau">{children}</table>
    </div>
  );
}

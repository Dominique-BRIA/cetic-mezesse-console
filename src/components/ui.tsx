import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, RefreshCw, type LucideIcon } from 'lucide-react';

export function Page({ titre, description, actions, children }: { titre: string; description?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  useEffect(() => {
    document.title = `${titre} · Console CETIC`;
  }, [titre]);
  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-encre">{titre}</h1>
          {description && <p className="mt-1 max-w-3xl text-sm text-encre-2">{description}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
    <button type="button" className="bouton-secondaire w-10 px-0" onClick={() => client.refetchQueries({ type: 'active' })} disabled={enCours} title="Recharger les données" aria-label="Recharger les données">
      <RefreshCw className={clsx('h-4 w-4', enCours && 'animate-spin')} />
    </button>
  );
}

export function Carte({ titre, actions, children, sansMarge }: { titre?: ReactNode; actions?: ReactNode; children: ReactNode; sansMarge?: boolean }) {
  return (
    <section className="h-full rounded-xl bg-surface shadow-sm">
      {titre && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 pb-2 pt-5">
          <h2 className="text-base font-semibold text-encre">{titre}</h2>
          {actions}
        </div>
      )}
      <div className={sansMarge ? 'pt-2' : clsx('px-6 pb-6', titre ? 'pt-2' : 'pt-6')}>{children}</div>
    </section>
  );
}

interface PropsIndicateur {
  libelle: string;
  valeur: ReactNode;
  detail?: ReactNode;
  icone?: LucideIcon;
  /** Couleur de la pastille de l'icône, en hexadécimal. */
  teinte?: string;
  href?: string;
  /** Évolution en pourcentage ; « bon » dit si le sens de la variation est une bonne nouvelle. */
  tendance?: { pourcentage: number; bon: boolean };
}

export function Indicateur({ libelle, valeur, detail, icone: Icone, teinte = '#6366f1', href, tendance }: PropsIndicateur) {
  const contenu = (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-medium text-encre-2">{libelle}</p>
        <p className="text-3xl font-bold tracking-tight text-encre">{valeur}</p>
        {detail && <p className="text-xs text-encre-2">{detail}</p>}
        {tendance && (
          <p className={clsx('text-xs font-medium', tendance.pourcentage === 0 ? 'text-encre-2' : tendance.bon ? 'text-succes' : 'text-danger')}>
            {tendance.pourcentage === 0 ? (
              'Stable sur la période précédente'
            ) : (
              <>
                {tendance.pourcentage > 0 ? '↗' : '↘'} {Math.abs(tendance.pourcentage)} % <span className="font-normal text-encre-2">sur la période précédente</span>
              </>
            )}
          </p>
        )}
      </div>
      {Icone && (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${teinte}1a` }}>
          <Icone className="h-6 w-6" style={{ color: teinte }} />
        </div>
      )}
    </div>
  );
  const classes = 'block rounded-xl bg-surface p-5 shadow-sm transition-all duration-200';
  return href ? (
    <Link href={href} className={clsx(classes, 'hover:-translate-y-0.5 hover:shadow-md')}>
      {contenu}
    </Link>
  ) : (
    <div className={classes}>{contenu}</div>
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
    <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2.5 text-sm text-danger" role="alert">
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

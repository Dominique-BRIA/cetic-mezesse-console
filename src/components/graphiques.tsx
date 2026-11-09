'use client';

import { useId, useState, type ReactElement, type ReactNode } from 'react';
import { BarChart3, Table2 } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Carte, Vide } from './ui';

export const SERIE = [1, 2, 3, 4, 5].map((n) => `rgb(var(--serie-${n}))`);
export const SERIE_NEUTRE = 'rgb(var(--serie-neutre))';

const GRILLE = 'rgb(var(--bord))';
const SURFACE = 'rgb(var(--surface))';
const AXE = { fontSize: 12, fill: 'rgb(var(--encre-2))' };
const ANIMER = typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const nombre = (v: unknown) => (typeof v === 'number' ? v.toLocaleString('fr-FR') : String(v ?? ''));

interface PropsInfoBulle {
  active?: boolean;
  payload?: readonly { name?: unknown; value?: unknown; color?: string; payload?: { fill?: string } }[];
  label?: unknown;
  suffixe?: string;
}

/** La valeur d'abord, le nom ensuite : on connaît déjà la série, on cherche le chiffre. */
function InfoBulle({ active, payload, label, suffixe = '' }: PropsInfoBulle) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-bord bg-surface px-3 py-2 text-[13px] shadow-lg">
      {label != null && label !== '' && <p className="mb-1 text-xs text-encre-2">{String(label)}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2 text-encre-2">
          <span className="h-0.5 w-3 rounded" style={{ backgroundColor: p.color ?? p.payload?.fill }} />
          <span className="font-semibold text-encre">
            {nombre(p.value)}
            {suffixe}
          </span>
          {String(p.name ?? '')}
        </p>
      ))}
    </div>
  );
}

export function Legende({ elements }: { elements: { libelle: string; couleur: string }[] }) {
  return (
    <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-encre-2">
      {elements.map((e) => (
        <li key={e.libelle} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: e.couleur }} />
          {e.libelle}
        </li>
      ))}
    </ul>
  );
}

interface PropsCarteGraphique {
  titre: string;
  /** Les mêmes chiffres en tableau : lisibles sans survol. */
  tableau: { colonnes: string[]; lignes: (string | number)[][] };
  vide?: { titre: string; texte: ReactNode } | null;
  children: ReactNode;
}

export function CarteGraphique({ titre, tableau, vide, children }: PropsCarteGraphique) {
  const [enTableau, setEnTableau] = useState(false);
  return (
    <Carte
      titre={titre}
      actions={
        !vide && (
          <button
            type="button"
            className="rounded-lg p-1.5 text-encre-2 transition-colors hover:bg-surface-2 hover:text-encre"
            onClick={() => setEnTableau(!enTableau)}
            title={enTableau ? 'Voir le graphique' : 'Voir les chiffres'}
            aria-label={enTableau ? 'Voir le graphique' : 'Voir les chiffres'}
          >
            {enTableau ? <BarChart3 className="h-4 w-4" /> : <Table2 className="h-4 w-4" />}
          </button>
        )
      }
    >
      {vide ? (
        <Vide titre={vide.titre}>{vide.texte}</Vide>
      ) : enTableau ? (
        <div className="max-h-80 overflow-auto">
          <table className="tableau tabular-nums">
            <thead>
              <tr>
                {tableau.colonnes.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableau.lignes.map((l, i) => (
                <tr key={i}>
                  {l.map((v, j) => (
                    <td key={j} className={j === 0 ? 'font-medium text-encre' : 'text-encre-2'}>
                      {typeof v === 'number' ? v.toLocaleString('fr-FR') : v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        children
      )}
    </Carte>
  );
}

function Zone({ hauteur, children }: { hauteur: number; children: ReactElement }) {
  return (
    <div style={{ height: hauteur }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

const axeX = { dataKey: 'libelle', tick: AXE, axisLine: false, tickLine: false, minTickGap: 28 } as const;
const axeY = { tick: AXE, axisLine: false, tickLine: false, width: 36, allowDecimals: false } as const;

export function Aire({ donnees, cle, nom, hauteur = 320 }: { donnees: object[]; cle: string; nom: string; hauteur?: number }) {
  const id = `degrade${useId().replace(/[^a-z0-9]/gi, '')}`;
  return (
    <Zone hauteur={hauteur}>
      <AreaChart data={donnees} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={SERIE[0]} stopOpacity={0.3} />
            <stop offset="95%" stopColor={SERIE[0]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRILLE} vertical={false} />
        <XAxis {...axeX} />
        <YAxis {...axeY} />
        <Tooltip content={<InfoBulle />} cursor={{ stroke: GRILLE }} />
        <Area type="monotone" dataKey={cle} name={nom} stroke={SERIE[0]} strokeWidth={2} fill={`url(#${id})`} isAnimationActive={ANIMER} activeDot={{ r: 5, fill: SERIE[0], stroke: SURFACE, strokeWidth: 2 }} />
      </AreaChart>
    </Zone>
  );
}

/** Une ligne sur 0-100 : les jours sans téléphone actif restent un trou, pas un zéro. */
export function CourbePourcentage({ donnees, cle, nom, hauteur = 288 }: { donnees: object[]; cle: string; nom: string; hauteur?: number }) {
  return (
    <Zone hauteur={hauteur}>
      <LineChart data={donnees} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRILLE} vertical={false} />
        <XAxis {...axeX} />
        <YAxis {...axeY} width={44} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v: number) => `${v} %`} />
        <Tooltip content={<InfoBulle suffixe=" %" />} cursor={{ stroke: GRILLE }} />
        <Line type="monotone" dataKey={cle} name={nom} stroke={SERIE[0]} strokeWidth={2} dot={false} connectNulls={false} isAnimationActive={ANIMER} activeDot={{ r: 5, fill: SERIE[0], stroke: SURFACE, strokeWidth: 2 }} />
      </LineChart>
    </Zone>
  );
}

export interface SerieColonnes {
  cle: string;
  nom: string;
  couleur: string;
}

/** Colonnes, empilées s'il y a plusieurs séries ; l'arrondi ne se pose qu'au sommet de la pile. */
export function Colonnes({ donnees, series, hauteur = 288, suffixe, decimales }: { donnees: object[]; series: SerieColonnes[]; hauteur?: number; suffixe?: string; decimales?: boolean }) {
  return (
    <Zone hauteur={hauteur}>
      <BarChart data={donnees} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="20%">
        <CartesianGrid stroke={GRILLE} vertical={false} />
        <XAxis {...axeX} />
        <YAxis {...axeY} allowDecimals={Boolean(decimales)} />
        <Tooltip content={<InfoBulle suffixe={suffixe} />} cursor={{ fill: 'rgb(var(--surface-2))' }} />
        {series.map((s, i) => (
          <Bar key={s.cle} dataKey={s.cle} name={s.nom} stackId="pile" fill={s.couleur} maxBarSize={24} stroke={SURFACE} strokeWidth={series.length > 1 ? 2 : 0} radius={i === series.length - 1 ? [4, 4, 0, 0] : 0} isAnimationActive={ANIMER} />
        ))}
      </BarChart>
    </Zone>
  );
}

/** Barres horizontales, empilées s'il y a plusieurs séries : pour des libellés longs. */
export function Barres({ donnees, series, largeurLibelle = 120 }: { donnees: object[]; series: SerieColonnes[]; largeurLibelle?: number }) {
  return (
    <Zone hauteur={Math.max(120, donnees.length * 44 + 28)}>
      <BarChart data={donnees} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }} barCategoryGap="28%">
        <CartesianGrid stroke={GRILLE} horizontal={false} />
        <XAxis type="number" tick={AXE} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="libelle" tick={AXE} axisLine={false} tickLine={false} width={largeurLibelle} />
        <Tooltip content={<InfoBulle />} cursor={{ fill: 'rgb(var(--surface-2))' }} />
        {series.map((s, i) => (
          <Bar key={s.cle} dataKey={s.cle} name={s.nom} stackId="pile" fill={s.couleur} maxBarSize={24} stroke={SURFACE} strokeWidth={series.length > 1 ? 2 : 0} radius={i === series.length - 1 ? [0, 4, 4, 0] : 0} isAnimationActive={ANIMER} />
        ))}
      </BarChart>
    </Zone>
  );
}

/** Part de chaque élément dans un total, cinq éléments au plus ; le chiffre reste écrit dans la liste. */
export function Anneau({ elements, libelleTotal }: { elements: { nom: string; valeur: number; couleur: string }[]; libelleTotal: string }) {
  const total = elements.reduce((s, e) => s + e.valeur, 0);
  const donnees = elements.map((e) => ({ name: e.nom, value: e.valeur, fill: e.couleur }));
  return (
    <div>
      <div className="relative" style={{ height: 176 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={donnees} dataKey="value" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={elements.length > 1 ? 2 : 0} stroke="none" isAnimationActive={ANIMER} />
            <Tooltip content={<InfoBulle />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-encre">{total.toLocaleString('fr-FR')}</p>
            <p className="text-xs text-encre-2">{libelleTotal}</p>
          </div>
        </div>
      </div>
      <ul className="mt-3 space-y-1.5">
        {elements.map((e) => (
          <li key={e.nom} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-encre-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: e.couleur }} />
              <span className="truncate">{e.nom}</span>
            </span>
            <span className="font-semibold tabular-nums text-encre">
              {e.valeur} <span className="font-normal text-encre-2">· {total ? Math.round((e.valeur / total) * 100) : 0} %</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

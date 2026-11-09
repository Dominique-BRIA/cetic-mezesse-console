'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

// Tout se passe dans le navigateur : le jeton est dans sessionStorage et les données viennent de l'API.
const Application = dynamic(() => import('./Application').then((m) => m.Application), { ssr: false });

export function Racine({ children }: { children: ReactNode }) {
  return <Application>{children}</Application>;
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Adresse inconnue : retour au tableau de bord. */
export default function Introuvable() {
  const routeur = useRouter();
  useEffect(() => routeur.replace('/'), [routeur]);
  return null;
}

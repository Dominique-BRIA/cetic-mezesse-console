'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { quandSessionExpire, session } from '../lib/api';
import { SessionContexte } from '../lib/contexte';
import { Connexion } from '../ecrans/Connexion';
import { Cadre } from './Cadre';

export function Application({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 15_000, retry: 1, refetchOnWindowFocus: true } } }));
  const [connecte, setConnecte] = useState(Boolean(session.jeton()));

  useEffect(() => {
    quandSessionExpire(() => {
      client.clear();
      setConnecte(false);
    });
  }, [client]);

  const valeur = useMemo(
    () => ({
      deconnecter: () => {
        session.definir(null);
        client.clear();
        setConnecte(false);
      },
    }),
    [client],
  );

  return (
    <QueryClientProvider client={client}>
      <SessionContexte.Provider value={valeur}>
        {connecte ? <Cadre>{children}</Cadre> : <Connexion surConnexion={() => setConnecte(true)} />}
      </SessionContexte.Provider>
    </QueryClientProvider>
  );
}

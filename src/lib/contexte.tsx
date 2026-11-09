'use client';

import { createContext, useContext } from 'react';

export const SessionContexte = createContext<{ deconnecter: () => void }>({ deconnecter: () => {} });

export const useSession = () => useContext(SessionContexte);

'use client';

import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const CLE = 'cetic-console-theme';

function themeActuel(): 'dark' | 'light' {
  const choisi = document.documentElement.dataset.theme;
  if (choisi === 'dark' || choisi === 'light') return choisi;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function BasculeTheme() {
  const [theme, setTheme] = useState(themeActuel);

  function basculer() {
    const suivant = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = suivant;
    setTheme(suivant);
    try {
      localStorage.setItem(CLE, suivant);
    } catch {
      // stockage indisponible : le choix vaut pour cette page seulement
    }
  }

  return (
    <button type="button" className="rounded-lg p-2 text-encre-2 transition-colors hover:bg-surface-2" onClick={basculer} aria-label="Changer le thème" title="Changer le thème">
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

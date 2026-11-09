import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import localFont from 'next/font/local';
import '../styles.css';
import { Racine } from '../components/Racine';

const police = localFont({ src: './fonts/GeistVF.woff', variable: '--police', weight: '100 900', display: 'swap' });

export const metadata: Metadata = {
  title: 'Console CETIC',
  robots: { index: false, follow: false },
  icons: { icon: '/favicon.png' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

// Avant le premier affichage : le thème choisi s'applique sans clignotement.
const THEME = `try{var t=localStorage.getItem('cetic-console-theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}`;

export default function MiseEnPage({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={police.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME }} />
      </head>
      <body>
        <Racine>{children}</Racine>
      </body>
    </html>
  );
}

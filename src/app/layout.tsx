import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@fontsource/public-sans/400.css';
import '@fontsource/public-sans/500.css';
import '@fontsource/public-sans/600.css';
import '@fontsource/public-sans/700.css';
import '../styles.css';
import { Racine } from '../components/Racine';

export const metadata: Metadata = {
  title: 'Console CETIC',
  robots: { index: false, follow: false },
  icons: { icon: '/favicon.png' },
};

export const viewport: Viewport = { themeColor: '#eef1f5' };

export default function MiseEnPage({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Racine>{children}</Racine>
      </body>
    </html>
  );
}

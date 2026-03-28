import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import { QueryProvider } from '@/components/providers';
import { VerdantNavbar } from '@/components/layout/VerdantNavbar';
import { VerdantFooter } from '@/components/layout/VerdantFooter';
import { APP_NAME, APP_DESCRIPTION } from '@/config/app';
import './globals.css';

/**
 * Verdant Simulator — Typography Setup (UX-S00)
 * Inter   → --font-body     (texte courant)
 * Manrope → --font-headline  (titres, labels, navigation)
 *
 * Material Symbols Outlined : chargé via @import CSS dans globals.css
 * (ne peut pas être importé via next/font — non dans le registre Google Fonts de Next.js)
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-headline',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: `${APP_NAME} — Simulateur d'investissement immobilier`,
  description: APP_DESCRIPTION,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} ${manrope.variable} ${inter.className}`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:border-2 focus:border-forest focus:rounded-lg"
        >
          Passer au contenu principal
        </a>
        <QueryProvider>
          <VerdantNavbar />
          <main id="main-content" className="pt-16 min-h-[calc(100vh-4rem)] bg-background">
            {children}
          </main>
          <VerdantFooter />
        </QueryProvider>
      </body>
    </html>
  );
}

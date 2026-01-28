import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { QueryProvider } from '@/components/providers';
import { Header } from '@/components/layout/Header';
import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });

export const metadata: Metadata = {
  title: 'Renta Immo - Calculateur de Rentabilité Immobilière',
  description: 'Calculez la rentabilité de votre investissement immobilier en quelques clics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:border-2 focus:border-forest focus:rounded-lg">
          Passer au contenu principal
        </a>
        <QueryProvider>
          <Header />
          <main id="main-content" className="min-h-[calc(100vh-4rem)] bg-background">
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}

import { redirect } from 'next/navigation';

/**
 * Cette page est conservée pour compatibilité avec les liens existants.
 * La redirection 301 est gérée dans next.config.mjs.
 * Ce composant sert de fallback côté serveur.
 */
export default function EnSavoirPlusPage() {
  redirect('/comment-ca-marche');
}

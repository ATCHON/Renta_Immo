import { Resend } from 'resend';

// Initialisation du client Resend
// La clé API doit être définie dans les variables d'environnement
export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Configuration par défaut pour l'expéditeur
 * À personnaliser selon votre domaine vérifié sur Resend
 */
export const EMAIL_SENDER = process.env.EMAIL_SENDER || 'Renta Immo <onboarding@resend.dev>';

/**
 * API pour envoyer le rapport de simulation par email
 * POST /api/send-simulation
 */
import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { z, ZodError } from 'zod';
import { RapportSimulation } from '@/lib/pdf/templates/RapportSimulation';
import { logger } from '@/lib/logger';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { resend, EMAIL_SENDER } from '@/lib/email';
import type { CalculateurFormData, CalculResultats } from '@/types/calculateur';

// Schémas de validation (réutilisés ou dupliqués pour indépendance)
// TODO: Centraliser ces schémas dans lib/validators.ts si possible
const SendSimulationSchema = z.object({
  email: z.string().email(),
  formData: z.any(), // On fait confiance au typage TS pour la structure complexe pour l'instant
  resultats: z.any(),
});

export async function POST(request: NextRequest) {
  // Rate limiting: 3 envois par minute par IP
  const ip = getClientIp(request);
  const rl = rateLimit(`email:${ip}`, { limit: 3, window: 60_000 });

  if (!rl.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMIT',
          message: "Trop d'envois d'emails. Veuillez patienter.",
        },
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const validated = SendSimulationSchema.parse(body);
    const { email, formData, resultats } = validated;

    // 1. Génération du PDF
    const pdfElement = React.createElement(RapportSimulation, {
      formData: formData as CalculateurFormData,
      resultats: resultats as CalculResultats,
    });
    const pdfBuffer = await renderToBuffer(
      pdfElement as unknown as Parameters<typeof renderToBuffer>[0]
    );

    // 2. Envoi de l'email via Resend
    const data = await resend.emails.send({
      from: EMAIL_SENDER,
      to: email,
      subject: 'Votre simulation de rentabilité immobilière - Renta Immo',
      html: `
                <h1>Votre rapport de simulation est prêt !</h1>
                <p>Bonjour,</p>
                <p>Vous trouverez ci-joint le rapport détaillé de votre simulation de rentabilité immobilière réalisée sur Renta Immo.</p>
                <p>Détails du bien : ${formData.bien.type_bien} à ${formData.bien.adresse} (${formData.bien.prix_achat} €)</p>
                <br/>
                <p>À très vite sur <a href="https://renta-immo.com">Renta Immo</a>.</p>
            `,
      attachments: [
        {
          filename: `simulation-${new Date().toISOString().split('T')[0]}.pdf`,
          content: Buffer.from(pdfBuffer),
        },
      ],
    });

    if (data.error) {
      logger.error('Resend API error:', data.error);
      throw new Error(data.error.message);
    }

    return NextResponse.json({ success: true, id: data.data?.id });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Email invalide' } },
        { status: 400 }
      );
    }

    logger.error('Email sending error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'EMAIL_SEND_ERROR', message: "Erreur lors de l'envoi de l'email" },
      },
      { status: 500 }
    );
  }
}

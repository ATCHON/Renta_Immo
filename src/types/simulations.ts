// src/types/simulations.ts — Types de pagination curseur (ARCH-S05)

/** Colonnes de tri autorisées pour la liste des simulations */
export type SimulationSort = 'created_at' | 'updated_at' | 'score_global';

/** Payload encodé dans le curseur (base64url JSON) */
export interface CursorPayload {
  /** Valeur de la colonne de tri (ISO string pour dates, score en string, null si score_global NULL) */
  value: string | null;
  /** UUID de la simulation — départage les égalités */
  id: string;
  /** Champ de tri actif — nécessaire pour reconstruire la keyset condition SQL */
  sort: SimulationSort;
}

/** Paramètres de requête pour la pagination curseur */
export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
  favorite?: boolean;
  archived?: boolean;
  sort?: SimulationSort;
  search?: string;
}

/** Métadonnées de réponse pagination curseur */
export interface CursorPaginationMeta {
  /** Curseur opaque pour la page suivante — null si dernière page */
  next_cursor: string | null;
  limit: number;
  has_more: boolean;
}

/** Encode un CursorPayload en string base64url opaque */
export function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

/** Décode un curseur base64url — retourne null si invalide */
export function decodeCursor(cursor: string): CursorPayload | null {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf-8')) as unknown;
    if (!isCursorPayload(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function isCursorPayload(val: unknown): val is CursorPayload {
  if (!val || typeof val !== 'object') return false;
  const obj = val as Record<string, unknown>;
  return (
    (typeof obj.value === 'string' || obj.value === null) &&
    typeof obj.id === 'string' &&
    ['created_at', 'updated_at', 'score_global'].includes(obj.sort as string)
  );
}

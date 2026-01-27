/**
 * Utilitaires de comparaison pour les tests de régression
 * Compare les résultats du nouveau moteur avec les références n8n
 */

/**
 * Options de comparaison
 */
export interface CompareOptions {
  /** Tolérance en pourcentage (défaut: 0.01 = 0.01%) */
  tolerance: number;
  /** Ignorer les champs undefined */
  ignoreUndefined: boolean;
  /** Chemin actuel (pour le reporting) */
  path?: string;
}

/**
 * Résultat de comparaison
 */
export interface CompareResult {
  /** Comparaison réussie */
  success: boolean;
  /** Liste des différences */
  differences: Difference[];
  /** Nombre de valeurs comparées */
  totalCompared: number;
  /** Nombre de valeurs identiques */
  totalMatched: number;
}

/**
 * Détail d'une différence
 */
export interface Difference {
  /** Chemin du champ (ex: "rentabilite.rentabilite_brute") */
  path: string;
  /** Valeur attendue */
  expected: number | string | boolean | null;
  /** Valeur obtenue */
  actual: number | string | boolean | null;
  /** Écart en pourcentage (pour les nombres) */
  percentDiff?: number;
  /** Message d'erreur */
  message: string;
}

/**
 * Compare deux résultats avec tolérance
 *
 * @param expected - Résultat attendu (référence n8n)
 * @param actual - Résultat obtenu (nouveau moteur)
 * @param options - Options de comparaison
 * @returns Résultat de la comparaison
 */
export function compareResults(
  expected: unknown,
  actual: unknown,
  options: Partial<CompareOptions> = {}
): CompareResult {
  const opts: CompareOptions = {
    tolerance: 0.01,
    ignoreUndefined: true,
    path: '',
    ...options,
  };

  const differences: Difference[] = [];
  let totalCompared = 0;
  let totalMatched = 0;

  function compare(exp: unknown, act: unknown, path: string): void {
    // Null check
    if (exp === null && act === null) {
      totalCompared++;
      totalMatched++;
      return;
    }

    if (exp === null || act === null) {
      differences.push({
        path,
        expected: exp as null,
        actual: act as null,
        message: `Valeur null: attendu ${exp}, obtenu ${act}`,
      });
      totalCompared++;
      return;
    }

    // Undefined check
    if (exp === undefined && act === undefined) {
      return;
    }

    if (opts.ignoreUndefined && (exp === undefined || act === undefined)) {
      return;
    }

    // Type check
    const expType = typeof exp;
    const actType = typeof act;

    if (expType !== actType) {
      differences.push({
        path,
        expected: exp as string,
        actual: act as string,
        message: `Type différent: attendu ${expType}, obtenu ${actType}`,
      });
      totalCompared++;
      return;
    }

    // Number comparison with tolerance
    if (typeof exp === 'number' && typeof act === 'number') {
      totalCompared++;
      const diff = Math.abs(exp - act);
      const percentDiff = exp !== 0 ? (diff / Math.abs(exp)) * 100 : (act !== 0 ? 100 : 0);

      if (percentDiff <= opts.tolerance) {
        totalMatched++;
      } else {
        differences.push({
          path,
          expected: exp,
          actual: act,
          percentDiff,
          message: `Écart de ${percentDiff.toFixed(4)}% (tolérance: ${opts.tolerance}%)`,
        });
      }
      return;
    }

    // String/Boolean comparison
    if (typeof exp === 'string' || typeof exp === 'boolean') {
      totalCompared++;
      if (exp === act) {
        totalMatched++;
      } else {
        differences.push({
          path,
          expected: exp,
          actual: act as string | boolean,
          message: `Valeur différente`,
        });
      }
      return;
    }

    // Array comparison
    if (Array.isArray(exp) && Array.isArray(act)) {
      if (exp.length !== act.length) {
        differences.push({
          path,
          expected: `Array[${exp.length}]`,
          actual: `Array[${act.length}]`,
          message: `Taille différente`,
        });
      }
      const maxLen = Math.max(exp.length, act.length);
      for (let i = 0; i < maxLen; i++) {
        compare(exp[i], act[i], `${path}[${i}]`);
      }
      return;
    }

    // Object comparison
    if (typeof exp === 'object' && typeof act === 'object') {
      const expObj = exp as Record<string, unknown>;
      const actObj = act as Record<string, unknown>;
      const allKeys = new Set([...Object.keys(expObj), ...Object.keys(actObj)]);

      for (const key of allKeys) {
        compare(expObj[key], actObj[key], path ? `${path}.${key}` : key);
      }
      return;
    }
  }

  compare(expected, actual, opts.path || '');

  return {
    success: differences.length === 0,
    differences,
    totalCompared,
    totalMatched,
  };
}

/**
 * Génère un rapport de test formaté
 */
export function generateReport(
  caseName: string,
  result: CompareResult
): string {
  const lines: string[] = [];

  lines.push(`\n${'='.repeat(60)}`);
  lines.push(`Test: ${caseName}`);
  lines.push(`${'='.repeat(60)}`);
  lines.push(`Résultat: ${result.success ? 'PASS' : 'FAIL'}`);
  lines.push(`Valeurs comparées: ${result.totalCompared}`);
  lines.push(`Valeurs identiques: ${result.totalMatched}`);
  lines.push(`Différences: ${result.differences.length}`);

  if (result.differences.length > 0) {
    lines.push(`\nDétail des différences:`);
    lines.push('-'.repeat(60));

    for (const diff of result.differences) {
      lines.push(`  ${diff.path}:`);
      lines.push(`    Attendu: ${diff.expected}`);
      lines.push(`    Obtenu:  ${diff.actual}`);
      if (diff.percentDiff !== undefined) {
        lines.push(`    Écart:   ${diff.percentDiff.toFixed(4)}%`);
      }
      lines.push(`    ${diff.message}`);
    }
  }

  return lines.join('\n');
}

/**
 * Compare uniquement les champs numériques critiques (rentabilité, cashflow, HCSF)
 * avec une tolérance plus élevée pour les textes/recommandations
 */
export function compareResultsFlexible(
  expected: unknown,
  actual: unknown,
  options: Partial<CompareOptions> = {}
): CompareResult {
  const numericTolerance = options.tolerance ?? 1; // 1% pour les valeurs numériques

  const opts: CompareOptions = {
    tolerance: numericTolerance,
    ignoreUndefined: true,
    path: '',
    ...options,
  };

  // Champs à ignorer dans la comparaison (textes qui peuvent varier)
  const ignoredPaths = [
    'synthese.recommandation',
    'synthese.points_attention',
  ];

  const differences: Difference[] = [];
  let totalCompared = 0;
  let totalMatched = 0;

  function shouldIgnore(path: string): boolean {
    return ignoredPaths.some(ignored => path.startsWith(ignored));
  }

  function compare(exp: unknown, act: unknown, path: string): void {
    if (shouldIgnore(path)) {
      return;
    }

    // Null check
    if (exp === null && act === null) {
      totalCompared++;
      totalMatched++;
      return;
    }

    if (exp === null || act === null) {
      differences.push({
        path,
        expected: exp as null,
        actual: act as null,
        message: `Valeur null: attendu ${exp}, obtenu ${act}`,
      });
      totalCompared++;
      return;
    }

    // Undefined check
    if (exp === undefined && act === undefined) {
      return;
    }

    if (opts.ignoreUndefined && (exp === undefined || act === undefined)) {
      return;
    }

    // Type check
    const expType = typeof exp;
    const actType = typeof act;

    if (expType !== actType) {
      differences.push({
        path,
        expected: exp as string,
        actual: act as string,
        message: `Type différent: attendu ${expType}, obtenu ${actType}`,
      });
      totalCompared++;
      return;
    }

    // Number comparison with tolerance
    if (typeof exp === 'number' && typeof act === 'number') {
      totalCompared++;
      const diff = Math.abs(exp - act);
      const percentDiff = exp !== 0 ? (diff / Math.abs(exp)) * 100 : (act !== 0 ? 100 : 0);

      if (percentDiff <= opts.tolerance) {
        totalMatched++;
      } else {
        differences.push({
          path,
          expected: exp,
          actual: act,
          percentDiff,
          message: `Écart de ${percentDiff.toFixed(4)}% (tolérance: ${opts.tolerance}%)`,
        });
      }
      return;
    }

    // String/Boolean comparison
    if (typeof exp === 'string' || typeof exp === 'boolean') {
      totalCompared++;
      if (exp === act) {
        totalMatched++;
      } else {
        differences.push({
          path,
          expected: exp,
          actual: act as string | boolean,
          message: `Valeur différente`,
        });
      }
      return;
    }

    // Array comparison
    if (Array.isArray(exp) && Array.isArray(act)) {
      if (exp.length !== act.length) {
        differences.push({
          path,
          expected: `Array[${exp.length}]`,
          actual: `Array[${act.length}]`,
          message: `Taille différente`,
        });
      }
      const maxLen = Math.max(exp.length, act.length);
      for (let i = 0; i < maxLen; i++) {
        compare(exp[i], act[i], `${path}[${i}]`);
      }
      return;
    }

    // Object comparison
    if (typeof exp === 'object' && typeof act === 'object') {
      const expObj = exp as Record<string, unknown>;
      const actObj = act as Record<string, unknown>;
      const allKeys = new Set([...Object.keys(expObj), ...Object.keys(actObj)]);

      for (const key of allKeys) {
        compare(expObj[key], actObj[key], path ? `${path}.${key}` : key);
      }
      return;
    }
  }

  compare(expected, actual, opts.path || '');

  return {
    success: differences.length === 0,
    differences,
    totalCompared,
    totalMatched,
  };
}

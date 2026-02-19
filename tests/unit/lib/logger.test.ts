// @vitest-environment node
/* eslint-disable no-console */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('en production, info ne logue pas', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { logger } = await import('@/lib/logger');
    logger.info('test info');
    expect(vi.mocked(console.log)).not.toHaveBeenCalled();
  });

  it('en production, debug ne logue pas', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { logger } = await import('@/lib/logger');
    logger.debug('test debug');
    expect(vi.mocked(console.log)).not.toHaveBeenCalled();
  });

  it('en développement, info logue via console.log', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const { logger } = await import('@/lib/logger');
    logger.info('test info');
    expect(vi.mocked(console.log)).toHaveBeenCalled();
  });

  it('en développement, debug logue via console.log', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const { logger } = await import('@/lib/logger');
    logger.debug('test debug');
    expect(vi.mocked(console.log)).toHaveBeenCalled();
  });

  it('error logue toujours, même en production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { logger } = await import('@/lib/logger');
    logger.error('test error');
    expect(vi.mocked(console.error)).toHaveBeenCalled();
  });

  it('warn logue toujours, même en production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { logger } = await import('@/lib/logger');
    logger.warn('test warn');
    expect(vi.mocked(console.warn)).toHaveBeenCalled();
  });

  it("error inclut le message dans l'appel", async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { logger } = await import('@/lib/logger');
    logger.error('message critique', { code: 42 });
    expect(vi.mocked(console.error)).toHaveBeenCalledWith('[ERROR]', 'message critique', {
      code: 42,
    });
  });
});

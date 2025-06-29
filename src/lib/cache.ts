import NodeCache from 'node-cache';

const cache = new NodeCache({
  stdTTL: 1800, // 30 minutes default
  checkperiod: 300, // Check for expired keys every 5 minutes
});

export const cacheService = {
  get: <T>(key: string): T | undefined => {
    return cache.get<T>(key);
  },

  set: <T>(key: string, value: T, ttl?: number): boolean => {
    return cache.set(key, value, ttl || 0);
  },

  del: (key: string): number => {
    return cache.del(key);
  },

  flush: (): void => {
    cache.flushAll();
  },

  keys: (): string[] => {
    return cache.keys();
  },

  stats: () => {
    return cache.getStats();
  }
};

export const CACHE_KEYS = {
  SHOWTIMES: (date: string, chain?: string) => 
    `showtimes:${date}${chain ? `:${chain}` : ''}`,
  THEATERS: (chain?: string) => 
    `theaters${chain ? `:${chain}` : ''}`,
  MOVIES: (date: string) => `movies:${date}`,
};
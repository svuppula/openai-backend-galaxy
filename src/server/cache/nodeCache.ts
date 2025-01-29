import NodeCache from 'node-cache';

// Initialize cache with 1 hour TTL
const cache = new NodeCache({ stdTTL: 3600 });

export const getFromCache = (key: string) => {
  return cache.get(key);
};

export const setInCache = (key: string, value: any) => {
  return cache.set(key, value);
};
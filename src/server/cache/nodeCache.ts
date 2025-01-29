import NodeCache from 'node-cache';

// Initialize cache with optimized settings
const cache = new NodeCache({ 
  stdTTL: 3600, // 1 hour TTL
  checkperiod: 120, // Check for expired keys every 2 minutes
  maxKeys: 1000000, // Maximum number of keys to prevent memory issues
  useClones: false, // Disable cloning for better performance
  deleteOnExpire: true // Automatically delete expired items
});

export const getFromCache = (key: string) => {
  return cache.get(key);
};

export const setInCache = (key: string, value: any, ttl?: number) => {
  return cache.set(key, value, ttl);
};

export const clearCache = () => {
  return cache.flushAll();
};

// Add batch operations for better performance
export const mget = (keys: string[]) => {
  return cache.mget(keys);
};

export const mset = (keyValuePairs: [string, any][], ttl?: number) => {
  const items: { [key: string]: any } = {};
  keyValuePairs.forEach(([key, value]) => {
    items[key] = value;
  });
  return cache.mset(keyValuePairs.map(([key, value]) => ({ key, val: value, ttl: ttl || 3600 })));
};
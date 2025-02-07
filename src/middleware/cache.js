import NodeCache from 'node-cache';

const cache = new NodeCache({ 
  stdTTL: 3600, // 1 hour default TTL
  checkperiod: 120,
  maxKeys: 1000000
});

export const cacheMiddleware = (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return next();
  }

  const key = `${req.method}:${req.originalUrl}:${JSON.stringify(req.body)}`;
  const cachedResponse = cache.get(key);
  
  if (cachedResponse) {
    return res.json(cachedResponse);
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cache.set(key, body);
    }
    return originalJson(body);
  };

  next();
};
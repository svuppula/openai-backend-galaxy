import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';
import rateLimit from 'express-rate-limit';

const cache = new NodeCache({ 
  stdTTL: 3600,
  checkperiod: 120,
  maxKeys: 1000000,
  useClones: false,
  deleteOnExpire: true
});

export const cacheMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return next();
  }

  const key = `${req.method}:${req.originalUrl}:${JSON.stringify(req.body)}`;
  const cachedResponse = cache.get(key);
  
  if (cachedResponse) {
    return res.json(cachedResponse);
  }
  
  const originalJson = res.json.bind(res);
  res.json = ((data: any) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cache.set(key, data);
    }
    return originalJson(data);
  }) as any;
  
  next();
};

export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
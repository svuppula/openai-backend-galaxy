import { Request, Response, NextFunction } from 'express';
import { getFromCache, setInCache } from '../cache/nodeCache';
import rateLimit from 'express-rate-limit';

export const cacheMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return next();
  }

  try {
    const key = `${req.method}:${req.originalUrl}:${JSON.stringify(req.body)}`;
    const cachedResponse = await getFromCache(key);
    
    if (cachedResponse) {
      return res.json(cachedResponse);
    }
    
    const originalJson = res.json.bind(res);
    
    res.json = ((data: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        setInCache(key, data);
      }
      return originalJson(data);
    }) as any;
    
    next();
  } catch (error) {
    next();
  }
};

export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
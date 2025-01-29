import { Request, Response, NextFunction } from 'express';
import { getFromCache, setInCache } from '../cache/nodeCache';

export const cacheMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Skip caching for certain methods
  if (req.method !== 'GET' && req.method !== 'POST') {
    return next();
  }

  try {
    // Create a unique cache key based on method, path and body
    const key = `${req.method}:${req.originalUrl}:${JSON.stringify(req.body)}`;
    const cachedResponse = await getFromCache(key);
    
    if (cachedResponse) {
      return res.json(cachedResponse);
    }
    
    // Store the original res.json function
    const originalJson = res.json.bind(res);
    
    // Override res.json to cache the response
    res.json = ((data: any) => {
      // Cache successful responses only
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

// Add rate limiting with a more generous free tier limit
export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
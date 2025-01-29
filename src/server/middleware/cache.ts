import { Request, Response, NextFunction } from 'express';
import { getFromCache, setInCache } from '../cache/nodeCache';

export const cacheMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.originalUrl;
    const cachedResponse = await getFromCache(key);
    
    if (cachedResponse) {
      return res.json(cachedResponse);
    }
    
    next();
  } catch (error) {
    next();
  }
};
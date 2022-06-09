import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisCacheService } from '../utils/redis.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    
    const redisCache = new RedisCacheService();
    const client = redisCache.getClient();
    
    const tokenData = await client.json.get(req.headers.authorization);

    if (!tokenData) {
      return res
      .status(401)
      .json({
        statusCode: 401,
        timestamp: new Date().toISOString(),
        message: "Unauthorized",
      })
    }
    next();
  }
}

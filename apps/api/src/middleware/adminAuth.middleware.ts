import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisClientService } from '../utils/redis.service';

@Injectable()
export class AdminAuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    
    if (!req.headers.authorization) {
      return res
      .status(401)
      .json({
        statusCode: 401,
        timestamp: new Date().toISOString(),
        message: "Unauthorized",
      })
    }
    const redisCache = new RedisClientService();
    const client = redisCache.getClient();
    
    const tokenData = await client.json.get(req.headers.authorization);

    if (!tokenData || tokenData?.role !== 'admin') {
      return res
      .status(401)
      .json({
        statusCode: 401,
        timestamp: new Date().toISOString(),
        message: "Unauthorized",
      })
    }

    req['userData'] = tokenData;
    next();
  }
}

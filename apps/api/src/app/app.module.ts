import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AdminAuthMiddleware } from '../middleware/adminAuth.middleware';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { RedisCacheService } from '../utils/redis.service';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, RedisCacheService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'slots', method: RequestMethod.POST},
        { path: 'book/slot', method: RequestMethod.POST}
      );

    consumer
      .apply(AdminAuthMiddleware)
      .forRoutes(
        { path: 'appointments', method: RequestMethod.GET}
      );
  }
}

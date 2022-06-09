import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisCacheService {
  public client;
  constructor() {
    this.client = createClient();
    this.client.on('error', (err) => console.log('Redis Client Error', err));
    this.client.connect();
  }

  getClient() {
    return this.client;
  }
}

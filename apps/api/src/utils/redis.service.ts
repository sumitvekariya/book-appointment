import { Injectable } from '@nestjs/common';
import { createClient, SchemaFieldTypes } from 'redis';

@Injectable()
export class RedisCacheService {
  public client;
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_HOST,
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD
    });
    // this.client = createClient();
    this.client.on('error', (err) => console.log('Redis Client Error', err));
    this.client.connect();
  }

  getClient() {
    return this.client;
  }

  async generateIndex() {
    // create index
    try {
      await this.client.ft.create('idx:slots', {
        '$.timeStamp': {
          type: SchemaFieldTypes.NUMERIC,
          AS: 'timeStamp'
        },
        '$.email': {
          type: SchemaFieldTypes.TEXT,
          AS: 'email'
        },
        '$.name': {
          type: SchemaFieldTypes.TEXT,
          AS: 'name'
        }
      },
      {
        ON: 'JSON',
        PREFIX: 'booked:slots'
      });
    } catch (err) {
      console.log("Index already created")
    }
  }
}

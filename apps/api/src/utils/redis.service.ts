import { Injectable } from '@nestjs/common';
import { createClient, SchemaFieldTypes } from 'redis';
import { environment } from '../environments/environment';
@Injectable()
export class RedisClientService {
  public client;
  constructor() {
    // Create connection instance with redis using required variables.
    this.client = createClient({
      url: environment.REDIS_HOST,
      username: environment.REDIS_USERNAME,
      password: environment.REDIS_PASSWORD
    });

    // Check error while connection.
    this.client.on('error', (err) => console.log('Redis Client Error', err));

    // Establish a connection
    this.client.connect();

    this.setCategories();
  }

  getClient() {
    return this.client;
  }

  async generateIndex() {
    // create an index
    // Here, we have used NUMERIC and TEXT type while defining schema fields. // Other types are GEO, TAG and VECTOR. We can use suitable type based on requirement.
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
        },
        '$.category': {
          type: SchemaFieldTypes.TEXT,
          AS: 'category'
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

  async setCategories() {
    const categoryKey = `category`;
    const categories = [
      'Full Body Checkup',
      'Vaccine',
      'Eye Checkup'
    ];
  
    // Check whether same key exist or not
    const existingData = await this.client.json.get(categoryKey);
    if (!existingData) {
      this.client.json.set(categoryKey, '$', categories);
    }
  }
}

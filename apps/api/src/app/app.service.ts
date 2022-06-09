import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';
import { Message, Login } from '@book-appointmnet/api-interfaces';
import { LoginDto } from '../dto/login.dto';
import { RedisCacheService } from '../utils/redis.service';
@Injectable()
export class AppService {
  public client;
  public redisCacheObject = new RedisCacheService();

  constructor() {
    this.client = this.redisCacheObject.getClient()
  }

  getData(): Message {
    return { message: 'Welcome to api!' };
  }

  async login(loginDto: LoginDto): Promise<Login> {
    try {
      if (loginDto.email && loginDto.password) {
        const token = Math.ceil((Math.random() * new Date().getTime())).toString();

        const key = `${token}`;

        const redisData = await this.client.json.get(key);

        const response: Login = {
          email: loginDto.email,
          token: redisData?.token ? redisData?.token : token,
          name: loginDto.email.split('@')[0],
          role: loginDto.email.indexOf('user') >= 0 ? 'user' : 'admin'
        };

        await this.client.json.set(key, '.', response);

        return response;
      } else {
        throw new Error('Invalid Credentials');
      }
    } catch (err) {
      console.log(err)
      throw err;
    }
  }
}

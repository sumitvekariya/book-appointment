import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { Message, Login } from '@book-appointmnet/api-interfaces';
import { LoginDto } from '../dto/login.dto';
import { RedisCacheService } from '../utils/redis.service';
import { BookSlotDto } from '../dto/bookSlot.dto';
import { GetAppointmentDto } from '../dto/getAppointment.dto';
@Injectable()
export class AppService {
  public client;
  public redisCacheObject = new RedisCacheService();

  constructor() {
    this.client = this.redisCacheObject.getClient();
    this.redisCacheObject.generateIndex();
  }

  getData(): Message {
    return { message: 'Welcome to api!' };
  }

  async login(loginDto: LoginDto): Promise<Login> {
    try {
      if (loginDto.email && loginDto.password) {
        const token = Math.ceil((Math.random() * new Date().getTime())).toString();

        const key = `${loginDto.email}`;
        const key2 = `${token}`;
        const redisData = await this.client.json.get(key);

        const response: Login = {
          email: loginDto.email,
          token: redisData?.token ? redisData?.token : token,
          name: loginDto.email.split('@')[0],
          role: loginDto.email.indexOf('user') >= 0 ? 'user' : 'admin'
        };

        if (!redisData?.token) {
          await this.client.json.set(key2, '.', response);  
        }
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

  async generateSlots(date: string) {
    const duration = 20;
    const startDateFormat = `${date}T10:00:00`;
    const endDateFormat = `${date}T22:00:00`;
    let currentDate = startDateFormat;
    const slots = [];

    // get all booked slots
    let bookedSlots = [];
    const bookedSlotsKeys = await this.client.keys('booked:slots:*');
    if (bookedSlotsKeys?.length) {
        let bookedSlotsDataInRedis = await this.client.json.mGet(bookedSlotsKeys, '$');
        bookedSlotsDataInRedis = [].concat(...bookedSlotsDataInRedis);
        for (let slots of bookedSlotsDataInRedis) {
          bookedSlots = [...bookedSlots, ...slots.slots];
        }
    }

    while(new Date(currentDate) < new Date(endDateFormat)) {
      const startTime = moment(currentDate).format('YYYY-MM-DDTHH:mm:ss');
      const endTime = moment(currentDate).add(duration, 'minutes').format('YYYY-MM-DDTHH:mm:ss');

      let isBooked = 0;
      if (bookedSlots?.length) {
        const foundSlot = bookedSlots.find(obj => obj.startTime === startTime && obj.endTime === endTime);
        if (foundSlot) {
          isBooked = 1;
        }  
      }

      slots.push({
        startTime,
        endTime,
        isBooked
      });

      currentDate = endTime;
    }
    return slots
  }

  async bookSlot(bookSlotDto: BookSlotDto, userData: Login) {
    // check that incoming is booked or not
    try {
      const timeStamp = new Date(new Date(bookSlotDto.startTime).setHours(0,0,0,0)).getTime();
      const date = moment(bookSlotDto.startTime).format('YYYY-MM-DD');
      const dateSlug = date.replace(/\-/g, '');
      const tsKey = new Date(bookSlotDto.startTime).getTime();
      const key = `booked:slots:${userData.email}:${dateSlug}:${tsKey}`;
  
      const keysForIncomingdate = await this.client.keys(`booked:slots:*`);

      let result = await this.client.json.mGet(keysForIncomingdate, '$');
      result = [].concat(...result);

      if (result?.length) {
          const bookedSlot = result.find(obj => obj.startTime === bookSlotDto.startTime && obj.endTime === bookSlotDto.endTime);
          if (bookedSlot) {
            throw new Error('This slot is already booked. Please choose another one.');
          }
      }

      const obj = {
        "name": userData.name,
        "email": userData.email,
        "date": date,
        "timeStamp": timeStamp,
        "startTime": bookSlotDto.startTime,
        "endTime": bookSlotDto.endTime,
        "category": bookSlotDto.category
      }
      
      await this.client.json.set(key, '$', obj);
  
      return true;
      
    } catch (err) {
      console.log("ERRR", err);
      throw err;
    }
  }
  
  async getAppointments(appointmentDto: GetAppointmentDto) {
    try {

      let category = '';

      const timeStamp = new Date(new Date(appointmentDto.date).setHours(0,0,0,0)).getTime();
      let searchString = `@timeStamp:[${timeStamp} ${timeStamp}]`;

      if (appointmentDto.endDate) {
        const endTimeStamp = new Date(new Date(appointmentDto.endDate).setHours(0,0,0,0)).getTime();
        searchString = `@timeStamp:[${timeStamp} ${endTimeStamp}]`
      }

      if (appointmentDto.name) {
        searchString += `,@name:(${appointmentDto.name}*),@email:(${appointmentDto.name}*)`
      }

      if (appointmentDto.category) {
        category = appointmentDto.category.trim()
        searchString += `,@category:(${category}*)`
      }
      // searchString += ` SORTBY timeStamp`;

      const bookSlots = await this.client.ft.search('idx:slots', `${searchString}`);
      const response = [];

      if (bookSlots?.documents?.length) {
        for (let obj of bookSlots?.documents) {
          response.push(obj.value);
        }
        return response;
      } else {
        return [];
      }
    } catch (err) {
      throw err;
    }
  }
}

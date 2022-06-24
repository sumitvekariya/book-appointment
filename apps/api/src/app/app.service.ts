import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { Message, Login } from '@book-appointmnet/api-interfaces';
import { LoginDto } from '../dto/login.dto';
import { RedisClientService } from '../utils/redis.service';
import { BookSlotDto } from '../dto/bookSlot.dto';
import { GetAppointmentDto } from '../dto/getAppointment.dto';
@Injectable()
export class AppService {
  public client;
  public redisCacheObject = new RedisClientService();

  constructor() {
    this.client = this.redisCacheObject.getClient();
    this.redisCacheObject.generateIndex();
  }

  getData(): Message {
    return { message: 'Welcome to api!' };
  }

  async login(loginDto: LoginDto): Promise<Login> {
    try {
      const emails = ['patient1@gmail.com', 'patient2@gmail.com', 'patient3@gmail.com', 'patient4@gmail.com', 'admin@gmail.com'];

      if (loginDto.email && loginDto.password) {
        if (emails.indexOf(loginDto.email) === -1) {
          throw new Error('Invalid Credentials');
        }
        const token = Math.ceil((Math.random() * new Date().getTime())).toString();

        const key = `${loginDto.email}`;
        const key2 = `${token}`;
        const redisData = await this.client.json.get(key);

        const response: Login = {
          email: loginDto.email,
          token: redisData?.token ? redisData?.token : token,
          name: loginDto.email.split('@')[0],
          role: loginDto.email.indexOf('admin') >= 0 ? 'admin' : 'user'
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
    const endDateFormat = `${date}T20:00:00`;

    const lunchStartDate = `${date}T12:00:00`;
    const lunchEndDate = `${date}T13:00:00`;

    const noonEndTime = `${date}T16:00:00`;

    let currentDate = startDateFormat;
    const slots = [];

    // get all booked slots
    let bookedSlots = [];
    // Fetch all the keys (of booked slots) for given date
    const bookedSlotsKeys = await this.client.keys(`booked:slots:${date}:*`);
    if (bookedSlotsKeys?.length) {
        // Fetch slots from the keys
        let bookedSlotsDataInRedis = await this.client.json.mGet(bookedSlotsKeys, '$');
        bookedSlots = [].concat(...bookedSlotsDataInRedis);
    }

    while(new Date(currentDate) < new Date(endDateFormat)) {
      const startTime = moment(currentDate).format('YYYY-MM-DDTHH:mm:ss');
      const endTime = moment(currentDate).add(duration, 'minutes').format('YYYY-MM-DDTHH:mm:ss');

      let isBooked = 0;
      if (bookedSlots?.length) {
        // Check whether calculated slot is as same as booked slot. If yes then set isBooked flag as 1.
        const foundSlot = bookedSlots.find(obj => obj.startTime === startTime && obj.endTime === endTime);
        if (foundSlot) {
          isBooked = 1;
        }  
      }

      const objToPush = {
        startTime,
        endTime,
        isBooked
      };

      // Assign morning slots
      if (new Date(endTime) <= new Date(lunchStartDate)) {
        slots.push({ ...objToPush, isMorningSlot: 1 });
      }
      // Assign noon slots
      else if (new Date(startTime) >= new Date(lunchEndDate) && new Date(endTime) <= new Date(noonEndTime)) {
        slots.push({ ...objToPush, isNoonSlot: 1 });
      } 
      // Assign evening slots
      else if (new Date(startTime) >= new Date(noonEndTime)){
        slots.push({ ...objToPush, isEveningSlot: 1 });
      }
      currentDate = endTime;
    }
    
    return slots;
  }

  async bookSlot(bookSlotDto: BookSlotDto, userData: Login) {
    try {

      const unixTimeStamp = new Date(new Date(bookSlotDto.startTime).setHours(0,0,0,0)).getTime();
      const date = moment(bookSlotDto.startTime).format('YYYY-MM-DD');
      const key = `booked:slots:${date}:${userData.email}`;
  
      // Fetch all the keys (of booked slots) for given date
      const keysForIncomingdate = await this.client.keys(`booked:slots:${date}:*`);

      let result = []
      if (keysForIncomingdate?.length) {
        // Fetch slots from the keys
        result = await this.client.json.mGet(keysForIncomingdate, '$');
        result = [].concat(...result);
      }

      if (result?.length) {
          // check that incoming is booked or not
          const bookedSlot = result.find(obj => obj.startTime === bookSlotDto.startTime && obj.endTime === bookSlotDto.endTime);
          if (bookedSlot) {
            throw new Error('This slot is already booked. Please choose another one.');
          }
      }

      // Create JSON object with values to store into redis
      const obj = {
        "name": userData.name,
        "email": userData.email,
        "date": date,
        "timeStamp": unixTimeStamp,
        "startTime": bookSlotDto.startTime,
        "endTime": bookSlotDto.endTime,
        "category": bookSlotDto.category
      }
      
      // Set JSON object in Redis
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
      // Query to filter appointments by given date range e.g. [startDate endDate]
      let searchQuery = `@timeStamp:[${timeStamp} ${timeStamp}]`;
      if (appointmentDto.endDate) {
        const endTimeStamp = new Date(new Date(appointmentDto.endDate).setHours(0,0,0,0)).getTime();
        searchQuery = `@timeStamp:[${timeStamp} ${endTimeStamp}]`
      }

      // Query to filter appointments by given name. NOTE:: Here we search by the email as well.
      if (appointmentDto.name) {
        searchQuery += `,@name:(${appointmentDto.name}*),@email:(${appointmentDto.name}*)`
      }

      // Query to filter appointments by given category.
      if (appointmentDto.category) {
        category = appointmentDto.category.trim()
        searchQuery += `,@category:(${category})`
      }
      // Search index based on query filter.
      const bookSlots = await this.client.ft.search('idx:slots', `${searchQuery}`);
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

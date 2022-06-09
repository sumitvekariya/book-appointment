import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';

import { Message, Login, Categories } from '@book-appointmnet/api-interfaces';

import { AppService } from './app.service';
import { LoginDto } from '../dto/login.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  getData(): Message {
    return this.appService.getData();
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(
    @Body() loginDto: LoginDto
  ) {
    const response = await this.appService.login(loginDto);
    return { data: response}
  }

  @Get('categories')
  getCategories() {
    return {
      data: [
        'Full Body Checkup',
        'Dental Checkup',
        'Eye Checkup'
      ]
    }
  }
}

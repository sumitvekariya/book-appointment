import { Body, Controller, Get, Post, Query, Req, Res, UsePipes, ValidationPipe } from '@nestjs/common';

import { Message } from '@book-appointmnet/api-interfaces';
import { Response } from 'express';
import { AppService } from './app.service';
import { LoginDto } from '../dto/login.dto';
import { SlotDto } from '../dto/slot.dto';
import { BookSlotDto } from '../dto/bookSlot.dto';
import { GetAppointmentDto } from '../dto/getAppointment.dto';

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
    @Body() loginDto: LoginDto,
    @Res() res: Response
  ) {
    try {
      const response = await this.appService.login(loginDto);
      return res.status(200).send({
        message: "Login successfully",
        data: response
      });
    } catch (err) {
      return res.status(400).send({
        message: err.message
      });
    }
  }

  @Get('categories')
  async getCategories(
    @Res() res: Response
  ) {
    const data = await this.appService.getCategories();
    return res.status(200).send({
      data
    });
  }

  @Post('slots')
  async getSlots(
    @Res() res: Response,
    @Body() slotDto: SlotDto
  ) {
    const response = await this.appService.generateSlots(slotDto.date);
    return res.status(200).send({
      data: response
    });
  }

  @Post('book/slot')
  async bookSlot(
    @Req() req: Request,
    @Res() res: Response,
    @Body() bookSlotDto: BookSlotDto
  ) {
    try {
      const response = await this.appService.bookSlot(bookSlotDto, req['userData']);
      return res.status(200).send({
        message: 'Slot booked successfully',
        data: response
      });
    } catch (err) {
      return res.status(400).send({
        message: err.message
      });
    }
  }

  @Get('appointments')
  async getAppointment(
    @Res() res: Response,
    @Query() appointmentDto: GetAppointmentDto
  ) {
    const response = await this.appService.getAppointments(appointmentDto);
    return res.status(200).send({
      data: response
    });
  }
}

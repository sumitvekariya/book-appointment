import { IsNotEmpty, IsString } from 'class-validator';

export class GetAppointmentDto implements Readonly<GetAppointmentDto> {
  @IsNotEmpty()
  @IsString()
  date: string;

  @IsString()
  endDate: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}

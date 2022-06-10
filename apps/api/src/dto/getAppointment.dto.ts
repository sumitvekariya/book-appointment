import { IsNotEmpty, IsString } from 'class-validator';

export class GetAppointmentDto implements Readonly<GetAppointmentDto> {
  @IsNotEmpty()
  @IsString()
  date: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}

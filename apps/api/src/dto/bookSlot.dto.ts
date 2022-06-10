import { IsNotEmpty, IsString } from 'class-validator';

export class BookSlotDto implements Readonly<BookSlotDto> {
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @IsString()
  endTime: string;

  @IsNotEmpty()
  @IsString()
  category: string;
}

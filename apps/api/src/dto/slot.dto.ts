import { IsNotEmpty, IsString } from 'class-validator';

export class SlotDto implements Readonly<SlotDto> {
  @IsNotEmpty()
  @IsString()
  date: string;
}

import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto implements Readonly<LoginDto> {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

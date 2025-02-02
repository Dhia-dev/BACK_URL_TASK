import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty({
    description: 'The email of the user',
    example: 'user@example.com',
  })
  email: string;

  @IsString()
  @MinLength(3)
  @ApiProperty({
    description: 'The username of the user',
    example: 'exempleUser',
  })
  username: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({
    description: 'The password for the user account',
    example: 'exemplepassword123',
  })
  password: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsUrl, IsNotEmpty } from 'class-validator';

export class CreateShortenedUrlDto {
  @IsUrl()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The original URL to be shortened',
    example: 'https://example.com',
  })
  originalUrl: string;
}

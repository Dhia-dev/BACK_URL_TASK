import { IsUrl, IsNotEmpty } from 'class-validator';

export class CreateShortenedUrlDto {
  @IsUrl()
  @IsNotEmpty()
  originalUrl: string;
}

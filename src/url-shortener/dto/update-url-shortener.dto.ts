import { PartialType } from '@nestjs/mapped-types';
import { CreateShortenedUrlDto } from './create-url-shortener.dto';

export class UpdateUrlShortenerDto extends PartialType(CreateShortenedUrlDto) {}

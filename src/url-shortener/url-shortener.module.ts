import { Module } from '@nestjs/common';
import { UrlShortenerService } from './url-shortener.service';
import { UrlShortenerController } from './url-shortener.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ShortenedUrl,
  ShortenedUrlSchema,
} from './entities/url-shortener.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShortenedUrl.name, schema: ShortenedUrlSchema },
    ]),
  ],
  controllers: [UrlShortenerController],
  providers: [UrlShortenerService],
})
export class UrlShortenerModule {}

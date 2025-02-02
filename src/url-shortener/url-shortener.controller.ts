import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Redirect,
  NotFoundException,
  Delete,
} from '@nestjs/common';
import { UrlShortenerService } from './url-shortener.service';

import { CreateShortenedUrlDto } from './dto/create-url-shortener.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('')
export class UrlShortenerController {
  constructor(private readonly urlShortenerService: UrlShortenerService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createUrlDto: CreateShortenedUrlDto, @Request() req) {
    const shortenedUrl = await this.urlShortenerService.shorten(
      createUrlDto,
      req.user,
    );
    return {
      originalUrl: shortenedUrl.originalUrl,
      shortCode: shortenedUrl.shortCode,
      shortUrl: `${process.env.APP_URL}/${shortenedUrl.shortCode}`,
      clicks: shortenedUrl.clicks,
    };
  }

  @Get(':shortCode')
  @Redirect()
  async redirect(@Param('shortCode') shortCode: string) {
    const url = await this.urlShortenerService.findByShortCode(shortCode);
    if (!url) {
      throw new NotFoundException('URL not found');
    }
    return { url: url.originalUrl };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req) {
    const urls = await this.urlShortenerService.findAllByUser(req.user._id);
    return urls.map((url) => ({
      id: url._id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${process.env.APP_URL}/${url.shortCode}`,
      clicks: url.clicks,
      createdAt: url.createdAt,
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats/:shortCode')
  async getStats(@Param('shortCode') shortCode: string) {
    const url = await this.urlShortenerService.findByShortCode(shortCode);
    if (!url) {
      throw new NotFoundException('URL not found');
    }
    return {
      clicks: url.clicks,
      originalUrl: url.originalUrl,
      createdAt: url.createdAt,
    };
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':shortCode')
  async delete(@Param('shortCode') shortCode: string, @Request() req) {
    await this.urlShortenerService.deleteUrl(shortCode, req.user._id);
    return { message: 'URL deleted successfully' };
  }
}

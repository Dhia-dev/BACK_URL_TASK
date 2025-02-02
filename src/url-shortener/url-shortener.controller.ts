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
  Query,
} from '@nestjs/common';
import { UrlShortenerService } from './url-shortener.service';

import { CreateShortenedUrlDto } from './dto/create-url-shortener.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('')
export class UrlShortenerController {
  constructor(private readonly urlShortenerService: UrlShortenerService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a shortened URL' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 201, description: 'URL shortened successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Not Authorized .' })
  @ApiBody({
    description: 'Payload for creating a shortened URL',
    type: CreateShortenedUrlDto,
    examples: {
      example1: {
        summary: 'Sample Request',
        value: {
          originalUrl: 'https://example.com',
        },
      },
    },
  })
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
  @ApiOperation({ summary: 'Redirect to the original URL using a short code' })
  @ApiParam({ name: 'shortCode', description: 'The short code of the URL' })
  @ApiResponse({ status: 302, description: 'Redirecting to the original URL.' })
  @ApiResponse({ status: 404, description: 'URL not found.' })
  async redirect(@Param('shortCode') shortCode: string) {
    const url = await this.urlShortenerService.findByShortCode(shortCode);
    if (!url) {
      throw new NotFoundException('URL not found');
    }
    return { url: url.originalUrl };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Get all shortened URLs for the authenticated user',
  })
  @ApiBearerAuth('access-token')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Successfully retrieved URLs.' })
  @ApiResponse({ status: 404, description: 'No URLs found.' })
  async findAll(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 5,
  ) {
    page = Number(page) > 0 ? Number(page) : 1;
    limit = Number(limit) > 0 ? Number(limit) : 5;

    const skip = (page - 1) * limit;
    const [urls, total] = await this.urlShortenerService.findAllByUser(
      req.user._id,
      skip,
      limit,
    );

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: urls.map((url) => ({
        id: url._id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `${process.env.APP_URL}/${url.shortCode}`,
        clicks: url.clicks,
        createdAt: url.createdAt,
      })),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats/:shortCode')
  @ApiOperation({ summary: 'Get stats for a shortened URL' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'shortCode', description: 'The short code of the URL' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved URL stats.',
  })
  @ApiResponse({ status: 404, description: 'URL not found.' })
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
  @ApiOperation({ summary: 'Delete a shortened URL' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'shortCode', description: 'The short code of the URL' })
  @ApiResponse({ status: 200, description: 'URL deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Not Authorized.' })
  @ApiResponse({ status: 404, description: 'URL not found.' })
  async delete(@Param('shortCode') shortCode: string, @Request() req) {
    await this.urlShortenerService.deleteUrl(shortCode, req.user._id);
    return { message: 'URL deleted successfully' };
  }
}

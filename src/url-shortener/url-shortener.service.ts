import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { CreateShortenedUrlDto } from './dto/create-url-shortener.dto';
import { ShortenedUrl } from './entities/url-shortener.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class UrlShortenerService {
  private readonly logger = new Logger(UrlShortenerService.name);
  private readonly URL_LENGTH = 8;
  private readonly MAX_RETRIES = 3;

  constructor(
    @InjectModel(ShortenedUrl.name)
    private readonly urlModel: Model<ShortenedUrl>,
  ) {}

  async shorten(
    createUrlDto: CreateShortenedUrlDto,
    user: User,
  ): Promise<ShortenedUrl> {
    this.logger.log(`User ID: ${user.id}`);
    try {
      const shortCode = await this.generateUniqueShortCode();

      const shortened = new this.urlModel({
        originalUrl: this.normalizeUrl(createUrlDto.originalUrl),
        shortCode,
        creator: user._id,
        createdAt: new Date(),
      });

      const savedUrl = await shortened.save();
      this.logger.log(`URL shortened successfully: ${shortCode}`);
      return savedUrl;
    } catch (error) {
      this.handleShortenError(error);
    }
  }

  async findByShortCode(shortCode: string): Promise<ShortenedUrl> {
    try {
      const url = await this.urlModel.findOne({ shortCode }).exec();

      if (!url) {
        throw new NotFoundException('Short URL not found');
      }

      await this.incrementClickCount(url);
      return url;
    } catch (error) {
      this.handleFindError(error);
    }
  }

  async findAllByUser(
    userId: string,
    skip: number,
    limit: number,
  ): Promise<[ShortenedUrl[], number]> {
    try {
      const urls = await this.urlModel
        .find({ creator: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      const total = await this.urlModel
        .countDocuments({ creator: userId })
        .exec();

      return [urls, total];
    } catch (error) {
      this.logger.error(`Error fetching URLs for user ${userId}:`, error);
      throw error;
    }
  }

  private async generateUniqueShortCode(): Promise<string> {
    let retries = 0;
    while (retries < this.MAX_RETRIES) {
      const shortCode = uuidv4().slice(0, this.URL_LENGTH);
      const existing = await this.urlModel.findOne({ shortCode }).exec();

      if (!existing) {
        return shortCode;
      }
      retries++;
    }
    throw new ConflictException('Failed to generate unique short code');
  }

  private async incrementClickCount(url: ShortenedUrl): Promise<void> {
    try {
      await this.urlModel
        .updateOne({ _id: url._id }, { $inc: { clicks: 1 } })
        .exec();
    } catch (error) {
      this.logger.error(
        `Error incrementing click count for ${url.shortCode}:`,
        error,
      );
    }
  }

  private normalizeUrl(url: string): string {
    try {
      const urlObject = new URL(url);
      return urlObject.toString().replace(/\/$/, '');
    } catch {
      throw new ConflictException('Invalid URL provided');
    }
  }

  private handleShortenError(error: any): never {
    if (error.code === 11000) {
      throw new ConflictException('Short URL already exists');
    }
    this.logger.error('Error shortening URL:', error);
    throw error;
  }

  private handleFindError(error: any): never {
    if (error instanceof NotFoundException) {
      throw error;
    }
    this.logger.error('Error finding short URL:', error);
    throw error;
  }
  async deleteUrl(shortCode: string, userId: string): Promise<void> {
    try {
      const url = await this.urlModel
        .findOne({
          shortCode,
          creator: userId,
        })
        .exec();

      if (!url) {
        throw new NotFoundException('URL not found or unauthorized');
      }

      await this.urlModel.deleteOne({ _id: url._id }).exec();
      this.logger.log(`URL deleted successfully: ${shortCode}`);
    } catch (error) {
      this.logger.error(`Error deleting URL ${shortCode}:`, error);
      throw error;
    }
  }
}

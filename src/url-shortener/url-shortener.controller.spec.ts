// src/url-shortener/url-shortener.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UrlShortenerController } from './url-shortener.controller';
import { UrlShortenerService } from './url-shortener.service';
import { getModelToken } from '@nestjs/mongoose';
import { ShortenedUrl } from './entities/url-shortener.entity';
import { User } from '../users/entities/user.entity';

describe('UrlShortenerController', () => {
  let controller: UrlShortenerController;
  let service: UrlShortenerService;

  const mockUrlModel = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlShortenerController],
      providers: [
        UrlShortenerService,
        {
          provide: getModelToken(ShortenedUrl.name),
          useValue: mockUrlModel,
        },
      ],
    }).compile();

    controller = module.get<UrlShortenerController>(UrlShortenerController);
    service = module.get<UrlShortenerService>(UrlShortenerService);
  });

  describe('create', () => {
    it('should create shortened URL', async () => {
      const mockShortenedUrl = {
        _id: 'testid',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        creator: 'userid',
        clicks: 0,
        createdAt: new Date(),
        save: jest.fn(),
      } as unknown as ShortenedUrl;

      const req = {
        user: { _id: 'userid' } as User,
      };

      jest.spyOn(service, 'shorten').mockResolvedValue(mockShortenedUrl);

      const result = await controller.create(
        { originalUrl: 'https://example.com' },
        req,
      );

      expect(result.shortCode).toBe('abc123');
    });
  });
});

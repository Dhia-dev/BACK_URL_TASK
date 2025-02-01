// src/url-shortener/url-shortener.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UrlShortenerService } from './url-shortener.service';
import { getModelToken } from '@nestjs/mongoose';
import { ShortenedUrl } from './entities/url-shortener.entity';
import { User } from '../users/entities/user.entity';

describe('UrlShortenerService', () => {
  let service: UrlShortenerService;
  let mockModel: any;

  beforeEach(async () => {
    mockModel = {
      new: jest.fn().mockResolvedValue({
        save: () => Promise.resolve({}),
      }),
      constructor: jest.fn().mockResolvedValue({}),
      find: jest.fn(),
      findOne: jest.fn(),
      exec: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlShortenerService,
        {
          provide: getModelToken(ShortenedUrl.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<UrlShortenerService>(UrlShortenerService);
  });

  it('should shorten URL', async () => {
    const mockUser = {
      _id: 'userid',
      email: 'test@test.com',
      username: 'testuser',
    } as User;

    const savedUrl = {
      _id: 'urlid',
      originalUrl: 'https://example.com',
      shortCode: 'abc123',
      creator: mockUser._id,
      clicks: 0,
      createdAt: new Date(),
    };

    mockModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    mockModel.create.mockImplementation(() => ({
      ...savedUrl,
      save: () => Promise.resolve(savedUrl),
    }));

    const result = await service.shorten(
      { originalUrl: 'https://example.com' },
      mockUser,
    );

    expect(result).toBeDefined();
    expect(result.originalUrl).toBe('https://example.com');
    expect(result.creator).toBe(mockUser._id);
  });
});

// src/users/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
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
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const dto = {
        email: 'test@test.com',
        password: 'password123',
        username: 'testuser',
      };

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const savedUser = {
        _id: 'testid',
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
      };

      mockModel.create.mockImplementation(() => ({
        ...savedUser,
        save: () => Promise.resolve(savedUser),
      }));

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(result.email).toBe(dto.email);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../users/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: {
            new: jest.fn().mockResolvedValue({}),
            constructor: jest.fn().mockResolvedValue({}),
            find: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return token and user data', async () => {
      const loginDto = {
        email: 'test@test.com',
        password: 'password123',
      };

      const expectedResponse = {
        user: {
          id: 'testid',
          email: 'test@test.com',
          username: 'testuser',
        },
        token: 'test-token',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);
      expect(result).toEqual(expectedResponse);
    });
  });
});

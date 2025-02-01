import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('should successfully login a user', async () => {
      const mockUser = {
        _id: 'testid',
        id: 'testid',
        email: 'test@test.com',
        username: 'testuser',
        password: await bcrypt.hash('password123', 10),
      } as User;

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);

      const result = await service.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(mockUser.email);
    });
  });
});

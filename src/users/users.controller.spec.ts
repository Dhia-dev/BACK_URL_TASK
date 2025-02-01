import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

jest.mock('../auth/guards/jwt-auth.guard', () => ({
  JwtAuthGuard: jest.fn().mockImplementation(() => true),
}));

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto = {
        email: 'test@test.com',
        password: 'password123',
        username: 'testuser',
      };

      const mockUser = {
        _id: 'testid',
        ...createUserDto,
      } as User;

      jest.spyOn(service, 'create').mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);
      expect(result.email).toBe(createUserDto.email);
    });
  });
});

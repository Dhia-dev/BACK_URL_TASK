import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/create-auth.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and return a JWT token' })
  @ApiResponse({ status: 200, description: 'User successfully authenticated.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @ApiBody({
    description: 'User login credentials',
    type: LoginDto,
    examples: {
      example1: {
        summary: ' Test Login',
        value: {
          email: 'exemple@example.com',
          password: 'exemplepassword123',
        },
      },
    },
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}

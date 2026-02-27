import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Double Register: Creates Company + User + Association
  @Post('register-owner')
  async register(@Body() registerDto: any) {
    return this.authService.registerOwner(registerDto);
  }

  // Login: Validates credentials and returns a JWT
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: any) {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}

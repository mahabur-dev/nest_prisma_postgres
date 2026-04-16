import {
  Controller, Post, Get, Put,
  Body, UseGuards, HttpCode, HttpStatus,
  UseInterceptors, UploadedFile,
  Delete,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateAuthDto } from './dto/update.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { multerConfig } from '../../config/multer.config';
import { ChangePasswordDto } from './dto/change_password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    const data = await this.authService.register(dto);
    return { message: 'Registered successfully', data };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.login(dto);
    return { message: 'Login successful', data };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMe(@CurrentUser() user: any) {
    const data = await this.authService.getMe(user.id);
    return { message: 'User retrieved successfully', data };
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(@Body() dto: ChangePasswordDto, @CurrentUser() user: any) {
    const data = await this.authService.changePassword(user.id, dto);
    return { message: 'Password changed successfully', data };
  }

  @Put('update-profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Body() dto: UpdateAuthDto,
    @CurrentUser() user: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data = await this.authService.updateProfile(user.id, dto, file);
    return { message: 'Profile updated successfully', data };
  }
  @Delete('delete-address/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteAddress(@Param('id') id: string, @CurrentUser() user: any) {
    const data = await this.authService.deleteAddress(user.id, parseInt(id));
    return { message: 'Address deleted successfully', data };
  }
}
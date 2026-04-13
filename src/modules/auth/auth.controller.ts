import { Controller, Post, Body, Get, Put, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/change_password.dto';
import { UpdateAuthDto } from './dto/update.dto';
// import { multerConfig } from 'src/config/multer.config';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../../config/multer.config';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: any) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  changePassword(@Body() dto: ChangePasswordDto, @CurrentUser() user: any) {
    return this.authService.changePassword(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-profile')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  updateProfile(
    @Body() dto: UpdateAuthDto,
    @CurrentUser() user: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.authService.updateProfile(user.id, dto, file);
  }
}
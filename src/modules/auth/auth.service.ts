import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateAuthDto } from './dto/update.dto';
import { CloudinaryService } from '../../common/services/cloudinary.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      password: hashed,
      name: dto.name,
    });

    const token = this.generateToken(user.id, user.email);
    return { user: { id: user.id, email: user.email, name: user.name }, token };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.generateToken(user.id, user.email);
    return { user: { id: user.id, email: user.email, name: user.name }, token };
  }

  async changePassword(userId: number, dto: { currentPassword: string; newPassword: string }) {

    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    // console.log('User found for password change:', dto, user);

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    const updatedUser = await this.usersService.update(user.id, { password: hashed });
    return updatedUser;
  }
async updateProfile(
  userId: number,
  dto: UpdateAuthDto,
  file?: Express.Multer.File,
) {
  const user = await this.usersService.findById(userId);
  if (!user) throw new UnauthorizedException('User not found');

  if (dto.email && dto.email !== user.email) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');
  }

  let imageUrl: string | undefined;

  if (file) {
    // Delete old image from Cloudinary if exists
    if (user.image) {
      await this.cloudinaryService.deleteImage(user.image);
    }
    // Upload new image
    imageUrl = await this.cloudinaryService.uploadImage(file, 'profiles');
  }

  const updatedUser = await this.usersService.update(userId, {
    ...dto,
    ...(imageUrl && { image: imageUrl }),
  });

  return updatedUser;
}

  private generateToken(userId: number, email: string) {
    return this.jwtService.sign({ sub: userId, email });
  }
}

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { CloudinaryService } from '../../common/services/cloudinary.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateAuthDto } from './dto/update.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change_password.dto';

const PUBLIC_SELECT = {
  id: true,
  email: true,
  name: true,
  image: true,
  phone: true,
  profession: true,
  nid: true,
  createdAt: true,
  updatedAt: true,
  addresses: {
    select: {
      id: true,
      street: true,
      city: true,
      state: true,
      zipCode: true,
      country: true,
    },
  },
} satisfies Prisma.UserSelect;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const { addresses, password: raw, ...rest } = dto;
    const password = await bcrypt.hash(raw, 10);

    const user = await this.prisma.user.create({
      data: {
        ...rest,
        password,
        ...(addresses?.length && {
          addresses: { create: addresses },
        }),
      },
      select: PUBLIC_SELECT,
    });

    return { user, token: this.signToken(user.id, user.email) };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { ...PUBLIC_SELECT, password: true },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const { password: _, ...safeUser } = user;
    return { user: safeUser, token: this.signToken(user.id, user.email) };
  }

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: PUBLIC_SELECT,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    const password = await bcrypt.hash(dto.newPassword, 10);
    return this.prisma.user.update({
      where: { id: userId },
      data: { password },
      select: PUBLIC_SELECT,
    });
  }

  async updateProfile(userId: number, dto: UpdateAuthDto, file?: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, image: true },
    });
    if (!user) throw new NotFoundException('User not found');

    let image: string | undefined;
    if (file) {
      if (user.image) await this.cloudinaryService.deleteImage(user.image);
      image = await this.cloudinaryService.uploadImage(file, 'profiles');
    }

    const { addresses, ...rest } = dto;

   return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...rest,
        ...(image && { image }),
        ...(addresses && {
          addresses: {
            // Only create new addresses (those without an id)
            create: addresses
              .filter((addr) => !addr.id)
              .map(({ id, ...addr }) => addr),
            // Update only existing addresses (those with an id)
            updateMany: addresses
              .filter((addr) => addr.id)
              .map((addr) => ({
                where: { id: addr.id },
                data: { ...addr },
              })),
          },
        }),
      },
      select: PUBLIC_SELECT,
    });
  }

  private signToken(userId: number, email: string) {
    return this.jwtService.sign({ sub: userId, email });
  }
  async deleteAddress(userId: number, addressId: number) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
      select: { userId: true },
    });
    if (!address) throw new NotFoundException('Address not found');
    if (address.userId !== userId) throw new UnauthorizedException('Not authorized to delete this address');
    await this.prisma.address.delete({ where: { id: addressId } });
  }
}


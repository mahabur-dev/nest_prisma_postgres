// import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../../prisma/prisma.service';

// @Injectable()
// export class UsersService {
//   constructor(private readonly prisma: PrismaService) {}

//   findByEmail(email: string) {
//     return this.prisma.user.findUnique({ where: { email } });
//   }

//   findById(id: number) {
//     return this.prisma.user.findUnique({ where: { id } });
//   }

//   create(data: { email: string; password: string; name: string }) {
//     return this.prisma.user.create({ data });
//   }
// }

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        password: true,
        image: true,
        // password excluded intentionally for security
      },
    });
  }

  create(data: { email: string; password: string; name: string }) {
    return this.prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        // password excluded from response
      },
    });
  }
  update(
    id: number,
    data: {
      email?: string;
      password?: string;
      name?: string;
      image?: string;
      phone?: string;
      profession?: string;
      nid?: string;
    },
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        phone: true,
        profession: true,
        nid: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}

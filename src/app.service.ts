// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class AppService {
//   getHello(): string {
//     return 'Hello World!';
//   }
// }

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AppService {
  getHello(): string {
    return 'hi';
  }
}


@Injectable()
export class PrismaService extends PrismaClient 
  implements OnModuleInit, OnModuleDestroy {

  async onModuleInit() {
    await this.$connect();
    console.log('✅ NeonDB connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}